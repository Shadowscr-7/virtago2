"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Loader2,
  X,
  Sparkles
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

export type ToastType = "success" | "error" | "warning" | "info" | "loading";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  removeAllToasts: () => void;
  updateToast: (id: string, updates: Partial<Omit<Toast, "id">>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  // Helper methods for convenience
  const success = useCallback((title: string, description?: string, options?: Partial<Omit<Toast, "id" | "type" | "title" | "description">>) => {
    return context.showToast({ type: "success", title, description, ...options });
  }, [context]);

  const error = useCallback((title: string, description?: string, options?: Partial<Omit<Toast, "id" | "type" | "title" | "description">>) => {
    return context.showToast({ type: "error", title, description, ...options });
  }, [context]);

  const warning = useCallback((title: string, description?: string, options?: Partial<Omit<Toast, "id" | "type" | "title" | "description">>) => {
    return context.showToast({ type: "warning", title, description, ...options });
  }, [context]);

  const info = useCallback((title: string, description?: string, options?: Partial<Omit<Toast, "id" | "type" | "title" | "description">>) => {
    return context.showToast({ type: "info", title, description, ...options });
  }, [context]);

  const loading = useCallback((title: string, description?: string, options?: Partial<Omit<Toast, "id" | "type" | "title" | "description">>) => {
    return context.showToast({ type: "loading", title, description, persistent: true, ...options });
  }, [context]);

  // Promise-based toast for API calls
  const promise = useCallback(<T,>(
    promise: Promise<T>,
    options: {
      loading: { title: string; description?: string };
      success: { title: string; description?: string } | ((data: T) => { title: string; description?: string });
      error: { title: string; description?: string } | ((error: unknown) => { title: string; description?: string });
    }
  ) => {
    const loadingId = loading(options.loading.title, options.loading.description);

    return promise
      .then((data) => {
        context.removeToast(loadingId);
        const successConfig = typeof options.success === 'function' ? options.success(data) : options.success;
        return success(successConfig.title, successConfig.description);
      })
      .catch((err) => {
        context.removeToast(loadingId);
        const errorConfig = typeof options.error === 'function' ? options.error(err) : options.error;
        return error(errorConfig.title, errorConfig.description);
      });
  }, [context, loading, success, error]);

  return {
    ...context,
    success,
    error,
    warning,
    info,
    loading,
    promise,
  };
}

