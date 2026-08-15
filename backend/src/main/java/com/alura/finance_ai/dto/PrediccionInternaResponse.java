package com.alura.finance_ai.dto;

import java.util.List;

/**
 * Respuesta del microservicio Python ({@code /prediccion-interna}).
 * Espejo exacto de {@code PrediccionResponse} en data_science/main.py (JSON en camelCase).
 */
public record PrediccionInternaResponse(
        List<TransaccionClasificadaPython> transacciones,
        PerfilPython perfil
) {
    public record TransaccionClasificadaPython(
            String idTransaccion,
            String categoria
    ) {
    }

    public record PerfilPython(
            String valor,
            FeaturesPerfilPython featuresUsadas
    ) {
    }

    public record FeaturesPerfilPython(
            Double ingresoMensual,
            Double nivelEndeudamiento,
            String frecuenciaAhorro,
            Double totalGastos,
            Double promedioGasto,
            Integer numeroTransacciones
    ) {
    }
}
