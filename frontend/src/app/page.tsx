"use client";

import { useState } from "react";
import { 
  Bot, Heart, Send, Plus, Trash2, AlertCircle, CheckCircle2, 
  X, Zap, Users, ChevronDown, ChevronUp, Sun, Moon
} from "lucide-react";
import { sanitizeInput, TransaccionSecuritySchema } from "@/lib/security";

interface Transaccion {
  id: string;
  descripcion: string;
  monto: string;
}

interface ResultadoAnalisis {
  confianza: number;
  endeudamiento: number;
  frecuenciaAhorroText: string;
  frecuenciaAhorroNum: number;
  estado: string;
  mensaje: string;
  totalGastos: number;
  recomendaciones: string[];
}

interface Miembro {
  nombre: string;
  linkedin?: string;
  github?: string;
}

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [ingresoMensual, setIngresoMensual] = useState<string>("4500");
  
  const [endeudamientoManual, setEndeudamientoManual] = useState<string>("25");
  const [frecuenciaAhorroManual, setFrecuenciaAhorroManual] = useState<string>("Media");

  const [transacciones, setTransacciones] = useState<Transaccion[]>([
    { id: "1", descripcion: "Supermercado", monto: "420" },
    { id: "2", descripcion: "Combustible", monto: "300" },
    { id: "3", descripcion: "Streaming", monto: "40" },
  ]);

  const [resultado, setResultado] = useState<ResultadoAnalisis | null>(null);

  const [mostrarModal, setMostrarModal] = useState<boolean>(false);
  const [nuevaDescripcion, setNuevaDescripcion] = useState<string>("");
  const [nuevoMonto, setNuevoMonto] = useState<string>("");

  const [mostrarMiembros, setMostrarMiembros] = useState<boolean>(false);

  const abrirModal = () => {
    setNuevaDescripcion("");
    setNuevoMonto("");
    setMostrarModal(true);
  };

  const guardarNuevaTransaccion = (e: React.FormEvent) => {
    e.preventDefault();

    const validacion = TransaccionSecuritySchema.safeParse({
      descripcion: nuevaDescripcion,
      monto: parseFloat(nuevoMonto),
    });

    if (!validacion.success) {
      alert(validacion.error.issues[0]?.message || "Entrada no válida");
      return;
    }

    setTransacciones([
      ...transacciones,
      {
        id: Date.now().toString(),
        descripcion: validacion.data.descripcion,
        monto: validacion.data.monto.toString(),
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
    const valorLimpio = campo === "descripcion" ? sanitizeInput(valor) : valor;

    setTransacciones(
      transacciones.map((t) => (t.id === id ? { ...t, [campo]: valorLimpio } : t))
    );
  };

  const ejecutarAnalisis = () => {
    const ingreso = parseFloat(ingresoMensual) || 0;
    
    const transaccionesValidas = transacciones.filter(t => parseFloat(t.monto) > 0);
    const totalGastos = transaccionesValidas.reduce(
      (acc, t) => acc + (parseFloat(t.monto) || 0),
      0
    );

    let endeudamientoCalc = 25;
    if (endeudamientoManual.trim() !== "" && !isNaN(parseFloat(endeudamientoManual))) {
      endeudamientoCalc = Math.min(Math.max(parseFloat(endeudamientoManual), 0), 100);
    } else {
      endeudamientoCalc = ingreso > 0 ? Math.min(Math.round((totalGastos / ingreso) * 100), 100) : 0;
    }

    let ahorroNum = 50;
    let ahorroText = frecuenciaAhorroManual.trim() !== "" ? frecuenciaAhorroManual : "Media";
    
    const ahorroLower = ahorroText.toLowerCase();
    if (ahorroLower.includes("alta") || ahorroLower.includes("alto")) {
      ahorroNum = 80;
    } else if (ahorroLower.includes("baja") || ahorroLower.includes("bajo")) {
      ahorroNum = 20;
    } else {
      ahorroNum = 50; 
    }

    let confianzaCalc = 85;
    let estado = "Saludable";
    let mensaje = "Nivel de gasto muy controlado. Tienes un excelente margen para inversión y ahorro.";
    let recomendaciones = [
      "Considera destinar el excedente a un fondo de inversión.",
      "Mantén tu nivel de gastos actual para consolidar tus metas."
    ];

    setResultado({
      confianza: confianzaCalc,
      endeudamiento: endeudamientoCalc,
      frecuenciaAhorroText: ahorroText,
      frecuenciaAhorroNum: ahorroNum,
      estado,
      mensaje,
      totalGastos,
      recomendaciones,
    });
  };

  const coloresSegmentos = [
    "bg-[#8DA9C4]",
    "bg-[#134074]",
    "bg-[#13315C]",
    "bg-[#0B2545]",
    "bg-[#62B6CB]",
    "bg-[#5FA8D3]",
  ];

  const miembrosEquipo: Miembro[] = [
    { nombre: "Sonia Moran", linkedin: "https://www.linkedin.com/in/sonia-moran-286717422/", github: "https://github.com/Zonya8" },
    { nombre: "Brayan Camargo", linkedin: "https://www.linkedin.com/in/brayan-camargo-ram%C3%ADrez/", github: "https://github.com/Brayan-Camargo" },
    { nombre: "Gabriel Gil", linkedin: "https://www.linkedin.com/in/gabriel-gil-337a20250/", github: "https://github.com/gilgabriel422-netizen" },
    { nombre: "Armando Tapia", linkedin: "https://www.linkedin.com/in/atapia9/", github: "https://github.com/atapia9" },
    { nombre: "Jesús García", linkedin: "https://www.linkedin.com/in/jesusjgarciam/", github: "https://github.com/Electrocyte96" },
    { nombre: "Ian Osnaya", linkedin: "https://www.linkedin.com/in/ian-osnaya-0a7b71375/", github: "https://github.com/IanOsnaya" },
    { nombre: "Marco Arias", linkedin: "https://www.linkedin.com/in/marco-antonio-arias-mullisaca-b688611ba/", github: "https://github.com/marcomull" },
  ];

  const noSpinnersClass = "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  const themeStyles = isDarkMode ? {
    bgMain: "bg-[#0B2545]",
    textMain: "text-[#EEF4ED]",
    textMuted: "text-[#EEF4ED]/60",
    bannerBg: "bg-[#13315C]",
    bannerText: "text-[#EEF4ED]",
    cardBg: "bg-[#134074]",
    cardInner: "bg-[#0B2545]",
    inputBg: "bg-[#0B2545]",
    inputText: "text-[#EEF4ED]",
    inputBorder: "border-[#8DA9C4]/20",
    modalBg: "bg-[#134074]",
    borderSubtle: "border-[#8DA9C4]/10"
  } : {
    bgMain: "bg-[#EEF4ED]",
    textMain: "text-[#0B2545]",
    textMuted: "text-[#0B2545]/70",
    bannerBg: "bg-[#8DA9C4]",
    bannerText: "text-[#0B2545]",
    cardBg: "bg-[#FFFFFF]",
    cardInner: "bg-[#8DA9C4]/15",
    inputBg: "bg-[#FFFFFF]",
    inputText: "text-[#0B2545]",
    inputBorder: "border-[#8DA9C4]/40",
    modalBg: "bg-[#FFFFFF]",
    borderSubtle: "border-[#8DA9C4]/30"
  };

  return (
    <div className={`h-screen w-screen ${themeStyles.bgMain} ${themeStyles.textMain} font-sans flex flex-col justify-between selection:bg-[#8DA9C4]/30 px-4 py-2 relative overflow-hidden transition-colors duration-300`}>
      
      {/* HEADER */}
      <header className="flex justify-between items-center px-2 py-1 gap-2 max-w-7xl mx-auto w-full flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="bg-[#8DA9C4] p-1.5 rounded-xl shadow-md flex items-center justify-center text-[#0B2545]">
            <Bot size={20} />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-bold leading-none">Finance IA</h1>
            <p className={`${themeStyles.textMuted} text-[11px] hidden sm:block mt-0.5`}>Diagnóstico financiero impulsado por IA</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center gap-1.5 bg-[#8DA9C4] text-[#0B2545] text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-sm hover:bg-[#134074] hover:text-[#EEF4ED] transition-colors"
          >
            {isDarkMode ? <Sun size={13} /> : <Moon size={13} />}
            <span>{isDarkMode ? "Modo Claro" : "Modo Oscuro"}</span>
          </button>

          <div className="bg-[#8DA9C4] text-[#0B2545] text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-sm hidden sm:block">
            #38 Equipo Dinamita
          </div>
          <span className={`${themeStyles.textMuted} text-xs hidden md:inline font-medium`}>
            Hackathon ONE · Alura + Oracle + NoCountry
          </span>
        </div>
      </header>

      {/* CONTENEDOR CENTRAL */}
      <div className="w-full max-w-7xl mx-auto my-1 flex-1 flex flex-col justify-center min-h-0">
        
        {/* BANNER SUPERIOR */}
        <div className={`${themeStyles.bannerBg} border border-[#8DA9C4]/30 rounded-t-2xl px-5 py-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-center relative shadow-lg flex-shrink-0 transition-colors duration-300`}>
          <div className="z-10">
            <div className={`${isDarkMode ? 'text-[#8DA9C4]' : 'text-[#0B2545]'} text-[9px] font-bold tracking-widest uppercase mb-0.5`}>
              ANÁLISIS FINANCIERO
            </div>
            <h2 className={`text-sm md:text-lg font-bold flex items-center gap-2 ${themeStyles.bannerText}`}>
              <Zap size={18} className={`${isDarkMode ? 'text-[#8DA9C4] fill-[#8DA9C4]/20' : 'text-[#0B2545] fill-[#0B2545]/25'} stroke-[2.5]`} />
              Conoce recomendaciones y tu salud financiera
            </h2>
          </div>

          <div className="z-10 mt-1 sm:mt-0 flex items-center gap-2 bg-[#0B2545]/20 border border-[#8DA9C4]/30 px-3 py-1 rounded-full">
            <div className="w-2 h-2 rounded-full bg-[#8DA9C4] animate-pulse"></div>
            <span className={`text-[11px] font-mono ${isDarkMode ? 'text-[#EEF4ED]' : 'text-[#0B2545]'} font-semibold flex items-center gap-1.5`}>
              <Send size={11} className={isDarkMode ? 'text-[#8DA9C4]' : 'text-[#0B2545]'} />
              /Analisis-Financiero
            </span>
          </div>
        </div>

        {/* CONTENEDOR PRINCIPAL */}
        <main className={`${themeStyles.cardBg} rounded-b-2xl p-4 md:p-5 grid grid-cols-1 lg:grid-cols-2 gap-5 shadow-2xl border ${themeStyles.borderSubtle} flex-1 min-h-0 overflow-hidden transition-colors duration-300`}>
          
          {/* COLUMNA IZQUIERDA (ENTRADA) */}
          <div className="flex flex-col gap-2 min-h-0">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center justify-center w-3 h-3 border-2 border-[#8DA9C4] rounded-[2px]">
                <div className="w-0.5 h-0.5 bg-[#8DA9C4]"></div>
              </div>
              <h3 className={`${themeStyles.textMuted} font-bold tracking-widest text-[11px] uppercase`}>Entrada</h3>
            </div>

            <div className={`${themeStyles.cardInner} border ${themeStyles.borderSubtle} rounded-xl p-3.5 flex flex-col justify-between gap-3 flex-1 min-h-0 transition-colors duration-300`}>
              <div className="flex-1 min-h-0 flex flex-col gap-3">
                
                {/* Ingreso Mensual */}
                <div>
                  <label className={`block text-xs font-semibold ${themeStyles.textMuted} mb-1`}>
                    Ingreso mensual ($)
                  </label>
                  <input
                    type="number"
                    value={ingresoMensual}
                    onChange={(e) => setIngresoMensual(e.target.value)}
                    placeholder="4500"
                    className={`w-full ${themeStyles.inputBg} border ${themeStyles.inputBorder} rounded-lg px-3 py-1.5 text-xs font-semibold ${themeStyles.inputText} focus:outline-none focus:border-[#8DA9C4] ${noSpinnersClass}`}
                  />
                </div>

                {/* Endeudamiento y Ahorro */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className={`block text-[11px] font-semibold ${themeStyles.textMuted} mb-1 whitespace-nowrap`}>
                      Nivel de endeudamiento (%)
                    </label>
                    <input
                      type="number"
                      value={endeudamientoManual}
                      onChange={(e) => setEndeudamientoManual(e.target.value)}
                      placeholder="25"
                      className={`w-full ${themeStyles.inputBg} border ${themeStyles.inputBorder} rounded-lg px-3 py-1.5 text-xs font-semibold ${themeStyles.inputText} focus:outline-none focus:border-[#8DA9C4] ${noSpinnersClass}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[11px] font-semibold ${themeStyles.textMuted} mb-1 whitespace-nowrap`}>
                      Frecuencia de ahorro
                    </label>
                    <input
                      type="text"
                      value={frecuenciaAhorroManual}
                      onChange={(e) => setFrecuenciaAhorroManual(e.target.value)}
                      placeholder="Media"
                      className={`w-full ${themeStyles.inputBg} border ${themeStyles.inputBorder} rounded-lg px-3 py-1.5 text-xs font-semibold ${themeStyles.inputText} focus:outline-none focus:border-[#8DA9C4]`}
                    />
                  </div>
                </div>

                {/* Transacciones Recientes */}
                <div className="flex-1 min-h-0 flex flex-col">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className={`text-xs font-semibold ${themeStyles.textMuted}`}>
                      Transacciones recientes
                    </label>
                    <button
                      onClick={abrirModal}
                      type="button"
                      className="text-[#8DA9C4] hover:underline text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Plus size={13} /> añadir
                    </button>
                  </div>

                  <div className="space-y-1.5 flex-1 min-h-0 overflow-y-auto pr-1">
                    {transacciones.map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Descripción"
                          value={item.descripcion}
                          onChange={(e) =>
                            actualizarTransaccion(item.id, "descripcion", e.target.value)
                          }
                          className={`flex-grow ${themeStyles.inputBg} border ${themeStyles.inputBorder} rounded-lg px-2.5 py-1 text-xs ${themeStyles.inputText} focus:outline-none focus:border-[#8DA9C4]`}
                        />
                        <div className="relative w-24 flex-shrink-0">
                          <span className="absolute left-2 top-1 text-xs opacity-50">$</span>
                          <input
                            type="number"
                            placeholder="0"
                            value={item.monto}
                            onChange={(e) =>
                              actualizarTransaccion(item.id, "monto", e.target.value)
                            }
                            className={`w-full ${themeStyles.inputBg} border ${themeStyles.inputBorder} rounded-lg pl-4 pr-1.5 py-1 text-xs ${themeStyles.inputText} focus:outline-none focus:border-[#8DA9C4] ${noSpinnersClass}`}
                          />
                        </div>
                        {transacciones.length > 1 && (
                          <button
                            onClick={() => eliminarTransaccion(item.id)}
                            className="opacity-40 hover:opacity-100 p-0.5 transition-opacity"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={ejecutarAnalisis}
                className="w-full bg-[#8DA9C4] hover:bg-[#13315C] text-[#0B2545] hover:text-[#EEF4ED] font-bold py-2 rounded-lg transition-all shadow-md flex items-center justify-center gap-2 text-xs flex-shrink-0"
              >
                <div className="w-2 h-2 border-2 border-currentColor rounded-[1px] flex items-center justify-center">
                  <div className="w-0.5 h-0.5 bg-currentColor"></div>
                </div>
                Ejecutar análisis
              </button>
            </div>
          </div>

          {/* COLUMNA DERECHA (RESULTADO) */}
          <div className={`flex flex-col gap-2 lg:pl-5 lg:border-l ${themeStyles.borderSubtle} min-h-0`}>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center justify-center w-3 h-3 border-2 border-[#8DA9C4] rounded-[2px]">
                <div className="w-0.5 h-0.5 bg-[#8DA9C4]"></div>
              </div>
              <h3 className={`${themeStyles.textMuted} font-bold tracking-widest text-[11px] uppercase`}>Resultado</h3>
            </div>
            
            {!resultado ? (
              <div className={`flex-1 border border-dashed ${themeStyles.inputBorder} rounded-xl flex flex-col items-center justify-center p-6 text-center`}>
                <AlertCircle size={26} className="opacity-30 mb-2" />
                <span className={`${themeStyles.textMuted} text-xs font-medium`}>
                  Haz clic en &quot;Ejecutar análisis&quot; para generar los resultados
                </span>
              </div>
            ) : (
              <div className={`${themeStyles.cardInner} border ${themeStyles.borderSubtle} rounded-xl p-3.5 flex flex-col justify-between gap-2.5 flex-1 min-h-0 overflow-y-auto transition-colors duration-300`}>
                
                {/* Diagnóstico superior */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
                  <div className="flex items-center justify-around sm:justify-start gap-2.5 flex-shrink-0">
                    <div className={`relative w-12 h-12 flex items-center justify-center rounded-full border-2 border-[#8DA9C4] ${themeStyles.cardBg}`}>
                      <div className="text-center">
                        <span className="text-xs font-bold block leading-none">
                          {resultado.confianza}%
                        </span>
                        <span className="text-[6.5px] opacity-60 block mt-0.5">Confianza</span>
                      </div>
                    </div>

                    <div className={`relative w-12 h-12 flex items-center justify-center rounded-full border-2 border-[#13315C] ${themeStyles.cardBg}`}>
                      <div className="text-center">
                        <span className="text-xs font-bold block leading-none">
                          {resultado.endeudamiento}%
                        </span>
                        <span className="text-[6.5px] opacity-60 block mt-0.5">Endeudam.</span>
                      </div>
                    </div>

                    <div className={`relative w-12 h-12 flex items-center justify-center rounded-full border-2 border-[#8DA9C4] ${themeStyles.cardBg}`}>
                      <div className="text-center">
                        <span className="text-xs font-bold block leading-none truncate max-w-[40px]">
                          {resultado.frecuenciaAhorroText}
                        </span>
                        <span className="text-[6.5px] opacity-60 block mt-0.5">Ahorro</span>
                      </div>
                    </div>
                  </div>

                  <div className={`flex-grow ${themeStyles.cardBg} p-2.5 rounded-lg border border-[#8DA9C4]/25`}>
                    <div className="inline-block bg-[#8DA9C4]/20 text-[#8DA9C4] text-[8.5px] font-bold px-1.5 py-0.5 rounded mb-0.5 border border-[#8DA9C4]/30">
                      ☐ {resultado.estado}
                    </div>
                    <p className="text-[11px] opacity-90 leading-tight">
                      {resultado.mensaje}
                    </p>
                  </div>
                </div>

                {/* Resumen de gastos */}
                <div className="space-y-1.5 flex-shrink-0">
                  <div className="flex justify-between items-center text-xs">
                    <span className={`${themeStyles.textMuted} font-medium`}>Resumen de gastos</span>
                    <span className="font-bold text-xs">${resultado.totalGastos}</span>
                  </div>

                  <div className={`w-full h-2 ${themeStyles.cardBg} rounded-full overflow-hidden flex`}>
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

                  <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 mb-2">
                    {transacciones
                      .filter((t) => parseFloat(t.monto) > 0)
                      .map((item, idx) => (
                        <div key={item.id} className="flex items-center gap-1 text-[11px]">
                          <div className={`w-1.5 h-1.5 rounded-full ${coloresSegmentos[idx % coloresSegmentos.length]}`} />
                          <span className={themeStyles.textMuted}>{item.descripcion || 'Gasto'}:</span>
                          <span className="font-semibold">${item.monto}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Recomendaciones */}
                <div className={`space-y-1.5 pt-2 border-t ${themeStyles.borderSubtle} flex-shrink-0`}>
                  <span className="text-[9.5px] uppercase tracking-wider text-[#8DA9C4] font-bold block mb-1">
                    Recomendaciones
                  </span>
                  {resultado.recomendaciones.map((rec, i) => (
                    <div key={i} className={`flex items-start gap-2 ${themeStyles.cardBg} p-2 rounded-lg border border-[#8DA9C4]/20 text-[11px] opacity-90`}>
                      <CheckCircle2 size={13} className="text-[#8DA9C4] flex-shrink-0 mt-0.5" />
                      <span className="leading-tight">{rec}</span>
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODAL */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`${themeStyles.modalBg} border border-[#8DA9C4]/30 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative z-10`}>
            <div className="flex justify-between items-center mb-5">
              <h4 className="text-base font-bold flex items-center gap-2">
                <Plus size={20} className="text-[#8DA9C4]" />
                Añadir Nueva Transacción
              </h4>
              <button
                onClick={() => setMostrarModal(false)}
                className="opacity-40 hover:opacity-100 transition-opacity p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={guardarNuevaTransaccion} className="space-y-4">
              <div>
                <label className={`block text-xs ${themeStyles.textMuted} mb-1.5 font-medium`}>
                  Descripción del gasto
                </label>
                <input
                  type="text"
                  placeholder="ej. Supermercado, Streaming..."
                  value={nuevaDescripcion}
                  onChange={(e) => setNuevaDescripcion(e.target.value)}
                  className={`w-full ${themeStyles.inputBg} border ${themeStyles.inputBorder} rounded-lg px-3.5 py-2 text-xs ${themeStyles.inputText} focus:outline-none focus:border-[#8DA9C4]`}
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className={`block text-xs ${themeStyles.textMuted} mb-1.5 font-medium`}>
                  Monto ($)
                </label>
                <input
                  type="number"
                  placeholder="ej. 150"
                  value={nuevoMonto}
                  onChange={(e) => setNuevoMonto(e.target.value)}
                  className={`w-full ${themeStyles.inputBg} border ${themeStyles.inputBorder} rounded-lg px-3.5 py-2 text-xs ${themeStyles.inputText} focus:outline-none focus:border-[#8DA9C4] ${noSpinnersClass}`}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className={`px-4 py-2 rounded-lg text-xs opacity-60 hover:opacity-100 transition-opacity font-medium`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#8DA9C4] hover:bg-[#13315C] text-[#0B2545] hover:text-[#EEF4ED] font-bold px-5 py-2 rounded-lg text-xs transition-colors shadow-md"
                >
                  Agregar Transacción
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="py-1 flex flex-col items-center gap-1.5 max-w-7xl mx-auto w-full flex-shrink-0 relative">
        <div className="relative">
          <button
            onClick={() => setMostrarMiembros(!mostrarMiembros)}
            className={`flex items-center gap-2 ${themeStyles.cardBg} hover:opacity-90 px-3.5 py-1 rounded-full text-[11px] font-semibold border border-[#8DA9C4]/30 transition-all shadow-md active:scale-95`}
          >
            <Users size={13} className="text-[#8DA9C4]" />
            <span>Miembros del equipo</span>
            {mostrarMiembros ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
          </button>

          {mostrarMiembros && (
            <div className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-80 ${themeStyles.modalBg} border border-[#8DA9C4]/30 rounded-xl p-2.5 shadow-2xl z-40`}>
              <div className="text-[10px] font-bold text-[#8DA9C4] uppercase tracking-wider mb-1.5 text-center border-b border-white/5 pb-1 flex justify-between items-center px-1">
                <span>Integrantes del Equipo 38</span>
                <span>Enlaces</span>
              </div>
              <div className="space-y-1">
                {miembrosEquipo.map((m) => (
                  <div 
                    key={m.github || m.nombre} 
                    className={`flex items-center justify-between gap-2 ${themeStyles.cardBg} px-2.5 py-1 rounded-lg border ${themeStyles.borderSubtle} text-[10.5px]`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-4 h-4 rounded-full bg-[#8DA9C4]/20 text-[#8DA9C4] font-bold text-[8px] flex items-center justify-center flex-shrink-0">
                        •
                      </div>
                      <span className="truncate font-medium">{m.nombre}</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {m.linkedin && (
                        <a
                          href={m.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="LinkedIn"
                          className="p-1 rounded bg-[#0077B5]/20 text-[#0A66C2] hover:bg-[#0077B5]/40 transition-colors"
                        >
                          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                          </svg>
                        </a>
                      )}
                      {m.github && (
                        <a
                          href={m.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="GitHub"
                          className="p-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                        >
                          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className={`flex items-center gap-1 ${themeStyles.textMuted} text-[8.5px] text-center`}>
          <span>Hecho con</span>
          <Heart size={9} className="text-[#8DA9C4] fill-[#8DA9C4]" />
          <span>por Proyecto <strong className="opacity-90">Equipo Dinamita - 38</strong> — Hackathon ONE para <strong className="opacity-90">Alura · Oracle · NoCountry</strong></span>
        </div>
      </footer>
    </div>
  );
}