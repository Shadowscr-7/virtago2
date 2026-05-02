"use client";

import {
  createContext,
  useContext,
  useEffect,
  ReactNode,
} from "react";

// Only light-red is supported — the switcher was removed.
export type ThemeVariant = "light-red";

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

const RED_THEME: ThemeColors = {
  name: "Rojo",
  primary: "#B91C1C",   // red-700 — rojo profundo, claramente rojo sin rosado
  secondary: "#DC2626", // red-600
  accent: "#991B1B",    // red-800
  background: "#ffffff",
  surface: "#ffffff",   // blanco puro, sin tinte rosado
  border: "#e5e7eb",    // gris neutro, sin rosa
  text: {
    primary: "#111827",
    secondary: "#4b5563",
    muted: "#9ca3af",
  },
  gradients: {
    primary: "from-red-700 to-red-600",
    secondary: "from-red-600 to-red-500",
    accent: "from-red-800 to-red-700",
  },
  glass: {
    primary: "from-white/95 to-gray-50/90",
    secondary: "from-gray-50/90 to-white/95",
  },
};

// Keep a minimal themes record for backwards-compat with any consumer that reads availableThemes
export const themes: Record<ThemeVariant, ThemeColors> = {
  "light-red": RED_THEME,
};

interface ThemeContextType {
  currentTheme: ThemeVariant;
  themeColors: ThemeColors;
  /** No-op — theme is locked to light-red */
  setTheme: (theme: ThemeVariant) => void;
  availableThemes: Record<ThemeVariant, ThemeColors>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Apply CSS variables once on mount — theme is always light-red
  useEffect(() => {
    const theme = RED_THEME;
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

    // Clear any stale saved theme so future loads also use red
    try {
      localStorage.setItem("virtago-theme", "light-red");
    } catch {}
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        currentTheme: "light-red",
        themeColors: RED_THEME,
        setTheme: () => {
          // Theme is locked to light-red — this is intentional
        },
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
