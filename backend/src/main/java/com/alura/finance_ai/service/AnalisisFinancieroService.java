package com.alura.finance_ai.service;

import com.alura.finance_ai.dto.AnalisisRequest;
import com.alura.finance_ai.dto.TransaccionDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class AnalisisFinancieroService {

    private final RestClient restClient;

    public AnalisisFinancieroService(@Value("${servicio.ia.url:http://localhost:8000}") String servicioIaUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(servicioIaUrl)
                .build();
    }

    public String realizarPrediccionInterna(Object payload) {
        try {
            return restClient.post()
                    .uri("/prediccion-interna")
                    .body(payload)
                    .retrieve()
                    .body(String.class);
        } catch (Exception e) {
            // Simulamos una respuesta realista para que el Front-End pueda hacer pruebas 
            // sin depender de Data Science.
            if (payload instanceof com.alura.finance_ai.dto.AnalisisRequest req) {
                if (req.nivelEndeudamiento() != null) {
                    if (req.nivelEndeudamiento() < 30) return "Saludable";
                    if (req.nivelEndeudamiento() > 70) return "En Riesgo";
                }
            }
            return "En Observacion";
        }
    }

    public String clasificarTransaccion(TransaccionDTO transaccion) {
        try {
            return restClient.post()
                    .uri("/prediccion-interna")
                    .body(transaccion)
                    .retrieve()
                    .body(String.class);
        } catch (Exception e) {
            return simularClasificacion(transaccion.descripcion());
        }
    }

    private String simularClasificacion(String descripcion) {
        if (descripcion == null) return "Otros";

        String descLower = descripcion.toLowerCase();
        if (descLower.contains("supermercado") || descLower.contains("comida") || descLower.contains("restaurante")) {
            return "Alimentación";
        } else if (descLower.contains("cine") || descLower.contains("streaming") || descLower.contains("juegos")) {
            return "Entretenimiento";
        } else if (descLower.contains("uber") || descLower.contains("gasolina") || descLower.contains("transporte")) {
            return "Transporte";
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
                        "Atención: Sus gastos actuales están consumiendo la mayor parte de sus ingresos. Recomendamos considerar moderar gastos."
                );
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
        if (ahorro != null && (ahorro.equalsIgnoreCase("Baja") || ahorro.equalsIgnoreCase("Nulo"))) {
            recomendaciones.add(
                    "Aumentar la frecuencia de ahorro ayudaría a mejorar tu perfil financiero y tener mejores oportunidades a futuro"
            );
        }

        return recomendaciones;
    }
}