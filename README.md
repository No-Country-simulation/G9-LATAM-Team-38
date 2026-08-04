# FinanceAI

## Descripción del proyecto

**FinanceAI** es un asistente de salud financiera desarrollado como proyecto del **Hackathon Oracle ONE — Generación 9**, por el equipo **G9-LATAM-Team 38**.

- **Sector:** Fintech
- **Objetivo:** Brindar a los usuarios herramientas de análisis financiero personal, incluyendo clasificación automática de gastos y evaluación de perfil financiero, para apoyar la toma de decisiones y el bienestar económico.

## Equipo — G9-LATAM-Team 38

| Integrante | Rol |
|---|---|
| Brayan Camargo Ramírez | Project Manager (PM) |
| Armando | Data Scientist |
| Jesús García | Data Scientist |
| Sonia Moran Jarquin | Data Scientist |
| Gabriel Gil | Backend |
| Ian Alonso Jesus Osnaya | Backend |
| Marco Antonio Arias Mullisaca | Full Stack |
| Julio Cesar Brito Guarneros | Software Engineer / Infraestructura |

## Arquitectura (resumen)

- **Backend:** Java Spring Boot
- **Microservicio de Data Science:** Python (FastAPI), expuesto en el puerto 8000 vía `/predict-internal`
- **Contenerización:** Docker (imagen base `python:3.11-slim`)
- **Despliegue:** Oracle Cloud Infrastructure (OCI) — Compute (VM) + docker-compose

## Estructura del repositorio

```
backend/
data_science/
docs/
.gitignore
docker-compose.yml
README.md
```

## Convenciones

Este proyecto sigue la guía de convenciones del equipo (`Guia_Completa_Convenciones_Hackathon_Java_Python.md`):
- Carpetas y archivos en `snake_case` (ej. `data_science/`)
- Branches con guiones medios, sin slash (ej. `feature-user-auth`)
- Conventional Commits para los mensajes de commit

## Prueba aislada en Postman

El entrypoint raíz levanta por defecto el modo `model-free`, por lo que la prueba no depende de modelos entrenados ni de una base de datos.

1. Inicia el API desde la raíz del proyecto:

   ```bash
   python3 -m uvicorn main:app --host 127.0.0.1 --port 8000
   ```

2. Importa en Postman la colección [`docs/postman/FinanceAI-local.postman_collection.json`](docs/postman/FinanceAI-local.postman_collection.json).
3. Ejecuta las solicitudes `Health - API disponible sin modelos` y `Predict internal - contrato de red aislado`.

La segunda solicitud usa `POST http://localhost:8000/predict-internal` y debe devolver `200 OK`, `mode: "model-free"` y `models_loaded: false`. Para activar inferencia real se debe iniciar con `ENABLE_MODEL_API=1`; esa ejecución sí requiere los modelos disponibles.
