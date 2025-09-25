"use client";

import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "@/contexts/theme-context";
import { useEffect } from "react";

export function ToastProvider() {
  const { themeColors } = useTheme();

  // Aplicar variables CSS para los toasts
  useEffect(() => {
    const root = document.documentElement;
    
    // Variables para los toasts
    root.style.setProperty("--toast-bg", themeColors.surface);
    root.style.setProperty("--toast-border", themeColors.primary + "30");
    root.style.setProperty("--toast-text", themeColors.text.primary);
    root.style.setProperty("--toast-text-secondary", themeColors.text.secondary);
    root.style.setProperty("--toast-success", themeColors.accent);
    root.style.setProperty("--toast-error", "#ef4444");
    root.style.setProperty("--toast-warning", "#f59e0b");
    root.style.setProperty("--toast-info", themeColors.primary);
    
    // Gradientes para los toasts
    root.style.setProperty("--toast-success-gradient", `linear-gradient(135deg, ${themeColors.accent}, #10b981)`);
    root.style.setProperty("--toast-error-gradient", "linear-gradient(135deg, #ef4444, #dc2626)");
    root.style.setProperty("--toast-warning-gradient", "linear-gradient(135deg, #f59e0b, #d97706)");
    root.style.setProperty("--toast-info-gradient", `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`);
  }, [themeColors]);

  return (
    <SonnerToaster
      position="top-right"
      expand={true}
      richColors={false}
      closeButton={true}
      duration={4000}
      gap={12}
      offset={20}
      theme="dark"
      toastOptions={{
        className: "virtago-toast",
        style: {
          background: `${themeColors.surface}f0`,
          border: `1px solid ${themeColors.primary}30`,
          color: themeColors.text.primary,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderRadius: "12px",
          padding: "16px",
          fontSize: "14px",
          fontWeight: "500",
          boxShadow: `
            0 0 0 1px ${themeColors.primary}20,
            0 10px 25px -5px rgba(0, 0, 0, 0.5),
            0 0 20px ${themeColors.primary}30
          `,
          minHeight: "60px",
          minWidth: "320px",
        },
      }}
    />
  );
}