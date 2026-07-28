import pickle
from pathlib import Path
from contextlib import asynccontextmanager
from datetime import date
from enum import Enum
from typing import List, Optional, Any

from fastapi import FastAPI
from pydantic import BaseModel, Field, field_validator, ConfigDict
from pydantic.alias_generators import to_camel

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


# ----------------
# Schemas (Pydantic v2) — input in camelCase, attributes in snake_case
# ----------------

class NivelEndeudamiento(str, Enum):
    BAJO = "bajo"
    MEDIO = "medio"
    ALTO = "alto"


class BaseSchema(BaseModel):
    """Base común: acepta JSON en camelCase y expone atributos en snake_case."""
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class Transaccion(BaseSchema):
    id_transaccion: Optional[str] = Field(
        default=None,
        description="ID de la transacción en el sistema Java (opcional, útil para trazabilidad)",
    )
    descripcion: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="Texto de la transacción, entrada del Modelo 1 (clasificador de gastos)",
    )
    monto: float = Field(..., gt=0, description="Monto de la transacción, debe ser positivo")
    fecha: Optional[date] = Field(default=None, description="Fecha ISO 8601 (YYYY-MM-DD)")

    @field_validator("descripcion")
    @classmethod
    def descripcion_no_vacia(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("descripcion no puede estar vacía")
        return v


class TransaccionesRequest(BaseSchema):
    """Payload de entrada para /predict-internal."""
    usuario_id: Optional[str] = None
    transacciones: List[Transaccion] = Field(..., min_length=1)

    # Campos opcionales para el Modelo 2 (perfil financiero)
    ingreso_mensual: Optional[float] = Field(default=None, ge=0)
    nivel_endeudamiento: Optional[NivelEndeudamiento] = None

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "usuarioId": "USR-4521",
                "transacciones": [
                    {"idTransaccion": "TX-00123", "descripcion": "Pago renta departamento", "monto": 8500.00, "fecha": "2026-07-15"},
                    {"idTransaccion": "TX-00124", "descripcion": "Uber Eats cena", "monto": 245.50, "fecha": "2026-07-16"},
                ],
                "ingresoMensual": 25000.00,
                "nivelEndeudamiento": "medio",
            }
        },
    )


app = FastAPI(title="FinanceAI - Data Science Microservice", lifespan=lifespan)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "modelos_cargados": list(modelos.keys()),
    }


@app.post("/predict-internal")
def predict_internal(payload: TransaccionesRequest):
    """Endpoint que recibe transacciones (camelCase en JSON) y devuelve categorías.

    Usa el modelo cargado en modelos['clasificador_gastos'] si tiene .predict().
    Para modelos placeholder sin método predict, devuelve una categoría de prueba.
    """
    resultados = []
    modelo_gastos: Any = modelos.get("clasificador_gastos")

    for tx in payload.transacciones:
        # Intentar usar predict si existe (modelos reales de scikit-learn/etc.)
        categoria = None
        try:
            predictor = getattr(modelo_gastos, "predict", None)
            if callable(predictor):
                # Muchos modelos esperan una lista/array de características; aquí sólo usamos la descripcion
                categoria = predictor([tx.descripcion])[0]
            else:
                # Fallback para placeholders
                categoria = f"placeholder_categoria_{tx.descripcion[:10]}"
        except Exception:
            categoria = "error_al_predecir"

        resultados.append({"idTransaccion": tx.id_transaccion, "categoria": categoria})

    return {"transacciones": resultados}