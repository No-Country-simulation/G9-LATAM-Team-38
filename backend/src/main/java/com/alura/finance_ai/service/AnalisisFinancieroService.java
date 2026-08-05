package com.alura.finance_ai.service;

import com.alura.finance_ai.dto.AnalisisRequest;
import com.alura.finance_ai.dto.TransaccionDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class AnalisisFinancieroService {
    //Se agrega un logger para poder ver los errores en la consola en caso de que la IA falle
   private static final Logger logger = LoggerFactory.getLogger(AnalisisFinancieroService.class);

    private final RestClient restClient;

    private boolean esCoherente(int endeudamiento, String ahorro) {
        int margen = Math.max(0, 100 - endeudamiento);
        return switch (ahorro.toLowerCase()) {
            case "alta" -> margen >= 40;
            case "media" -> margen >= 20;
            case "baja" -> margen >= 5;
            case "nula" -> true;
            default -> false;
        };
    }

    public AnalisisFinancieroService(@Value("${servicio.ia.url:http://localhost:8000}") String servicioIaUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(servicioIaUrl)
                .build();
    }

    private String determinarFrecuenciaAhorro(double ratioAhorro) {
        if (ratioAhorro >= 0.40) return "Alta";
        if (ratioAhorro >= 0.20) return "Media";
        if (ratioAhorro >= 0.05) return "Baja";
        return "Nula";
    }

    private int calcularPuntosAhorro(String ahorroStr) {
        if (ahorroStr == null) return 0;
        return switch (ahorroStr.toLowerCase()) {
            case "alta" -> 30;
            case "media" -> 20;
            case "baja" -> 10;
            default -> 0;
        };
    }

    private int calcularPuntosEndeudamiento(Integer nivelEndeudamiento) {
        if (nivelEndeudamiento == null) return 0;
        if (nivelEndeudamiento < 30) return 30;
        if (nivelEndeudamiento <= 50) return 20;
        if (nivelEndeudamiento <= 70) return 10;
        return 0;
    }

    private int calcularPuntosGasto(double porcentajeGasto) {
        if (porcentajeGasto < 30) return 40;
        if (porcentajeGasto <= 60) return 20;
        return 5;
    }

    public AnalisisRequest validarYCompletarRequest(AnalisisRequest request) {
        double ingreso = request.ingresoMensual() != null && request.ingresoMensual() > 0 ? request.ingresoMensual() : 1.0;
        
        double totalGastos = 0.0;
        if (request.transacciones() != null) {
            for (TransaccionDTO t : request.transacciones()) {
                if (t.valor() != null) {
                    totalGastos += t.valor();
                }
            }
        }

        Integer endeudamiento = request.nivelEndeudamiento();
        String ahorro = request.frecuenciaAhorro();

        // Auto-cálculo si el usuario no los envió explícitamente
        if (endeudamiento == null || ahorro == null || ahorro.isEmpty()) {
            double end = Math.round((totalGastos / ingreso) * 100.0);
            endeudamiento = (int) end;
            
            double margenLibre = ingreso - totalGastos;
            double ratioAhorro = margenLibre / ingreso;
            ahorro = determinarFrecuenciaAhorro(ratioAhorro);
        } else {
            // Validación Manual (Margen de error del 20%)
            int porcentajeGastos = (int) Math.round((totalGastos / ingreso) * 100);
            
            if (Math.abs(endeudamiento - porcentajeGastos) > 20) {
                throw new IllegalArgumentException(String.format("Incoherencia detectada: Tu nivel de endeudamiento declarado (%d%%) difiere demasiado de tus gastos reales registrados (%d%%). Solo se permite un margen de aproximación del 20%%.", endeudamiento, porcentajeGastos));
            }

            if (!esCoherente(endeudamiento, ahorro)) {
                int margenLibre = Math.max(0, 100 - endeudamiento);
                throw new IllegalArgumentException(String.format("Incoherencia detectada: Declaras un endeudamiento del %d%%, lo cual deja un margen libre del %d%%. Matemáticamente esto no alcanza para sostener una frecuencia de ahorro '%s'.", 
                        endeudamiento, margenLibre, ahorro));
            }
        }

        return new AnalisisRequest(
                request.ingresoMensual(),
                endeudamiento,
                ahorro,
                request.transacciones()
        );
    }

    public int calcularPuntaje(AnalisisRequest datos) {
        int puntaje = 0;
        puntaje += calcularPuntosAhorro(datos.frecuenciaAhorro());
        puntaje += calcularPuntosEndeudamiento(datos.nivelEndeudamiento());

        double totalGastosRecientes = 0.0;
        if (datos.transacciones() != null) {
            for (TransaccionDTO t : datos.transacciones()) {
                if (t.valor() != null) totalGastosRecientes += t.valor();
            }
        }
        
        double ingreso = datos.ingresoMensual() != null && datos.ingresoMensual() > 0 ? datos.ingresoMensual() : 1.0;
        double porcentajeGasto = (totalGastosRecientes / ingreso) * 100;
        
        puntaje += calcularPuntosGasto(porcentajeGasto);
        return puntaje;
    }

    public String realizarPrediccionInterna(Object payload) {
        try {
            return restClient.post()
                    .uri("/prediccion-interna")
                    .body(payload)
                    .retrieve()
                    .body(String.class);
        } catch (Exception e) {
            // Se manda a imprimir el error en color rojo para saber que paso antes de mandar la respuesta por defecto
            logger.error("Se cayo la conexion con Python en prediccion Interna: " + e.getMessage());

            // Simulamos una respuesta usando la lógica del requerimiento solicitada
            if (payload instanceof AnalisisRequest req) {
                int puntaje = calcularPuntaje(req);
                return (puntaje >= 80) ? "Excelente" : (puntaje >= 50) ? "Estable" : (puntaje >= 30) ? "En Riesgo" : "Crítico";
            }
            return "En Observacion";
        }
    }

    public String clasificarTransaccion(TransaccionDTO transaccion) {
        try {
            return restClient.post()
                    .uri("/prediccion-interna")
                    .body(transaccion)
                    .retrieve()
                    .body(String.class);
        } catch (Exception e) {
            //Se logea el error y se simula la categoria para que el front end no se rompa
           logger.warn("No se puede clasificar la transaccion, Error: " + e.getMessage());
           return simularClasificacion(transaccion.descripcion());
        }
    }

    private String simularClasificacion(String descripcion) {
        if (descripcion == null) return "Otros";

        String descLower = descripcion.toLowerCase();
        if (descLower.contains("supermercado") || descLower.contains("comida") || descLower.contains("restaurante")) {
            return "Alimentación";
        } else if (descLower.contains("cine") || descLower.contains("streaming") || descLower.contains("juegos")) {
            return "Entretenimiento";
        } else if (descLower.contains("uber") || descLower.contains("gasolina") || descLower.contains("transporte")) {
            return "Transporte";
        }

        return "Otros";
    }

    public List<String> generarRecomendaciones(
            AnalisisRequest request,
            String perfilPython,
            Map<String, Double> resumenGastos) {

        List<String> recomendaciones = new ArrayList<>();

        if (request.transacciones() != null && request.ingresoMensual() != null && request.ingresoMensual() > 0) {
            double umbral10PorCiento = request.ingresoMensual() * 0.10;

            for (TransaccionDTO transaccion : request.transacciones()) {
                if (transaccion.valor() > umbral10PorCiento) {
                    recomendaciones.add(
                            "[ALERTA] El gasto en '" + transaccion.descripcion() +
                                    "' supera el límite preventivo recomendado por transacción"
                    );
                }
            }
        }

        if (perfilPython != null) {
            if (perfilPython.equalsIgnoreCase("En Riesgo")) {
                recomendaciones.add(
                        "Alerta: Su nivel de endeudamiento supera los límites recomendados. Evite adquirir nuevos créditos."
                );
            } else if (perfilPython.equalsIgnoreCase("Finanzas Sanas") || perfilPython.equalsIgnoreCase("Saludable")) {
                recomendaciones.add(
                        "Buen trabajo. Se recomienda destinar un 10% adicional a su ahorro mensual."
                );
            } else if (perfilPython.equalsIgnoreCase("En Observacion")) {
                recomendaciones.add(
                        "Atención: Tus obligaciones financieras declaradas están consumiendo la mayor parte de tus ingresos. Recomendamos considerar moderar gastos."
                );
            }
        }

        if (request.transacciones() != null && request.ingresoMensual() != null && request.ingresoMensual() > 0) {
            double totalGastosRegistrados = 0.0;
            for (TransaccionDTO t : request.transacciones()) {
                if (t.valor() != null && t.valor() > 0) {
                    totalGastosRegistrados += t.valor();
                }
            }
            int porcentajeGastos = (int) Math.round((totalGastosRegistrados / request.ingresoMensual()) * 100);
            
            if (porcentajeGastos > 100) {
                recomendaciones.add(String.format("¡Atención! Tus gastos actuales representan un %d%% de tus ingresos. Si no recibes ayuda externa, estás en grave riesgo de sobreendeudamiento.", porcentajeGastos));
            } else if (porcentajeGastos < 20) {
                recomendaciones.add(String.format("Tus gastos registrados representan solo un %d%% de tus ingresos. ¡Excelente capacidad para ahorrar e invertir!", porcentajeGastos));
            }
        }

        if (resumenGastos != null && request.ingresoMensual() != null && request.ingresoMensual() > 0) {
            double umbral30PorCiento = request.ingresoMensual() * 0.30;

            resumenGastos.forEach((categoria, totalGasto) -> {
                if (totalGasto > umbral30PorCiento) {
                    recomendaciones.add(
                            "Se recomienda reducir gastos en la categoría de " + categoria
                    );
                }
            });
        }

        String ahorro = request.frecuenciaAhorro();
        if (ahorro != null && (ahorro.equalsIgnoreCase("Baja") || ahorro.equalsIgnoreCase("Nula") || ahorro.equalsIgnoreCase("Nulo"))) {
            recomendaciones.add(
                    "Aumentar la frecuencia de ahorro ayudaría a mejorar tu perfil financiero y tener mejores oportunidades a futuro"
            );
        }

        return recomendaciones;
    }
}