package com.alura.finance_ai.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record AnalisisRequest(
        @NotNull @Min(0) Double ingresoMensual,
        @NotNull @Min(0) Integer nivelEndeudamiento,
        @NotNull String frecuenciaAhorro,
        @NotEmpty @Valid List<TransaccionDTO> transacciones
) {
}