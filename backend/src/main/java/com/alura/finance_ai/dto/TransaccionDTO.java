package com.alura.finance_ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record TransaccionDTO(
        @NotBlank String descripcion,
        @NotBlank String categoria,
        @Positive Double valor
) {
}