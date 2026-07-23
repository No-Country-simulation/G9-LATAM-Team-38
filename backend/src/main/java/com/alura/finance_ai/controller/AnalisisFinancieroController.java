package com.alura.finance_ai.controller;

import com.alura.finance_ai.dto.AnalisisRequest;
import com.alura.finance_ai.dto.TransaccionDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Tag(name = "Finanzas", description = "Endpoints para el análisis y clasificación financiera")
public class AnalisisFinancieroController {

    @Operation(summary = "Analizar comportamiento financiero", description = "Recibe datos del usuario y genera un perfil financiero, resumen de gastos y recomendaciones.")
    @PostMapping("/analisis-financiero")
    public ResponseEntity<?> procesarAnalisis(@Valid @RequestBody AnalisisRequest request) {
        
        Map<String, Object> response = new HashMap<>();
        response.put("perfil_financiero", "Saludable");
        response.put("probabilidad", 0.90);
        
        Map<String, Double> resumenGastos = new HashMap<>();
        resumenGastos.put("Alimentacion", 350.0);
        resumenGastos.put("Transporte", 120.0);
        resumenGastos.put("Ocio", 80.0);
        response.put("resumen_gastos", resumenGastos);
        
        response.put("recomendaciones", List.of(
            "Buen nivel de ahorro este mes.",
            "Alerta: Tus gastos en ocio están subiendo respecto al mes pasado."
        ));

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Clasificar transacción", description = "Clasifica automáticamente una transacción en una categoría financiera (ej. Alimentación, Transporte, etc).")
    @PostMapping("/clasificar-transaccion")
    public ResponseEntity<?> clasificarTransaccion(@Valid @RequestBody TransaccionDTO transaccion) {
        // Simulación de clasificación
        String categoria = "Otras categorías";
        String descripcion = transaccion.descripcion().toLowerCase();
        
        if (descripcion.contains("supermercado") || descripcion.contains("comida") || descripcion.contains("restaurante")) {
            categoria = "Alimentación";
        } else if (descripcion.contains("uber") || descripcion.contains("combustible") || descripcion.contains("gasolina")) {
            categoria = "Transporte";
        } else if (descripcion.contains("netflix") || descripcion.contains("cine") || descripcion.contains("streaming")) {
            categoria = "Ocio";
        } else if (descripcion.contains("farmacia") || descripcion.contains("medico")) {
            categoria = "Salud";
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("descripcion", transaccion.descripcion());
        response.put("monto", transaccion.valor());
        response.put("categoria_asignada", categoria);
        
        return ResponseEntity.ok(response);
    }
}