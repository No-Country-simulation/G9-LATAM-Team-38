# FinanceAI — Datasets

Este folder documenta los datos que usan los dos modelos del microservicio. No hay un script único que los genere desde cero: son archivos ya procesados, cada uno con su propio origen.

## Modelo 1 — Clasificador de gastos (`clasificador_gastos.pkl`)

- **`raw/Expenses_clean.csv`** — gastos individuales sin categorizar por texto (`date_time, category, account, amount, currency, tags`).
- **`processed/df_gastos.csv`** — el dataset real de entrenamiento: `descripcion_limpia, categoria`. Rescatado de la rama `jacob_2` (PR #40, cerrado sin mergear), donde también vive el modelo que hoy está en producción.
- El notebook `../notebooks/Procesado_Datos_Clasificador.ipynb` documenta cómo se limpió `Expenses_clean.csv` para llegar a `df_gastos.csv`.

**Pendiente:** el script que entrenó el Pipeline TF-IDF + Regresión Logística (`clasificador_gastos.pkl`) a partir de `df_gastos.csv` no está en el repo — ni en `jacob_2` ni en ningún otro lado. Los notebooks `Notebook_Entrenamiento.ipynb` y `Notebook_Entrenamiento_Jacob.ipynb` entrenan un RandomForest distinto, que no es el modelo en producción. Seguimiento con Jacob (autor de `jacob_2`).

## Modelo 2 — Perfil financiero (`perfil_financiero.pkl` + `codificador_perfil.pkl`)

- **`processed/dataset_financiero_completo.csv`** (y su `.xlsx`) — dataset ya procesado, features: `ingreso_mensual`, `nivel_endeudamiento`.
- Origen de entrenamiento: sección "Modelo 2" de `../notebooks/Notebook_Entrenamiento.ipynb`.

## Notas

- No existe (todavía) un pipeline automatizado que regenere estos datasets desde datos crudos externos — cualquier mención previa a un módulo `src.data.build_dataset_financeai` u output `financeai_dataset_hibrido.csv` quedó obsoleta y se removió de este README; ese código nunca se subió al repo y el CSV que generaba ya se borró por ser un artefacto huérfano.
- Si se recupera o reconstruye el entrenamiento del Modelo 1, documentarlo aquí y actualizar esta sección.
