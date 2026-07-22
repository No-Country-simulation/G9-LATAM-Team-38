"""
FinanceAI Data Pipeline Module
Extracts reusable data transformation and analysis functions.

This module provides functions for:
1. Loading and validating raw transaction data (Capa 1)
2. Loading and validating financial profiles (Capa 2)
3. Building the hybrid dataset
4. Calculating financial risk profiles
5. Data quality checks
"""

import logging
import json
from pathlib import Path
from typing import Dict, List, Tuple

import numpy as np
import pandas as pd

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Constants
RANDOM_SEED = 42
N_USUARIOS = 500
RUIDO_FACTOR = (0.9, 1.1)
RIESGO_UMBRAL_CRITICO = 3
RIESGO_UMBRAL_OBSERVACION = 1

CATEGORIAS_PROYECTO = [
    "Alimentación", "Transporte", "Salud", "Vivienda",
    "Educación", "Ocio", "Servicios", "Otros",
]

MAPEO_CATEGORIAS = {
    "groceries": "Alimentación", "restaurant": "Alimentación", "food": "Alimentación",
    "supermarket": "Alimentación",
    "transport": "Transporte", "fuel": "Transporte", "taxi": "Transporte",
    "public transport": "Transporte",
    "health": "Salud", "pharmacy": "Salud", "medical": "Salud",
    "rent": "Vivienda", "housing": "Vivienda", "mortgage": "Vivienda",
    "utilities": "Servicios", "bills": "Servicios", "internet": "Servicios",
    "education": "Educación", "tuition": "Educación", "books": "Educación",
    "entertainment": "Ocio", "streaming": "Ocio", "leisure": "Ocio",
    "shopping": "Otros", "other": "Otros",
}


def cargar_capa1_transacciones(path_csv: Path, min_rows: int = 100) -> Tuple[pd.DataFrame, Dict]:
    """
    Load and validate Layer 1 (raw transactions).
    
    Args:
        path_csv: Path to the transaction CSV file
        min_rows: Minimum expected rows (for validation)
    
    Returns:
        Tuple of (cleaned dataframe, validation stats)
    
    Raises:
        FileNotFoundError: If the file doesn't exist
        ValueError: If the file has fewer rows than min_rows or is missing required columns
    """
    if not Path(path_csv).exists():
        raise FileNotFoundError(f"Transaction file not found: {path_csv}")
    
    logger.info(f"Loading Layer 1 transactions from {path_csv}")
    df = pd.read_csv(path_csv)
    
    # Validation: check minimum rows
    if len(df) < min_rows:
        logger.warning(f"⚠ Dataset has {len(df)} rows (expected ≥ {min_rows})")
    
    # Standard column renaming
    df = df.rename(columns={
        "date": "fecha", "description": "descripcion",
        "category": "categoria_original", "amount": "valor",
    })
    
    # Log original categories found
    original_categories = df["categoria_original"].astype(str).str.strip().str.lower().unique()
    unmapped = [cat for cat in original_categories if cat not in MAPEO_CATEGORIAS]
    logger.info(f"Found {len(original_categories)} unique categories")
    if unmapped:
        logger.warning(f"⚠ Unmapped categories (will fallback to 'Otros'): {unmapped}")
    
    # Category mapping
    df["categoria"] = (
        df["categoria_original"].astype(str).str.strip().str.lower()
        .map(MAPEO_CATEGORIAS).fillna("Otros")
    )
    
    # Date and value parsing
    df["fecha"] = pd.to_datetime(df["fecha"], errors="coerce")
    df["valor"] = pd.to_numeric(df["valor"], errors="coerce").abs()
    
    # Remove rows with invalid values
    initial_rows = len(df)
    df = df.dropna(subset=["valor"])
    dropped = initial_rows - len(df)
    if dropped > 0:
        logger.warning(f"⚠ Dropped {dropped} rows with invalid values")
    
    # Select and reset index
    df = df[["fecha", "descripcion", "categoria", "valor"]].reset_index(drop=True)
    
    # Validation stats
    stats = {
        "total_rows": len(df),
        "unique_categories": df["categoria"].nunique(),
        "category_distribution": df["categoria"].value_counts().to_dict(),
        "value_stats": {
            "min": df["valor"].min(),
            "max": df["valor"].max(),
            "mean": df["valor"].mean(),
        }
    }
    
    logger.info(f"✓ Layer 1 loaded: {stats['total_rows']} transactions, {stats['unique_categories']} categories")
    return df, stats


