import psycopg2
from psycopg2.extras import Json
from pgvector.psycopg2 import register_vector
import numpy as np
import os
_port = os.environ.get('VECTOR_DB_PORT')
DB_PARAMS = {'host': os.environ.get('VECTOR_DB_HOST'), 'port': int(_port) if _port else None, 'user': os.environ.get('VECTOR_DB_USER'), 'password': os.environ.get('VECTOR_DB_PASSWORD'), 'dbname': os.environ.get('VECTOR_DB_NAME')}

def get_connection():
    conn = psycopg2.connect(**DB_PARAMS)
    register_vector(conn)
    return conn

def init_db(table_name: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute('CREATE EXTENSION IF NOT EXISTS vector')
    full_table_name = f'document_chunks_{table_name}'
    cur.execute(f'\n        CREATE TABLE IF NOT EXISTS {full_table_name} (\n            id SERIAL PRIMARY KEY,\n            chunk_id VARCHAR(50),\n            article_id VARCHAR(50),\n            title TEXT,\n            original_text TEXT,\n            final_keywords JSONB,\n            concepts JSONB,\n            details JSONB,\n            embedding vector(1024)\n        )\n    ')
    conn.commit()
    cur.close()
    conn.close()

def save_chunks(table_name: str, documents, doc_vectors):
    init_db(table_name)
    conn = get_connection()
    cur = conn.cursor()
    full_table_name = f'document_chunks_{table_name}'
    cur.execute(f'TRUNCATE TABLE {full_table_name}')
    for i, doc in enumerate(documents):
        cur.execute(f'\n            INSERT INTO {full_table_name} (\n                chunk_id, article_id, title, original_text, \n                final_keywords, concepts, details, embedding\n            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)\n        ', (doc.get('chunk_id', ''), doc.get('article_id', ''), doc.get('title', ''), doc.get('original_text', ''), Json(doc.get('final_keywords', [])), Json(doc.get('concepts', [])), Json(doc.get('details', [])), doc_vectors[i].tolist()))
    conn.commit()
    cur.close()
    conn.close()

def load_chunks(table_name: str):
    init_db(table_name)
    conn = get_connection()
    cur = conn.cursor()
    full_table_name = f'document_chunks_{table_name}'
    cur.execute(f'\n        SELECT chunk_id, article_id, title, original_text, \n               final_keywords, concepts, details, embedding \n        FROM {full_table_name} ORDER BY id\n    ')
    rows = cur.fetchall()
    documents = []
    doc_vectors = []
    for row in rows:
        documents.append({'chunk_id': row[0], 'article_id': row[1], 'title': row[2], 'original_text': row[3], 'final_keywords': row[4], 'concepts': row[5], 'details': row[6]})
        doc_vectors.append(row[7])
    cur.close()
    conn.close()
    if len(doc_vectors) > 0:
        return (documents, np.array(doc_vectors))
    return ([], None)
