package com.alura.finance_ai.service;

import com.alura.finance_ai.dto.AnalisisRequest;
import com.alura.finance_ai.dto.TransaccionDTO;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalisisFinancieroService {


    public List<String> analizarFinanzas(AnalisisRequest request, String perfilPython) {

        List<String> recomendaciones = new ArrayList<>();

        // =========================================================
        // TAREA 48:
        // Alertas de Gastos Elevados
        // Si una transacción individual supera el 10% del ingreso
        // mensual, se agrega una alerta.
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
        // TAREA 49:
        // Recomendaciones Financieras según el perfil devuelto
        // por Python.
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
        // TAREA 49-bis:
        // Recomendaciones Financieras por Categoría.
        //
        // Se agrupan las transacciones por categoría.
        // Si una categoría representa más del 30% del ingreso mensual,
        // se recomienda reducir los gastos de dicha categoría.
        // =========================================================

        if (request.transacciones() != null
                && request.ingresoMensual() != null
                && request.ingresoMensual() > 0) {

            Map<String, Double> resumenGastos = new HashMap<>();

            // Agrupar gastos por categoría
            for (TransaccionDTO transaccion : request.transacciones()) {

                String categoria = transaccion.categoria();

                resumenGastos.put(
                        categoria,
                        resumenGastos.getOrDefault(categoria, 0.0)
                                + transaccion.valor()
                );
            }

            // Umbral del 30% del ingreso mensual
            double umbralCategoria = request.ingresoMensual() * 0.30;

            // Revisar cada categoría
            for (Map.Entry<String, Double> gasto : resumenGastos.entrySet()) {

                if (gasto.getValue() > umbralCategoria) {

                    recomendaciones.add(
                            "Se recomienda reducir gastos en la categoría de "
                                    + gasto.getKey()
                    );
                }
            }
        }


        // =========================================================
        // TAREA 49-ter:
        // Recomendación según la frecuencia de ahorro.
        //
        // Si la frecuencia de ahorro es "Baja", se agrega
        // la recomendación solicitada.
        // =========================================================

        if (request.frecuenciaAhorro() != null
                && request.frecuenciaAhorro().equalsIgnoreCase("Baja")) {

            recomendaciones.add(
                    "Aumentar la frecuencia de ahorro ayudaría a mejorar tu perfil financiero"
            );
        }


        // =========================================================
        // RECOMENDACIÓN ADICIONAL:
        // Revisar nivel de endeudamiento.
        //
        // Esta lógica no corresponde a la Tarea 49-ter,
        // pero se conserva como una recomendación adicional.
        // =========================================================

        if (request.nivelEndeudamiento() != null
                && request.nivelEndeudamiento() > 5) {

            recomendaciones.add(
                    "Se recomienda revisar su nivel de endeudamiento actual "
                            + "para mejorar su salud financiera."
            );
        }


        // Retornar todas las recomendaciones generadas
        return recomendaciones;
    }

}
