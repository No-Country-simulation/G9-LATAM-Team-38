"use client";

import { Bot, Sun, Moon, LogOut } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface GlobalHeaderProps {
  username?: string | null;
  onLogout?: () => void;
}

export function GlobalHeader({ username, onLogout }: GlobalHeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex justify-between items-center px-4 md:px-6 py-3 max-w-7xl mx-auto w-full flex-shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="bg-[var(--brand-accent)] p-1.5 rounded-xl shadow-md flex items-center justify-center text-[var(--brand-text)]">
          <Bot size={20} />
        </div>
        <div>
          <h1 className="text-base font-bold leading-none">Finance IA</h1>
          <p className="text-[var(--brand-muted)] text-[11px] hidden sm:block mt-0.5">Conocer tus finanzas puede ser la diferencia entre tu nueva compra o tu nueva deuda.</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={toggleTheme} 
          className="flex items-center gap-1.5 bg-[var(--brand-accent)] text-[var(--brand-text)] text-[11px] font-bold px-3 py-1 rounded-full shadow-sm hover:bg-[var(--brand-accent-hover)] transition-colors"
        >
          {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
          <span className="hidden sm:inline">{theme === "dark" ? "Claro" : "Oscuro"}</span>
        </button>

        {username ? (
          <div className="flex items-center gap-2">
            <span className="text-[var(--brand-text)] text-[11px] font-bold hidden sm:inline px-2">Hola, {username}</span>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 bg-red-500/10 text-red-500 dark:text-red-400 hover:bg-red-500/20 text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        ) : (
          <div className="bg-[var(--brand-accent)] text-[var(--brand-text)] text-[11px] font-bold px-3 py-1 rounded-full shadow-sm hidden sm:block">
            #38 Dinamita
          </div>
        )}
      </div>
    </header>
  );
}
