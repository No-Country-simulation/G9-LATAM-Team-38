package com.alura.finance_ai.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record AnalisisRequest(
        @NotNull @Min(0) Double ingresoMensual,
        Integer nivelEndeudamiento, // La intencion es que si no proporcionan el dato se calcule de manera automatica
        String frecuenciaAhorro,     // Si no lo agregan proporcionaremos el dato nosotros
        @NotEmpty @Valid List<TransaccionDTO> transacciones
) {
}