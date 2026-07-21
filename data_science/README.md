# Data Science — FinanceAI

**Team 38 (LATAM) · Oracle ONE G9**

Módulo de Data Science para el análisis y clasificación de transacciones financieras.

## Estructura del proyecto

```
data_science/
├── data/
│   ├── raw/                          ← NO se sube a GitHub (.gitignore)
│   │   ├── financial_transactions.csv    # datos reales de Kaggle (Capa 1)
│   │   └── personal_finance_ml.csv       # datos de referencia (Capa 2)
│   ├── processed/                    ← NO se sube completo (puede pesar mucho)
│   │   └── financeai_dataset_hibrido.csv
│   └── samples/                      ← SÍ se sube (pequeño, para que Backend pruebe)
│       └── sample_financeai.json
│
├── notebooks/
│   ├── 01_eda_dataset_hibrido.ipynb      # análisis exploratorio inicial
│   └── 02_feature_engineering_modelo.ipynb
│
├── src/
│   ├── build_dataset_financeai.py    # construcción del dataset híbrido
│   ├── scoring.py                    # función de perfil financiero (aislada)
│   ├── features.py                   # ingeniería de atributos
│   ├── train_model.py                # entrenamiento del clasificador
│   └── predict.py                    # función de inferencia para Backend
│
├── models/
│   └── clasificador_gastos.pkl       # ver nota sobre Git LFS / OCI abajo
│
├── docs/
│   ├── metodologia_dataset_hibrido.md
│   ├── contrato_api.md               # JSON request/response para Backend
│   └── estado_actual.md              # checklist de progreso
│
├── requirements.txt
├── runtime.txt
└── README.md
```

## Instalación

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

pip install -r requirements.txt
```

## Flujo de trabajo

### 1. Construcción del dataset (Semana 1 — Lunes/Martes)

```bash
# Configurar credenciales de Kaggle primero:
# - Descarga tu token desde https://www.kaggle.com/account
# - Guárdalo en ~/.kaggle/kaggle.json
# - chmod 600 ~/.kaggle/kaggle.json (Linux/Mac)

python src/build_dataset_financeai.py
```

Producirá: `data/processed/financeai_dataset_hibrido.csv` (500 usuarios)

### 2. Análisis exploratorio (Semana 1 — Martes/Miércoles)

Abre `notebooks/01_eda_dataset_hibrido.ipynb` en Google Colab o Jupyter:

```bash
jupyter notebook notebooks/01_eda_dataset_hibrido.ipynb
```

### 3. Ingeniería de atributos y modelo (Semana 1 — Miércoles/Jueves)

Ver `notebooks/02_feature_engineering_modelo.ipynb` para:
- Extracción de features del texto de `descripcion`
- Entrenamiento del clasificador de gastos
- Serialización del modelo

### 4. Inferencia para Backend (Semana 1 — Viernes)

```python
from src.predict import predict_gastos

result = predict_gastos(
    ingreso_mensual=3000,
    nivel_endeudamiento=0.5,
    frecuencia_ahorro="Media",
    transacciones=[
        {"descripcion": "Compra en supermercado", "valor": 150},
        {"descripcion": "Pasaje de taxi", "valor": 50},
    ]
)
```

## Documentación clave

- **[Metodología del dataset híbrido](docs/metodologia_dataset_hibrido.md)** — Explicación de por qué usamos dos capas (Capa 1 real + Capa 2 sintética)
- **[Contrato de API](docs/contrato_api.md)** — Schema JSON del request/response para `/analisis-financiero`
- **[Estado actual](docs/estado_actual.md)** — Checklist de tareas completadas y pendientes

## Notas técnicas

### Git LFS para modelos grandes

Si el archivo `.pkl` del modelo supera 100 MB, usaremos Git LFS:

```bash
git lfs install
git lfs track "*.pkl"
git add .gitattributes
git add models/
```

### Variables de entorno

Para Kaggle API en CI/CD:

```bash
export KAGGLE_USERNAME=tu_usuario
export KAGGLE_KEY=tu_api_key
```

## Contribuciones

Ver [CONTRIBUTING.md](../CONTRIBUTING.md) en la raíz del repositorio.

## Licencia

MIT (ver LICENSE en la raíz)
