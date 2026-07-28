"use client";

import { useState } from "react";
import HeroSection from "../components/HeroSection";
import FinanceForm from "../components/FinanceForm";
import ResultsDashboard from "../components/ResultsDashboard";
import { AnalisisRequest, AnalisisResponse, Transaccion } from "../types/finance";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AnalisisResponse | null>(null);

  const handleAnalyze = async (data: AnalisisRequest) => {
    setIsLoading(true);

    // MOCK DATA (Simulación temporal solicitada para no conectar con el backend)
    setTimeout(() => {
      // Calculamos un resumen agrupado básico solo para que se vea real
      const resumen: Record<string, number> = {};
      data.transacciones.forEach((t: Transaccion) => {
        if(t.categoria) {
            resumen[t.categoria] = (resumen[t.categoria] || 0) + t.valor;
        }
      });

      const mockResponse: AnalisisResponse = {
        perfil_financiero: "En observación",
        probabilidad: 0.85,
        resumen_gastos: resumen,
        recomendaciones: [
          "Intenta reducir tus gastos variables este mes.",
          "Alerta: Revisa tus pagos de Ocio y Servicios.",
          "Buen nivel de ahorro declarado."
        ]
      };

      setResults(mockResponse);
      setIsLoading(false);
    }, 1500); // Simulamos 1.5s de carga
  };

  const handleReset = () => {
    setResults(null);
  };

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <HeroSection />
      
      <main>
        {!results ? (
          <FinanceForm onSubmit={handleAnalyze} isLoading={isLoading} />
        ) : (
          <ResultsDashboard data={results} onReset={handleReset} />
        )}
      </main>

      <footer className="mt-24 pt-8 border-t border-white/10 text-center text-slate-500 text-sm">
        <p>&copy; 2026 Finance AI - Hackathon ONE Proyectos G9 | Alura + Oracle</p>
      </footer>
    </div>
  );
}
