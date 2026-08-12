"use client";

import { Bot, Sun, Moon, LogOut, Shield, Zap } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface GlobalHeaderProps {
  username?: string | null;
  onLogout?: () => void;
  isAdmin?: boolean;
}

export function GlobalHeader({ username, onLogout, isAdmin }: GlobalHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  return (
    <header className="flex justify-between items-center px-4 md:px-6 py-3 max-w-7xl mx-auto w-full flex-shrink-0">
      
      {/* SECCIÓN IZQUIERDA: Libre de restricciones de ancho (sin truncate) */}
      <div className="flex items-center gap-3">
        <div className="bg-[var(--brand-accent)] p-2 rounded-xl shadow-md flex items-center justify-center text-[var(--brand-bg)] shrink-0">
          <Bot size={26} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-xl font-extrabold tracking-tight leading-none text-[var(--brand-text)]">
            Finance <span className="text-[var(--brand-accent)]">IA</span>
          </h1>
          <p className="text-[var(--brand-muted)] text-[10px] md:text-xs font-medium hidden sm:block mt-1">
            Conocer tus finanzas puede ser la diferencia entre tu nueva compra o tu nueva deuda.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-4">
        <button 
          onClick={toggleTheme} 
          className="flex items-center gap-1.5 bg-[var(--brand-accent)] text-[var(--brand-bg)] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm hover:bg-[var(--brand-accent-hover)] transition-colors"
        >
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          <span className="hidden sm:inline">{theme === "dark" ? "Claro" : "Oscuro"}</span>
        </button>

        {username ? (
          <div className="flex items-center gap-2">
            {isAdmin && pathname !== "/admin/dashboard" && (
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-1.5 bg-[var(--brand-card)] border border-[var(--brand-accent)] text-[var(--brand-text)] hover:bg-[var(--brand-accent)]/10 text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap transition-colors"
                title="Panel de Administración"
              >
                <Shield size={13} className="text-[var(--brand-accent)]" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}
            {isAdmin && pathname === "/admin/dashboard" && (
              <Link
                href="/analisis"
                className="flex items-center gap-1.5 bg-[var(--brand-card)] border border-[var(--brand-accent)] text-[var(--brand-text)] hover:bg-[var(--brand-accent)]/10 text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap transition-colors"
                title="Volver a Análisis"
              >
                <Zap size={13} className="text-[var(--brand-accent)]" />
                <span className="hidden sm:inline">Análisis</span>
              </Link>
            )}
            <span className="text-[var(--brand-text)] text-[11px] font-bold hidden sm:inline px-2">Hola, {username}</span>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        ) : (
          <div className="bg-[var(--brand-accent)] text-[var(--brand-bg)] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm hidden sm:block">
            #38 Dinamita
          </div>
        )}
      </div>
    </header>
  );
}