# Contrato de API — `/analisis-financiero`

**Team 38 (LATAM) · Oracle ONE G9 · FinanceAI**

Este contrato es el entregable intermedio de Data Science hacia Backend (miércoles,
Semana 1). Permite construir el endpoint completo —validaciones, estructura de respuesta,
manejo de errores— sin esperar a que el modelo de clasificación esté entrenado.

## Endpoint

```
POST /analisis-financiero
```

## Request (entrada)

```json
{
  "ingreso_mensual": 3679.39,
  "nivel_endeudamiento": 58.0,
  "frecuencia_ahorro": "Media",
  "transacciones": [
    { "descripcion": "Ejemplo alimentación", "valor": 120.88 },
    { "descripcion": "Ejemplo transporte",   "valor": 230.73 },
    { "descripcion": "Ejemplo salud",        "valor": 297.87 },
    { "descripcion": "Ejemplo otros",        "valor": 242.84 }
  ]
}
```

## Response (salida esperada)

```json
{
  "usuario_id": "user_0003",
  "perfil_financiero": "En observación",
  "resumen_gastos": {
    "Alimentación": 120.88,
    "Transporte": 230.73,
    "Salud": 297.87,
    "Otros": 242.84
  },
  "gasto_total": 892.32,
  "ratio_gasto_ingreso": 0.243,
  "recomendaciones": [
    "Priorizar el pago de deuda antes de nuevos compromisos financieros"
  ]
}
```

> Este ejemplo usa un registro real generado por `src/build_dataset_financeai.py`
> (`usuario_id: user_0003`), no un dato inventado.

## Esquema de campos

### Request

| Campo | Tipo | Notas |
|---|---|---|
| `ingreso_mensual` | float | Ingreso mensual del usuario |
| `nivel_endeudamiento` | float | Porcentaje (0–100) |
| `frecuencia_ahorro` | string | `"Baja"` \| `"Media"` \| `"Alta"` |
| `transacciones` | array de objetos | Cada una con `descripcion` (string) y `valor` (float) |

### Response

| Campo | Tipo | Notas |
|---|---|---|
| `usuario_id` | string | Identificador del usuario |
| `perfil_financiero` | string | `"Saludable"` \| `"En observación"` \| `"En riesgo"` |
| `resumen_gastos` | objeto | Suma por categoría (solo categorías con gasto > 0) |
| `gasto_total` | float | Suma de todas las categorías |
| `ratio_gasto_ingreso` | float | `gasto_total / ingreso_mensual` |
| `recomendaciones` | array de strings | 1 o más recomendaciones generadas por reglas |

## Categorías válidas

`Alimentación`, `Transporte`, `Salud`, `Vivienda`, `Educación`, `Ocio`, `Servicios`, `Otros`

## Nota de integración (jueves)

Cuando el modelo de clasificación esté entrenado y serializado, la única diferencia en el
contrato es que `categoria` en las transacciones de entrada ya no será necesaria —el
modelo la infiere a partir de `descripcion`. Backend debe estar preparado para que ese
campo sea opcional en el request final.
