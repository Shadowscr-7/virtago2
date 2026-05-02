"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ArrowRight } from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useTheme } from "@/contexts/theme-context";
import { useAuthStore } from "@/store/auth";
import { changePlan } from "@/services/superadmin.service";

const PLANS = [
  {
    id: "starter",
    name: "STARTER",
    displayName: "Starter",
    price: 9,
    commissionRate: "1%",
    features: [
      "Hasta 500 productos",
      "Hasta 100 clientes",
      "Soporte por email",
      "Comision por transaccion: 1%",
    ],
    color: "#6b7280",
  },
  {
    id: "pro",
    name: "PRO",
    displayName: "Pro",
    price: 29,
    commissionRate: "0.75%",
    features: [
      "Hasta 2,000 productos",
      "Hasta 500 clientes",
      "Soporte prioritario",
      "Comision por transaccion: 0.75%",
      "Smart Cart IA",
    ],
    color: "#C8102E",
    recommended: true,
  },
  {
    id: "enterprise",
    name: "ENTERPRISE",
    displayName: "Enterprise",
    price: 49,
    commissionRate: "0.5%",
    features: [
      "Productos ilimitados",
      "Clientes ilimitados",
      "Soporte 24/7 dedicado",
      "Comision por transaccion: 0.5%",
      "Smart Cart IA avanzado",
      "API personalizada",
    ],
    color: "#7c3aed",
  },
];

