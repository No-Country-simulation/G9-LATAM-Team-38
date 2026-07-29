"use client";

import { Bot, Terminal, Heart, Send } from "lucide-react";

export default function Home() {
  return (
    <div className="h-screen max-h-screen overflow-hidden bg-[#0E131F] text-[#FFFFFF] font-sans flex flex-col selection:bg-[#F97316]/30">
      {/* HEADER */}
      <header className="flex-shrink-0 flex justify-between items-center p-4 lg:px-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#C85A54] p-2.5 rounded-xl shadow-lg flex items-center justify-center">
            <Bot size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Finance IA</h1>
            <p className="text-white/70 text-xs hidden sm:block">Diagnóstico financiero personal impulsado por IA</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-[#C85A54] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap">
            #38 Equipo Dinamita
          </div>
          <span className="text-white/70 text-xs hidden md:inline font-medium">
            Hackathon ONE · Alura + Oracle + NoCountry
          </span>
        </div>
      </header>

      {/* CONTENEDOR CENTRAL */}
      <div className="mx-4 lg:mx-8 mb-3 flex-grow flex flex-col min-h-0">
        {/* BANNER SUPERIOR */}
        <div className="flex-shrink-0 bg-[#C85A54] rounded-t-[1.5rem] p-5 lg:px-8 lg:py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center relative overflow-hidden shadow-xl z-20">
          <div className="z-10">
            <div className="text-white/70 text-[10px] font-bold tracking-[0.2em] mb-1.5">
              ANÁLISIS EN VIVO
            </div>
            <h2 className="text-lg md:text-xl font-bold flex items-center gap-3">
              <Terminal size={22} className="text-white/90" />
              Así se ve la conversación entre tu app y nuestro modelo
            </h2>
          </div>
          
          <div className="z-10 mt-3 sm:mt-0 flex items-center gap-2 bg-[#1A2332]/40 border border-white/20 px-4 py-2 rounded-full backdrop-blur-md shadow-inner">
            <div className="w-2 h-2 rounded-full bg-[#F97316] animate-pulse shadow-[0_0_8px_#F97316]"></div>
            <span className="text-xs font-mono text-white font-semibold tracking-wide flex items-center gap-2">
              <Send size={14} className="text-white/70" />
              /Analisis-Financiero
            </span>
          </div>
          
          {/* Decorative abstract lines */}
          <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none">
             <svg width="250" height="80" viewBox="0 0 250 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 80C30 80 50 40 100 40C150 40 180 60 250 20" stroke="white" strokeWidth="3" strokeLinecap="round" />
                <circle cx="100" cy="40" r="4" fill="white" />
                <circle cx="250" cy="20" r="4" fill="white" />
             </svg>
          </div>
        </div>

        {/* CONTENEDOR PRINCIPAL */}
        <main className="bg-[#1A2332] rounded-b-[1.5rem] p-5 lg:p-8 flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 shadow-2xl relative z-10 min-h-0 overflow-hidden">
          
          {/* COLUMNA IZQUIERDA (ENTRADA) */}
          <div className="flex flex-col gap-4 overflow-hidden h-full">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="flex items-center justify-center w-4 h-4 border-2 border-[#F97316] rounded-[3px]">
                <div className="w-1 h-1 bg-[#F97316]"></div>
              </div>
              <h3 className="text-white/40 font-bold tracking-widest text-xs uppercase">Entrada</h3>
            </div>
            
            {/* Espacio vacío solicitado para la plantilla */}
            <div className="flex-grow border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center min-h-0 overflow-auto">
               <span className="text-white/20 text-sm font-medium">Contenido de entrada</span>
            </div>
          </div>

          {/* COLUMNA DERECHA (RESULTADO) */}
          <div className="flex flex-col gap-4 overflow-hidden h-full lg:pl-6 lg:border-l border-white/5">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="flex items-center justify-center w-4 h-4 border-2 border-[#F97316] rounded-[3px]">
                <div className="w-1 h-1 bg-[#F97316]"></div>
              </div>
              <h3 className="text-white/40 font-bold tracking-widest text-xs uppercase">Resultado</h3>
            </div>
            
            {/* Espacio vacío solicitado para la plantilla */}
            <div className="flex-grow border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center min-h-0 overflow-auto">
               <span className="text-white/20 text-sm font-medium">Resultados del modelo</span>
            </div>
          </div>
        </main>
      </div>

      {/* FOOTER */}
      <footer className="flex-shrink-0 py-3 flex flex-col items-center gap-3">
        <div className="flex flex-wrap justify-center gap-2 px-4 max-w-5xl">
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
              className="bg-[#1A2332] text-white/90 px-3 py-1.5 rounded-full text-[11px] font-medium border border-white/5 shadow-sm flex items-center gap-2 hover:border-white/20 transition-all hover:bg-white/5"
            >
              <div className="w-4 h-4 rounded-full bg-[#C85A54]/20 flex items-center justify-center text-[8px] text-[#F97316] font-bold">
                {name.split(' ').slice(0, 2).map(n => n[0]).join('')}
              </div>
              <span className="whitespace-nowrap">{name}</span>
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-2 text-white/40 text-[10px] text-center tracking-wide">
          <span>Hecho con</span>
          <Heart size={10} className="text-[#C85A54] fill-[#C85A54] animate-pulse" />
          <span>por Proyecto <strong className="text-white/70">Equipo Dinamita - 38</strong> — Hackathon ONE para <strong className="text-white/70">Alura · Oracle · NoCountry</strong></span>
        </div>
      </footer>
    </div>
  );
}
