```markdown name=README.md
# FinanceAI — G9 LATAM Team 38

**Oracle ONE G9 · No-Country Simulation**

Un sistema integral de análisis y clasificación de transacciones financieras que combina conjuntos de datos reales y sintéticos con modelos de aprendizaje automático para generar insights personales de finanzas.

---

## 🎯 Descripción General de Ciencia de Datos

El módulo DS proporciona perfilado financiero inteligente y clasificación de gastos a través de:

- **Dataset Híbrido**: 500 usuarios combinando datos reales de Kaggle (Capa 1) + patrones financieros sintéticos (Capa 2)
- **Ingeniería de Características**: Análisis de descripciones de transacciones basado en NLP y cálculo de ratios financieros
- **Modelo de Clasificación**: Clasificador de aprendizaje automático para categorización de gastos
- **Sistema de Puntuación**: Generación de perfil financiero basado en ingresos, deuda y comportamiento de ahorro
- **Integración API**: Endpoint de inferencia RESTful para predicciones en tiempo real del Backend

---

## 📁 Estructura del Proyecto

```
data_science/

├── data/

│   ├── raw/                          # Datasets reales (Kaggle) — .gitignore

│   ├── processed/                    # Salida del dataset híbrido

│   └── samples/                      # JSON de muestra para pruebas del Backend

├── notebooks/

│   ├── 01_eda_dataset_hibrido.ipynb      # Análisis exploratorio de datos

│   └── 02_feature_engineering_modelo.ipynb # Entrenamiento del modelo y características

├── src/

│   ├── build_dataset_financeai.py        # Construcción del dataset híbrido
│   ├── scoring.py                        # Puntuación del perfil financiero
│   ├── features.py                       # Extracción de características
│   ├── train_model.py                    # Pipeline de entrenamiento del modelo
│   └── predict.py                        # Función de inferencia
├── models/
│   └── clasificador_gastos.pkl           # Clasificador de gastos entrenado
├── docs/
│   ├── metodologia_dataset_hibrido.md    # Estrategia del dataset
│   ├── contrato_api.md                   # Esquema de API (solicitud/respuesta)
│   └── estado_actual.md                  # Checklist de progreso
├── requirements.txt
└── runtime.txt
```

---

## 🚀 Inicio Rápido

### 1. Configurar Entorno
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

### 2. Construir Dataset Híbrido
```bash
python src/build_dataset_financeai.py
# Requiere token de API de Kaggle (~/.kaggle/kaggle.json)
```

### 3. Entrenar Modelo
Abre y ejecuta `notebooks/02_feature_engineering_modelo.ipynb` para:
- Extracción de características de descripciones de transacciones
- Entrenamiento del clasificador y sintonización de hiperparámetros
- Serialización del modelo a `models/clasificador_gastos.pkl`

### 4. Predecir (Integración con Backend)
```python
from src.predict import predict_gastos

result = predict_gastos(
    ingreso_mensual=3000,
    nivel_endeudamiento=0.5,
    frecuencia_ahorro="Media",
    transacciones=[
        {"descripcion": "Compra en supermercado", "valor": 150},
        {"descripcion": "Pasaje de taxi", "valor": 50}
    ]
)
# Retorna: perfil financiero + clasificaciones de gastos
```

---

## 📊 Características Clave

| Componente | Propósito |
|-----------|---------|
| **Dataset Híbrido** | 500 perfiles de usuarios reales + sintéticos para entrenamiento robusto del modelo |
| **Características NLP** | Análisis y categorización de descripciones de transacciones |
| **Ratios Financieros** | Relación ingresos-deuda, frecuencia de ahorro, patrones de gasto |
| **Clasificación** | Categorización multiclase de gastos (Alimentos, Transporte, etc.) |
| **API de Puntuación** | Solicitud/respuesta JSON para integración con Backend |

---

## 📚 Documentación

- **[Metodología del Dataset](docs/metodologia_dataset_hibrido.md)** — Por qué enfoque híbrido + estrategia de capas de datos
- **[Contrato de API](docs/contrato_api.md)** — Esquema JSON completo para endpoint `/analisis-financiero`
- **[Estado del Progreso](docs/estado_actual.md)** — Checklist de tareas y seguimiento de completitud

---

## 🔧 Notas Técnicas

**Git LFS** (si el modelo > 100MB):
```bash
git lfs install && git lfs track "*.pkl"
```

**Variables de Entorno** (CI/CD):
```bash
export KAGGLE_USERNAME=<tu_usuario>
export KAGGLE_KEY=<tu_clave_api>
```

---

## 📝 Licencia

MIT — Ver LICENSE en la raíz del repositorio
```

Este README traducido incluye:
- ✅ Descripción general del proyecto enfocada en DS
- ✅ Estructura de directorios clara
- ✅ Guía de inicio rápido para flujos clave
- ✅ Tabla resumen de características
- ✅ Enlaces a documentación detallada
- ✅ Notas de configuración técnica
- ✅ Ejemplos de integración con Backend
- ✅ **Completamente en español**
