"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Bot, X, ArrowRight, Sparkles } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { api, PendingSuggestion } from "@/api";
import { useAuthStore } from "@/store/auth";

/**
 * Banner que aparece en el dashboard del cliente cuando hay un pedido sugerido pendiente.
 * Solo para roles 'user' con plan GOLD o PLATINUM.
 */
export function SmartCartBanner() {
  const { themeColors } = useTheme();
  const { user } = useAuthStore();
  const router = useRouter();
  const [suggestion, setSuggestion] = useState<PendingSuggestion | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Solo mostrar para usuarios con plan AI habilitado
  const planName = (user?.planName || "").toLowerCase();
  const hasAiPlan = planName === "gold" || planName === "platinum";

  useEffect(() => {
    if (!user || user.role !== "user" || !hasAiPlan) return;

    const fetchPending = async () => {
      try {
        const response = await api.smartCart.getPending();
        if (response.success && response.data) {
          setSuggestion(response.data);
        }
      } catch {
        // Silenciar error — no mostrar banner si falla
      }
    };

    fetchPending();
  }, [user, hasAiPlan]);

  const handleDismiss = async () => {
    if (!suggestion) return;
    setIsLoading(true);
    try {
      await api.smartCart.dismiss(suggestion.id);
      setIsDismissed(true);
      setSuggestion(null);
    } catch {
      setIsDismissed(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (!suggestion || isDismissed || !hasAiPlan || user?.role !== "user") {
    return null;
  }

  const totalItems = suggestion.metadata?.totalItems ?? suggestion.cart.length;
  const totalAmount = suggestion.metadata?.totalAmount ?? 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.35 }}
        className="relative rounded-2xl border overflow-hidden shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${themeColors.primary}15 0%, ${themeColors.secondary}15 100%)`,
          borderColor: themeColors.primary + "30",
        }}
      >
        {/* Decorativo fondo */}
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -translate-y-8 translate-x-8"
          style={{ backgroundColor: themeColors.primary }}
        />

        <div className="relative p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Icono */}
          <div
            className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
            style={{
              background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
            }}
          >
            <Bot className="w-6 h-6 text-white" />
          </div>

          {/* Texto */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3
                className="text-base font-bold"
                style={{ color: themeColors.text.primary }}
              >
                Tenes un pedido sugerido para esta semana
              </h3>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: themeColors.primary + "20",
                  color: themeColors.primary,
                }}
              >
                <Sparkles className="w-3 h-3" />
                IA
              </span>
            </div>
            <p className="text-sm" style={{ color: themeColors.text.secondary }}>
              {totalItems} productos sugeridos &middot; Total estimado:{" "}
              <span className="font-semibold" style={{ color: themeColors.text.primary }}>
                ${totalAmount.toLocaleString("es-UY", { minimumFractionDigits: 2 })}
              </span>
            </p>
            {suggestion.summary && (
              <p
                className="text-xs mt-1 line-clamp-1"
                style={{ color: themeColors.text.secondary }}
              >
                {suggestion.summary}
              </p>
            )}
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push(`/smart-cart?id=${suggestion.id}`)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition-all"
              style={{
                background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
              }}
            >
              Ver sugerencia
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            <button
              onClick={handleDismiss}
              disabled={isLoading}
              className="p-2 rounded-lg transition-colors hover:bg-black/10 disabled:opacity-50"
              title="Descartar sugerencia"
              style={{ color: themeColors.text.secondary }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
