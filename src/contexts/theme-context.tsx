"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type ThemeVariant = "light-red" | "light-blue" | "light-green" | "light-orange" | "light-purple";

export interface ThemeColors {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  border: string;
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
  "light-red": {
    name: "Rojo",
    primary: "#C8102E",
    secondary: "#E8354A",
    accent: "#A00C24",
    background: "#ffffff",
    surface: "#fff5f5",
    border: "#fecdd3",
    text: {
      primary: "#1a0205",
      secondary: "#475569",
      muted: "#94a3b8",
    },
    gradients: {
      primary: "from-red-700 to-red-500",
      secondary: "from-red-500 to-rose-400",
      accent: "from-red-800 to-red-600",
    },
    glass: {
      primary: "from-red-50/90 to-white/90",
      secondary: "from-white/90 to-red-50/80",
    },
  },
  "light-blue": {
    name: "Azul",
    primary: "#1E3A61",
    secondary: "#3A5A94",
    accent: "#2A4D89",
    background: "#ffffff",
    surface: "#f1f5f9",
    border: "#e2e8f0",
    text: {
      primary: "#0f172a",
      secondary: "#475569",
      muted: "#94a3b8",
    },
    gradients: {
      primary: "from-blue-800 to-blue-600",
      secondary: "from-blue-600 to-blue-400",
      accent: "from-blue-700 to-blue-500",
    },
    glass: {
      primary: "from-blue-50/90 to-white/90",
      secondary: "from-white/90 to-blue-50/80",
    },
  },
  "light-green": {
    name: "Verde",
    primary: "#1B6B3A",
    secondary: "#4CAF7D",
    accent: "#2E7D52",
    background: "#ffffff",
    surface: "#f0fdf4",
    border: "#dcfce7",
    text: {
      primary: "#0a1f10",
      secondary: "#374151",
      muted: "#6b7280",
    },
    gradients: {
      primary: "from-green-800 to-green-600",
      secondary: "from-green-600 to-emerald-400",
      accent: "from-green-700 to-emerald-500",
    },
    glass: {
      primary: "from-green-50/90 to-white/90",
      secondary: "from-white/90 to-green-50/80",
    },
  },
  "light-orange": {
    name: "Naranja",
    primary: "#C45000",
    secondary: "#F4874B",
    accent: "#E65100",
    background: "#ffffff",
    surface: "#fff7ed",
    border: "#fed7aa",
    text: {
      primary: "#1c0a00",
      secondary: "#374151",
      muted: "#6b7280",
    },
    gradients: {
      primary: "from-orange-700 to-orange-500",
      secondary: "from-orange-500 to-amber-400",
      accent: "from-orange-600 to-amber-500",
    },
    glass: {
      primary: "from-orange-50/90 to-white/90",
      secondary: "from-white/90 to-orange-50/80",
    },
  },
  "light-purple": {
    name: "Morado",
    primary: "#4A148C",
    secondary: "#7E57C2",
    accent: "#6200EA",
    background: "#ffffff",
    surface: "#faf5ff",
    border: "#e9d5ff",
    text: {
      primary: "#1a0a2e",
      secondary: "#475569",
      muted: "#6b7280",
    },
    gradients: {
      primary: "from-purple-900 to-purple-600",
      secondary: "from-purple-600 to-violet-400",
      accent: "from-purple-700 to-violet-500",
    },
    glass: {
      primary: "from-purple-50/90 to-white/90",
      secondary: "from-white/90 to-purple-50/80",
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
  const [currentTheme, setCurrentTheme] = useState<ThemeVariant>("light-red");

  useEffect(() => {
    const savedTheme = localStorage.getItem("virtago-theme") as ThemeVariant;
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    } else {
      // Force light-red as default, remove stale saved value
      localStorage.setItem("virtago-theme", "light-red");
    }
  }, []);

  useEffect(() => {
    const theme = themes[currentTheme];
    const root = document.documentElement;

    root.style.setProperty("--theme-primary", theme.primary);
    root.style.setProperty("--theme-secondary", theme.secondary);
    root.style.setProperty("--theme-accent", theme.accent);
    root.style.setProperty("--theme-background", theme.background);
    root.style.setProperty("--theme-surface", theme.surface);
    root.style.setProperty("--theme-border", theme.border);
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
