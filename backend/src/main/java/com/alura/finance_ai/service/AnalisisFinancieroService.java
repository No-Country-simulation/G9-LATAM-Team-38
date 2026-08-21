package com.alura.finance_ai.service;

import com.alura.finance_ai.dto.AnalisisRequest;
import com.alura.finance_ai.dto.TransaccionDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class AnalisisFinancieroService {
    //Se agrega un logger para poder ver los errores en la consola en caso de que la IA falle
   private static final Logger logger = LoggerFactory.getLogger(AnalisisFinancieroService.class);

    private final RestClient restClient;

    
    private boolean esCoherente(int endeudamiento, String ahorro) {
        int margen = Math.max(0, 100 - endeudamiento);
        return switch (ahorro.toLowerCase()) {
            case "alta" -> margen >= 20;
            case "media" -> margen >= 10;
            case "baja" -> true;
            default -> false;
        };
    }

    public AnalisisFinancieroService(
            @Value("${servicio.ia.url:http://localhost:8000}") String servicioIaUrl,
            @Value("${servicio.ia.connect-timeout-ms:2000}") int connectTimeoutMs,
            @Value("${servicio.ia.read-timeout-ms:12000}") int readTimeoutMs) {
        var requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofMillis(connectTimeoutMs));
        requestFactory.setReadTimeout(Duration.ofMillis(readTimeoutMs));
        this.restClient = RestClient.builder()
                .baseUrl(servicioIaUrl)
                .requestFactory(requestFactory)
                .build();
    }

    private String determinarFrecuenciaAhorro(double ratioAhorro) {
        double porcentaje = ratioAhorro * 100;
        if (porcentaje >= 20) return "Alta";
        if (porcentaje >= 10) return "Media";
        return "Baja";
    }

    private int calcularPuntosAhorro(String ahorroStr) {
        if (ahorroStr == null) return 0;
        return switch (ahorroStr.toLowerCase()) {
            case "alta" -> 40;
            case "media" -> 20;
            case "baja" -> 0;
            default -> 0;
        };
    }

    private int calcularPuntosEndeudamiento(Integer nivelEndeudamiento) {
        if (nivelEndeudamiento == null) return 0;
        if (nivelEndeudamiento < 30) return 30;
        if (nivelEndeudamiento <= 50) return 20;
        if (nivelEndeudamiento <= 70) return 10;
        return 0;
    }

    private int calcularPuntosGasto(double porcentajeGasto) {
        if (porcentajeGasto < 30) return 40;
        if (porcentajeGasto <= 60) return 20;
        return 5;
    }

    public AnalisisRequest validarYCompletarRequest(AnalisisRequest request) {

    if (request.ingresoMensual() == null || request.ingresoMensual() <= 0) {
        throw new IllegalArgumentException(
                "Debes ingresar un valor válido superior a 0 en el ingreso mensual."
        );
    }

    double ingreso = request.ingresoMensual();

    double totalGastos = 0.0;
    if (request.transacciones() != null) {
    for (TransaccionDTO t : request.transacciones()) {
        if (t.valor() == null || t.valor() <= 0) {
            throw new IllegalArgumentException(
                    "Debes ingresar un valor válido superior a 0 en cada gasto."
            );
        }

        totalGastos += t.valor();
    }
}

        Integer endeudamiento = request.nivelEndeudamiento();
        String ahorro = request.frecuenciaAhorro();

        // Auto-cálculo si el usuario no los envió explícitamente
        if (endeudamiento == null || ahorro == null || ahorro.isEmpty()) {
            double end = Math.round((totalGastos / ingreso) * 100.0);
            endeudamiento = (int) end;
            
            double margenLibre = ingreso - totalGastos;
            double ratioAhorro = margenLibre / ingreso;
            ahorro = determinarFrecuenciaAhorro(ratioAhorro);
        } else {
            // Ya no lanzamos excepciones matemáticas para permitir pruebas libres.
            // Si el usuario envió valores, simplemente los aceptamos.
        }

        return new AnalisisRequest(
                request.ingresoMensual(),
                endeudamiento,
                ahorro,
                request.transacciones()
        );
    }

    public int calcularPuntaje(AnalisisRequest datos) {
        int puntaje = 0;
        puntaje += calcularPuntosAhorro(datos.frecuenciaAhorro());
        puntaje += calcularPuntosEndeudamiento(datos.nivelEndeudamiento());

        double totalGastosRecientes = 0.0;
        if (datos.transacciones() != null) {
            for (TransaccionDTO t : datos.transacciones()) {
                if (t.valor() != null) totalGastosRecientes += t.valor();
            }
        }
        
        double ingreso = datos.ingresoMensual() != null && datos.ingresoMensual() > 0 ? datos.ingresoMensual() : 1.0;
        double porcentajeGasto = (totalGastosRecientes / ingreso) * 100;
        
        puntaje += calcularPuntosGasto(porcentajeGasto);
        return puntaje;
    }

    public String realizarPrediccionInterna(Object payload) {
        try {
            Object pythonPayload = payload;
            if (payload instanceof AnalisisRequest req) {
                int endClamped = Math.min(100, Math.max(0, req.nivelEndeudamiento() != null ? req.nivelEndeudamiento() : 0));
                pythonPayload = new AnalisisRequest(
                        req.ingresoMensual(),
                        endClamped,
                        req.frecuenciaAhorro(),
                        req.transacciones()
                );
            }

            String rawJson = restClient.post()
                    .uri("/prediccion-interna")
                    .body(pythonPayload)
                    .retrieve()
                    .body(String.class);

            if (rawJson != null) {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode root = mapper.readTree(rawJson);
                if (root.has("perfil") && root.get("perfil").has("valor")) {
                    return root.get("perfil").get("valor").asText();
                }
            }
            return rawJson;
        } catch (RestClientException | JsonProcessingException e) {
            logger.error("Se cayo la conexion con Python en /prediccion-interna: " + e.getMessage());
            if (payload instanceof AnalisisRequest req) {
                int puntaje = calcularPuntaje(req);
                return (puntaje >= 80) ? "Excelente" : (puntaje >= 50) ? "Estable" : (puntaje >= 30) ? "En Riesgo" : "Crítico";
            }
            return "En Riesgo";
        }
    }

    public String clasificarTransaccion(TransaccionDTO transaccion) {
        if (transaccion == null || transaccion.descripcion() == null) {
            return "Otros";
        }
        String desc = transaccion.descripcion().trim().toLowerCase();
        if (desc.equals("otro") || desc.equals("otros") || desc.startsWith("otro") || desc.contains("varios") || desc.contains("miscelaneo") || desc.contains("extra") || desc.equals("sin categoria")) {
            return "Otros";
        }

        try {
            String rawJson = restClient.post()
                    .uri("/clasificar-transaccion")
                    .body(transaccion)
                    .retrieve()
                    .body(String.class);

            if (rawJson != null) {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode root = mapper.readTree(rawJson);
                if (root.has("categoria")) {
                    return root.get("categoria").asText();
                }
            }
            return "Otros";
        } catch (RestClientException | JsonProcessingException e) {
            logger.warn("No se pudo clasificar la transaccion con FastAPI, usando fallback: " + e.getMessage());
            return simularClasificacion(transaccion.descripcion());
        }
    }

    private String simularClasificacion(String descripcion) {
        if (descripcion == null) return "Otros";
        String descLower = descripcion.toLowerCase();
        if (descLower.contains("super") || descLower.contains("comida") || descLower.contains("carne") || descLower.contains("despensa")) {
            return "Alimentacion";
        } else if (descLower.contains("cine") || descLower.contains("juego") || descLower.contains("steam")) {
            return "Ocio";
        } else if (descLower.contains("uber") || descLower.contains("gasolina") || descLower.contains("auto")) {
            return "Transporte";
        } else if (descLower.contains("alquiler") || descLower.contains("renta") || descLower.contains("casa")) {
            return "Vivienda";
        } else if (descLower.contains("luz") || descLower.contains("internet") || descLower.contains("servicio")) {
            return "Servicios";
        } else if (descLower.contains("medica") || descLower.contains("salud") || descLower.contains("farmacia")) {
            return "Salud";
        } else if (descLower.contains("libro") || descLower.contains("escuela") || descLower.contains("universidad")) {
            return "Educación";
        }
        return "Otros";
    }


    public List<String> generarRecomendaciones(
            AnalisisRequest request,
            String perfilPython,
            Map<String, Double> resumenGastos) {

        List<String> recomendaciones = new ArrayList<>();

        if (request.transacciones() != null && request.ingresoMensual() != null && request.ingresoMensual() > 0) {
            double umbral10PorCiento = request.ingresoMensual() * 0.10;

            for (TransaccionDTO transaccion : request.transacciones()) {
                if (transaccion.valor() > umbral10PorCiento) {
                    recomendaciones.add(
                            "[ALERTA] El gasto en '" + transaccion.descripcion() +
                                    "' supera el límite preventivo recomendado por transacción"
                    );
                }
            }
        }

        if (perfilPython != null) {
            if (perfilPython.equalsIgnoreCase("En Riesgo")) {
                recomendaciones.add(
                        "Alerta: Su nivel de endeudamiento supera los límites recomendados. Evite adquirir nuevos créditos."
                );
            } else if (perfilPython.equalsIgnoreCase("Finanzas Sanas") || perfilPython.equalsIgnoreCase("Saludable")) {
                recomendaciones.add(
                        "Buen trabajo. Se recomienda destinar un 10% adicional a su ahorro mensual."
                );
            } else if (perfilPython.equalsIgnoreCase("En Observacion")) {
                recomendaciones.add(
                        "Atención: Tus obligaciones financieras declaradas están consumiendo la mayor parte de tus ingresos. Recomendamos considerar moderar gastos."
                );
            }
        }

        if (request.transacciones() != null && request.ingresoMensual() != null && request.ingresoMensual() > 0) {
            double totalGastosRegistrados = 0.0;
            for (TransaccionDTO t : request.transacciones()) {
                if (t.valor() != null && t.valor() > 0) {
                    totalGastosRegistrados += t.valor();
                }
            }
            int porcentajeGastos = (int) Math.round((totalGastosRegistrados / request.ingresoMensual()) * 100);
            
            if (porcentajeGastos > 100) {
                recomendaciones.add(String.format("¡Atención! Tus gastos actuales representan un %d%% de tus ingresos. Si no recibes ayuda externa, estás en grave riesgo de sobreendeudamiento.", porcentajeGastos));
            } else if (porcentajeGastos < 20) {
                recomendaciones.add(String.format("Tus gastos registrados representan solo un %d%% de tus ingresos. ¡Excelente capacidad para ahorrar e invertir!", porcentajeGastos));
            }
            
            if (request.nivelEndeudamiento() != null && Math.abs(request.nivelEndeudamiento() - porcentajeGastos) > 0) {
                recomendaciones.add(String.format("Nota: Has declarado un endeudamiento del %d%%, pero según tus ingresos y transacciones recientes, tu verdadero nivel de endeudamiento es del %d%%.", request.nivelEndeudamiento(), porcentajeGastos));
            }
        }

        if (resumenGastos != null && request.ingresoMensual() != null && request.ingresoMensual() > 0) {
            double umbral30PorCiento = request.ingresoMensual() * 0.30;

            resumenGastos.forEach((categoria, totalGasto) -> {
                if (totalGasto > umbral30PorCiento) {
                    recomendaciones.add(
                            "Se recomienda reducir gastos en la categoría de " + categoria
                    );
                }
            });
        }

        String ahorro = request.frecuenciaAhorro();
        if (ahorro != null && (ahorro.equalsIgnoreCase("Baja") || ahorro.equalsIgnoreCase("Nula") || ahorro.equalsIgnoreCase("Nulo"))) {
            recomendaciones.add(
                    "Aumentar la frecuencia de ahorro ayudaría a mejorar tu perfil financiero y tener mejores oportunidades a futuro"
            );
        }

        return recomendaciones;
    }
}