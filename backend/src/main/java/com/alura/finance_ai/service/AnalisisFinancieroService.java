package com.alura.finance_ai.service;

import com.alura.finance_ai.dto.AnalisisRequest;
import com.alura.finance_ai.dto.TransaccionDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;

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
            return "Saludable";
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
        if (descLower.contains("supermercado") || descLower.contains("comida")) {
            return "Alimentación";
        } else if (descLower.contains("cine") || descLower.contains("juegos")) {
            return "Entretenimiento";
        }

        return "Otros";
    }

    public List<String> analizarFinanzas(AnalisisRequest request, String perfilPython) {

        List<String> recomendaciones = new ArrayList<>();

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

        if (perfilPython != null) {
            if (perfilPython.equalsIgnoreCase("En riesgo")) {
                recomendaciones.add(
                        "Alerta: Su perfil financiero actual presenta un nivel de riesgo. "
                                + "Evite adquirir nuevos compromisos financieros."
                );
            } else if (perfilPython.equalsIgnoreCase("Saludable")) {
                recomendaciones.add(
                        "Buen trabajo. Se recomienda destinar un 10% adicional "
                                + "a su reserva financiera mensual."
                );
            }
        }

        if (request.frecuenciaAhorro() != null
                && request.frecuenciaAhorro().equalsIgnoreCase("Baja")) {
            recomendaciones.add(
                    "Aumentar la frecuencia de ahorro ayudaría a mejorar tu perfil financiero"
            );
        }

        return recomendaciones;
    }
}