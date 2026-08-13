"use client";

import { useState, useEffect } from "react";
import {
  Bot, PlusCircle, Trash2, AlertCircle, BadgeCheck,
  X, Sparkles, WalletCards, ChartNoAxesCombined, UsersRound,
  ChevronDown, ChevronUp, FileDown
} from "lucide-react";
import { sanitizeInput, TransaccionSecuritySchema } from "@/lib/security";
import { API_BASE_URL } from "@/config/api";
import { GlobalHeader } from "@/components/GlobalHeader";
import { GlobalFooter } from "@/components/GlobalFooter";
import { useTheme } from "@/components/ThemeProvider";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
  const { theme } = useTheme();
  const [ingresoMensual, setIngresoMensual] = useState<string>("");
  
  const [modoIngresoDatos, setModoIngresoDatos] = useState<'auto' | 'manual' | null>(null);
  const [mostrarModalModo, setMostrarModalModo] = useState<boolean>(false);
  const [mensajeAdvertencia, setMensajeAdvertencia] = useState<string | null>(null);

  const [endeudamientoManual, setEndeudamientoManual] = useState<string>("");
  const [frecuenciaAhorroManual, setFrecuenciaAhorroManual] = useState<string>("Media");

  const [transacciones, setTransacciones] = useState<Transaccion[]>([
    { id: "1", descripcion: "", monto: "" },
  ]);

  const [resultado, setResultado] = useState<ResultadoAnalisis | null>(null);
  const [generandoPDF, setGenerandoPDF] = useState(false);

  const [mostrarMiembros, setMostrarMiembros] = useState<boolean>(false);
  const [cargando, setCargando] = useState<boolean>(false);

  const [endeudamientoAuto, setEndeudamientoAuto] = useState<string>("0");
  const [frecuenciaAhorroAuto, setFrecuenciaAhorroAuto] = useState<string>("Media");

  const [username, setUsername] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem("finance_username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
    const role = localStorage.getItem("finance_role");
    if (role === "ADMIN") {
      setIsAdmin(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("finance_token");
    localStorage.removeItem("finance_username");
    localStorage.removeItem("finance_role");
    setUsername(null);
    window.location.href = "/login";
  };

  useEffect(() => {
    if (modoIngresoDatos === 'auto') {
      const ingreso = parseFloat(ingresoMensual);

      // No consultar al backend si el ingreso mensual
      // no es un valor válido superior a 0.
      if (!ingresoMensual.trim() || isNaN(ingreso) || ingreso <= 0) {
        return;
      }

      const transaccionesValidas = transacciones.filter(
        t => parseFloat(t.monto) > 0
      );

      // No consultar al backend hasta tener al menos un gasto válido.
      if (transaccionesValidas.length === 0) {
        return;
      }

      const transaccionesBackend = transaccionesValidas.map(t => ({
        descripcion: t.descripcion || "Gasto",
        valor: parseFloat(t.monto)
      }));

      const timeoutId = setTimeout(() => {
        const token = localStorage.getItem("finance_token");
        const headers: HeadersInit = { 'Content-Type': 'application/json' };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        fetch(`${API_BASE_URL}/pre-calculo`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            ingreso_mensual: ingreso,
            nivel_endeudamiento: null,
            frecuencia_ahorro: null,
            transacciones: transaccionesBackend
          })
        })
          .then(res => {
            if (!res.ok) {
              throw new Error(`Error HTTP: ${res.status}`);
            }

            return res.json();
          })
          .then(data => {
            if (data.nivel_endeudamiento !== undefined) {
              setEndeudamientoAuto(data.nivel_endeudamiento.toString());
              setFrecuenciaAhorroAuto(data.frecuencia_ahorro);
            }
          })
          .catch(err => console.error("Error pre-calculo:", err));
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [modoIngresoDatos, ingresoMensual, transacciones]);



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

  const manejarClickInputAvanzado = () => {
    if (modoIngresoDatos === null) {
      setMostrarModalModo(true);
    }
  };

  const preventInvalidKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const generarPDF = async () => {
    const elemento = document.getElementById("pdf-report-template");
    if (!elemento) return;
    
    setGenerandoPDF(true);
    try {
      const canvas = await html2canvas(elemento, {
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = position - pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Analisis_Financiero_${username || 'Usuario'}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF:", error);
    } finally {
      setGenerandoPDF(false);
    }
  };

  const ejecutarAnalisis = async (modoForzado?: any) => {
    setResultado(null);
    setMensajeAdvertencia(null);
    setCargando(true);

    const ingreso = parseFloat(ingresoMensual);
    const modoActual =
      typeof modoForzado === 'string' ? modoForzado : modoIngresoDatos;

    // VALIDACIÓN DEL INGRESO MENSUAL
    if (
      !ingresoMensual.trim() ||
      isNaN(ingreso) ||
      ingreso <= 0
    ) {
      setMensajeAdvertencia(
        "Debes ingresar un valor válido superior a 0 en el ingreso mensual."
      );
      setCargando(false);
      return;
    }

    // Si aún no ha decidido el modo, le preguntamos antes de ejecutar
    if (modoActual === null) {
      setMostrarModalModo(true);
      setCargando(false);
      return;
    }

    // VALIDACIÓN DE GASTOS
    const hayGastoInvalido = transacciones.some(
      t =>
        !t.monto.trim() ||
        isNaN(parseFloat(t.monto)) ||
        parseFloat(t.monto) <= 0
    );

    if (hayGastoInvalido) {
      setMensajeAdvertencia(
        "Debes ingresar un valor válido superior a 0 en cada gasto."
      );
      setCargando(false);
      return;
    }

    const transaccionesValidas = transacciones.filter(
      t => parseFloat(t.monto) > 0
    );

    if (transaccionesValidas.length === 0) {
      setMensajeAdvertencia(
        "Debes ingresar al menos un gasto con un valor válido superior a 0."
      );
      setCargando(false);
      return;
    }

    const totalGastos = transaccionesValidas.reduce(
      (acc, t) => acc + (parseFloat(t.monto) || 0),
      0
    );

    const transaccionesBackend = transaccionesValidas.map(t => ({
      descripcion: t.descripcion || "Gasto",
      valor: parseFloat(t.monto)
    }));


    let nivelEndeudamiento = null;
    let frecuenciaAhorro = null;

    if (modoActual === 'manual') {
      const end = parseFloat(endeudamientoManual);
      if (isNaN(end) || end < 0) {
        setMensajeAdvertencia("El nivel de endeudamiento debe ser un número válido mayor o igual a 0.");
        setCargando(false);
        return;
      }
      nivelEndeudamiento = end;
      
      const frec = frecuenciaAhorroManual.trim().toLowerCase();
      if (!["muy alta", "alta", "media", "baja", "nula"].includes(frec)) {
        setMensajeAdvertencia("La frecuencia de ahorro debe ser Muy alta, Alta, Media, Baja o Nula.");
        setCargando(false);
        return;
      }
      frecuenciaAhorro = frecuenciaAhorroManual;
    }

    const datosEntrada = {
      ingreso_mensual: ingreso,
      nivel_endeudamiento: nivelEndeudamiento,
      frecuencia_ahorro: frecuenciaAhorro,
      transacciones: transaccionesBackend
    };

    try {
      const token = localStorage.getItem("finance_token");
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/analisis-financiero`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(datosEntrada)
      });

      if (!response.ok) {
        throw new Error("Error de red al comunicarse con el servidor");
      }

      const data = await response.json();
      
      if (data.success === false || data.error) {
        setMensajeAdvertencia(data.error || "Datos financieros inválidos.");
        setCargando(false);
        return;
      }

      // Mapeamos los datos para la UI
      // Nota: asumiendo que el backend ahora nos podría devolver el endeudamiento y ahorro que usó
      // Si el backend no los devuelve en la respuesta actual, calculamos para la gráfica visual de manera ilustrativa
      const endResult = data.nivel_endeudamiento ?? nivelEndeudamiento ?? Math.round((totalGastos / ingreso) * 100);
      const freqTextResult = data.frecuencia_ahorro ?? frecuenciaAhorro ?? "Media";
      
      let ahorroNum = 50;
      const ahorroLower = freqTextResult.toLowerCase();
      if (ahorroLower.includes("alta") || ahorroLower.includes("alto")) ahorroNum = 80;
      if (ahorroLower.includes("baja") || ahorroLower.includes("bajo") || ahorroLower.includes("nula")) ahorroNum = 20;

      const desglose = transaccionesValidas.map(t => {
        const montoNum = parseFloat(t.monto) || 0;
        const porcentaje = totalGastos > 0 ? (montoNum / totalGastos) * 100 : 0;
        return {
          descripcion: t.descripcion || "Sin nombre",
          monto: montoNum,
          porcentaje
        };
      });

      setResultado({
        confianza: Math.round((data.probabilidad || 0.88) * 100),
        endeudamiento: endResult,
        frecuenciaAhorroText: freqTextResult,
        frecuenciaAhorroNum: ahorroNum,
        estado: data.perfil_financiero || "Desconocido",
        mensaje: "Evaluación de riesgo crediticio y viabilidad financiera calculada mediante nuestro motor algorítmico.",
        totalGastos,
        recomendaciones: data.recomendaciones || [],
        desglose
      });

    } catch (error) {
      console.error(error);
      setMensajeAdvertencia(`Oops! Ocurrió un error al intentar conectarse con el Backend en ${API_BASE_URL}`);
    } finally {
      setCargando(false);
    }
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

  // Colores dinámicos para las métricas según su nivel de riesgo.
  // Confianza alta y ahorro alto representan menor riesgo.
  const getConfidenceColor = (value: number) => {
    if (value >= 80) return "#22c55e";
    if (value >= 60) return "#eab308";
    return "#ef4444";
  };

  // Endeudamiento bajo representa menor riesgo.
  const getDebtColor = (value: number) => {
    if (value <= 30) return "#22c55e";
    if (value <= 60) return "#eab308";
    return "#ef4444";
  };

  const getSavingsColor = (frequency: string) => {
    const value = frequency.toLowerCase();

    if (value.includes("muy alta")) return "#22c55e";
    if (value.includes("alta")) return "#84cc16";
    if (value.includes("media")) return "#eab308";
    if (value.includes("baja")) return "#f97316";
    return "#ef4444";
  };

  // Color dinámico según el porcentaje que representa cada gasto.
  const getExpenseColor = (percentage: number) => {
    if (percentage <= 20) return "#22c55e";
    if (percentage <= 40) return "#eab308";
    if (percentage <= 60) return "#f97316";
    return "#ef4444";
  };

  return (
    <div className="h-screen w-screen bg-[var(--brand-bg)] text-[var(--brand-text)] font-sans flex flex-col justify-between selection:bg-[var(--brand-accent)]/30 px-4 py-2 relative overflow-hidden transition-colors duration-300">
      
      <GlobalHeader username={username || ""} onLogout={handleLogout} isAdmin={isAdmin} />

      {/* CONTENEDOR CENTRAL */}
      <div className="w-full max-w-7xl mx-auto my-1 flex-1 flex flex-col justify-center min-h-0">
        
        {/* BANNER SUPERIOR */}
        <div className={`bg-[var(--brand-banner-bg)] border border-[var(--brand-border)] rounded-t-2xl px-5 py-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-center relative shadow-lg flex-shrink-0 transition-colors duration-300`}>
          <div className="z-10">
            <div className={`text-[var(--brand-accent)] text-[9px] font-bold tracking-widest uppercase mb-0.5`}>
              ANÁLISIS FINANCIERO
            </div>
            <h2 className={`group text-sm md:text-lg font-bold flex items-center gap-2 text-[var(--brand-banner-text)]`}>
              <Sparkles size={18} className="text-[var(--brand-accent)] fill-[var(--brand-accent)]/20 stroke-[2.5] transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
              Conoce recomendaciones y tu salud financiera
            </h2>
          </div>

          <div className="z-10 mt-1 sm:mt-0 flex items-center gap-2 bg-[#0B2545]/20 border border-[var(--brand-border)] px-3 py-1 rounded-full">
            <Bot
              size={14}
              strokeWidth={2.5}
              className="text-[var(--brand-accent)] animate-pulse"
            />
            <span className={`text-[11px] font-mono text-[var(--brand-banner-text)] font-semibold`}>
              Análisis personalizado para {username || "Gabriel"}
            </span>
          </div>
        </div>

        {/* CONTENEDOR PRINCIPAL */}
        <main className={`bg-[var(--brand-card)] rounded-b-2xl p-4 md:p-5 grid grid-cols-1 lg:grid-cols-2 gap-5 shadow-2xl border border-[var(--brand-border)] flex-1 min-h-0 overflow-hidden transition-colors duration-300`}>
          
          {/* COLUMNA IZQUIERDA (ENTRADA) */}
          <div className="flex flex-col gap-2 min-h-0">
            <div className="flex items-center gap-2 flex-shrink-0">
              <WalletCards
                size={15}
                strokeWidth={2.2}
                className="text-[var(--brand-accent)] flex-shrink-0 transition-transform duration-200 hover:scale-110"
              />
              <h3 className={`text-[var(--brand-muted)] font-bold tracking-widest text-[11px] uppercase`}>Entrada</h3>
            </div>

            <div className={`bg-[var(--brand-bg)] border border-[var(--brand-border)] rounded-xl p-3.5 flex flex-col justify-between gap-3 flex-1 min-h-0 transition-colors duration-300`}>
              <div className="flex-1 min-h-0 flex flex-col gap-3">
                
                {/* Ingreso Mensual */}
                <div>
                  <label className={`block text-xs font-semibold text-[var(--brand-muted)] mb-1`}>
                    Ingreso mensual ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={ingresoMensual}
                    onChange={(e) => setIngresoMensual(e.target.value)}
                    onKeyDown={preventInvalidKeys}
                    placeholder="Ej. 4500"
                    className={`w-full bg-[var(--brand-bg)] border border-[var(--brand-border)] rounded-lg px-3 py-1.5 text-xs font-semibold text-[var(--brand-text)] focus:outline-none focus:border-[var(--brand-accent)] ${noSpinnersClass}`}
                  />
                </div>

                {/* Endeudamiento y Ahorro */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div onClick={manejarClickInputAvanzado} className={modoIngresoDatos === 'auto' ? "opacity-50 pointer-events-none" : ""}>
                    <label className={`block text-[11px] font-semibold text-[var(--brand-muted)] mb-1 whitespace-nowrap`}>
                      Nivel de endeudamiento (%)
                    </label>
                    <input
                      type={modoIngresoDatos === 'auto' ? "text" : "number"}
                      min="0"
                      value={modoIngresoDatos === 'auto' ? `${endeudamientoAuto}% (Automático)` : endeudamientoManual}
                      onChange={(e) => setEndeudamientoManual(e.target.value)}
                      onKeyDown={modoIngresoDatos === 'manual' ? preventInvalidKeys : undefined}
                      placeholder="Ej. 25"
                      readOnly={modoIngresoDatos !== 'manual'}
                      className={`w-full bg-[var(--brand-bg)] border border-[var(--brand-border)] rounded-lg px-3 py-1.5 text-xs font-semibold text-[var(--brand-text)] focus:outline-none focus:border-[var(--brand-accent)] ${noSpinnersClass} ${modoIngresoDatos !== 'manual' ? 'cursor-pointer' : ''}`}
                    />
                  </div>

                  <div onClick={manejarClickInputAvanzado} className={modoIngresoDatos === 'auto' ? "opacity-50 pointer-events-none" : ""}>
                    <label className={`block text-[11px] font-semibold text-[var(--brand-muted)] mb-1 whitespace-nowrap`}>
                      Frecuencia de ahorro
                    </label>
                    {modoIngresoDatos === 'manual' ? (
                      <select
                        value={frecuenciaAhorroManual}
                        onChange={(e) => setFrecuenciaAhorroManual(e.target.value)}
                        className={`w-full bg-[var(--brand-bg)] border border-[var(--brand-border)] rounded-lg px-3 py-1.5 text-xs font-semibold text-[var(--brand-text)] focus:outline-none focus:border-[var(--brand-accent)] appearance-none cursor-pointer`}
                      >
                        <option value="Muy alta">Muy alta</option>
                        <option value="Alta">Alta</option>
                        <option value="Media">Media</option>
                        <option value="Baja">Baja</option>
                        <option value="Nula">Muy baja / Nula</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={modoIngresoDatos === 'auto' ? `${frecuenciaAhorroAuto} (Automático)` : frecuenciaAhorroManual}
                        readOnly
                        className={`w-full bg-[var(--brand-bg)] border border-[var(--brand-border)] rounded-lg px-3 py-1.5 text-xs font-semibold text-[var(--brand-text)] focus:outline-none focus:border-[var(--brand-accent)] cursor-pointer`}
                      />
                    )}
                  </div>
                </div>

                {/* Transacciones Recientes */}
                <div className="flex-1 min-h-0 flex flex-col">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className={`text-xs font-semibold text-[var(--brand-muted)]`}>
                      Transacciones recientes
                    </label>
                    <button
                      onClick={() => setTransacciones([...transacciones, { id: Date.now().toString(), descripcion: "", monto: "" }])}
                      type="button"
                      className="text-[var(--brand-accent)] hover:underline text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <PlusCircle size={13} /> añadir
                    </button>
                  </div>

                  <div className="space-y-1.5 flex-1 min-h-0 overflow-y-auto pr-1">
                    {transacciones.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 group">
                        <input
                          type="text"
                          placeholder="Descripción"
                          value={item.descripcion}
                          onChange={(e) =>
                            actualizarTransaccion(item.id, "descripcion", e.target.value)
                          }
                          className={`flex-grow bg-[var(--brand-bg)] border border-[var(--brand-border)] rounded-lg px-2.5 py-1 text-xs text-[var(--brand-text)] focus:outline-none focus:border-[var(--brand-accent)]`}
                        />
                        <div className="relative w-24 flex-shrink-0">
                          <span className="absolute left-2 top-1 text-xs opacity-50">$</span>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={item.monto}
                            onChange={(e) =>
                              actualizarTransaccion(item.id, "monto", e.target.value)
                            }
                            onKeyDown={preventInvalidKeys}
                            className={`w-full bg-[var(--brand-bg)] border border-[var(--brand-border)] rounded-lg pl-4 pr-1.5 py-1 text-xs text-[var(--brand-text)] focus:outline-none focus:border-[var(--brand-accent)] ${noSpinnersClass}`}
                          />
                        </div>
                        {transacciones.length > 1 && (
                          <button
                            onClick={() => eliminarTransaccion(item.id)}
                            className="opacity-40 hover:opacity-100 p-0.5 transition-opacity"
                          >
                            <Trash2 size={13} className="transition-transform duration-200 group-hover:scale-110" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={ejecutarAnalisis}
                disabled={cargando}
                className="w-full bg-[var(--brand-accent)] hover:bg-[var(--brand-accent-hover)] text-[var(--brand-bg)] hover:text-[#EEF4ED] font-bold py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center text-xs flex-shrink-0"
              >
                {cargando ? "Analizando..." : "Ejecutar análisis"}
              </button>
            </div>
          </div>

          {/* COLUMNA DERECHA (RESULTADO) */}
          <div className={`flex flex-col gap-2 lg:pl-5 lg:border-l border-[var(--brand-border)] min-h-0`}>
            <div className="flex items-center gap-2 flex-shrink-0">
              <ChartNoAxesCombined
                size={15}
                strokeWidth={2.2}
                className="text-[var(--brand-accent)] flex-shrink-0 transition-transform duration-200 hover:scale-110"
              />
              <h3 className={`text-[var(--brand-muted)] font-bold tracking-widest text-[11px] uppercase`}>Resultado</h3>
            </div>
            
            {cargando ? (
              <div className={`flex-1 border border-dashed border-[var(--brand-border)] rounded-xl flex flex-col items-center justify-center p-6 text-center`}>
                <div className="w-8 h-8 border-4 border-[var(--brand-accent)] border-t-transparent rounded-full animate-spin mb-3"></div>
                <span className={`text-[var(--brand-muted)] text-xs font-medium animate-pulse`}>
                  Analizando datos financieros...
                </span>
              </div>
            ) : !resultado ? (
              <div className={`flex-1 border border-dashed border-[var(--brand-border)] rounded-xl flex flex-col items-center justify-center p-6 text-center`}>
                <AlertCircle size={26} className="opacity-30 mb-2 transition-transform duration-300 hover:scale-110" />
                <span className={`text-[var(--brand-muted)] text-xs font-medium`}>
                  Haz clic en &quot;Ejecutar análisis&quot; para generar los resultados
                </span>
              </div>
            ) : (
              <div className={`bg-[var(--brand-bg)] border border-[var(--brand-border)] rounded-xl p-3 flex flex-col justify-between gap-2.5 flex-1 min-h-0 overflow-y-auto transition-colors duration-300`}>
                
                {/* Diagnóstico superior */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
                  <div className="flex items-center justify-around sm:justify-start gap-2 flex-shrink-0">
                    <div
                      className="relative w-16 h-16 flex items-center justify-center rounded-full border-2 bg-[var(--brand-card)]"
                      style={{ borderColor: getConfidenceColor(resultado.confianza) }}
                    >
                      <div className="text-center">
                        <span className="text-sm font-bold block leading-none">
                          {resultado.confianza}%
                        </span>
                        <span className="text-[8px] opacity-60 block mt-1">Confianza</span>
                      </div>
                    </div>

                    <div
                      className="relative w-16 h-16 flex items-center justify-center rounded-full border-2 bg-[var(--brand-card)]"
                      style={{ borderColor: getDebtColor(resultado.endeudamiento) }}
                    >
                      <div className="text-center">
                        <span className="text-sm font-bold block leading-none">
                          {resultado.endeudamiento}%
                        </span>
                        <span className="text-[8px] opacity-60 block mt-1">Endeudam.</span>
                      </div>
                    </div>

                    <div
                      className="relative w-16 h-16 flex items-center justify-center rounded-full border-2 bg-[var(--brand-card)]"
                      style={{ borderColor: getSavingsColor(resultado.frecuenciaAhorroText) }}
                    >
                      <div className="text-center">
                        <span className="text-xs font-bold block leading-none truncate max-w-[50px]">
                          {resultado.frecuenciaAhorroText}
                        </span>
                        <span className="text-[8px] opacity-60 block mt-1">Ahorro</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <BadgeCheck size={13} className="text-[var(--brand-accent)] flex-shrink-0 transition-transform duration-200 hover:scale-110" />
                      <span className="text-xs font-bold truncate">Estado: {resultado.estado}</span>
                    </div>
                    <p className={`text-[var(--brand-muted)] text-[10px] leading-snug line-clamp-2`}>
                      {resultado.mensaje}
                    </p>
                  </div>
                </div>

                {/* BARRA DE PROGRESO / RESUMEN DE GASTOS */}
                <div className="space-y-1.5 flex-shrink-0">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-[var(--brand-muted)]">Resumen de gastos</span>
                    <span>${resultado.totalGastos}</span>
                  </div>

                  {/* Barra seccionada */}
                  <div className={`w-full h-3 rounded-full overflow-hidden flex bg-[var(--brand-accent-hover)] shadow-inner`}>
                    {(resultado.desglose ?? []).map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: `${item.porcentaje}%`,
                          backgroundColor: getExpenseColor(item.porcentaje),
                        }}
                        className="h-full transition-all duration-500"
                        title={`${item.descripcion}: $${item.monto} (${item.porcentaje.toFixed(1)}%)`}
                      />
                    ))}
                  </div>

                  {/* Leyenda de transacciones debajo de la barra */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 pt-0.5">
                    {(resultado.desglose ?? []).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1 text-[10.5px]">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getExpenseColor(item.porcentaje) }}
                        ></span>
                        <span className="text-[var(--brand-muted)]">{item.descripcion}:</span>
                        <span className="font-bold">${item.monto}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recomendaciones de IA */}
                <div className="space-y-1 flex-shrink-0 mt-2 border-t border-[var(--brand-border)] pt-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider text-[var(--brand-muted)]`}>
                    Recomendaciones de IA:
                  </span>
                  <ul className="space-y-2 mt-2">
                    {resultado.recomendaciones.map((rec, index) => (
                      <li
                        key={index}
                        className="text-sm flex items-start gap-2 text-[var(--brand-muted)]"
                      >
                        <span className="text-[var(--brand-accent)] font-bold text-base leading-none mt-0.5">
                          •
                        </span>
                        <span className="leading-relaxed">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-3 pt-3 border-t border-[var(--brand-border)] flex justify-end">
                  <button
                    onClick={generarPDF}
                    disabled={generandoPDF}
                    className="group flex items-center gap-2 bg-[var(--brand-accent)] text-[var(--brand-bg)] px-3 py-1.5 rounded-lg font-bold text-xs hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    <FileDown size={14} className="transition-transform duration-200 group-hover:translate-y-0.5" />
                    {generandoPDF ? "Generando..." : "Descargar Reporte PDF"}
                  </button>
                </div>

              </div>
            )}
          </div>

        </main>
      </div>

            {/* FOOTER EQUIPO */}
      <GlobalFooter>
        <button
          onClick={() => setMostrarMiembros(!mostrarMiembros)}
          className="group flex items-center gap-1 text-[var(--brand-accent)] hover:underline font-bold transition-colors"
        >
          <UsersRound size={14} className="transition-transform duration-200 group-hover:scale-110" />
          <span>Ver Miembros del Equipo</span>
          {mostrarMiembros ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </GlobalFooter>

      {/* DESPLEGABLE DE MIEMBROS */}
      {mostrarMiembros && (
        <div className={`w-full max-w-7xl mx-auto mb-2 bg-[var(--brand-card)] border border-[var(--brand-border)] rounded-xl p-3 shadow-xl transition-colors duration-300`}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {miembrosEquipo.map((miembro, idx) => (
              <div key={idx} className="bg-[var(--brand-card)] p-3 rounded-xl border border-[var(--brand-border)] flex flex-col justify-between shadow-lg hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)] hover:border-[var(--brand-accent)] transition-all duration-300 group transform hover:-translate-y-1">
                <span className="font-bold text-[11px] truncate text-[var(--brand-text)] group-hover:text-[var(--brand-accent)] transition-colors">{miembro.nombre}</span>
                <div className="flex items-center gap-2 mt-2">
                  {miembro.linkedin && (
                    <a href={miembro.linkedin} target="_blank" rel="noopener noreferrer" className="text-[var(--brand-accent)] hover:text-[var(--brand-text)] transition-transform duration-300 hover:scale-110" title="LinkedIn">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </a>
                  )}
                  {miembro.github && (
                    <a href={miembro.github} target="_blank" rel="noopener noreferrer" className="text-[var(--brand-accent)] hover:text-[var(--brand-text)] transition-transform duration-300 hover:scale-110" title="GitHub">
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


      
      {/* MODAL PARA PREGUNTAR MODO DE INGRESO (AUTO/MANUAL) */}
      {mostrarModalModo && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className={`bg-[var(--brand-card)] border border-[var(--brand-border)] rounded-2xl p-6 max-w-sm w-full shadow-2xl relative text-center`}>
            <button
              onClick={() => setMostrarModalModo(false)}
              className="absolute top-4 right-4 opacity-50 hover:opacity-100 hover:scale-110 transition-all duration-200"
            >
              <X size={16} />
            </button>
            <Bot size={40} className="mx-auto mb-4 text-[var(--brand-accent)] transition-transform duration-300 hover:scale-110 hover:-rotate-3" />
            <h3 className="text-lg font-bold mb-2">
              Configuración Avanzada
            </h3>
            <p className={`text-xs text-[var(--brand-muted)] mb-6`}>
              ¿Deseas que nuestra Inteligencia Artificial calcule tu nivel de endeudamiento y capacidad de ahorro automáticamente basado en tus ingresos y gastos, o prefieres ingresarlos manualmente?
            </p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setModoIngresoDatos('auto');
                  setEndeudamientoManual("");
                  setFrecuenciaAhorroManual("Media");
                  setMostrarModalModo(false);
                  setTimeout(() => ejecutarAnalisis('auto'), 50);
                }}
                className="w-full bg-[var(--brand-accent)] text-[var(--brand-bg)] hover:opacity-90 font-bold py-2.5 rounded-lg transition-all shadow-md text-sm"
              >
                Calcular automáticamente por mí
              </button>
              <button
                onClick={() => {
                  setModoIngresoDatos('manual');
                  setMostrarModalModo(false);
                }}
                className={`w-full border-2 border-[var(--brand-border)] hover:bg-[var(--brand-accent)]/10 font-bold py-2.5 rounded-lg transition-all text-sm`}
              >
                Ingresar datos manualmente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ADVERTENCIA (VALIDACION) */}
      {mensajeAdvertencia && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className={`bg-[var(--brand-card)] border border-red-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative text-center`}>
            <button
              onClick={() => setMensajeAdvertencia(null)}
              className="absolute top-4 right-4 opacity-50 hover:opacity-100 hover:scale-110 transition-all duration-200"
            >
              <X size={16} />
            </button>
            <AlertCircle size={40} className="mx-auto mb-4 text-red-400 transition-transform duration-300 hover:scale-110" />
            <h3 className="text-lg font-bold mb-2">
              Validación Financiera
            </h3>
            <p className={`text-xs text-[var(--brand-muted)] mb-6`}>
              {mensajeAdvertencia}
            </p>
            <button
              onClick={() => setMensajeAdvertencia(null)}
              className="w-full bg-[var(--brand-accent)] text-[var(--brand-bg)] hover:opacity-90 font-bold py-2.5 rounded-lg transition-all shadow-md text-sm"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* HIDDEN PDF TEMPLATE PARA REPORTE EMPRESARIAL */}
      {resultado && (
        <div className="absolute top-[-9999px] left-[-9999px] pointer-events-none">
          <div id="pdf-report-template" className="bg-[#ffffff] text-[#0f172a] font-sans p-12 box-border relative flex flex-col" style={{ width: '794px', minHeight: '1123px' }}>
            <div className="flex-1">
            {/* Header */}
            <div className="flex justify-between items-end border-b-4 border-[#1e3a8a] pb-4 mb-8">
              <div>
                <h1 className="text-4xl font-extrabold text-[#172554] tracking-tight">FINANCE AI</h1>
                <p className="text-sm font-semibold text-[#64748b] uppercase tracking-widest mt-1">Reporte Analítico Empresarial</p>
              </div>
              <div className="text-right text-xs text-[#64748b] font-medium">
                <p>Generado el: {new Date().toLocaleDateString()}</p>
                <p>Usuario: <span className="font-bold text-[#334155]">{username || 'N/A'}</span></p>
                <p>ID Transacción: #{Date.now().toString().slice(-6)}</p>
              </div>
            </div>

            {/* Resumen Ejecutivo */}
            <h2 className="text-xl font-bold text-[#1e3a8a] mb-4 border-l-4 border-[#2563eb] pl-3">Resumen Ejecutivo</h2>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-[#f8fafc] p-4 rounded-lg border border-[#e2e8f0] shadow-sm">
                <p className="text-xs text-[#64748b] font-bold uppercase mb-1">Ingresos Declarados</p>
                <p className="text-2xl font-black text-[#1e293b]">${parseFloat(ingresoMensual).toLocaleString()}</p>
              </div>
              <div className="bg-[#f8fafc] p-4 rounded-lg border border-[#e2e8f0] shadow-sm">
                <p className="text-xs text-[#64748b] font-bold uppercase mb-1">Gastos Identificados</p>
                <p className="text-2xl font-black text-[#1e293b]">${resultado.totalGastos.toLocaleString()}</p>
              </div>
              <div className="bg-[#eff6ff] p-4 rounded-lg border border-[#bfdbfe] shadow-sm">
                <p className="text-xs text-[#2563eb] font-bold uppercase mb-1">Balance / Flujo</p>
                <p className="text-2xl font-black text-[#1e3a8a]">${(parseFloat(ingresoMensual) - resultado.totalGastos).toLocaleString()}</p>
              </div>
            </div>

            {/* Diagnostico */}
            <h2 className="text-xl font-bold text-[#1e3a8a] mb-4 border-l-4 border-[#2563eb] pl-3">Diagnóstico Financiero</h2>
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="col-span-2 bg-[#f8fafc] p-4 rounded-lg border border-[#e2e8f0] flex flex-col justify-center">
                <p className="text-xs text-[#64748b] font-bold uppercase mb-1">Estado de Salud</p>
                <p className="text-lg font-bold text-[#1e293b]">{resultado.estado}</p>
                <p className="text-sm text-[#475569] mt-1">{resultado.mensaje}</p>
              </div>
              
              <div className="text-center bg-[#f8fafc] p-4 rounded-lg border border-[#e2e8f0] flex flex-col items-center justify-center">
                <p className="text-xs text-[#64748b] font-bold uppercase mb-2">Endeudamiento</p>
                <span className="text-3xl font-black text-[#e11d48] leading-none">{resultado.endeudamiento}%</span>
              </div>
              
              <div className="text-center bg-[#f8fafc] p-4 rounded-lg border border-[#e2e8f0] flex flex-col items-center justify-center">
                <p className="text-xs text-[#64748b] font-bold uppercase mb-2">Capacidad Ahorro</p>
                <span className="text-2xl font-black text-[#059669] leading-none">{resultado.frecuenciaAhorroText}</span>
              </div>
            </div>

            {/* Desglose de Gastos */}
            <h2 className="text-xl font-bold text-[#1e3a8a] mb-4 border-l-4 border-[#2563eb] pl-3">Desglose de Movimientos</h2>
            <div className="mb-8 overflow-hidden rounded-lg border border-[#e2e8f0]">
              <table className="w-full text-left text-sm text-[#475569]">
                <thead className="bg-[#f1f5f9] text-xs uppercase font-bold text-[#334155]">
                  <tr>
                    <th className="px-4 py-3 border-b border-[#e2e8f0]">Concepto</th>
                    <th className="px-4 py-3 border-b border-[#e2e8f0] text-right">Monto</th>
                    <th className="px-4 py-3 border-b border-[#e2e8f0] text-right">Impacto (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {resultado.desglose.map((item, idx) => (
                    <tr key={idx} className="bg-[#ffffff]">
                      <td className="px-4 py-2.5 font-medium text-[#1e293b]">{item.descripcion}</td>
                      <td className="px-4 py-2.5 text-right font-bold">${item.monto.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right">
                        <span className="bg-[#f1f5f9] text-[#475569] py-0.5 px-2 rounded-full text-xs font-bold">{item.porcentaje.toFixed(1)}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Recomendaciones de IA */}
            <h2 className="text-xl font-bold text-[#1e3a8a] mb-4 border-l-4 border-[#2563eb] pl-3">Plan de Acción / Sugerencias IA</h2>
            <div className="bg-[#eef2ff] border border-[#e0e7ff] rounded-lg p-5 mb-8">
              <ul className="space-y-3">
                {resultado.recomendaciones.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-[#4338ca] font-black text-sm flex-shrink-0 mt-[1px]">
                      {index + 1}.
                    </span>
                    <p className="text-[#1e1b4b] text-sm font-medium leading-relaxed">{rec}</p>
                  </li>
                ))}
              </ul>
            </div>
            </div>

            {/* Footer */}
            <div className="w-full pt-8 mt-auto">
              <div className="border-t border-[#e2e8f0] pt-4 flex justify-between items-center text-xs text-[#94a3b8] font-medium">
                <p>Documento hecho con cariño para ayudarte a mejorar tus finanzas.</p>
                <p className="flex items-center gap-1"><Sparkles size={12} /> G9 LATAM Team 38</p>
              </div>
              <div className="h-4 w-[calc(100%+6rem)] bg-[#1e3a8a] absolute bottom-0 -ml-12"></div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}