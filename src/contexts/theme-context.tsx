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
