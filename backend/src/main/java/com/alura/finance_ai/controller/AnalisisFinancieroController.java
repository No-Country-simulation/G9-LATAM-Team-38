package com.alura.finance_ai.controller;

import com.alura.finance_ai.dto.AnalisisRequest;
import com.alura.finance_ai.dto.TransaccionDTO;
import com.alura.finance_ai.service.AnalisisFinancieroService;
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
@CrossOrigin(origins = "*") // Permite que el frontend se conecte sin errores de CORS
@Tag(name = "Finanzas", description = "Endpoints para el análisis y clasificación financiera")
public class AnalisisFinancieroController {

    private final AnalisisFinancieroService analisisService;

    public AnalisisFinancieroController(AnalisisFinancieroService analisisService) {
        this.analisisService = analisisService;
    }

    @Operation(summary = "Analizar comportamiento financiero", description = "Recibe datos de ingresos y transacciones para generar perfil, resumen de gastos y recomendaciones.")
    @PostMapping("/analisis-financiero")
    public ResponseEntity<?> procesarAnalisis(@Valid @RequestBody AnalisisRequest request) {

        Integer endeudamiento = request.nivelEndeudamiento();
        String ahorro = request.frecuenciaAhorro();

        if (endeudamiento == null || ahorro == null || ahorro.isEmpty()) {
            double totalGastos = 0.0;
            if (request.transacciones() != null) {
                for (TransaccionDTO t : request.transacciones()) {
                    if (t.valor() != null && t.valor() > 0) {
                        totalGastos += t.valor();
                    }
                }
            }

            if (endeudamiento == null) {
                double ingreso = request.ingresoMensual() != null && request.ingresoMensual() > 0 ? request.ingresoMensual() : 1.0;
                endeudamiento = (int) Math.round((totalGastos / ingreso) * 100);
                if (endeudamiento > 100) endeudamiento = 100;
            }

            if (ahorro == null || ahorro.isEmpty()) {
                int porcentajeSobrante = 100 - endeudamiento;
                if (porcentajeSobrante >= 20) ahorro = "Alta";
                else if (porcentajeSobrante >= 10) ahorro = "Media";
                else if (porcentajeSobrante > 0) ahorro = "Baja";
                else ahorro = "Nula";
            }

            request = new AnalisisRequest(
                    request.ingresoMensual(),
                    endeudamiento,
                    ahorro,
                    request.transacciones()
            );
        }

        String perfilFinanciero = analisisService.realizarPrediccionInterna(request);

        Map<String, Double> resumenGastos = calcularResumenGastos(request);

        List<String> recomendaciones = analisisService.generarRecomendaciones(request, perfilFinanciero, resumenGastos);

        Map<String, Object> response = new HashMap<>();
        response.put("perfil_financiero", perfilFinanciero);
        response.put("probabilidad", 0.88);
        response.put("resumen_gastos", resumenGastos);
        response.put("recomendaciones", recomendaciones);

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Clasificar transacción", description = "Clasifica automáticamente una transacción individual en una categoría.")
    @PostMapping("/clasificar-transaccion")
    //Se cambio el <?> por Map<String, Object> para enviar warnings y hacer mas claro lo que devolvemos
    public ResponseEntity<Map<String, Object>> clasificarTransaccion(@Valid @RequestBody TransaccionDTO transaccion) {

        String categoria = analisisService.clasificarTransaccion(transaccion);

        Map<String, Object> response = new HashMap<>();
        response.put("descripcion", transaccion.descripcion());
        response.put("monto", transaccion.valor());
        response.put("categoria_asignada", categoria);

        return ResponseEntity.ok(response);
    }

    private Map<String, Double> calcularResumenGastos(AnalisisRequest request) {
        Map<String, Double> resumen = new HashMap<>();

        if (request.transacciones() != null) {
            for (TransaccionDTO t : request.transacciones()) {
                String categoria = analisisService.clasificarTransaccion(t);
                resumen.put(categoria, resumen.getOrDefault(categoria, 0.0) + t.valor());
            }
        }

        return resumen;
    }
}