```markdown name=README.md
# FinanceAI — G9 LATAM Team 38

**Oracle ONE G9 · No-Country Simulation**

A comprehensive financial transaction analysis and classification system combining real and synthetic datasets with machine learning models for personal finance insights.

---

## 🎯 Data Science Overview

The DS module provides intelligent financial profiling and expense classification through:

- **Hybrid Dataset**: 500 users combining real Kaggle data (Layer 1) + synthetic financial patterns (Layer 2)
- **Feature Engineering**: NLP-based transaction description analysis and financial ratio calculations
- **Classification Model**: Machine-learning classifier for expense categorization
- **Scoring System**: Financial profile generation based on income, debt, and savings behavior
- **API Integration**: RESTful inference endpoint for real-time Backend predictions

---

## 📁 Project Structure

```
data_science/
├── data/
│   ├── raw/                          # Real datasets (Kaggle) — .gitignore
│   ├── processed/                    # Hybrid dataset output
│   └── samples/                      # Sample JSON for Backend testing
├── notebooks/
│   ├── 01_eda_dataset_hibrido.ipynb      # Exploratory data analysis
│   └── 02_feature_engineering_modelo.ipynb # Model training & features
├── src/
│   ├── build_dataset_financeai.py        # Hybrid dataset construction
│   ├── scoring.py                        # Financial profile scoring
│   ├── features.py                       # Feature extraction
│   ├── train_model.py                    # Model training pipeline
│   └── predict.py                        # Inference function
├── models/
│   └── clasificador_gastos.pkl           # Trained expense classifier
├── docs/
│   ├── metodologia_dataset_hibrido.md    # Dataset strategy
│   ├── contrato_api.md                   # API schema (request/response)
│   └── estado_actual.md                  # Progress checklist
├── requirements.txt
└── runtime.txt
```

---

## 🚀 Quick Start

### 1. Setup Environment
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

### 2. Build Hybrid Dataset
```bash
python src/build_dataset_financeai.py
# Requires Kaggle API token (~/.kaggle/kaggle.json)
```

### 3. Train Model
Open and run `notebooks/02_feature_engineering_modelo.ipynb` for:
- Feature extraction from transaction descriptions
- Classifier training & hyperparameter tuning
- Model serialization to `models/clasificador_gastos.pkl`

### 4. Predict (Backend Integration)
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
# Returns: financial profile + expense classifications
```

---

## 📊 Key Features

| Component | Purpose |
|-----------|---------|
| **Hybrid Dataset** | 500 real + synthetic user profiles for robust model training |
| **NLP Features** | Transaction description parsing & categorization |
| **Financial Ratios** | Income-to-debt, savings frequency, spending patterns |
| **Classification** | Multi-class expense categorization (Food, Transport, etc.) |
| **Scoring API** | JSON request/response for Backend integration |

---

## 📚 Documentation

- **[Dataset Methodology](docs/metodologia_dataset_hibrido.md)** — Why hybrid approach + data layering strategy
- **[API Contract](docs/contrato_api.md)** — Full JSON schema for `/analisis-financiero` endpoint
- **[Progress Status](docs/estado_actual.md)** — Task checklist & completion tracking

---

## 🔧 Technical Notes

**Git LFS** (if model > 100MB):
```bash
git lfs install && git lfs track "*.pkl"
```

**Environment Variables** (CI/CD):
```bash
export KAGGLE_USERNAME=<your_username>
export KAGGLE_KEY=<your_api_key>
```

---

## 📝 License

MIT — See LICENSE in repository root

```

This README provides:
- ✅ Concise project overview focused on DS aspects
- ✅ Clear directory structure explanation
- ✅ Quick start guide for key workflows
- ✅ Feature summary table
- ✅ Links to detailed documentation
- ✅ Technical setup notes
- ✅ Backend integration examples

Ready to use in the ds-stage branch!
