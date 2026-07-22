package com.alura.finance_ai.service;

import com.alura.finance_ai.dto.AnalisisRequest;
import com.alura.finance_ai.dto.TransaccionDTO;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalisisFinancieroService {

    private final RestClient restClient;

    // Inyección del RestClient para conectar con Python (Tarea 47)
    public AnalisisFinancieroService(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder
                .baseUrl("http://localhost:5000") // URL donde corre el servicio de Python
                .build();
    }

    // Tarea 47: Método opcional para consultar el perfil de Python de forma remota si se requiere
    public String obtenerPerfilDesdePython(AnalisisRequest request) {
        try {
            return restClient.post()
                    .uri("/perfil") // Endpoint del modelo de clasificación de perfil en Python
                    .body(request)
                    .retrieve()
                    .body(String.class);
        } catch (Exception e) {
            return "Saludable"; // Fallback por defecto si Python no está activo localmente
        }
    }

    // Tarea 47-bis: Endpoint o método para clasificar una sola transacción con el Modelo 1
    public String clasificarTransaccion(TransaccionDTO transaccion) {
        try {
            return restClient.post()
                    .uri("/clasificar") // Endpoint del Modelo 1 en Python
                    .body(transaccion)
                    .retrieve()
                    .body(String.class);
        } catch (Exception e) {
            return "Categoría No Disponible (Sin conexión a IA)";
        }
    }


    public List<String> analizarFinanzas(AnalisisRequest request, String perfilPython) {

        List<String> recomendaciones = new ArrayList<>();

        // Si prefieres que el perfil se obtenga automáticamente de Python mediante el RestClient:
        // String perfilPython = obtenerPerfilDesdePython(request);

        // =========================================================
        // TAREA 48: Alertas de Gastos Elevados
        // =========================================================
        if (request.transacciones() != null
                && request.ingresoMensual() != null
                && request.ingresoMensual() > 0) {

            double umbralGasto = request.ingresoMensual() * 0.10;

            for (TransaccionDTO transaccion : request.transacciones()) {
                if (transaccion.valor() > umbralGasto) {
                    recomendaciones.add(
                            "[ALERTA] El gasto en '"
                                    + transaccion.descripcion()
                                    + "' supera el límite preventivo recomendado por transacción"
                    );
                }
            }
        }

        // =========================================================
        // TAREA 49: Recomendaciones Financieras según el perfil
        // =========================================================
        if (perfilPython != null) {
            if (perfilPython.equalsIgnoreCase("En riesgo")) {
                recomendaciones.add(
                        "Alerta: Su nivel de endeudamiento supera los límites recomendados. "
                                + "Evite adquirir nuevos créditos."
                );
            } else if (perfilPython.equalsIgnoreCase("Saludable")) {
                recomendaciones.add(
                        "Buen trabajo. Se recomienda destinar un 10% adicional "
                                + "a su reserva financiera mensual."
                );
            }
        }

        // =========================================================
        // TAREA 49-bis: Recomendaciones Financieras por Categoría
        // =========================================================
        if (request.transacciones() != null
                && request.ingresoMensual() != null
                && request.ingresoMensual() > 0) {

            Map<String, Double> resumenGastos = new HashMap<>();

            for (TransaccionDTO transaccion : request.transacciones()) {
                String categoria = transaccion.categoria();
                resumenGastos.put(
                        categoria,
                        resumenGastos.getOrDefault(categoria, 0.0) + transaccion.valor()
                );
            }

            double umbralCategoria = request.ingresoMensual() * 0.30;

            for (Map.Entry<String, Double> gasto : resumenGastos.entrySet()) {
                if (gasto.getValue() > umbralCategoria) {
                    recomendaciones.add(
                            "Se recomienda reducir gastos en la categoría de " + gasto.getKey()
                    );
                }
            }
        }

        // =========================================================
        // TAREA 49-ter: Recomendación según la frecuencia de ahorro
        // =========================================================
        if (request.frecuenciaAhorro() != null
                && request.frecuenciaAhorro().equalsIgnoreCase("Baja")) {
            recomendaciones.add(
                    "Aumentar la frecuencia de ahorro ayudaría a mejorar tu perfil financiero"
            );
        }

        // =========================================================
        // RECOMENDACIÓN ADICIONAL: Nivel de endeudamiento
        // =========================================================
        if (request.nivelEndeudamiento() != null
                && request.nivelEndeudamiento() > 5) {
            recomendaciones.add(
                    "Se recomienda revisar su nivel de endeudamiento actual "
                            + "para mejorar su salud financiera."
            );
        }

        return recomendaciones;
    }
}