export default function MiPlan() {
  const { themeColors } = useTheme();
  const { user, setUser } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ amount: number; creditAmount: number; note: string } | null>(null);

  const currentPlan = user?.plan;

  const handleSelectPlan = (plan: typeof PLANS[0]) => {
    if (plan.name === currentPlan?.name?.toUpperCase()) return;
    setSelectedPlan(plan);
    setResult(null);
    setShowModal(true);
  };

  const handleConfirm = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    try {
      const res = await changePlan(selectedPlan.id);
      const data = res.data;
      setResult({
        amount: data.amount,
        creditAmount: data.creditAmount,
        note: data.note,
      });
      // Update user plan in store
      if (user) {
        setUser({
          ...user,
          plan: {
            id: selectedPlan.id,
            name: selectedPlan.name,
            displayName: selectedPlan.displayName,
            price: selectedPlan.price,
            currency: "USD",
            billingCycle: "monthly",
          },
        });
      }
    } catch (e: any) {
      alert(e.message || "Error al cambiar de plan");
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: themeColors.text.primary }}>
            Mi Plan
          </h1>
          <p className="mt-1 text-sm" style={{ color: themeColors.text.secondary }}>
            Plan actual y opciones de cambio
          </p>
        </motion.div>

        {/* Current plan banner */}
        {currentPlan && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 p-4 rounded-2xl border flex items-center gap-4"
            style={{ borderColor: themeColors.primary + "40", backgroundColor: themeColors.primary + "08" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs"
              style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
            >
              {currentPlan.displayName?.charAt(0) || "?"}
            </div>
            <div>
              <p className="font-semibold" style={{ color: themeColors.text.primary }}>
                Plan actual: <span style={{ color: themeColors.primary }}>{currentPlan.displayName}</span>
              </p>
              <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                ${currentPlan.price}/mes — {currentPlan.billingCycle === "monthly" ? "Mensual" : currentPlan.billingCycle}
              </p>
            </div>
          </motion.div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => {
            const isCurrent = plan.name === currentPlan?.name?.toUpperCase() ||
              plan.displayName.toLowerCase() === currentPlan?.displayName?.toLowerCase();
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.1 }}
                className={`relative p-6 rounded-2xl border shadow-lg transition-all ${plan.recommended ? "ring-2" : ""}`}
                style={{
                  borderColor: isCurrent ? plan.color + "60" : themeColors.primary + "20",
                  backgroundColor: "#fff",
                  ...(plan.recommended ? { ringColor: plan.color } : {}),
                }}
              >
                {plan.recommended && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: plan.color }}
                  >
                    Recomendado
                  </div>
                )}
                {isCurrent && (
                  <div
                    className="absolute -top-3 right-4 px-2 py-0.5 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: plan.color }}
                  >
                    Plan actual
                  </div>
                )}
                <div className="mb-4">
                  <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: plan.color }}>
                    {plan.name}
                  </div>
                  <div className="text-3xl font-bold" style={{ color: themeColors.text.primary }}>
                    ${plan.price}
                    <span className="text-base font-normal" style={{ color: themeColors.text.muted }}>/mes</span>
                  </div>
                  <div className="text-xs mt-1" style={{ color: themeColors.text.muted }}>
                    Comision: {plan.commissionRate} por transaccion
                  </div>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: themeColors.text.secondary }}>
                      <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: plan.color }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isCurrent}
                  className="w-full py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105 disabled:cursor-default disabled:opacity-50 flex items-center justify-center gap-2"
                  style={
                    isCurrent
                      ? { backgroundColor: plan.color + "20", color: plan.color }
                      : { background: `linear-gradient(135deg, ${plan.color}, ${plan.color}bb)`, color: "#fff" }
                  }
                >
                  {isCurrent ? "Plan actual" : <>Cambiar a {plan.displayName} <ArrowRight className="w-4 h-4" /></>}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showModal && selectedPlan && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
            >
              {result ? (
                // Success state
                <>
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: "#dcfce7" }}>
                      <Check className="w-6 h-6" style={{ color: "#15803d" }} />
                    </div>
                    <h3 className="text-lg font-bold" style={{ color: themeColors.text.primary }}>
                      Plan cambiado a {selectedPlan.displayName}
                    </h3>
                  </div>
                  <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: themeColors.surface }}>
                    <div className="space-y-2 text-sm">
                      {result.amount > 0 && (
                        <div className="flex justify-between">
                          <span style={{ color: themeColors.text.muted }}>Cargo generado:</span>
                          <span className="font-semibold" style={{ color: themeColors.primary }}>${result.amount.toFixed(2)}</span>
                        </div>
                      )}
                      {result.creditAmount > 0 && (
                        <div className="flex justify-between">
                          <span style={{ color: themeColors.text.muted }}>Credito generado:</span>
                          <span className="font-semibold" style={{ color: "#15803d" }}>${result.creditAmount.toFixed(2)}</span>
                        </div>
                      )}
                      {result.amount === 0 && result.creditAmount === 0 && (
                        <p style={{ color: themeColors.text.secondary }}>Sin cargo adicional este mes.</p>
                      )}
                    </div>
                    {result.note && <p className="mt-2 text-xs" style={{ color: themeColors.text.muted }}>{result.note}</p>}
                  </div>
                  <p className="text-xs text-center mb-4" style={{ color: themeColors.text.muted }}>
                    Se ha enviado un email de confirmacion a tu correo.
                  </p>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full py-2.5 rounded-xl text-sm font-medium text-white"
                    style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
                  >
                    Cerrar
                  </button>
                </>
              ) : (
                // Confirm state
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold" style={{ color: themeColors.text.primary }}>
                      Confirmar cambio de plan
                    </h3>
                    <button onClick={() => setShowModal(false)} style={{ color: themeColors.text.muted }}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: themeColors.surface }}>
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p style={{ color: themeColors.text.muted }}>Plan actual</p>
                        <p className="font-semibold" style={{ color: themeColors.text.primary }}>
                          {currentPlan?.displayName || "Sin plan"} — ${currentPlan?.price || 0}/mes
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5" style={{ color: themeColors.text.muted }} />
                      <div className="text-right">
                        <p style={{ color: themeColors.text.muted }}>Nuevo plan</p>
                        <p className="font-semibold" style={{ color: selectedPlan.color }}>
                          {selectedPlan.displayName} — ${selectedPlan.price}/mes
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs mb-4" style={{ color: themeColors.text.secondary }}>
                    El cambio sera efectivo inmediatamente. Se generara una factura o credito segun la logica de prorreo del mes en curso.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 py-2.5 rounded-xl border text-sm font-medium"
                      style={{ borderColor: themeColors.border, color: themeColors.text.secondary }}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={loading}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50"
                      style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
                    >
                      {loading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                      ) : (
                        "Confirmar cambio"
                      )}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
