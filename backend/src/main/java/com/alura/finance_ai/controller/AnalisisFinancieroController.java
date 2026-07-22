package com.alura.finance_ai.controller;

import com.alura.finance_ai.dto.AnalisisRequest;
import com.alura.finance_ai.service.AnalisisFinancieroService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/analisis")
public class AnalisisFinancieroController {

    @Autowired
    private AnalisisFinancieroService analisisService;

    @PostMapping
    public ResponseEntity<List<String>> analizar(@RequestBody @Valid AnalisisRequest request) {
        // Aquí pasamos el request y de forma simulada o temporal el perfil obtenido (ej. "Saludable" o "En riesgo")
        List<String> recomendaciones = analisisService.analizarFinanzas(request, "Saludable");

        return ResponseEntity.ok(recomendaciones);
    }
}