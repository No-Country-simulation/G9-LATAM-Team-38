# FinanceAI — G9 LATAM Team 38

**Oracle ONE G9 · No-Country Simulation**

Un sistema integral de análisis y clasificación de transacciones financieras que combina conjuntos de datos reales y sintéticos con modelos de aprendizaje automático para generar insights personalizados.

---

## 🎯 Descripción General

El módulo de Data Science proporciona perfilado financiero inteligente y clasificación de gastos mediante:

- **Dataset Híbrido**: 500 usuarios combinando datos reales de Kaggle + patrones financieros sintéticos
- **Ingeniería de Características**: Análisis NLP de descripciones y cálculo de ratios financieros
- **Modelo de Clasificación**: Clasificador de machine learning para categorización automática de gastos
- **Sistema de Puntuación**: Generación de perfil financiero basado en ingresos, deuda y ahorro
- **API REST**: Endpoint de inferencia para predicciones en tiempo real

---

## 📁 Estructura del Proyecto

```
data_science/
│
├── data/
│   ├── raw/                               # Datasets reales (Kaggle) — .gitignore
│   ├── processed/                         # Salida del dataset híbrido
│   └── samples/                           # JSON de muestra para pruebas del Backend
│
├── notebooks/
│   ├── 01_eda_dataset_hibrido.ipynb       # Análisis exploratorio de datos
│   └── 02_feature_engineering_modelo.ipynb # Entrenamiento y características
│
├── src/
│   ├── build_dataset_financeai.py         # Construcción del dataset híbrido
│   ├── scoring.py                         # Puntuación del perfil financiero
│   ├── features.py                        # Extracción de características
│   ├── train_model.py                     # Pipeline de entrenamiento
│   └── predict.py                         # Función de inferencia
│
├── models/
│   └── clasificador_gastos.pkl            # Clasificador entrenado
│
├── docs/
│   ├── metodologia_dataset_hibrido.md     # Estrategia del dataset
│   ├── contrato_api.md                    # Esquema de API (request/response)
│   └── estado_actual.md                   # Checklist de progreso
│
├── requirements.txt
├── runtime.txt
└── README.md
```

---

## 🚀 Inicio Rápido

### 1️⃣ Configurar Entorno

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

pip install -r requirements.txt
```

### 2️⃣ Construir Dataset Híbrido

```bash
# Configurar credenciales de Kaggle primero:
# - Descargar token desde https://www.kaggle.com/account
# - Guardar en ~/.kaggle/kaggle.json

python src/build_dataset_financeai.py
```

**Salida**: `data/processed/financeai_dataset_hibrido.csv` (500 usuarios)

### 3️⃣ Entrenar Modelo

Abrir y ejecutar `notebooks/02_feature_engineering_modelo.ipynb`:
- Extracción de características de descripciones
- Entrenamiento del clasificador
- Sintonización de hiperparámetros
- Serialización a `models/clasificador_gastos.pkl`

### 4️⃣ Predecir (Integración Backend)

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

## 📊 Componentes Clave

| Componente | Descripción |
|-----------|-----------|
| **Dataset Híbrido** | 500 perfiles reales + sintéticos para entrenamiento robusto |
| **Características NLP** | Análisis y categorización de descripciones de transacciones |
| **Ratios Financieros** | Relación ingresos-deuda, frecuencia de ahorro, patrones de gasto |
| **Clasificador** | Categorización multiclase de gastos (Alimentos, Transporte, etc.) |
| **API REST** | Endpoint JSON para integración con Backend |

---

## 📚 Documentación Detallada

- **[Metodología del Dataset](docs/metodologia_dataset_hibrido.md)** — Estrategia híbrida de dos capas de datos
- **[Contrato de API](docs/contrato_api.md)** — Schema completo para `/analisis-financiero`
- **[Estado del Progreso](docs/estado_actual.md)** — Checklist de tareas y completitud

---

## 🔧 Configuración Técnica

### Git LFS (si archivo .pkl > 100MB)

```bash
git lfs install
git lfs track "*.pkl"
git add .gitattributes
git add models/
```

### Variables de Entorno (CI/CD)

```bash
export KAGGLE_USERNAME=tu_usuario
export KAGGLE_KEY=tu_api_key
```

---

## 📝 Licencia

MIT — Ver LICENSE en la raíz del repositorio

---

**Última actualización**: 2024  
**Equipo**: No Country Simulation - G9 LATAM Team 38
