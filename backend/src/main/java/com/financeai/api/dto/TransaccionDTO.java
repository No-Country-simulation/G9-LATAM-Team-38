package com.financeai.api.dto;
//lkj
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record TransaccionDTO(
        @NotBlank String descripcion,
        @Positive Double valor
) {
}
