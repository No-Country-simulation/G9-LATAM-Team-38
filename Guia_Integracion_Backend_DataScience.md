# Guía de integración — Consumo del microservicio Data Science (FastAPI)

**Team 38 (LATAM) · Oracle ONE G9 · Proyecto FinanceAI**

**Para:** Backend (Gabriel Gil, Ian Alonso Jesus Osnaya)
**De:** Data Science (Armando, Jesús García, Sonia Moran Jarquin)

---

## 1. Cómo se conectan los dos servicios

No hay IP fija ni `localhost`. En `docker-compose.yml` ambos contenedores están en la misma red (`financeai-network`), así que Backend le habla al microservicio por su **nombre de servicio**:

```
http://data-science:8000
```

El puerto 8000 **no está publicado al host** — solo es alcanzable desde dentro de la red interna de Docker. No debe consumirse desde fuera del contenedor de Backend.

## 2. Endpoint disponible

```
POST /predict-internal
```

- `/predict-internal` (no `/predict`) — deja claro que es un endpoint interno, no de cara al usuario final.
- También existe `GET /health` → `{"status": "ok"}`, usado por el healthcheck de Docker, no por la lógica de negocio.

## 3. Contrato de datos (request)

```json
{
  "ingreso_mensual": 15000.0,
  "nivel_endeudamiento": 0.35,
  "frecuencia_ahorro": "mensual",
  "transacciones": [
    { "descripcion": "Uber viaje centro", "valor": 120.0 }
  ]
}
```

> ⚠️ El contrato usa **snake_case** (`ingreso_mensual`, `nivel_endeudamiento`, `frecuencia_ahorro`), aunque Java use camelCase. Usar `@JsonProperty` en los DTOs para que Jackson traduzca:

```java
public record TransaccionDTO(String descripcion, Double valor) {}

public record SolicitudAnalisisDTO(
    @JsonProperty("ingreso_mensual") Double ingresoMensual,
    @JsonProperty("nivel_endeudamiento") Double nivelEndeudamiento,
    @JsonProperty("frecuencia_ahorro") String frecuenciaAhorro,
    List<TransaccionDTO> transacciones
) {}
```

## 4. Contrato de datos (respuesta)

```json
{
  "perfil_financiero": "Saludable",
  "probabilidad": 0.87,
  "resumen_gastos": { "Transporte": 120.0 },
  "recomendaciones": ["..."]
}
```

```java
public record RespuestaAnalisisDTO(
    String perfilFinanciero,
    Double probabilidad,
    Map<String, Double> resumenGastos,
    List<String> recomendaciones
) {}
```

## 5. Cliente HTTP recomendado

`RestClient` (Spring Boot 3.2+), apuntando al nombre del servicio, no a una URL hardcodeada:

```java
@Configuration
public class DataScienceClientConfig {

    @Bean
    public RestClient dataScienceRestClient() {
        return RestClient.builder()
                .baseUrl("http://data-science:8000")
                .build();
    }
}
```

## 6. Manejo de errores

Si el microservicio no responde (aún cargando modelos, caído, etc.), capturar `RestClientException` y devolver 503 en vez de dejar que el error se propague sin control:

```java
@ExceptionHandler(RestClientException.class)
public ResponseEntity<String> manejarErrorServicioDS(RestClientException ex) {
    return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
            .body("El servicio de análisis financiero no está disponible");
}
```

## 7. Orden de arranque

En `docker-compose.yml`, `backend` tiene `depends_on: data-science: condition: service_healthy`. Esto significa que Backend **no arranca tráfico hasta que el healthcheck de `/health` responda OK** — es decir, hasta que los dos `.pkl` ya estén cargados en memoria. No debería ser necesario implementar retries manuales para ese caso específico de arranque en frío.

## 8. Qué NO necesita saber Backend

Backend no toca modelos, `.pkl`, ni scikit-learn — solo consume JSON por HTTP. Cualquier cambio en el modelo (reentrenar, cambiar algoritmo) es transparente para Backend mientras el contrato de `/predict-internal` no cambie.
