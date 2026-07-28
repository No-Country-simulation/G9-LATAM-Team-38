import pickle
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI

# Rutas a los modelos serializados
MODELS_DIR = Path(__file__).parent / "models"
CLASIFICADOR_GASTOS_PATH = MODELS_DIR / "clasificador_gastos.pkl"
PERFIL_FINANCIERO_PATH = MODELS_DIR / "perfil_financiero.pkl"

# Diccionario donde viviran los modelos ya cargados en memoria
modelos: dict = {}


def cargar_modelo(path: Path):
    with open(path, "rb") as f:
        return pickle.load(f)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: cargar modelos una sola vez al arrancar la app
    try:
        modelos["clasificador_gastos"] = cargar_modelo(CLASIFICADOR_GASTOS_PATH)
        modelos["perfil_financiero"] = cargar_modelo(PERFIL_FINANCIERO_PATH)
        print("Modelos cargados correctamente.")
    except FileNotFoundError as e:
        raise RuntimeError(f"No se encontro el archivo de modelo: {e.filename}") from e
    except Exception as e:
        raise RuntimeError(f"Error al cargar los modelos: {e}") from e

    yield

    # Shutdown: limpiar referencias (opcional)
    modelos.clear()


app = FastAPI(title="FinanceAI - Data Science Microservice", lifespan=lifespan)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "modelos_cargados": list(modelos.keys()),
    }