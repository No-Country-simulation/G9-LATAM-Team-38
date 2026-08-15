# 📜 Reglas de Negocio y Lógica del Sistema - Finance AI

## 📋 Información del Documento
- **Proyecto:** Finance AI (G9 LATAM Team 38)
- **Responsable del Documento:** Marco Arias (Backend & Data/IA Lead)
- **Fecha de Publicación:** 15 de Agosto de 2026
- **Versión:** 1.0.0
- **Estado:** Aprobado

---

## 🎯 1. Objetivo
El propósito de este documento es especificar formalmente los algoritmos, reglas de negocio, modelos de Machine Learning y criterios financieros utilizados en la plataforma **Finance AI** para la evaluación de salud financiera, pre-cálculos de endeudamiento, estimación de capacidad de ahorro y generación de recomendaciones automáticas.

---

## 📊 2. Algoritmos de Cálculo Financiero

### 2.1. Nivel de Endeudamiento (%)
El Nivel de Endeudamiento mide la proporción de los ingresos mensuales consumida por el total de gastos identificados.

$$\text{Nivel de Endeudamiento (\%)} = \left( \frac{\sum \text{Monto de Transacciones de Gasto}}{\text{Ingreso Mensual Declarado}} \right) \times 100$$

#### Criterios de Clasificación:
- **Saludable ($0\% \le \text{Endeudamiento} \le 30\%$):** El usuario conserva margen de maniobra financiera.
- **Moderado ($31\% \le \text{Endeudamiento} \le 50\%$):** Nivel de gasto bajo control pero requiere monitoreo.
- **Crítico / Elevado ($\text{Endeudamiento} > 50\%$):** Se emite una alerta preventiva por riesgo de iliquidez.

> **Nota Técnica (Seguridad IA):** Para la inferencia del modelo predictivo en FastAPI, los valores mayores al $100\%$ o menores al $0\%$ se acotan (*clamping*) al rango $[0, 100]\%$ para prevenir errores de validación de esquema en la red neuronal / modelo supervisado.

---

### 2.2. Frecuencia y Capacidad de Ahorro
La Capacidad de Ahorro se calcula a partir del **Ratio de Margen Libre**:

$$\text{Margen Libre} = \text{Ingreso Mensual} - \sum \text{Gastos}$$

$$\text{Ratio de Ahorro} = \frac{\text{Margen Libre}}{\text{Ingreso Mensual}}$$

#### Matriz de Reglas para Frecuencia de Ahorro:
| Ratio de Ahorro ($\text{Ratio}$) | Categoría Asignada | Nivel de Riesgo |
| :--- | :--- | :--- |
| $\text{Ratio} \ge 0.40$ ($40\%+$ libre) | **Muy Alta** | Excelente |
| $0.25 \le \text{Ratio} < 0.40$ | **Alta** | Bueno |
| $0.10 \le \text{Ratio} < 0.25$ | **Media** | Moderado |
| $0.00 \le \text{Ratio} < 0.10$ | **Baja** | En Riesgo |
| $\text{Ratio} < 0.00$ (Gastos > Ingresos) | **Nula** | Crítico (Déficit) |

---

## 🤖 3. Lógica de IA y Machine Learning

El microservicio de Ciencia de Datos (`data_science/main.py`) opera mediante dos módulos principales:

### 3.1. Categorización Automática de Transacciones
- **Endpoint:** `POST /clasificar-transaccion`
- **Modelo:** Clasificador supervisado Scikit-Learn (`clasificador_gastos.pkl`).
- **Categorías soportadas:**
  - `Alimentacion`
  - `Transporte`
  - `Vivienda`
  - `Servicios`
  - `Salud`
  - `Educación`
  - `Ocio`
  - `Otros`
- **Mecanismo de Resiliencia (Fallback):** En caso de indisponibilidad temporal del microservicio, el Backend Java ejecuta coincidencia de palabras clave léxicas (`super`/`comida` $\rightarrow$ Alimentacion, `uber`/`gasolina` $\rightarrow$ Transporte, `luz`/`internet` $\rightarrow$ Servicios, etc.).

---

### 3.2. Diagnóstico de Salud Financiera (Score & Perfil)
- **Endpoint:** `POST /prediccion-interna`
- **Modelo:** Perfilador de Riesgo Crediticio (`perfil_financiero.pkl` y `codificador_perfil.pkl`).
- **Puntaje de Salud (Score 0-100):**
  - **Puntos por Ahorro:** Muy Alta ($40$ pts), Alta ($30$ pts), Media ($20$ pts), Baja ($10$ pts), Nula ($0$ pts).
  - **Puntos por Endeudamiento:** $\le 30\%$ ($40$ pts), $31-50\%$ ($20$ pts), $> 50\%$ ($0$ pts).
  - **Puntos por Proporción de Gasto:** $< 70\%$ ($20$ pts), $70-90\%$ ($10$ pts), $> 90\%$ ($0$ pts).

#### Perfiles Resultantes:
- **80 – 100 Puntos:** **Excelente** 🟢
- **50 – 79 Puntos:** **Estable** 🔵
- **30 – 49 Puntos:** **En Riesgo** 🟠
- **0 – 29 Puntos:** **Crítico** 🔴

---

## 💡 4. Motor de Recomendaciones Dinámicas

El motor de sugerencias evalúa en tiempo real los siguientes disparadores (*triggers*):

1. **Alerta de Transacción Individual Elevada:**
   Si una transacción de gasto supera el $20\%$ del ingreso mensual, se genera el aviso:
   > `[ALERTA] El gasto en '{descripcion}' supera el límite preventivo recomendado por transacción.`

2. **Alerta de Endeudamiento Excesivo:**
   Si el nivel de endeudamiento supera el $50\%$:
   > `Alerta: Su nivel de endeudamiento supera los límites recomendados. Evite adquirir nuevos créditos.`

3. **Optimización por Categoría Dominante:**
   Se identifica la categoría con mayor porcentaje de gasto respecto al total y se sugiere un plan de optimización:
   > `Se recomienda reducir gastos en la categoría de {categoria_dominante}.`

---

## 📄 5. Criterios de Redacción y Mantenimiento
- **Actualización:** Cualquier modificación en las fórmulas de cálculo o modelos de IA debe registrarse en la sección de versiones de este documento.
- **Responsables:** El equipo de Backend/Data Science es el encargado exclusivo de auditar la concordancia entre este documento y el código fuente (`AnalisisFinancieroService.java` y `data_science/main.py`).
