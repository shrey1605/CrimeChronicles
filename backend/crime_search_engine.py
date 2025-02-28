import json
import numpy as np
from sentence_transformers import SentenceTransformer
import faiss
import os
import torch

class CrimeSearchEngine:
    def __init__(self, embeddings_file: str, metadata_file: str, model_name: str = "all-MiniLM-L6-v2", hf_token: str = None):
        """
        Initialize the search engine with file paths and model configuration.
        """
        self.embeddings_file = embeddings_file
        self.metadata_file = metadata_file
        self.model_name = model_name
        self.hf_token = hf_token
        self.embeddings = None
        self.metadata = None
        self.faiss_index = None
        self.model = None

    def load_embeddings_and_metadata(self):
        """
        Load embeddings from .npy file and metadata from a line-delimited JSON file.
        """
        # Load embeddings
        self.embeddings = np.load(self.embeddings_file)
        print(f"Loaded embeddings from {self.embeddings_file}")

        # Load metadata
        self.metadata = []
        with open(self.metadata_file, "r") as metafile:
            for line in metafile:
                self.metadata.append(json.loads(line.strip()))
        print(f"Loaded metadata from {self.metadata_file} with {len(self.metadata)} entries")

    def initialize_model(self):
        """
        Initialize the SentenceTransformer model for query embeddings.
        """
        self.model = SentenceTransformer(self.model_name, use_auth_token=self.hf_token)
        self.model = self.model.to("cpu")

    def create_faiss_index(self):
        """
        Create a FAISS index from the loaded embeddings.
        """
        if self.embeddings is None:
            raise ValueError("Embeddings not loaded. Call load_embeddings_and_metadata first.")
        embedding_dim = self.embeddings.shape[1]
        self.faiss_index = faiss.IndexFlatL2(embedding_dim)
        self.faiss_index.add(self.embeddings)
        print(f"FAISS index created with {self.faiss_index.ntotal} embeddings.")

    def query_embeddings(self, query: str, k: int = 10):
        """
        Query the FAISS index for the top-k most similar embeddings.
        """
        if not self.faiss_index or not self.model:
            raise ValueError("FAISS index or model not initialized. Call setup first.")

        # Generate embedding for the query
        query_embedding = self.model.encode([query], convert_to_tensor=True, device="cpu").cpu().numpy()

        # Search for the top-k matches
        distances, indices = self.faiss_index.search(query_embedding, k)

        # Retrieve results
        results = [{"metadata": self.metadata[idx], "distance": distances[0][i]} for i, idx in enumerate(indices[0])]
        return results
    
    # Retry logic for OpenAI API calls
    def call_openai_with_retry(self, prompt, retries=3, delay=10):
        for attempt in range(retries):
            try:
                response = openai.ChatCompletion.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": "You are an assistant generating chart visualization data for queries."},
                        {"role": "user", "content": prompt}
                    ],
                    timeout=60
                )
                return response
            except (openai.error.APIError, openai.error.Timeout) as e:
                print(f"API error: {e}. Retrying in {delay} seconds... ({attempt + 1}/{retries})")
                time.sleep(delay)
        raise Exception("Failed to connect to OpenAI API after multiple attempts.")
    
    # Query FAISS index with enhanced functionality
    def charting_with_openai(self, query, chart_type, k=10):
        # Generate embedding for the query
        query_embedding = self.query_embedding(query, self.model_name)

        # Search for the top-k matches
        distances, indices = self.faiss_index.search(query_embedding, k)

        # Prepare results
        results = [{"metadata": metadata[idx], "distance": float(distances[0][i])} for i, idx in enumerate(indices[0])]

        # Use only the top 10 results for ChatGPT input
        top_results = results[:10]
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
    
    def create_charts(self, user_query, metadata):
        try:
            # Query the index and get visualization data
            results, chart_data = charting_with_openai(user_query, chart_type, k=10)

            # Display results
            print("\nTop matches:")
            for result in results:
                print(f"Metadata: {result['metadata']}")
                print(f"Distance: {result['distance']}\n")

            # Transform, display, and save chart data if generated
            if chart_data:
                return transform_chart_data_to_format(chart_data)
            else:
                return "No chart data generated."
        except Exception as e:
            print(f"Error during query processing: {e}")

    def transform_chart_data_to_format(self, generated_data):
        """
        Transform generated chart data into the required format, including support for pie charts.

        Args:
            generated_data (dict): The generated chart data.

        Returns:
            dict: Transformed chart data in the specified format.
        """
        if generated_data["type"] == "pie":
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
        else:
            # Bar or Line Chart Format
            transformed_data = {
                "chart": {
                    "type": generated_data["type"]
                },
                "title": {
                    "text": "Number of Crimes by Time"
                },
                "xAxis": {
                    "categories": generated_data["labels"]
                },
                "series": [
                    {
                        "name": "Time of Crime",
                        "data": generated_data["values"]
                    }
                ]
            }
        return transformed_data

    def texting_with_openai(self, user_query):
        print("\nUnsupported chart type. Generating a text-based response instead...")
        try:
            # Query FAISS index
            query_embedding = self.query_embedding(user_query)
            distances, indices = self.index.search(query_embedding, k=10)

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

            return explanation
        except Exception as e:
            print(f"Error during text response generation: {e}")
    
    def setup(self):
        """
        Load embeddings, metadata, initialize the model, and create the FAISS index.
        """
        self.load_embeddings_and_metadata()
        self.initialize_model()
        self.create_faiss_index()