function ToastContent({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const { themeColors } = useTheme();

  const getIcon = () => {
    const iconProps = { className: "h-5 w-5 flex-shrink-0" };
    
    switch (toast.type) {
      case "success":
        return <CheckCircle {...iconProps} style={{ color: "#10b981" }} />;
      case "error":
        return <XCircle {...iconProps} style={{ color: "#ef4444" }} />;
      case "warning":
        return <AlertTriangle {...iconProps} style={{ color: "#f59e0b" }} />;
      case "info":
        return <Info {...iconProps} style={{ color: themeColors.primary }} />;
      case "loading":
        return <Loader2 {...iconProps} className="animate-spin" style={{ color: themeColors.secondary }} />;
      default:
        return <Info {...iconProps} />;
    }
  };

  const getTypeStyles = () => {
    switch (toast.type) {
      case "success":
        return {
          gradient: "linear-gradient(135deg, #10b98120, #059669120)",
          border: "#10b981",
          glow: "rgba(16, 185, 129, 0.3)",
          accent: "#10b981",
        };
      case "error":
        return {
          gradient: "linear-gradient(135deg, #ef444420, #dc262620)",
          border: "#ef4444",
          glow: "rgba(239, 68, 68, 0.3)", 
          accent: "#ef4444",
        };
      case "warning":
        return {
          gradient: "linear-gradient(135deg, #f59e0b20, #d9770620)",
          border: "#f59e0b",
          glow: "rgba(245, 158, 11, 0.3)",
          accent: "#f59e0b",
        };
      case "info":
        return {
          gradient: `linear-gradient(135deg, ${themeColors.primary}20, ${themeColors.secondary}20)`,
          border: themeColors.primary,
          glow: `${themeColors.primary}50`,
          accent: themeColors.primary,
        };
      case "loading":
        return {
          gradient: `linear-gradient(135deg, ${themeColors.secondary}20, ${themeColors.accent}20)`,
          border: themeColors.secondary,
          glow: `${themeColors.secondary}50`,
          accent: themeColors.secondary,
        };
      default:
        return {
          gradient: `linear-gradient(135deg, ${themeColors.primary}20, ${themeColors.secondary}20)`,
          border: themeColors.primary,
          glow: `${themeColors.primary}50`,
          accent: themeColors.primary,
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 300, scale: 0.9, rotateY: -15 }}
      animate={{ opacity: 1, x: 0, scale: 1, rotateY: 0 }}
      exit={{ opacity: 0, x: 300, scale: 0.9, rotateY: 15 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 25,
        opacity: { duration: 0.2 }
      }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="relative overflow-hidden rounded-2xl min-w-[320px] max-w-[400px] backdrop-blur-xl"
      style={{
        background: `${themeColors.surface}f0`,
        border: `1px solid ${typeStyles.border}40`,
        boxShadow: `
          0 0 0 1px ${typeStyles.border}20,
          0 20px 40px -12px rgba(0, 0, 0, 0.6),
          0 0 30px ${typeStyles.glow}
        `,
      }}
    >
      {/* Gradient overlay */}
      <div 
        className="absolute inset-0 opacity-60"
        style={{ background: typeStyles.gradient }}
      />

      {/* Animated shine effect */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background: `linear-gradient(135deg, transparent, ${typeStyles.accent}60, transparent)`,
        }}
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          repeatDelay: 4,
          ease: "easeInOut",
        }}
      />

      {/* Left accent bar */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ background: typeStyles.accent }}
      />

      {/* Content */}
      <div className="relative p-4">
        <div className="flex items-start gap-3">
          {/* Animated icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              delay: 0.1, 
              type: "spring", 
              stiffness: 300,
              damping: 15
            }}
            className="mt-0.5 relative"
          >
            {getIcon()}
            {toast.type === "success" && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles className="h-3 w-3 text-yellow-400" />
              </motion.div>
            )}
          </motion.div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            <motion.h4
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-semibold text-sm leading-5"
              style={{ color: themeColors.text.primary }}
            >
              {toast.title}
            </motion.h4>
            
            {toast.description && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-sm leading-5 mt-1"
                style={{ color: themeColors.text.secondary }}
              >
                {toast.description}
              </motion.p>
            )}

            {/* Action button */}
            {toast.action && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onClick={toast.action.onClick}
                className="mt-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105"
                style={{
                  background: typeStyles.accent,
                  color: "white",
                }}
              >
                {toast.action.label}
              </motion.button>
            )}
          </div>

          {/* Close button */}
          {!toast.persistent && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onRemove}
              className="p-1.5 rounded-full transition-all duration-200 hover:bg-white/10"
              style={{ color: themeColors.text.secondary }}
            >
              <X className="h-4 w-4" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Progress bar for temporary toasts */}
      {!toast.persistent && toast.duration && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 rounded-full"
          style={{ background: typeStyles.accent }}
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: toast.duration / 1000, ease: "linear" }}
        />
      )}
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { 
      duration: 4000,
      ...toast, 
      id 
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove toast after duration (if not persistent)
    if (!newToast.persistent && newToast.duration) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, [removeToast]);

  const removeAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const updateToast = useCallback((id: string, updates: Partial<Omit<Toast, "id">>) => {
    setToasts((prev) => 
      prev.map((toast) => 
        toast.id === id ? { ...toast, ...updates } : toast
      )
    );
  }, []);

  return (
    <ToastContext.Provider value={{ 
      showToast, 
      removeToast, 
      removeAllToasts, 
      updateToast 
    }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-6 right-6 z-[9999] space-y-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <ToastContent
                toast={toast}
                onRemove={() => removeToast(toast.id)}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
