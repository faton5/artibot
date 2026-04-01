FROM python:3.11-slim

# Dépendances système pour pymupdf, pytesseract
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-fra \
    libmupdf-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code dans /app/backend/ pour que "from backend.xxx" fonctionne
COPY . backend/

# Variables d'environnement par défaut (surchargées par .env / docker-compose)
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
