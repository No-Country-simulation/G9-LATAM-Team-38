# Estado actual — Equipo de Data Science

**Team 38 (LATAM) · Oracle ONE G9 · FinanceAI**
Última actualización: 21 de julio de 2026 (Semana 1)

## ✅ Completado

- [x] Propuesta de dataset evaluada y decidida (Híbrido explícito)
- [x] Fuentes de datos identificadas y documentadas (Capa 1 y Capa 2)
- [x] Script de construcción del dataset (`src/build_dataset_financeai.py`) — probado sin errores
- [x] Función de scoring del perfil financiero documentada
- [x] Notebook de EDA construido y probado con datos simulados (Colab)
- [x] Estándar de versión de Python fijado (3.11) en `requirements.txt` y `runtime.txt`
- [x] Dataset híbrido generado (500 usuarios) con transacciones reales y perfil sintético
- [x] Guía completa de convenciones para Java/Python en hackathon documentada

## ⬜ Pendiente

- [ ] Descarga real de los datasets desde Kaggle (requiere `kaggle.json` de cada integrante)
- [ ] EDA ejecutado con los datos reales (no simulados)
- [ ] Ingeniería de atributos para el clasificador de gastos
- [ ] Primer modelo de clasificación entrenado y evaluado
- [ ] Unificar las dos bases ya existentes (generada en VS Code + sintética de Kaggle) con el pipeline
- [ ] Congelar contrato JSON con datos reales (miércoles, Semana 1)
- [ ] Modelo serializado y función de inferencia entregados a Backend (jueves, Semana 1)

## Archivos relacionados

| Archivo | Descripción |
|---|---|
| `src/build_dataset_financeai.py` | Pipeline de construcción del dataset híbrido |
| `notebooks/01_eda_dataset_hibrido.ipynb` | EDA inicial (Colab) |
| `docs/metodologia_dataset_hibrido.md` | Metodología completa del dataset híbrido |
| `docs/contrato_api.md` | Contrato de request/response para Backend |
| `requirements.txt` / `runtime.txt` | Dependencias y versión de Python fijada (3.11.x) |

## Plan de la semana (referencia rápida)

| Día | Entregable |
|---|---|
| Martes | Dataset unificado (fuentes reales) + primer modelo exploratorio |
| Miércoles | Esquema final + contrato JSON + función de scoring documentada → Backend |
| Jueves | Modelo entrenado, evaluado y serializado + función de inferencia |
