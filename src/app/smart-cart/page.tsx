"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bot,
  Sparkles,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  X,
  CheckCircle,
  ArrowLeft,
  Info,
  Zap,
  Lock
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { useAuthStore } from "@/store/auth";
import { api, SmartCartItem, PendingSuggestion } from "@/api";
import { showToast } from "@/store/toast-helpers";

function SmartCartContent() {
  const { themeColors } = useTheme();
  const { user } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const suggestionId = searchParams.get("id");

  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [suggestion, setSuggestion] = useState<PendingSuggestion | null>(null);
  const [cart, setCart] = useState<SmartCartItem[]>([]);
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);

  const planName = (user?.planName || "").toLowerCase();
  const hasAiPlan = planName === "gold" || planName === "platinum";

  const loadSuggestion = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.smartCart.getPending();
      if (response.success && response.data) {
        setSuggestion(response.data);
        setCart(response.data.cart.map((item) => ({ ...item })));
      }
    } catch {
      showToast({ title: "Error al cargar la sugerencia", type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && hasAiPlan) {
      loadSuggestion();
    } else {
      setIsLoading(false);
    }
  }, [user, hasAiPlan, loadSuggestion]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await api.smartCart.generate();
      if (response.success && response.data) {
        const newSugg: PendingSuggestion = {
          id: "generated-" + Date.now(),
          userId: user?.id || "",
          userEmail: user?.email || "",
          status: "pending",
          cart: response.data.cart,
          summary: response.data.summary,
          generatedAt: response.data.generatedAt,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          metadata: response.data.metadata,
        };
        setSuggestion(newSugg);
        setCart(response.data.cart.map((item) => ({ ...item })));
        showToast({ title: "Carrito sugerido generado con exito", type: "success" });
      } else {
        showToast({ title: response.message || "Error al generar el carrito", type: "error" });
      }
    } catch (err) {
      showToast({
        title: "Error al generar el carrito",
        description: err instanceof Error ? err.message : "Error inesperado",
        type: "error",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: Math.min(newQty, item.stockQuantity ?? 9999) };
      })
    );
  };

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleConfirm = async () => {
    if (!suggestion) return;
    if (cart.length === 0) {
      showToast({ title: "El carrito esta vacio", type: "error" });
      return;
    }

    setIsConfirming(true);
    try {
      const response = await api.smartCart.confirm(suggestion.id, cart);
      if (response.success) {
        setConfirmedAt(new Date().toISOString());
        showToast({ title: "Pedido confirmado. Redirigiendo al checkout...", type: "success" });

        // Construir parametros para el checkout con los items del carrito
        const checkoutItems = encodeURIComponent(JSON.stringify(cart.map((i) => ({
          pid: i.productId,
          name: i.productName,
          sku: i.sku || "",
          quantity: i.quantity,
          price: i.unitPrice,
        }))));

        setTimeout(() => {
          router.push(`/checkout?from=smart-cart&items=${checkoutItems}`);
        }, 1200);
      } else {
        showToast({ title: "Error al confirmar el pedido", description: response.message, type: "error" });
      }
    } catch (err) {
      showToast({
        title: "Error al confirmar el pedido",
        description: err instanceof Error ? err.message : "Error inesperado",
        type: "error",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleDismiss = async () => {
    if (!suggestion) return;
    try {
      await api.smartCart.dismiss(suggestion.id);
      setSuggestion(null);
      setCart([]);
      showToast({ title: "Sugerencia descartada", type: "success" });
    } catch {
      setSuggestion(null);
      setCart([]);
    }
  };

  const confidenceConfig = {
    high: { label: "Alta", bgColor: "#c6f6d5", color: "#276749" },
    medium: { label: "Media", bgColor: "#fefcbf", color: "#744210" },
    low: { label: "Baja", bgColor: "#fed7d7", color: "#9b2c2c" },
  };

  // Upsell para usuarios FREE
  if (user && !hasAiPlan && !isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: themeColors.background }}>
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-10 rounded-2xl border shadow-lg"
            style={{
              backgroundColor: themeColors.surface,
              borderColor: themeColors.primary + "30",
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md"
              style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
            >
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-3" style={{ color: themeColors.text.primary }}>
              Funcionalidad GOLD y PLATINUM
            </h1>
            <p className="mb-6" style={{ color: themeColors.text.secondary }}>
              El pedido sugerido con IA esta disponible solo para planes GOLD (hasta 1.000 sugerencias/mes)
              y PLATINUM (ilimitado). Mejora tu plan para acceder.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.back()}
                className="px-5 py-2.5 rounded-xl border font-medium transition-all"
                style={{ borderColor: themeColors.primary + "30", color: themeColors.text.secondary }}
              >
                Volver
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push("/configuracion?tab=plan")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white"
                style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
              >
                <Zap className="w-4 h-4" />
                Ver planes
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: themeColors.background }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: themeColors.primary }} />
      </div>
    );
  }

  if (confirmedAt) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: themeColors.background }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center p-10"
        >
          <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: "#10b981" }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: themeColors.text.primary }}>
            Pedido confirmado
          </h2>
          <p style={{ color: themeColors.text.secondary }}>Redirigiendo al checkout...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: themeColors.background }}>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm mb-4 transition-colors hover:opacity-80"
            style={{ color: themeColors.text.secondary }}
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
                style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
              >
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: themeColors.text.primary }}>
                  Pedido Sugerido
                </h1>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3" style={{ color: themeColors.primary }} />
                  <span className="text-sm" style={{ color: themeColors.text.secondary }}>
                    Generado por inteligencia artificial
                  </span>
                </div>
              </div>
            </div>

            {!suggestion && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white shadow-md disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
              >
                <Sparkles className="w-4 h-4" />
                {isGenerating ? "Generando..." : "Generar sugerencia"}
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Sin sugerencia activa */}
        {!suggestion && !isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Bot className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: themeColors.primary }} />
            <h2 className="text-xl font-semibold mb-2" style={{ color: themeColors.text.primary }}>
              No hay sugerencias pendientes
            </h2>
            <p className="mb-6" style={{ color: themeColors.text.secondary }}>
              Podes generar un carrito sugerido en cualquier momento o esperarlo los lunes.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
              style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
            >
              <Sparkles className="w-4 h-4" />
              Generar ahora
            </motion.button>
          </motion.div>
        )}

        {/* Generando... spinner */}
        {isGenerating && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: themeColors.primary }} />
            <p style={{ color: themeColors.text.secondary }}>La IA esta analizando tu historial de compras...</p>
          </div>
        )}

        {/* Sugerencia disponible */}
        <AnimatePresence>
          {suggestion && cart.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Resumen de IA */}
              <div
                className="p-4 rounded-xl border-l-4"
                style={{
                  backgroundColor: themeColors.primary + "10",
                  borderColor: themeColors.primary,
                }}
              >
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: themeColors.primary }} />
                  <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                    {suggestion.summary}
                  </p>
                </div>
              </div>

              {/* Grid: tabla + resumen */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Tabla de productos */}
                <div className="lg:col-span-2">
                  <div
                    className="rounded-2xl border overflow-hidden shadow-lg"
                    style={{
                      backgroundColor: themeColors.surface + "70",
                      borderColor: themeColors.primary + "30",
                    }}
                  >
                    <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: themeColors.primary + "20" }}>
                      <h2 className="font-bold" style={{ color: themeColors.text.primary }}>
                        Productos sugeridos ({cart.length})
                      </h2>
                    </div>

                    <div className="divide-y" style={{ borderColor: themeColors.primary + "10" }}>
                      {cart.map((item) => {
                        const conf = confidenceConfig[item.confidence] || confidenceConfig.medium;
                        return (
                          <motion.div
                            key={item.productId}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-4 flex flex-col sm:flex-row sm:items-start gap-4"
                          >
                            {/* Info producto */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-2 flex-wrap">
                                <span className="font-semibold text-sm" style={{ color: themeColors.text.primary }}>
                                  {item.productName}
                                </span>
                                <span
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                                  style={{ backgroundColor: conf.bgColor, color: conf.color }}
                                >
                                  {conf.label}
                                </span>
                              </div>
                              {item.sku && (
                                <span className="text-xs font-mono" style={{ color: themeColors.text.secondary }}>
                                  SKU: {item.sku}
                                </span>
                              )}
                              {/* Razon */}
                              <div className="flex items-start gap-1 mt-2">
                                <Sparkles className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: themeColors.primary }} />
                                <p className="text-xs" style={{ color: themeColors.text.secondary }}>
                                  {item.reason}
                                </p>
                              </div>
                            </div>

                            {/* Cantidad + precio */}
                            <div className="flex items-center gap-4 flex-shrink-0">
                              {/* Controles de cantidad */}
                              <div
                                className="flex items-center gap-2 rounded-xl border px-2 py-1"
                                style={{ borderColor: themeColors.primary + "30" }}
                              >
                                <button
                                  onClick={() => updateQuantity(item.productId, -1)}
                                  className="p-1 rounded-lg transition-colors"
                                  style={{ color: themeColors.primary }}
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-6 text-center text-sm font-semibold" style={{ color: themeColors.text.primary }}>
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.productId, 1)}
                                  className="p-1 rounded-lg transition-colors"
                                  style={{ color: themeColors.primary }}
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Precio */}
                              <div className="text-right min-w-16">
                                <div className="text-sm font-bold" style={{ color: themeColors.text.primary }}>
                                  ${(item.unitPrice * item.quantity).toLocaleString("es-UY", { minimumFractionDigits: 2 })}
                                </div>
                                <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                                  ${item.unitPrice.toLocaleString("es-UY", { minimumFractionDigits: 2 })} c/u
                                </div>
                              </div>

                              {/* Quitar */}
                              <button
                                onClick={() => removeItem(item.productId)}
                                className="p-1.5 rounded-lg transition-colors hover:bg-red-50"
                                style={{ color: "#ef4444" }}
                                title="Quitar producto"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Resumen lateral */}
                <div className="lg:col-span-1">
                  <div
                    className="rounded-2xl border shadow-lg p-6 sticky top-6"
                    style={{
                      backgroundColor: themeColors.surface + "70",
                      borderColor: themeColors.primary + "30",
                    }}
                  >
                    <h2 className="font-bold mb-4" style={{ color: themeColors.text.primary }}>
                      Resumen del pedido
                    </h2>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span style={{ color: themeColors.text.secondary }}>Productos</span>
                        <span style={{ color: themeColors.text.primary }}>{cart.length} items</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: themeColors.text.secondary }}>Unidades totales</span>
                        <span style={{ color: themeColors.text.primary }}>{totalItems}</span>
                      </div>
                      <div
                        className="border-t pt-3 flex justify-between"
                        style={{ borderColor: themeColors.primary + "20" }}
                      >
                        <span className="font-bold" style={{ color: themeColors.text.primary }}>
                          Total estimado
                        </span>
                        <span className="font-bold text-lg" style={{ color: themeColors.primary }}>
                          ${totalAmount.toLocaleString("es-UY", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleConfirm}
                        disabled={isConfirming || cart.length === 0}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white shadow-md disabled:opacity-60 transition-all"
                        style={{
                          background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                        }}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {isConfirming ? "Procesando..." : "Confirmar pedido"}
                      </motion.button>

                      <button
                        onClick={handleDismiss}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium border transition-all"
                        style={{
                          borderColor: themeColors.primary + "30",
                          color: themeColors.text.secondary,
                        }}
                      >
                        <X className="w-4 h-4" />
                        Descartar sugerencia
                      </button>
                    </div>

                    <p className="text-xs mt-4 text-center" style={{ color: themeColors.text.secondary }}>
                      Podes modificar cantidades, agregar o quitar productos antes de confirmar.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function SmartCartPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    }>
      <SmartCartContent />
    </Suspense>
  );
}
