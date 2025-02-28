from fastapi import FastAPI, HTTPException, Request, Depends
import openai
import json
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
import os
import time

app = FastAPI()

# Enter your api key here
openai.api_key = ""
# Suppress tokenizer parallelism warnings
os.environ["TOKENIZERS_PARALLELISM"] = "false"

# Generate embeddings for a query
def generate_query_embedding(query, model_name='all-MiniLM-L6-v2'):
    model = SentenceTransformer(model_name)
    model = model.to("cpu")  # Use CPU (modify to "cuda" for GPU if available)
    query_embedding = model.encode([query], convert_to_tensor=True, device="cpu").cpu().numpy()
    return query_embedding

# Retry logic for OpenAI API calls
def call_openai_with_retry(prompt, retries=3, delay=10):
    for attempt in range(retries):
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an assistant to generate either chart visualization data or summary for queries."},
                    {"role": "user", "content": prompt}
                ],
                timeout=60
            )
            return response
        except Exception as e:  # Catch all exceptions, including OpenAI-related issues
            print(f"API error: {e}. Retrying in {delay} seconds... ({attempt + 1}/{retries})")
            time.sleep(delay)
    raise Exception("Failed to connect to OpenAI API after multiple attempts.")
   
# Query FAISS index with enhanced functionality
def query_and_visualize_with_openai(index, query, metadata, chart_type, model_name='all-MiniLM-L6-v2', k=20):
    # Generate embedding for the query
    query_embedding = generate_query_embedding(query, model_name)

    # Search for the top-k matches
    distances, indices = index.search(query_embedding, k)

    # Prepare results
    results = [{"metadata": metadata[idx], "distance": float(distances[0][i])} for i, idx in enumerate(indices[0])]

    # Use only the top 10 results for ChatGPT input
    top_results = results[:20]
    chatgpt_prompt = f"""
    The user queried: "{query}".
    Based on the results below, generate a suitable visualization.
    The user prefers a {chart_type} chart.
    Results:
    {json.dumps(top_results, indent=2)}

    Instructions:
    - Provide a JSON structure for creating the {chart_type} chart.
    - Include labels and values.
    - Ensure the JSON is in the following format:
    {{
        "type": "{chart_type}",
        "labels": ["label1", "label2", "label3"],
        "values": [value1, value2, value3]
    }}
    Respond with JSON only.
    """

    # Call OpenAI API with retries
    response = call_openai_with_retry(chatgpt_prompt)
    response_content = response["choices"][0]["message"]["content"].strip()

    try:
        print("Raw response content from OpenAI:", response_content)  # Debugging
        visualization_suggestion = json.loads(response_content)
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON response from OpenAI: {e}")
        visualization_suggestion = None

    return results, visualization_suggestion

# Transform chart data to required format
def transform_chart_data_to_format(generated_data):
    """
    Transform generated chart data into the required format, including support for pie charts.

    Args:
        generated_data (dict): The generated chart data.

    Returns:
        dict: Transformed chart data in the specified format.
    """
    # if generated_data["type"] == "pie":
    transformed_data = {
        "chart": {
            "type": "pie"
        },
        "title": {
            "text": "Crime Distribution"
        },
        "series": [
            {
                "name": "Crime Count",
                "data": [
                    {"name": label, "y": value} for label, value in zip(generated_data["labels"], generated_data["values"])
                ]
            }
        ]
    }
    # else:
    #     # Bar or Line Chart Format
    #     transformed_data = {
    #         "chart": {
    #             "type": generated_data["type"]
    #         },
    #         "title": {
    #             "text": "Number of Crimes by Time"
    #         },
    #         "xAxis": {
    #             "categories": generated_data["labels"]
    #         },
    #         "series": [
    #             {
    #                 "name": "Time of Crime",
    #                 "data": generated_data["values"]
    #             }
    #         ]
    #     }
    return transformed_data

# Load embeddings and metadata
def load_embeddings_and_metadata(embeddings_file, metadata_file):
    embeddings = np.load(embeddings_file)
    print(f"Loaded embeddings from {embeddings_file}")

    metadata = []
    with open(metadata_file, "r") as metafile:
        for line in metafile:
            metadata.append(json.loads(line.strip()))  # Parse each line as JSON object
    print(f"Loaded metadata from {metadata_file} with {len(metadata)} entries")

    return embeddings, metadata

# Create FAISS index
def create_faiss_index(embeddings):
    embedding_dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(embedding_dim)  # L2 (Euclidean) distance
    index.add(embeddings)
    print(f"FAISS index created with {index.ntotal} embeddings")
    return index

def interactive_session_with_openai(user_query, chart_type, embeddings_file, metadata_file):
    # Load data
    embeddings, metadata = load_embeddings_and_metadata(embeddings_file, metadata_file)

    # Create FAISS index
    index = create_faiss_index(embeddings)

    # if user_query.lower() == "exit":
    #     break

    if chart_type not in {"bar", "line", "pie"}:
        # Fallback for unsupported chart type
        print("\nUnsupported chart type. Generating a text-based response instead...")
        try:
            # Query FAISS index
            query_embedding = generate_query_embedding(user_query, model_name='all-MiniLM-L6-v2')
            distances, indices = index.search(query_embedding, k=20)

            # Prepare results
            results = [{"metadata": metadata[idx], "distance": float(distances[0][i])} for i, idx in enumerate(indices[0])]

            # Prepare data for GPT
            result_summary = "\n".join(
                [f"Data: {json.dumps(result['metadata'])}" for result in results[:5]]
            )

            # Generate a verbose explanation using GPT
            chatgpt_prompt = f"""
            The user queried: "{user_query}".
            Based on the top matching results below, provide a general, user-friendly explanation:
            Results:
            {result_summary}

            Instructions:
            - Summarize the insights derived from the results.
            - Explain the relevance of the data to the query without mentioning specific document numbers or IDs.
            - Use clear and concise language.
            Respond with the explanation only.
            """
            response = call_openai_with_retry(chatgpt_prompt)
            explanation = response["choices"][0]["message"]["content"].strip()

            print("\nGenerated Explanation:")
            return explanation
        except Exception as e:
            print(f"Error during text response generation: {e}")

    try:
        # Query the index and get visualization data
        results, chart_data = query_and_visualize_with_openai(index, user_query, metadata, chart_type, model_name='all-MiniLM-L6-v2', k=20)

        # Display results
        print("\nTop matches:")
        for result in results:
            print(f"Metadata: {result['metadata']}")
            print(f"Distance: {result['distance']}\n")

        # Transform, display, and save chart data if generated
        if chart_data:
            formatted_chart_data = transform_chart_data_to_format(chart_data)
            print("\nTransformed Chart Data:")
            return formatted_chart_data
        else:
            return "No chart data generated."
    except Exception as e:
        print(f"Error during query processing: {e}")


# File paths
embeddings_file = "embeddings.npy"
metadata_file = "metadata.json"

# Run interactive session

@app.post("/query")
async def read_root(request: Request):
    body = await request.json()
    query = body['query']
    chart_type = body['chart_type']
    return interactive_session_with_openai(query, chart_type, embeddings_file, metadata_file)