def cargar_capa2_referencia(path_csv: Path, min_rows: int = 100) -> Tuple[pd.DataFrame, Dict]:
    """
    Load and validate Layer 2 (financial profiles reference).
    
    Args:
        path_csv: Path to the reference profile CSV
        min_rows: Minimum expected rows for validation
    
    Returns:
        Tuple of (cleaned dataframe, validation stats)
    
    Raises:
        FileNotFoundError: If the file doesn't exist
    """
    if not Path(path_csv).exists():
        raise FileNotFoundError(f"Profile reference file not found: {path_csv}")
    
    logger.info(f"Loading Layer 2 reference profiles from {path_csv}")
    df = pd.read_csv(path_csv)
    
    if len(df) < min_rows:
        logger.warning(f"⚠ Profile dataset has {len(df)} rows (expected ≥ {min_rows})")
    
    df = df.rename(columns={
        "monthly_income_usd": "ingreso_mensual",
        "debt_to_income_ratio": "nivel_endeudamiento",
        "savings_to_income_ratio": "ratio_ahorro",
        "credit_score": "score_crediticio",
    })
    
    cols = ["ingreso_mensual", "nivel_endeudamiento", "ratio_ahorro", "score_crediticio"]
    initial_rows = len(df)
    df = df[cols].dropna()
    dropped = initial_rows - len(df)
    if dropped > 0:
        logger.warning(f"⚠ Dropped {dropped} rows with missing profile values")
    
    stats = {
        "total_rows": len(df),
        "income_stats": {
            "min": df["ingreso_mensual"].min(),
            "max": df["ingreso_mensual"].max(),
            "mean": df["ingreso_mensual"].mean(),
        },
        "debt_distribution": df["nivel_endeudamiento"].describe().to_dict(),
    }
    
    logger.info(f"✓ Layer 2 loaded: {stats['total_rows']} profiles")
    return df, stats


def asignar_usuarios(df_transacciones: pd.DataFrame, n_usuarios: int = N_USUARIOS) -> Tuple[pd.DataFrame, List[str]]:
    """
    Assign synthetic user IDs to transactions using Dirichlet distribution.
    
    Ensures realistic user distribution (some users have more transactions).
    """
    logger.info(f"Assigning {n_usuarios} users to {len(df_transacciones)} transactions")
    usuario_ids = [f"user_{i:04d}" for i in range(n_usuarios)]
    pesos = np.random.dirichlet(np.ones(n_usuarios) * 2, size=1)[0]
    
    df = df_transacciones.copy()
    df["usuario_id"] = np.random.choice(usuario_ids, size=len(df), p=pesos)
    
    # Log distribution
    dist = df["usuario_id"].value_counts()
    logger.info(f"✓ Users assigned. Distribution: min={dist.min()}, max={dist.max()}, mean={dist.mean():.1f}")
    
    return df, usuario_ids


def generar_perfiles_sinteticos(
    usuario_ids: List[str], 
    df_referencia: pd.DataFrame,
    ruido_factor: Tuple[float, float] = RUIDO_FACTOR
) -> pd.DataFrame:
    """Generate synthetic financial profiles by sampling from reference with noise."""
    logger.info(f"Generating synthetic profiles for {len(usuario_ids)} users")
    
    muestra = df_referencia.sample(
        n=len(usuario_ids), 
        replace=True, 
        random_state=RANDOM_SEED
    ).reset_index(drop=True)
    
    muestra["usuario_id"] = usuario_ids
    
    # Add realistic noise to income
    ruido = np.random.uniform(ruido_factor[0], ruido_factor[1], size=len(muestra))
    muestra["ingreso_mensual"] = (muestra["ingreso_mensual"] * ruido).round(2)
    muestra["nivel_endeudamiento"] = muestra["nivel_endeudamiento"].clip(0, 1)
    
    # Categorize savings frequency
    muestra["frecuencia_ahorro"] = pd.cut(
        muestra["ratio_ahorro"], 
        bins=[-np.inf, 0.05, 0.15, np.inf],
        labels=["Baja", "Media", "Alta"],
    ).astype(str)
    
    logger.info("✓ Synthetic profiles generated")
    
    return muestra[[
        "usuario_id", "ingreso_mensual", "nivel_endeudamiento", 
        "frecuencia_ahorro", "score_crediticio"
    ]]


def calcular_perfil_financiero(row: pd.Series) -> str:
    """Calculate financial risk profile based on multiple indicators."""
    riesgo = 0
    
    if row["ratio_gasto_ingreso"] > 0.9:
        riesgo += 2
    elif row["ratio_gasto_ingreso"] > 0.7:
        riesgo += 1
    
    if row["nivel_endeudamiento"] > 0.4:
        riesgo += 2
    elif row["nivel_endeudamiento"] > 0.25:
        riesgo += 1
    
    if row["frecuencia_ahorro"] == "Baja":
        riesgo += 1
    elif row["frecuencia_ahorro"] == "Alta":
        riesgo -= 1
    
    if riesgo >= RIESGO_UMBRAL_CRITICO:
        return "En riesgo"
    if riesgo >= RIESGO_UMBRAL_OBSERVACION:
        return "En observación"
    return "Saludable"


