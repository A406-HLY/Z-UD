FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Environment variables for database connection
ENV VECTOR_DB_HOST=vector_db
ENV VECTOR_DB_PORT=5432

# FastAPI 포트 노출(EXPOSE 8000) 삭제 및 Kafka Consumer 실행 명령어로 교체
CMD ["python", "-u", "kafka_app.py"]
