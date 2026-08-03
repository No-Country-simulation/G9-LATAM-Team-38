"use client";

import { useState, useEffect } from "react";
import { Bot, Terminal, Heart, Send, Plus, Trash2, AlertCircle, CheckCircle2, X } from "lucide-react";

interface Transaccion {
  id: string;
  descripcion: string;
  monto: string;
}

interface ResultadoAnalisis {
  confianza: number;
  endeudamiento: number;
  frecuenciaAhorro: number;
  estado: string;
  mensaje: string;
  totalGastos: number;
  recomendaciones: string[];
}

export default function Home() {
  const [ingresoMensual, setIngresoMensual] = useState<string>("4500");
  
  // Campos opcionales de Entrada
  const [endeudamientoManual, setEndeudamientoManual] = useState<string>("");
  const [frecuenciaAhorroManual, setFrecuenciaAhorroManual] = useState<string>("");

  const [transacciones, setTransacciones] = useState<Transaccion[]>([
    { id: "1", descripcion: "Alimentación", monto: "420" },
    { id: "2", descripcion: "Transporte", monto: "300" },
    { id: "3", descripcion: "Entretenimiento", monto: "40" },
  ]);

  const [resultado, setResultado] = useState<ResultadoAnalisis | null>(null);

  const [mostrarModal, setMostrarModal] = useState<boolean>(false);
  const [nuevaDescripcion, setNuevaDescripcion] = useState<string>("");
  const [nuevoMonto, setNuevoMonto] = useState<string>("");

  // Auto-cálculo en tiempo real conforme el usuario agrega transacciones
  useEffect(() => {
    const ingreso = parseFloat(ingresoMensual) || 0;
    const transaccionesValidas = transacciones.filter(t => parseFloat(t.monto) > 0);
    const totalGastos = transaccionesValidas.reduce((acc, t) => acc + (parseFloat(t.monto) || 0), 0);
    
    // Calcular endeudamiento
    let endeudamientoCalculado = ingreso > 0 ? Math.round((totalGastos / ingreso) * 100) : 0;
    if (endeudamientoCalculado > 100) endeudamientoCalculado = 100;
    
    setEndeudamientoManual(endeudamientoCalculado.toString());

    // Calcular ahorro
    const porcentajeSobrante = 100 - endeudamientoCalculado;
    if (porcentajeSobrante >= 20) setFrecuenciaAhorroManual("Alta");
    else if (porcentajeSobrante >= 10) setFrecuenciaAhorroManual("Media");
    else if (porcentajeSobrante > 0) setFrecuenciaAhorroManual("Baja");
    else setFrecuenciaAhorroManual("Nula");
    
  }, [transacciones, ingresoMensual]);

  const abrirModal = () => {
    setNuevaDescripcion("");
    setNuevoMonto("");
    setMostrarModal(true);
  };

  const guardarNuevaTransaccion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaDescripcion.trim() || !nuevoMonto.trim()) return;

    setTransacciones([
      ...transacciones,
      {
        id: Date.now().toString(),
        descripcion: nuevaDescripcion.trim(),
        monto: nuevoMonto.trim(),
      },
    ]);

    setMostrarModal(false);
  };

  const eliminarTransaccion = (id: string) => {
    setTransacciones(transacciones.filter((t) => t.id !== id));
  };

  const actualizarTransaccion = (
    id: string,
    campo: "descripcion" | "monto",
    valor: string
  ) => {
    setTransacciones(
      transacciones.map((t) => (t.id === id ? { ...t, [campo]: valor } : t))
    );
  };

  const ejecutarAnalisis = async () => {
    const ingreso = parseFloat(ingresoMensual) || 0;
    const transaccionesValidas = transacciones.filter(t => parseFloat(t.monto) > 0);
    const totalGastos = transaccionesValidas.reduce((acc, t) => acc + (parseFloat(t.monto) || 0), 0);
    
    // Preparar el cuerpo de la petición según lo que pide el Backend
    const transaccionesBackend = transaccionesValidas.map(t => ({
      descripcion: t.descripcion || "Gasto",
      valor: parseFloat(t.monto)
    }));

    // --- CÁLCULOS INTERNOS AUTOMÁTICOS ---
    // 1. Calcular Endeudamiento (% de ingresos gastado)
    let endeudamientoCalculado = Math.round((totalGastos / (ingreso || 1)) * 100);
    if (endeudamientoCalculado > 100) endeudamientoCalculado = 100;
    
    const endeudamientoFinal = endeudamientoManual.trim() !== "" ? parseInt(endeudamientoManual) : endeudamientoCalculado;

    // 2. Calcular Frecuencia de Ahorro según el dinero sobrante (si no se eligió manualmente)
    const porcentajeSobrante = 100 - endeudamientoFinal;
    let frecuenciaCalculada = "Baja";
    let porcentajeAhorroGrafica = 0;

    if (porcentajeSobrante >= 20) {
      frecuenciaCalculada = "Alta"; // Le sobra buen dinero, puede ahorrar frecuentemente
      porcentajeAhorroGrafica = 100;
    } else if (porcentajeSobrante >= 10) {
      frecuenciaCalculada = "Media";
      porcentajeAhorroGrafica = 50;
    } else if (porcentajeSobrante > 0) {
      frecuenciaCalculada = "Baja";
      porcentajeAhorroGrafica = 20;
    } else {
      frecuenciaCalculada = "Nula"; // Gasta más de lo que gana, no puede ahorrar
      porcentajeAhorroGrafica = 0;
    }

    const frecuenciaFinal = frecuenciaAhorroManual !== "" ? frecuenciaAhorroManual : frecuenciaCalculada;
    
    // Si el usuario eligió manualmente, forzamos el valor de la gráfica para que tenga sentido visual
    if (frecuenciaAhorroManual !== "") {
       if (frecuenciaFinal === "Alta") porcentajeAhorroGrafica = 100;
       else if (frecuenciaFinal === "Media") porcentajeAhorroGrafica = 50;
       else if (frecuenciaFinal === "Baja") porcentajeAhorroGrafica = 20;
       else porcentajeAhorroGrafica = 0;
    }

    // ACTUALIZAR LOS CAMPOS VISUALES DE LA IZQUIERDA PARA QUE EL USUARIO VEA LO QUE SE CALCULÓ
    if (endeudamientoManual.trim() === "") {
       setEndeudamientoManual(endeudamientoFinal.toString());
    }
    if (frecuenciaAhorroManual === "") {
       setFrecuenciaAhorroManual(frecuenciaFinal);
    }

    const datosEntrada = {
      ingresoMensual: ingreso,
      nivelEndeudamiento: endeudamientoFinal,
      frecuenciaAhorro: frecuenciaFinal,
      transacciones: transaccionesBackend
    };

    try {
      // LLAMADA REAL AL BACKEND EN JAVA
      const response = await fetch("http://localhost:8080/api/analisis-financiero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosEntrada)
      });

      if (!response.ok) {
        throw new Error("Error en el backend");
      }

      const data = await response.json();

      // Mapeamos los datos del JSON de salida a nuestra UI
      setResultado({
        confianza: Math.round((data.probabilidad || 0.88) * 100),
        endeudamiento: endeudamientoFinal,
        frecuenciaAhorro: porcentajeAhorroGrafica,
        estado: data.perfil_financiero || "Desconocido",
        mensaje: "Análisis generado por el servidor Java (Spring Boot).",
        totalGastos,
        recomendaciones: data.recomendaciones || []
      });

    } catch (error) {
      console.error(error);
      alert("Oops! Ocurrió un error al intentar conectarse con el Backend en localhost:8080");
    }
  };

  const coloresSegmentos = [
    "bg-[#C85A54]",
    "bg-[#F97316]",
    "bg-[#3B82F6]",
    "bg-[#10B981]",
    "bg-[#8B5CF6]",
    "bg-[#EC4899]",
  ];

  return (
    <div className="min-h-screen bg-[#0E131F] text-[#FFFFFF] font-sans flex flex-col justify-between selection:bg-[#F97316]/30 p-2 sm:p-4 relative">
      {/* HEADER */}
      <header className="flex justify-between items-center px-2 py-1 gap-2">
        <div className="flex items-center gap-2">
          <div className="bg-[#C85A54] p-1.5 rounded-lg shadow flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-none">Finance IA</h1>
            <p className="text-white/60 text-[10px] hidden sm:block">Diagnóstico financiero impulsado por IA</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#C85A54] text-white text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
            #38 Equipo Dinamita
          </div>
          <span className="text-white/60 text-[11px] hidden md:inline font-medium">
            Hackathon ONE · Alura + Oracle + NoCountry
          </span>
        </div>
      </header>

      {/* CONTENEDOR CENTRAL */}
      <div className="w-full my-1 flex-grow flex flex-col justify-center">
        {/* BANNER SUPERIOR */}
        <div className="bg-[#C85A54] rounded-t-xl px-4 py-2 flex flex-col sm:flex-row justify-between items-start sm:items-center relative overflow-hidden shadow-md">
          <div className="z-10">
            <div className="text-white/70 text-[8px] font-bold tracking-widest uppercase">
              ANÁLISIS FINANCIERO
            </div>
            <h2 className="text-sm md:text-base font-bold flex items-center gap-2">
              <Terminal size={16} className="text-white/90" />
              Diagnóstico financiero en tiempo real
            </h2>
          </div>

          <div className="z-10 mt-1 sm:mt-0 flex items-center gap-1.5 bg-[#1A2332]/40 border border-white/20 px-2.5 py-1 rounded-full backdrop-blur-md">
            <div className="w-1.5 h-1.5 rounded-full bg-[#F97316] animate-pulse"></div>
            <span className="text-[11px] font-mono text-white font-semibold flex items-center gap-1">
              <Send size={10} className="text-white/70" />
              /Analisis-Financiero
            </span>
          </div>
        </div>

        {/* CONTENEDOR PRINCIPAL */}
        <main className="bg-[#1A2332] rounded-b-xl p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 shadow-xl border border-white/5">
          
          {/* COLUMNA IZQUIERDA (ENTRADA) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center justify-center w-3 h-3 border-2 border-[#F97316] rounded-[2px]">
                <div className="w-0.5 h-0.5 bg-[#F97316]"></div>
              </div>
              <h3 className="text-white/50 font-bold tracking-widest text-[10px] uppercase">Entrada</h3>
            </div>

            <div className="bg-[#131924] border border-white/5 rounded-lg p-3 flex flex-col justify-between gap-2">
              <div className="space-y-2">
                
                {/* Ingreso Mensual */}
                <div>
                  <label className="block text-[11px] font-semibold text-white/70 mb-0.5">
                    Ingreso mensual ($)
                  </label>
                  <input
                    type="number"
                    value={ingresoMensual}
                    onChange={(e) => setIngresoMensual(e.target.value)}
                    placeholder="4500"
                    className="w-full bg-[#1A2332] border border-white/10 rounded-md px-2.5 py-1 text-xs font-semibold text-white focus:outline-none focus:border-[#F97316]"
                  />
                </div>

                {/* Fila de Endeudamiento y Frecuencia de Ahorro */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-white/70 mb-0.5 whitespace-nowrap">
                      Nivel de endeudamiento (%)
                    </label>
                    <input
                      type="number"
                      value={endeudamientoManual}
                      readOnly
                      placeholder="Auto"
                      className="w-full bg-[#1A2332]/50 border border-white/10 rounded-md px-2.5 py-1 text-xs font-semibold text-white/80 cursor-not-allowed focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-white/70 mb-0.5 whitespace-nowrap">
                      Frecuencia de ahorro
                    </label>
                    <select
                      value={frecuenciaAhorroManual}
                      disabled
                      className="w-full bg-[#1A2332]/50 border border-white/10 rounded-md px-2.5 py-1 text-xs font-semibold text-white/80 cursor-not-allowed focus:outline-none appearance-none"
                    >
                      <option value="">Auto (Media)</option>
                      <option value="Alta">Alta</option>
                      <option value="Media">Media</option>
                      <option value="Baja">Baja</option>
                      <option value="Nula">Nula</option>
                    </select>
                  </div>
                </div>

                {/* Transacciones Recientes */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-semibold text-white/70">
                      Transacciones recientes
                    </label>
                    <button
                      onClick={abrirModal}
                      type="button"
                      className="text-[#F97316] hover:text-[#f88837] text-[11px] font-bold flex items-center gap-0.5 transition-colors"
                    >
                      <Plus size={12} /> añadir
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                    {transacciones.map((item) => (
                      <div key={item.id} className="flex items-center gap-1.5">
                        <input
                          type="text"
                          placeholder="Descripción (ej. Alimentación)"
                          value={item.descripcion}
                          onChange={(e) =>
                            actualizarTransaccion(item.id, "descripcion", e.target.value)
                          }
                          className="flex-grow bg-[#1A2332] border border-white/10 rounded-md px-2 py-1 text-xs text-white focus:outline-none focus:border-[#F97316]"
                        />
                        <div className="relative w-20 flex-shrink-0">
                          <span className="absolute left-2 top-1 text-xs text-white/40">$</span>
                          <input
                            type="number"
                            placeholder="0"
                            value={item.monto}
                            onChange={(e) =>
                              actualizarTransaccion(item.id, "monto", e.target.value)
                            }
                            className="w-full bg-[#1A2332] border border-white/10 rounded-md pl-4 pr-1.5 py-1 text-xs text-white focus:outline-none focus:border-[#F97316]"
                          />
                        </div>
                        {transacciones.length > 1 && (
                          <button
                            onClick={() => eliminarTransaccion(item.id)}
                            className="text-white/30 hover:text-[#C85A54] p-0.5 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={ejecutarAnalisis}
                className="w-full bg-[#C85A54] hover:bg-[#b34f49] text-white font-bold py-2 rounded-md transition-all shadow flex items-center justify-center gap-1.5 text-xs mt-1"
              >
                <div className="w-2 h-2 border-2 border-white rounded-[1px] flex items-center justify-center">
                  <div className="w-0.5 h-0.5 bg-white"></div>
                </div>
                Ejecutar análisis
              </button>
            </div>
          </div>

          {/* COLUMNA DERECHA (RESULTADO) */}
          <div className="flex flex-col gap-2 lg:pl-4 lg:border-l border-white/5">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center justify-center w-3 h-3 border-2 border-[#F97316] rounded-[2px]">
                <div className="w-0.5 h-0.5 bg-[#F97316]"></div>
              </div>
              <h3 className="text-white/50 font-bold tracking-widest text-[10px] uppercase">Resultado</h3>
            </div>
            
            {!resultado ? (
              <div className="h-full border border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle size={24} className="text-white/20 mb-1.5" />
                <span className="text-white/40 text-xs font-medium">
                  Haz clic en &quot;Ejecutar análisis&quot; para generar los resultados
                </span>
              </div>
            ) : (
              <div className="bg-[#131924] border border-white/5 rounded-lg p-3 flex flex-col justify-between gap-3">
                
                {/* Diagnóstico superior con círculos métricos */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  
                  {/* Círculos Calculables */}
                  <div className="flex items-center justify-around sm:justify-start gap-2.5 flex-shrink-0">
                    {/* Círculo 1: Confianza */}
                    <div className="relative w-12 h-12 flex items-center justify-center rounded-full border-2 border-[#C85A54] bg-[#1A2332]">
                      <div className="text-center">
                        <span className="text-xs font-bold text-white block leading-none">
                          {resultado.confianza}%
                        </span>
                        <span className="text-[6px] text-white/50 block mt-0.5">Confianza</span>
                      </div>
                    </div>

                    {/* Círculo 2: Endeudamiento */}
                    <div className="relative w-12 h-12 flex items-center justify-center rounded-full border-2 border-[#F97316] bg-[#1A2332]">
                      <div className="text-center">
                        <span className="text-xs font-bold text-white block leading-none">
                          {resultado.endeudamiento}%
                        </span>
                        <span className="text-[6px] text-white/50 block mt-0.5">Endeudamiento</span>
                      </div>
                    </div>

                    {/* Círculo 3: Frecuencia / Capacidad Ahorro */}
                    <div className="relative w-12 h-12 flex items-center justify-center rounded-full border-2 border-[#10B981] bg-[#1A2332]">
                      <div className="text-center">
                        <span className="text-xs font-bold text-white block leading-none">
                          {resultado.frecuenciaAhorro}%
                        </span>
                        <span className="text-[6px] text-white/50 block mt-0.5">Ahorro</span>
                      </div>
                    </div>
                  </div>

                  {/* Cuadro de Observación */}
                  <div className="flex-grow bg-[#1A2332] p-2 rounded-md border border-white/5">
                    <div className="inline-block bg-[#F97316]/20 text-[#F97316] text-[8px] font-bold px-1.5 py-0.2 rounded mb-0.5 border border-[#F97316]/30">
                      ☐ {resultado.estado}
                    </div>
                    <p className="text-[10px] text-white/80 leading-tight">
                      {resultado.mensaje}
                    </p>
                  </div>

                </div>

                {/* Resumen de gastos y Barra ÚNICA segmentada */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-white/60 font-medium">Resumen de gastos</span>
                    <span className="text-white font-bold">${resultado.totalGastos}</span>
                  </div>

                  <div className="w-full h-2 bg-[#1A2332] rounded-full overflow-hidden flex">
                    {transacciones
                      .filter((t) => parseFloat(t.monto) > 0)
                      .map((item, idx) => {
                        const monto = parseFloat(item.monto) || 0;
                        const porcentaje = resultado.totalGastos > 0 
                          ? (monto / resultado.totalGastos) * 100 
                          : 0;
                        return (
                          <div
                            key={item.id}
                            style={{ width: `${porcentaje}%` }}
                            className={`h-full ${coloresSegmentos[idx % coloresSegmentos.length]} transition-all duration-300`}
                          />
                        );
                      })}
                  </div>

                  {/* Leyenda limpia */}
                  <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 pt-0.5">
                    {transacciones
                      .filter((t) => parseFloat(t.monto) > 0)
                      .map((item, idx) => (
                        <div key={item.id} className="flex items-center gap-1 text-[10px]">
                          <div className={`w-1.5 h-1.5 rounded-full ${coloresSegmentos[idx % coloresSegmentos.length]}`} />
                          <span className="text-white/70">{item.descripcion || 'Gasto'}:</span>
                          <span className="text-white font-semibold">${item.monto}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Explicación de Métricas para el Usuario */}
                <div className="bg-[#1A2332]/40 p-2 rounded border border-white/5 text-[9px] text-white/60 space-y-1 mt-1">
                  <p><strong className="text-white/80">🧠 Confianza ({resultado.confianza}%):</strong> Nivel de seguridad del modelo de Inteligencia Artificial sobre este diagnóstico.</p>
                  <p><strong className="text-white/80">💰 Frecuencia de Ahorro:</strong> Nivel de capacidad de ahorro detectado (Alta, Media, Baja o Nula) según el dinero sobrante después de gastos.</p>
                </div>

                {/* Recomendaciones */}
                <div className="space-y-1 pt-1 border-t border-white/5">
                  <span className="text-[9px] uppercase tracking-wider text-white/40 font-bold block">
                    Recomendaciones
                  </span>
                  {resultado.recomendaciones.map((rec, i) => (
                    <div key={i} className="flex items-start gap-1.5 bg-[#1A2332]/60 p-1.5 rounded border border-white/5 text-[10px] text-white/80">
                      <CheckCircle2 size={11} className="text-[#F97316] flex-shrink-0 mt-0.5" />
                      <span className="leading-tight">{rec}</span>
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODAL / VENTANA EMERGENTE PARA AÑADIR TRANSACCIÓN */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131924] border border-white/10 rounded-xl p-4 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus size={16} className="text-[#F97316]" />
                Añadir Nueva Transacción
              </h4>
              <button
                onClick={() => setMostrarModal(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={guardarNuevaTransaccion} className="space-y-3">
              <div>
                <label className="block text-[11px] text-white/70 mb-1 font-medium">
                  Descripción del gasto
                </label>
                <input
                  type="text"
                  placeholder="ej. Suscripción Netflix, Servicios..."
                  value={nuevaDescripcion}
                  onChange={(e) => setNuevaDescripcion(e.target.value)}
                  className="w-full bg-[#1A2332] border border-white/10 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#F97316]"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] text-white/70 mb-1 font-medium">
                  Monto ($)
                </label>
                <input
                  type="number"
                  placeholder="ej. 150"
                  value={nuevoMonto}
                  onChange={(e) => setNuevoMonto(e.target.value)}
                  className="w-full bg-[#1A2332] border border-white/10 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#F97316]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="px-3 py-1.5 rounded-md text-xs text-white/60 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#F97316] hover:bg-[#e0620d] text-white font-bold px-4 py-1.5 rounded-md text-xs transition-colors shadow"
                >
                  Agregar Transacción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="py-1 flex flex-col items-center gap-1">
        <div className="flex flex-wrap justify-center gap-1 px-2 max-w-5xl">
          {[
            "Sonia Moran Jarquin",
            "Brayan Camargo Ramírez",
            "Gabriel Gil",
            "Jesus Armando Tapia Gallegos",
            "Jesús García",
            "Ian Alonso Jesus Osnaya",
            "Marco Antonio Arias Mullisaca"
          ].map((name, i) => (
            <div 
              key={i} 
              className="bg-[#1A2332] text-white/80 px-2 py-0.5 rounded-full text-[9px] font-medium border border-white/5 flex items-center gap-1"
            >
              <div className="w-3 h-3 rounded-full bg-[#C85A54]/20 flex items-center justify-center text-[6px] text-[#F97316] font-bold">
                {name.split(' ').slice(0, 2).map(n => n[0]).join('')}
              </div>
              <span className="whitespace-nowrap">{name}</span>
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-1 text-white/40 text-[8px] text-center">
          <span>Hecho con</span>
          <Heart size={8} className="text-[#C85A54] fill-[#C85A54]" />
          <span>por Proyecto <strong className="text-white/70">Equipo Dinamita - 38</strong> — Hackathon ONE para <strong className="text-white/70">Alura · Oracle · NoCountry</strong></span>
        </div>
      </footer>
    </div>
  );
}