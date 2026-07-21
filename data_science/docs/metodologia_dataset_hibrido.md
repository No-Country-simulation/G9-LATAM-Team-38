# Metodología del Dataset Híbrido — FinanceAI

**Team 38 (LATAM) · Oracle ONE G9**

## 1. Decisión tomada

El equipo de Data Science (Jesús García, Sonia Moran, Jesus Armando Tapia) eligió la
**Propuesta 3 — Dataset Híbrido Explícito** como base para construir el conjunto de datos
financieros de FinanceAI, tras comparar tres alternativas (100% sintética, pública
adaptada, e híbrida) frente a criterios de calidad de datos, rapidez, defendibilidad ante
evaluadores, riesgo técnico y esfuerzo del equipo.

**Idea central:** no todo el dataset se genera igual. Se separan explícitamente dos capas
de información, cada una con un propósito distinto y una fuente distinta.

## 2. Arquitectura de dos capas

| | Capa 1 — Transacciones | Capa 2 — Perfil financiero |
|---|---|---|
| **¿Qué es?** | Datos reales (anonimizados) de gasto: descripción, categoría, monto | Datos sintéticos de nivel de usuario: ingreso, endeudamiento, ahorro, score crediticio |
| **¿Para qué se usa?** | Entrenar el clasificador de gastos por categoría | Calcular el `perfil_financiero` (Saludable / En observación / En riesgo) y generar recomendaciones |
| **¿De dónde sale?** | Dataset público de Kaggle (comportamiento real de usuarios) | Dataset público de referencia + función de scoring diseñada por el equipo |
| **¿Por qué esta fuente?** | Da patrones de consumo genuinos, no inventados | Da rangos y distribuciones realistas para calibrar la lógica de negocio propia |

Esta separación es la diferencia clave frente a construir todo desde cero o usar solo un
dataset público sin declarar sus límites: aquí queda documentado qué parte del sistema
aprende de datos reales y qué parte es una regla de negocio diseñada por el equipo.

## 3. Capa 1 — Datos reales de transacciones

**Fuente principal:** Financial Transactions Dataset (Expenses & Income) — Kaggle
`kaggle.com/datasets/artemkabseu/financial-transactions-dataset-expenses-and-income`

Exportado originalmente de una app móvil de finanzas personales. Fue procesado para
eliminar toda información personal identificable (nombres, cuentas, comentarios
anonimizados) y se aplicó una variación aleatoria de ±20% a los montos, conservando las
propiedades estadísticas originales. Resultado: comportamiento de gasto genuino, sin datos
personales reales.

**Fuente complementaria (EDA más robusto):** BudgetWise Personal Finance Dataset — Kaggle
`kaggle.com/datasets/mohammedarfathr/budgetwise-personal-finance-dataset`

Simula la "suciedad" típica de datos reales en producción: formatos de fecha mixtos,
símbolos de moneda distintos, duplicados y valores faltantes.

**Qué se extrae de aquí:**
- `descripcion` — texto de la transacción
- `categoria` — remapeada a las 8 categorías del proyecto (Alimentación, Transporte,
  Salud, Vivienda, Educación, Ocio, Servicios, Otros)
- `valor` — monto de la transacción
- `fecha` — para análisis de frecuencia y estacionalidad

## 4. Capa 2 — Perfil financiero sintético

**Fuente de referencia:** Personal Finance ML Dataset — Kaggle
`kaggle.com/datasets/miadul/personal-finance-ml-dataset`

Incluye ingreso mensual, gastos mensuales, ahorro total, existencia y monto de préstamo,
ratio deuda/ingreso, score crediticio sintético (300–850) y ratio ahorro/ingreso, por región.

**Alternativa más completa:** Personal Finance Tracker Dataset — Kaggle
`kaggle.com/datasets/khushikyad001/personal-finance-tracker-dataset`

### Cómo se usa (importante: no se copia tal cual)

Estos datasets **no** se usan como "la verdad" del perfil financiero — se usan como
referencia estadística para calibrar rangos realistas. El equipo diseña su propia función
de scoring documentada (ver sección 5).

## 5. Función de scoring del perfil financiero

Regla de negocio documentada por el equipo (no aprendida de datos):

```
riesgo = 0
si ratio_gasto_ingreso > 0.9:      riesgo += 2
elif ratio_gasto_ingreso > 0.7:    riesgo += 1

si nivel_endeudamiento > 0.4:      riesgo += 2
elif nivel_endeudamiento > 0.25:   riesgo += 1

si frecuencia_ahorro == "Baja":    riesgo += 1
elif frecuencia_ahorro == "Alta":  riesgo -= 1

riesgo >= 3        -> "En riesgo"
1 <= riesgo < 3     -> "En observación"
riesgo < 1          -> "Saludable"
```

## 6. Cómo se integran ambas capas

1. Se genera un `usuario_id` sintético (con la librería `Faker` de Python) que actúa como
   llave entre las dos capas.
2. Cada `usuario_id` se asocia a un conjunto de transacciones reales tomadas de la Capa 1.
3. Cada `usuario_id` se asocia también a un perfil financiero calibrado con la Capa 2 como
   referencia.
4. El resumen de gastos por categoría (Capa 1) alimenta la función de scoring (Capa 2) para
   producir el `perfil_financiero` final y las recomendaciones.

## 7. Por qué este enfoque es metodológicamente sólido

Al presentar el proyecto ante evaluadores o mentores, el equipo puede explicar con
claridad:

- Qué parte del sistema aprendió de datos reales (la clasificación de gastos).
- Qué parte es una regla de negocio diseñada intencionalmente por el equipo (el perfil
  financiero), y por qué se diseñó así.
- Que no se está disfrazando una regla simple como si fuera un modelo entrenado con datos
  reales de perfil financiero.

## 8. Próximos pasos

| Tarea | Responsable(s) |
|---|---|
| Descargar y explorar ambos datasets de la Capa 1 (Kaggle API) | Jesús, Sonia, Armando |
| Definir el mapeo final de categorías (dataset → 8 categorías del proyecto) | Data Science |
| Diseñar y documentar la función de scoring de perfil financiero | Data Science |
| Generar `usuario_id` sintético y unir ambas capas | Data Science |
| Revisar que el esquema final sea compatible con el endpoint `/analisis-financiero` | Data Science + Backend |

> Para descargar los datasets de Kaggle se necesita una cuenta y un token de API
> (`kaggle datasets download -d usuario/dataset`).
