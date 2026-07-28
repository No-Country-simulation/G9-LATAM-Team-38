export interface Transaccion {
    id: number;
    descripcion: string;
    categoria: string;
    valor: number;
}

export interface AnalisisRequest {
    ingreso_mensual: number;
    nivel_endeudamiento: number;
    frecuencia_ahorro: string;
    transacciones: Transaccion[];
}

export interface AnalisisResponse {
    perfil_financiero: string;
    probabilidad: number;
    resumen_gastos: Record<string, number>;
    recomendaciones: string[];
}
