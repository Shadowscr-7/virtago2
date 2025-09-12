"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Definición de temas con sus paletas de colores
export type ThemeVariant = "original" | "ocean" | "forest" | "crimson";

export interface ThemeColors {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  gradients: {
    primary: string;
    secondary: string;
    accent: string;
  };
  glass: {
    primary: string;
    secondary: string;
  };
}

export const themes: Record<ThemeVariant, ThemeColors> = {
  original: {
    name: "Virtago Original",
    primary: "#8b5cf6", // purple-500
    secondary: "#ec4899", // pink-500
    accent: "#06b6d4", // cyan-500
    background: "#0f172a", // slate-900
    surface: "#1e293b", // slate-800
    text: {
      primary: "#f8fafc", // slate-50
      secondary: "#cbd5e1", // slate-300
      muted: "#64748b", // slate-500
    },
    gradients: {
      primary: "from-purple-500 to-pink-500",
      secondary: "from-blue-500 to-cyan-500",
      accent: "from-purple-600 to-pink-600",
    },
    glass: {
      primary:
        "from-white/80 to-gray-50/80 dark:from-slate-800/80 dark:to-slate-700/80",
      secondary:
        "from-white/70 to-gray-50/70 dark:from-slate-800/70 dark:to-slate-700/70",
    },
  },
  ocean: {
    name: "Ocean Depths",
    primary: "#3b82f6", // blue-500
    secondary: "#06b6d4", // cyan-500
    accent: "#10b981", // emerald-500
    background: "#0c1421", // azul muy oscuro
    surface: "#1e2a3a", // azul grisáceo
    text: {
      primary: "#f0f9ff", // blue-50
      secondary: "#bae6fd", // blue-200
      muted: "#64748b", // slate-500
    },
    gradients: {
      primary: "from-blue-500 to-cyan-500",
      secondary: "from-cyan-500 to-emerald-500",
      accent: "from-blue-600 to-cyan-600",
    },
    glass: {
      primary:
        "from-blue-50/80 to-cyan-50/80 dark:from-blue-900/80 dark:to-cyan-900/80",
      secondary:
        "from-blue-50/70 to-cyan-50/70 dark:from-blue-900/70 dark:to-cyan-900/70",
    },
  },
  forest: {
    name: "Forest Depths",
    primary: "#10b981", // emerald-500
    secondary: "#059669", // emerald-600
    accent: "#3b82f6", // blue-500
    background: "#0f1f13", // verde muy oscuro
    surface: "#1a2e20", // verde grisáceo
    text: {
      primary: "#f0fdf4", // green-50
      secondary: "#bbf7d0", // green-200
      muted: "#64748b", // slate-500
    },
    gradients: {
      primary: "from-emerald-500 to-green-500",
      secondary: "from-green-500 to-blue-500",
      accent: "from-emerald-600 to-green-600",
    },
    glass: {
      primary:
        "from-emerald-50/80 to-green-50/80 dark:from-emerald-900/80 dark:to-green-900/80",
      secondary:
        "from-emerald-50/70 to-green-50/70 dark:from-emerald-900/70 dark:to-green-900/70",
    },
  },
  crimson: {
    name: "Crimson Nights",
    primary: "#ef4444", // red-500
    secondary: "#dc2626", // red-600
    accent: "#f59e0b", // amber-500
    background: "#1a0f0f", // rojo muy oscuro
    surface: "#2a1818", // rojo grisáceo
    text: {
      primary: "#fef2f2", // red-50
      secondary: "#fecaca", // red-200
      muted: "#64748b", // slate-500
    },
    gradients: {
      primary: "from-red-500 to-rose-500",
      secondary: "from-rose-500 to-amber-500",
      accent: "from-red-600 to-rose-600",
    },
    glass: {
      primary:
        "from-red-50/80 to-rose-50/80 dark:from-red-900/80 dark:to-rose-900/80",
      secondary:
        "from-red-50/70 to-rose-50/70 dark:from-red-900/70 dark:to-rose-900/70",
    },
  },
};

interface ThemeContextType {
  currentTheme: ThemeVariant;
  themeColors: ThemeColors;
  setTheme: (theme: ThemeVariant) => void;
  availableThemes: Record<ThemeVariant, ThemeColors>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeVariant>("original");

  // Cargar tema guardado al inicializar
  useEffect(() => {
    const savedTheme = localStorage.getItem("virtago-theme") as ThemeVariant;
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Aplicar variables CSS personalizadas cuando cambie el tema
  useEffect(() => {
    const theme = themes[currentTheme];
    const root = document.documentElement;

    // Aplicar variables CSS personalizadas
    root.style.setProperty("--theme-primary", theme.primary);
    root.style.setProperty("--theme-secondary", theme.secondary);
    root.style.setProperty("--theme-accent", theme.accent);
    root.style.setProperty("--theme-background", theme.background);
    root.style.setProperty("--theme-surface", theme.surface);
    root.style.setProperty("--theme-text-primary", theme.text.primary);
    root.style.setProperty("--theme-text-secondary", theme.text.secondary);
    root.style.setProperty("--theme-text-muted", theme.text.muted);
  }, [currentTheme]);

  const setTheme = (theme: ThemeVariant) => {
    setCurrentTheme(theme);
    localStorage.setItem("virtago-theme", theme);
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themeColors: themes[currentTheme],
        setTheme,
        availableThemes: themes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
