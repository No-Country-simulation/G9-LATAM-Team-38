package com.alura.finance_ai.dto;

import java.time.LocalDate;
import java.util.List;

/**
 * Payload enviado al microservicio Python ({@code /prediccion-interna}).
 * Espejo exacto de {@code TransaccionesRequest} en data_science/main.py: JSON en camelCase.
 * No confundir con {@link AnalisisRequest} (contrato público con el frontend, usa "valor" en vez de "monto").
 */
public record PrediccionPythonRequest(
        String usuarioId,
        List<TransaccionPython> transacciones,
        Double ingresoMensual,
        Integer nivelEndeudamiento,
        String frecuenciaAhorro
) {
    public record TransaccionPython(
            String idTransaccion,
            String descripcion,
            Double monto,
            LocalDate fecha
    ) {
    }
}
