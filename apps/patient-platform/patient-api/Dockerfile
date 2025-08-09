# ----- Base Python image -----
FROM python:3.11-slim AS base
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install system deps for psycopg2
RUN apt-get update && apt-get install -y build-essential libpq-dev && rm -rf /var/lib/apt/lists/*

# ----- Install Python dependencies -----
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# ----- Copy application code -----
COPY src ./src

EXPOSE 8000

# Start FastAPI with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--app-dir", "src"] 