def generar_recomendaciones(row: pd.Series) -> List[str]:
    """Generate financial recommendations based on user profile."""
    recs = []
    
    if row["ratio_gasto_ingreso"] > 0.8:
        recs.append("Reducir gastos recurrentes en las categorías de mayor peso")
    if row["nivel_endeudamiento"] > 0.35:
        recs.append("Priorizar el pago de deuda antes de nuevos compromisos financieros")
    if row["frecuencia_ahorro"] == "Baja":
        recs.append("Aumentar la frecuencia de ahorro mensual")
    
    if not recs:
        recs.append("Mantener los hábitos financieros actuales")
    
    return recs


def construir_dataset_final(
    df_transacciones_usuario: pd.DataFrame, 
    df_perfiles: pd.DataFrame
) -> pd.DataFrame:
    """Merge transactions and profiles into final hybrid dataset."""
    logger.info("Building final hybrid dataset")
    
    # Aggregate spending by user and category
    resumen = (
        df_transacciones_usuario.groupby(["usuario_id", "categoria"])["valor"]
        .sum().unstack(fill_value=0).reset_index()
    )
    
    # Ensure all project categories exist
    for cat in CATEGORIAS_PROYECTO:
        if cat not in resumen.columns:
            resumen[cat] = 0.0
    
    # Merge profiles with spending summary
    df_final = df_perfiles.merge(resumen, on="usuario_id", how="left")
    df_final[CATEGORIAS_PROYECTO] = df_final[CATEGORIAS_PROYECTO].fillna(0.0)
    
    # Calculate aggregated metrics
    df_final["gasto_total"] = df_final[CATEGORIAS_PROYECTO].sum(axis=1)
    df_final["ratio_gasto_ingreso"] = (
        df_final["gasto_total"] / df_final["ingreso_mensual"].replace(0, np.nan)
    ).fillna(0)
    
    # Apply scoring functions
    df_final["perfil_financiero"] = df_final.apply(calcular_perfil_financiero, axis=1)
    df_final["recomendaciones"] = df_final.apply(generar_recomendaciones, axis=1)
    
    # Serialize recommendations to JSON
    df_final["recomendaciones"] = df_final["recomendaciones"].apply(json.dumps)
    
    logger.info(f"✓ Dataset built: {len(df_final)} users, {len(df_final.columns)} columns")
    return df_final


def validar_dataset(df: pd.DataFrame) -> Dict:
    """
    Comprehensive data quality validation report.
    
    Returns:
        Dictionary with quality metrics
    """
    logger.info("Running data quality validation...")
    
    report = {
        "shape": df.shape,
        "missing_values": df.isna().sum().to_dict(),
        "duplicate_users": len(df[df.duplicated(subset=["usuario_id"], keep=False)]),
        "users_with_zero_spending": len(df[df["gasto_total"] == 0]),
        "spending_exceeds_income": len(df[df["ratio_gasto_ingreso"] > 1.0]),
        "income_stats": {
            "min": df["ingreso_mensual"].min(),
            "max": df["ingreso_mensual"].max(),
            "mean": df["ingreso_mensual"].mean(),
            "std": df["ingreso_mensual"].std(),
        },
        "profile_distribution": df["perfil_financiero"].value_counts().to_dict(),
        "outliers": {
            "high_spending_ratio": len(df[df["ratio_gasto_ingreso"] > 3 * df["ratio_gasto_ingreso"].std()]),
            "extreme_debt": len(df[df["nivel_endeudamiento"] > 0.9]),
            "low_credit_score": len(df[df["score_crediticio"] < 400]),
        }
    }
    
    logger.info(f"✓ Validation complete. Profile distribution: {report['profile_distribution']}")
    
    return report


def descargar_kaggle_datasets(raw_dir: Path, dry_run: bool = False) -> bool:
    """
    Attempt to download Kaggle datasets (Layer 1 and Layer 2).
    
    Args:
        raw_dir: Directory to download to
        dry_run: If True, only report what would be downloaded
    
    Returns:
        True if download successful, False otherwise
    """
    import subprocess
    
    raw_dir = Path(raw_dir)
    raw_dir.mkdir(parents=True, exist_ok=True)
    
    datasets = {
        "financial_transactions.csv": "artemkabseu/financial-transactions-dataset-expenses-and-income",
        "personal_finance_ml.csv": "miadul/personal-finance-ml-dataset",
    }
    
    logger.info(f"Checking for Kaggle datasets in {raw_dir}")
    
    for filename, slug in datasets.items():
        ruta = raw_dir / filename
        if ruta.exists():
            logger.info(f"✓ Already exists: {ruta}")
            continue
        
        logger.info(f"Downloading {slug}...")
        
        if dry_run:
            logger.info(f"[DRY RUN] Would download: kaggle datasets download -d {slug} -p {raw_dir} --unzip")
            continue
        
        try:
            subprocess.run(
                ["kaggle", "datasets", "download", "-d", slug, "-p", str(raw_dir), "--unzip"],
                check=True,
                capture_output=True,
            )
            logger.info(f"✓ Downloaded: {slug}")
        except FileNotFoundError:
            logger.error("Kaggle CLI not found. Install with: pip install kaggle")
            return False
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to download {slug}: {e.stderr.decode()}")
            return False
    
    return True
