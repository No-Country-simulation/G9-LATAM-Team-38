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
  desglose: { descripcion: string; monto: number; porcentaje: number }[];
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

    const desglose = transaccionesValidas.map(t => {
      const montoNum = parseFloat(t.monto) || 0;
      const porcentaje = totalGastos > 0 ? (montoNum / totalGastos) * 100 : 0;
      return {
        descripcion: t.descripcion || "Sin nombre",
        monto: montoNum,
        porcentaje
      };
    });

    let endeudamientoCalc = 25;
    if (endeudamientoManual.trim() !== "" && !isNaN(parseFloat(endeudamientoManual))) {
      endeudamientoCalc = Math.min(Math.max(parseFloat(endeudamientoManual), 0), 100);
    } else {
      endeudamientoCalc = ingreso > 0 ? Math.min(Math.round((totalGastos / ingreso) * 100), 100) : 0;
    }

    let ahorroText = frecuenciaAhorroManual.trim() !== "" ? frecuenciaAhorroManual : "Media";
    let ahorroNum = 50;
    
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
      desglose
    });
  };

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
    borderSubtle: "border-[#8DA9C4]/10",
    barBg: "bg-[#13315C]",
    barColors: ["bg-[#8DA9C4]", "bg-[#6685A4]", "bg-[#4B6887]", "bg-[#334E6B]"]
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
    borderSubtle: "border-[#8DA9C4]/30",
    barBg: "bg-[#8DA9C4]/40",
    barColors: ["bg-[#0B2545]", "bg-[#13315C]", "bg-[#134074]", "bg-[#8DA9C4]"]
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
              <div className={`${themeStyles.cardInner} border ${themeStyles.borderSubtle} rounded-xl p-3 flex flex-col justify-between gap-2.5 flex-1 min-h-0 overflow-y-auto transition-colors duration-300`}>
                
                {/* Diagnóstico superior */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
                  <div className="flex items-center justify-around sm:justify-start gap-2 flex-shrink-0">
                    <div className={`relative w-11 h-11 flex items-center justify-center rounded-full border-2 border-[#8DA9C4] ${themeStyles.cardBg}`}>
                      <div className="text-center">
                        <span className="text-[11px] font-bold block leading-none">
                          {resultado.confianza}%
                        </span>
                        <span className="text-[6px] opacity-60 block mt-0.5">Confianza</span>
                      </div>
                    </div>

                    <div className={`relative w-11 h-11 flex items-center justify-center rounded-full border-2 border-[#13315C] ${themeStyles.cardBg}`}>
                      <div className="text-center">
                        <span className="text-[11px] font-bold block leading-none">
                          {resultado.endeudamiento}%
                        </span>
                        <span className="text-[6px] opacity-60 block mt-0.5">Endeudam.</span>
                      </div>
                    </div>

                    <div className={`relative w-11 h-11 flex items-center justify-center rounded-full border-2 border-[#8DA9C4] ${themeStyles.cardBg}`}>
                      <div className="text-center">
                        <span className="text-[10px] font-bold block leading-none truncate max-w-[36px]">
                          {resultado.frecuenciaAhorroText}
                        </span>
                        <span className="text-[6px] opacity-60 block mt-0.5">Ahorro</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <CheckCircle2 size={12} className="text-[#8DA9C4] flex-shrink-0" />
                      <span className="text-xs font-bold truncate">Estado: {resultado.estado}</span>
                    </div>
                    <p className={`${themeStyles.textMuted} text-[10px] leading-snug line-clamp-2`}>
                      {resultado.mensaje}
                    </p>
                  </div>
                </div>

                {/* BARRA DE PROGRESO / RESUMEN DE GASTOS */}
                <div className="space-y-1.5 flex-shrink-0">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className={themeStyles.textMuted}>Resumen de gastos</span>
                    <span>${resultado.totalGastos}</span>
                  </div>

                  {/* Barra seccionada */}
                  <div className={`w-full h-3 rounded-full overflow-hidden flex ${themeStyles.barBg} shadow-inner`}>
                    {(resultado.desglose ?? []).map((item, idx) => (
                      <div
                        key={idx}
                        style={{ width: `${item.porcentaje}%` }}
                        className={`h-full ${themeStyles.barColors[idx % themeStyles.barColors.length]} transition-all duration-500`}
                        title={`${item.descripcion}: $${item.monto} (${item.porcentaje.toFixed(1)}%)`}
                      />
                    ))}
                  </div>

                  {/* Leyenda de transacciones debajo de la barra */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 pt-0.5">
                    {(resultado.desglose ?? []).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1 text-[10.5px]">
                        <span className={`w-2 h-2 rounded-full ${themeStyles.barColors[idx % themeStyles.barColors.length]}`}></span>
                        <span className={themeStyles.textMuted}>{item.descripcion}:</span>
                        <span className="font-bold">${item.monto}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recomendaciones de IA */}
                <div className="space-y-1 flex-shrink-0">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${themeStyles.textMuted}`}>
                    Recomendaciones de IA:
                  </span>
                  <ul className="space-y-1">
                    {resultado.recomendaciones.map((rec, index) => (
                      <li key={index} className={`text-[10px] flex items-start gap-1.5 ${themeStyles.textMuted}`}>
                        <span className="text-[#8DA9C4] font-bold">•</span>
                        <span className="leading-tight">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            )}
          </div>

        </main>
      </div>

      {/* FOOTER EQUIPO */}
      <footer className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center px-3 py-1.5 flex-shrink-0 gap-2 border-t border-[#8DA9C4]/10 text-xs">
        <div className="flex items-center gap-1.5">
          <span className={themeStyles.textMuted}>Hecho con</span>
          <Heart size={13} className="text-red-400 fill-red-400/20" />
          <span className={themeStyles.textMuted}>por Equipo Dinamita</span>
        </div>

        <button
          onClick={() => setMostrarMiembros(!mostrarMiembros)}
          className="flex items-center gap-1 text-[#8DA9C4] hover:underline font-bold transition-colors"
        >
          <Users size={14} />
          <span>Ver Miembros del Equipo</span>
          {mostrarMiembros ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </footer>

      {/* DESPLEGABLE DE MIEMBROS */}
      {mostrarMiembros && (
        <div className={`w-full max-w-7xl mx-auto mb-2 ${themeStyles.cardBg} border ${themeStyles.borderSubtle} rounded-xl p-3 shadow-xl transition-colors duration-300`}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {miembrosEquipo.map((miembro, idx) => (
              <div key={idx} className={`${themeStyles.cardInner} p-2 rounded-lg border ${themeStyles.borderSubtle} flex flex-col justify-between`}>
                <span className="font-bold text-[11px] truncate">{miembro.nombre}</span>
                <div className="flex items-center gap-2 mt-2">
                  {miembro.linkedin && (
                    <a href={miembro.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#8DA9C4] hover:opacity-80" title="LinkedIn">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </a>
                  )}
                  {miembro.github && (
                    <a href={miembro.github} target="_blank" rel="noopener noreferrer" className="text-[#8DA9C4] hover:opacity-80" title="GitHub">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL PARA AÑADIR TRANSACCIÓN */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className={`${themeStyles.modalBg} border ${themeStyles.borderSubtle} rounded-2xl p-5 max-w-sm w-full shadow-2xl relative`}>
            <button
              onClick={() => setMostrarModal(false)}
              className="absolute top-4 right-4 opacity-50 hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>

            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Plus size={16} className="text-[#8DA9C4]" /> Añadir Transacción
            </h3>

            <form onSubmit={guardarNuevaTransaccion} className="space-y-3">
              <div>
                <label className={`block text-[11px] font-semibold ${themeStyles.textMuted} mb-1`}>
                  Descripción
                </label>
                <input
                  type="text"
                  value={nuevaDescripcion}
                  onChange={(e) => setNuevaDescripcion(e.target.value)}
                  placeholder="Ej. Supermercado, Servicios..."
                  className={`w-full ${themeStyles.inputBg} border ${themeStyles.inputBorder} rounded-lg px-3 py-1.5 text-xs ${themeStyles.inputText} focus:outline-none focus:border-[#8DA9C4]`}
                  required
                />
              </div>

              <div>
                <label className={`block text-[11px] font-semibold ${themeStyles.textMuted} mb-1`}>
                  Monto ($)
                </label>
                <input
                  type="number"
                  value={nuevoMonto}
                  onChange={(e) => setNuevoMonto(e.target.value)}
                  placeholder="0.00"
                  className={`w-full ${themeStyles.inputBg} border ${themeStyles.inputBorder} rounded-lg px-3 py-1.5 text-xs ${themeStyles.inputText} focus:outline-none focus:border-[#8DA9C4] ${noSpinnersClass}`}
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className={`flex-1 border ${themeStyles.inputBorder} hover:opacity-80 text-xs font-bold py-2 rounded-lg transition-opacity`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#8DA9C4] text-[#0B2545] hover:opacity-90 text-xs font-bold py-2 rounded-lg transition-opacity"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}