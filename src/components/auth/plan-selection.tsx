"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Crown,
  Star,
  Zap,
  Users,
  Package,
  BarChart,
  Clock,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/theme-context";
import { api, Plan } from "@/api";
import { showToast } from "@/store/toast-helpers";
import { useAuthStore } from "@/store/auth";

interface PlanSelectionProps {
  onPlanSelected: (plan: Plan) => void;
  onBack?: () => void;
}

export function PlanSelection({ onPlanSelected, onBack }: PlanSelectionProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);
  const { themeColors } = useTheme();
  const { selectPlan } = useAuthStore();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await api.plans.getPlans();
      setPlans(response.data.data.sort((a, b) => a.order - b.order));
      
      // Seleccionar plan por defecto
      const defaultPlan = response.data.data.find(plan => plan.isDefault);
      if (defaultPlan) {
        setSelectedPlan(defaultPlan);
      }
    } catch (error) {
      console.error("Error loading plans:", error);
      showToast({
        title: "Error",
        description: "No se pudieron cargar los planes. Inténtalo de nuevo.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  const handleContinue = async () => {
    if (!selectedPlan) return;

    console.log("🔵 Iniciando creación de distribuidor...");
    setIsSelecting(true);
    try {
      console.log("🔵 Llamando a selectPlan con:", selectedPlan.displayName);
      // Usar la función del store que crea el distribuidor completo con toda la información del plan
      await selectPlan(selectedPlan);
      
      console.log("✅ selectPlan completado exitosamente, redirigiendo...");
      // Solo redirigir si la creación del distribuidor fue exitosa
      onPlanSelected(selectedPlan);
    } catch (error) {
      console.error("❌ Error creating distributor:", error);
      console.log("❌ NO redirigiendo debido al error");
      showToast({
        title: "Error",
        description: "No se pudo completar el registro. Inténtalo de nuevo.",
        type: "error",
      });
      // NO llamar onPlanSelected aquí para evitar redirección en caso de error
    } finally {
      console.log("🔵 Finalizando handleContinue, isSelecting = false");
      setIsSelecting(false);
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "free":
        return <Star className="h-8 w-8" />;
      case "gold":
        return <Crown className="h-8 w-8" />;
      case "platinum":
        return <Zap className="h-8 w-8" />;
      default:
        return <Package className="h-8 w-8" />;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case "free":
        return {
          gradient: "from-gray-500 to-gray-600",
          border: "border-gray-400",
          bg: "bg-gray-500/20",
          text: "text-gray-300",
        };
      case "gold":
        return {
          gradient: "from-yellow-500 to-orange-500",
          border: "border-yellow-400",
          bg: "bg-yellow-500/20",
          text: "text-yellow-300",
        };
      case "platinum":
        return {
          gradient: "from-purple-500 to-pink-500",
          border: "border-purple-400",
          bg: "bg-purple-500/20",
          text: "text-purple-300",
        };
      default:
        return {
          gradient: "from-blue-500 to-cyan-500",
          border: "border-blue-400",
          bg: "bg-blue-500/20",
          text: "text-blue-300",
        };
    }
  };

  const formatLimit = (limit: number) => {
    if (limit === -1) return "Ilimitado";
    if (limit >= 1000) return `${(limit / 1000).toFixed(0)}K`;
    return limit.toString();
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "Gratis";
    return `$${price.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-current border-t-transparent rounded-full animate-spin"
               style={{ color: themeColors.primary }} />
          <p style={{ color: themeColors.text.secondary }}>Cargando planes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "#ffffff",
          boxShadow: `0 20px 60px ${themeColors.primary}20, 0 4px 20px rgba(0,0,0,0.08)`,
          border: `1px solid ${themeColors.border}`,
        }}
      >
        {/* Header con gradiente */}
        <div
          className="px-8 pt-8 pb-6 text-white text-center"
          style={{
            background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
          }}
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-white">Elige tu Plan</h1>
              <p className="text-white/80 text-sm">Podrás cambiar tu plan en cualquier momento</p>
            </div>
          </div>
        </div>

        <div className="p-8">

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan, index) => {
            const colors = getPlanColor(plan.name);
            const isSelected = selectedPlan?.id === plan.id;
            const isPopular = plan.name.toLowerCase() === "gold";

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.08, duration: 0.5 }}
                className="relative rounded-2xl border-2 p-6 cursor-pointer transition-all duration-300"
                style={{
                  borderColor: isSelected ? themeColors.primary : themeColors.border,
                  backgroundColor: isSelected ? `${themeColors.primary}08` : themeColors.surface,
                  boxShadow: isSelected ? `0 0 0 3px ${themeColors.primary}20` : "none",
                  ...(isPopular && !isSelected && { borderColor: "#f59e0b" }),
                }}
                onClick={() => handlePlanSelect(plan)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Más Popular
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div
                    className="w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${themeColors.primary}15` }}
                  >
                    <div style={{ color: themeColors.primary }}>
                      {getPlanIcon(plan.name)}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold mb-2" style={{ color: themeColors.text.primary }}>
                    {plan.displayName}
                  </h3>

                  <p className="text-sm mb-4" style={{ color: themeColors.text.secondary }}>
                    {plan.description}
                  </p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold" style={{ color: themeColors.text.primary }}>
                      {formatPrice(plan.price)}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-sm ml-2" style={{ color: themeColors.text.secondary }}>
                        /{plan.billingCycle === 'monthly' ? 'mes' : 'año'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Key Limits */}
                <div className="grid grid-cols-2 gap-3 mb-5 p-3 rounded-xl"
                     style={{ backgroundColor: "#ffffff", border: `1px solid ${themeColors.border}` }}>
                  <div className="text-center">
                    <Users className="h-5 w-5 mx-auto mb-1" style={{ color: themeColors.primary }} />
                    <div className="text-sm font-semibold" style={{ color: themeColors.text.primary }}>
                      {formatLimit(plan.limits.clients)}
                    </div>
                    <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                      Clientes
                    </div>
                  </div>
                  <div className="text-center">
                    <Package className="h-5 w-5 mx-auto mb-1" style={{ color: themeColors.primary }} />
                    <div className="text-sm font-semibold" style={{ color: themeColors.text.primary }}>
                      {formatLimit(plan.limits.products)}
                    </div>
                    <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                      Productos
                    </div>
                  </div>
                  <div className="text-center">
                    <BarChart className="h-5 w-5 mx-auto mb-1" style={{ color: themeColors.primary }} />
                    <div className="text-sm font-semibold" style={{ color: themeColors.text.primary }}>
                      {formatLimit(plan.limits.storage)} MB
                    </div>
                    <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                      Almacenamiento
                    </div>
                  </div>
                  <div className="text-center">
                    {plan.aiSupport ? (
                      <Zap className="h-5 w-5 mx-auto mb-1" style={{ color: themeColors.accent }} />
                    ) : (
                      <Clock className="h-5 w-5 mx-auto mb-1" style={{ color: themeColors.text.secondary }} />
                    )}
                    <div className="text-sm font-semibold" style={{ color: themeColors.text.primary }}>
                      {plan.aiSupport ? formatLimit(plan.limits.aiRequests) : "No"}
                    </div>
                    <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                      IA
                    </div>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  {plan.features.slice(0, 6).map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <Check className="h-5 w-5 mt-0.5 flex-shrink-0" 
                            style={{ color: themeColors.accent }} />
                      <span className="text-sm" style={{ color: themeColors.text.secondary }}>
                        {feature}
                      </span>
                    </div>
                  ))}
                  {plan.features.length > 6 && (
                    <div className="text-sm font-medium" style={{ color: themeColors.primary }}>
                      +{plan.features.length - 6} características más
                    </div>
                  )}
                </div>

                {/* Support Level */}
                <div
                  className="flex items-center justify-center gap-2 p-2.5 rounded-lg"
                  style={{ backgroundColor: themeColors.surface }}
                >
                  <Shield className="h-4 w-4" style={{ color: themeColors.primary }} />
                  <span className="text-sm font-medium" style={{ color: themeColors.text.primary }}>
                    Soporte {plan.supportLevel === 'community' ? 'Comunidad' : 
                             plan.supportLevel === 'priority' ? 'Prioritario' : 'Dedicado 24/7'}
                  </span>
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center"
                         style={{ backgroundColor: themeColors.accent }}>
                      <Check className="h-5 w-5 text-white" />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex items-center justify-between gap-4"
        >
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 border-2"
              style={{
                borderColor: themeColors.border,
                color: themeColors.text.secondary,
                backgroundColor: "#ffffff",
              }}
            >
              Volver
            </button>
          )}

          <button
            onClick={handleContinue}
            disabled={!selectedPlan || isSelecting}
            className="flex-1 max-w-md ml-auto py-3 px-6 rounded-lg font-semibold text-white text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
              boxShadow: `0 4px 14px ${themeColors.primary}40`,
            }}
          >
            {isSelecting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creando distribuidor...
              </>
            ) : (
              <>
                Completar con {selectedPlan?.displayName}
                <Crown className="h-4 w-4" />
              </>
            )}
          </button>
        </motion.div>

        {/* Progreso */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-6 p-4 rounded-xl"
          style={{
            backgroundColor: themeColors.surface,
            border: `1px solid ${themeColors.border}`,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: themeColors.text.secondary }}>
              Progreso del registro
            </span>
            <span className="text-sm font-medium" style={{ color: themeColors.text.primary }}>
              86%
            </span>
          </div>
          <div className="w-full rounded-full h-1.5" style={{ backgroundColor: themeColors.border }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "86%" }}
              transition={{ delay: 0.6, duration: 1 }}
              className="h-1.5 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${themeColors.primary}, ${themeColors.secondary})`,
              }}
            />
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-center text-xs"
          style={{ color: themeColors.text.muted }}
        >
          Puedes cambiar tu plan en cualquier momento desde la configuración de tu cuenta.
        </motion.p>
        </div>
      </motion.div>
    </div>
  );
}