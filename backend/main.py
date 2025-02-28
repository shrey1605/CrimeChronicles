from fastapi import FastAPI, HTTPException, Request, Depends, Query
from pydantic import BaseModel
from typing import List, Optional
from crime_search_engine import CrimeSearchEngine
import psycopg2
from psycopg2.extras import RealDictCursor
from passlib.context import CryptContext
from fastapi.middleware.cors import CORSMiddleware
import requests
from fastapi.responses import JSONResponse
import json
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




# Database connection settings
DB_CONFIG = {
    "host": "ce0lkuo944ch99.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com",
    "port": 5432,
    "database": "d13rbt7mg7hn29",
    "user": "u4ibo387dcdtna",
    "password": "pacd72ed23e71851106933f7dab36e222133126c2881c48b7ed97da8a5ebd2e41"
}

# Initialize password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_db_connection():
    """Establish a connection to the PostgreSQL database."""
    try:
        return psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")


def hash_password(password: str) -> str:
    """Hash a plain text password."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)

# Response model for the query API
# class QueryResponse(BaseModel):
#     status: str
#     data: str

class HistoryResponse(BaseModel):
    queries: List[str]
    replies: List[str]


@app.get("/history", response_model=HistoryResponse)
async def get_history(user_email: str = Query(..., alias="user_email"), page_no: int = Query(..., alias="page_no")):
    """
    API to get the history of a user's queries and responses.
    """
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT user_query, response
                FROM history 
                WHERE user_email = %s
                ORDER BY created_at DESC
                LIMIT 5
                OFFSET %s
                """,
                (user_email, page_no)
            )
            history = cursor.fetchall()
            
            # # Separate the queries and responses into two lists
            # queries = [item[0] for item in history]  # Extracting user_query
            # replies = [item[1] for item in history]  # Extracting response
            
            # Return the structured response
            return JSONResponse(content=history)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve history: {str(e)}")
    finally:
        conn.close()
    

@app.post("/signup")
async def signup(request: Request):
    """API to handle user signup."""
    body = await request.json()
    email = body.get("email")
    phone = body.get("phone")
    name = body.get("name")
    password = body.get("password")

    if not all([email, phone, name, password]):
        raise HTTPException(status_code=400, detail="Missing required fields")

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT email FROM users WHERE email = %s", (email,))
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="Email already registered.")

            hashed_password = hash_password(password)
            cursor.execute(
                "INSERT INTO users (email, phone, name, password) VALUES (%s, %s, %s, %s)",
                (email, phone, name, hashed_password)
            )
            conn.commit()
        return {"message": "User registered successfully."}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Signup failed: {str(e)}")
    finally:
        conn.close()


@app.post("/login")
async def login(request: Request):
    """API to handle user login."""
    body = await request.json()
    email = body.get("email")
    password = body.get("password")

    if not all([email, password]):
        raise HTTPException(status_code=400, detail="Missing required fields")

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT email, password FROM users WHERE email = %s", (email,))
            user = cursor.fetchone()

            if not user or not verify_password(password, user["password"]):
                raise HTTPException(status_code=401, detail="Invalid email or password.")
        return {"message": "Login successful."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")
    finally:
        conn.close()



# @app.post("/query", response_model=QueryResponse)
# async def query_api(request: Request):
#     """API to query the CrimeSearchEngine."""
#     body = await request.json()
#     user_email = body.get("user_email")
#     user_query = body.get("user_query")
#     is_chart = body.get("is_chart")
#     response_data = ""

#     if not user_query:
#         raise HTTPException(status_code=400, detail="Missing user query")

#     try:
#         if is_chart == 1:
#             chart_type = body.get("chart_type")
#             response_data = search_engine.create_charts(user_query, chart_type)
#         else:
#             response_data = search_engine.texting_with_openai(user_query)
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

#     # Handle empty response
#     if not response_data:
#         response_data = "No response available"

#     # Store query and response in history
#     conn = get_db_connection()
#     try:
#         with conn.cursor() as cursor:
#             cursor.execute(
#                 """
#                 INSERT INTO history (user_email, user_query, response) 
#                 VALUES (%s, %s, %s)
#                 ON CONFLICT (user_email) 
#                 DO UPDATE SET user_query = EXCLUDED.user_query, response = EXCLUDED.response, created_at = CURRENT_TIMESTAMP
#                 """,
#                 (user_email, user_query, response_data)
#             )
#             conn.commit()
#     except Exception as e:
#         conn.rollback()
#         raise HTTPException(status_code=500, detail=f"Failed to store query history: {str(e)}")
#     finally:
#         conn.close()

#     return QueryResponse(results=[], message="Query executed successfully.", history=None)


@app.post("/query")
async def query_api(request: Request):
    """API to query the CrimeSearchEngine."""
    body = await request.json()
    user_email = body.get("user_email")
    user_query = body.get("user_query")
    #is_chart = body.get("is_chart")
    chart_type = body.get("chart_type")
    response_data = ""
    print(f"starting the method : {user_email} {user_query}")

    if not user_query:
        raise HTTPException(status_code=400, detail="Missing user query")

    response_data = requests.post(
        'http://localhost:8000/query',
        json={"query": user_query, "chart_type": chart_type}
    ).json()
    
    if chart_type:
        response_data_store=json.dumps(response_data)
    else:
        response_data_store=response_data
        

    # try:
    #     if is_chart == 1:
    #         print(f"Inside chart")
    #         chart_type = body.get("chart_type")
    #         print(f"CHart type is {chart_type}")
    #         response_data = search_engine.create_charts(user_query, chart_type)
    #     else:
    #         print(f"Inside text")
    #         response_data = search_engine.texting_with_openai(user_query)
    # except Exception as e:
    #     raise HTTPException(status_code=500, detail=str(e))

    # Handle empty response
    if not response_data:
        response_data = "No response available"

    # Store query and response in history
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
           cursor.execute(
                """
                INSERT INTO history (user_email, user_query, response)
                VALUES (%s, %s, %s)
                """,
                (user_email, user_query, response_data_store)
            )
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to store query history: {str(e)}")
    finally:
        conn.close()

    # Explicitly set history to None
    if chart_type:
        return JSONResponse(content={"data":response_data})
    return {"data": response_data}
    #return response_data

    
@app.get("/history")
async def get_history(email: str = Query(..., alias="email")):
    """
    API to get the history of a user's queries and responses.
    """
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT user_email, user_query, response 
                FROM history 
                WHERE user_email = %s 
                ORDER BY created_at DESC
                """,
                (email,)
            )
            history = cursor.fetchall()
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve history: {str(e)}")
    finally:
        conn.close()


@app.get("/")
def read_root():
    """Health check endpoint."""
    return {"message": "Welcome!"}
