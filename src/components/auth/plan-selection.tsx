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

    setIsSelecting(true);
    try {
      await api.plans.selectPlan(selectedPlan.id);
      
      showToast({
        title: "Plan seleccionado",
        description: `Has seleccionado el plan ${selectedPlan.displayName}`,
        type: "success",
      });

      onPlanSelected(selectedPlan);
    } catch (error) {
      console.error("Error selecting plan:", error);
      showToast({
        title: "Error",
        description: "No se pudo seleccionar el plan. Inténtalo de nuevo.",
        type: "error",
      });
    } finally {
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
        className="backdrop-blur-lg rounded-2xl border p-8 shadow-2xl"
        style={{
          backgroundColor: themeColors.surface + "40",
          borderColor: themeColors.primary + "30",
        }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.5, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-20 h-20 mx-auto mb-6"
          >
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary}, ${themeColors.accent})`,
                }}
              />
              <div
                className="absolute inset-2 rounded-full flex items-center justify-center"
                style={{ backgroundColor: themeColors.background }}
              >
                <Crown
                  className="h-8 w-8"
                  style={{ color: themeColors.primary }}
                />
              </div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl font-bold mb-4"
            style={{ color: themeColors.text.primary }}
          >
            Elige tu Plan
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl max-w-2xl mx-auto"
            style={{ color: themeColors.text.secondary }}
          >
            Selecciona el plan que mejor se adapte a las necesidades de tu negocio.
            Podrás cambiar o actualizar tu plan en cualquier momento.
          </motion.p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => {
            const colors = getPlanColor(plan.name);
            const isSelected = selectedPlan?.id === plan.id;
            const isPopular = plan.name.toLowerCase() === "gold";

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                className={cn(
                  "relative rounded-2xl border-2 p-8 cursor-pointer transition-all duration-300",
                  isSelected 
                    ? `${colors.border} ${colors.bg}` 
                    : "border-gray-600 hover:border-gray-500",
                  isPopular && "ring-2 ring-yellow-400 ring-opacity-50"
                )}
                style={{
                  backgroundColor: isSelected 
                    ? colors.bg 
                    : themeColors.surface + "30",
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
                <div className="text-center mb-8">
                  <div className={cn("w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center", colors.bg)}>
                    <div style={{ color: colors.text.replace('text-', '') }}>
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
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-lg" 
                     style={{ backgroundColor: themeColors.surface + "20" }}>
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
                <div className="flex items-center justify-center gap-2 p-3 rounded-lg"
                     style={{ backgroundColor: themeColors.surface + "10" }}>
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex items-center justify-between gap-4"
        >
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-lg font-semibold transition-all duration-300 border"
              style={{
                borderColor: themeColors.primary + "50",
                color: themeColors.text.secondary,
              }}
            >
              Volver
            </button>
          )}

          <button
            onClick={handleContinue}
            disabled={!selectedPlan || isSelecting}
            className={cn(
              "flex-1 max-w-md ml-auto py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300",
              "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent",
              "disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
              isSelecting && "animate-pulse"
            )}
            style={{
              background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
              boxShadow: `0 0 0 2px ${themeColors.primary}50`,
            }}
          >
            {isSelecting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Seleccionando plan...
              </>
            ) : (
              <>
                Continuar con {selectedPlan?.displayName}
                <Crown className="h-5 w-5" />
              </>
            )}
          </button>
        </motion.div>

        {/* Progreso */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-8 p-4 rounded-lg border"
          style={{ 
            backgroundColor: themeColors.surface + "20",
            borderColor: themeColors.primary + "30" 
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
          <div className="w-full rounded-full h-2" 
               style={{ backgroundColor: themeColors.surface + "40" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "86%" }}
              transition={{ delay: 1.2, duration: 1 }}
              className="h-2 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${themeColors.primary}, ${themeColors.accent})`
              }}
            />
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="mt-4 text-center p-4 rounded-lg"
          style={{ backgroundColor: themeColors.surface + "20" }}
        >
          <p className="text-sm" style={{ color: themeColors.text.secondary }}>
            🔄 Puedes cambiar tu plan en cualquier momento desde la configuración de tu cuenta.
            Los cambios se aplicarán en tu próximo ciclo de facturación.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}