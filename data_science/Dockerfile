# Tarea 56 — Dockerfile para el microservicio de Data Science (FastAPI)
# Imagen base alineada con la decision de equipo: Python 3.11.x (no 3.10)

FROM python:3.11-slim

# Evitar .pyc y forzar salida de logs sin buffer
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Dependencias del sistema mínimas (build de paquetes con extensiones nativas)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias de Python primero (aprovecha la cache de capas)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del código del microservicio (main.py, modelos .pkl, etc.)
COPY . .

# Usuario no privilegiado
RUN useradd --create-home --shell /bin/bash appuser
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Un solo worker mantiene acotada la memoria de los modelos cargados en RAM;
# los limites de concurrencia/requests evitan que una instancia colgada por
# el timeout del backend (servicio.ia.read-timeout-ms) acumule conexiones.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1", "--limit-concurrency", "32", "--limit-max-requests", "1000"]
