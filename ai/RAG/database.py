import psycopg2
from psycopg2.extras import Json
from pgvector.psycopg2 import register_vector
import numpy as np
import os

_port = os.environ.get("VECTOR_DB_PORT")
DB_PARAMS = {
    "host": os.environ.get("VECTOR_DB_HOST"),
    "port": int(_port) if _port else None,
    "user": os.environ.get("VECTOR_DB_USER"),
    "password": os.environ.get("VECTOR_DB_PASSWORD"),
    "dbname": os.environ.get("VECTOR_DB_NAME")
}

def get_connection():
    conn = psycopg2.connect(**DB_PARAMS)
    register_vector(conn)
    return conn

def init_db(table_name: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("CREATE EXTENSION IF NOT EXISTS vector")
    # 테이블 이름은 document_chunks_{table_name}
    full_table_name = f"document_chunks_{table_name}"
    cur.execute(f"""
        CREATE TABLE IF NOT EXISTS {full_table_name} (
            id SERIAL PRIMARY KEY,
            chunk_id VARCHAR(50),
            article_id VARCHAR(50),
            title TEXT,
            original_text TEXT,
            final_keywords JSONB,
            concepts JSONB,
            details JSONB,
            embedding vector(1024)
        )
    """)
    conn.commit()
    cur.close()
    conn.close()

def save_chunks(table_name: str, documents, doc_vectors):
    init_db(table_name)
    conn = get_connection()
    cur = conn.cursor()
    full_table_name = f"document_chunks_{table_name}"
    cur.execute(f"TRUNCATE TABLE {full_table_name}") # Clear old data
    
    for i, doc in enumerate(documents):
        cur.execute(f"""
            INSERT INTO {full_table_name} (
                chunk_id, article_id, title, original_text, 
                final_keywords, concepts, details, embedding
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            doc.get("chunk_id", ""),
            doc.get("article_id", ""),
            doc.get("title", ""),
            doc.get("original_text", ""),
            Json(doc.get("final_keywords", [])),
            Json(doc.get("concepts", [])),
            Json(doc.get("details", [])),
            doc_vectors[i].tolist()
        ))
    conn.commit()
    cur.close()
    conn.close()

def load_chunks(table_name: str):
    init_db(table_name)
    conn = get_connection()
    cur = conn.cursor()
    full_table_name = f"document_chunks_{table_name}"
    cur.execute(f"""
        SELECT chunk_id, article_id, title, original_text, 
               final_keywords, concepts, details, embedding 
        FROM {full_table_name} ORDER BY id
    """)
    rows = cur.fetchall()
    
    documents = []
    doc_vectors = []
    
    for row in rows:
        documents.append({
            "chunk_id": row[0],
            "article_id": row[1],
            "title": row[2],
            "original_text": row[3],
            "final_keywords": row[4],
            "concepts": row[5],
            "details": row[6]
        })
        doc_vectors.append(row[7]) # pgvector returns numpy array
        
    cur.close()
    conn.close()
    
    if len(doc_vectors) > 0:
        return documents, np.array(doc_vectors)
    return [], None
