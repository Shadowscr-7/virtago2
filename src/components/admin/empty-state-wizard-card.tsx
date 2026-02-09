/**
 * Empty State para invitar al usuario a configurar el sistema por primera vez
 * Se muestra cuando el distribuidor no tiene datos cargados
 */

"use client";

import { motion } from "framer-motion";
import { 
  Sparkles, 
  Rocket, 
  Package, 
  Users, 
  DollarSign,
  ArrowRight,
  CheckCircle2,
  Circle,
  Zap
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/theme-context";
import { OnboardingStatus } from "@/services/onboarding.service";
import { useState, useEffect } from "react";

interface EmptyStateWizardCardProps {
  onboardingStatus: OnboardingStatus;
}

export function EmptyStateWizardCard({ onboardingStatus }: EmptyStateWizardCardProps) {
  const router = useRouter();
  const { themeColors } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  // Generar partículas solo en cliente
  const [particles, setParticles] = useState<Array<{
    id: number;
    left: number;
    top: number;
    delay: number;
  }>>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: i * 0.2,
      }))
    );
  }, []);

  const steps = [
    {
      icon: Package,
      title: "Importar Productos",
      description: "Carga tu catálogo completo",
      isComplete: onboardingStatus.details.products.hasData,
      count: onboardingStatus.details.products.count,
    },
    {
      icon: DollarSign,
      title: "Configurar Precios",
      description: "Define tus listas de precios",
      isComplete: onboardingStatus.details.priceLists.hasData,
      count: onboardingStatus.details.priceLists.count,
    },
    {
      icon: Users,
      title: "Registrar Clientes",
      description: "Agrega tus clientes B2B",
      isComplete: onboardingStatus.details.clients.hasData,
      count: onboardingStatus.details.clients.count,
    },
  ];

  const handleStartWizard = () => {
    router.push("/admin/configuracion-rapida");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl shadow-2xl backdrop-blur-xl border-2"
      style={{
        background: `linear-gradient(135deg, 
          ${themeColors.surface}95 0%, 
          ${themeColors.primary}15 50%, 
          ${themeColors.secondary}15 100%)`,
        borderColor: `${themeColors.primary}30`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Partículas flotantes de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              background: `linear-gradient(45deg, ${themeColors.primary}, ${themeColors.secondary})`,
            }}
            animate={{
              y: [-20, -60, -20],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Brillo animado en hover */}
      <motion.div
        className="absolute inset-0 opacity-0 pointer-events-none"
        animate={{ opacity: isHovered ? 0.1 : 0 }}
        style={{
          background: `radial-gradient(circle at 50% 50%, ${themeColors.primary}, transparent 70%)`,
        }}
      />

      <div className="relative p-8 md:p-12">
        {/* Header con icono */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 relative"
            style={{
              background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
            }}
            animate={{
              scale: isHovered ? 1.1 : 1,
              rotate: isHovered ? 5 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            <Rocket className="w-12 h-12 text-white" />
            
            {/* Sparkles animados */}
            <motion.div
              className="absolute -top-2 -right-2"
              animate={{
                rotate: [0, 180, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Sparkles 
                className="w-6 h-6" 
                style={{ color: themeColors.accent }}
              />
            </motion.div>

            <motion.div
              className="absolute -bottom-1 -left-1"
              animate={{
                rotate: [360, 180, 0],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Zap 
                className="w-5 h-5" 
                style={{ color: themeColors.secondary }}
              />
            </motion.div>
          </motion.div>

          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
            }}
            animate={{
              backgroundPosition: isHovered ? ["0%", "100%"] : "0%",
            }}
          >
            ¡Bienvenido a Virtago!
          </motion.h2>

          <p
            className="text-lg md:text-xl mb-2"
            style={{ color: themeColors.text.primary }}
          >
            Estás a <span className="font-bold">3 pasos</span> de comenzar a operar
          </p>
          
          <p
            className="text-sm md:text-base"
            style={{ color: themeColors.text.secondary }}
          >
            Usa nuestro asistente inteligente para configurar todo en minutos
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span
              className="text-sm font-medium"
              style={{ color: themeColors.text.secondary }}
            >
              Progreso de configuración
            </span>
            <span
              className="text-sm font-bold"
              style={{ color: themeColors.primary }}
            >
              {onboardingStatus.completionPercentage}%
            </span>
          </div>
          
          <div
            className="h-3 rounded-full overflow-hidden"
            style={{ backgroundColor: `${themeColors.surface}60` }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${themeColors.primary}, ${themeColors.secondary})`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${onboardingStatus.completionPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
              className="relative p-4 rounded-xl backdrop-blur-sm border"
              style={{
                backgroundColor: step.isComplete
                  ? `${themeColors.primary}15`
                  : `${themeColors.surface}40`,
                borderColor: step.isComplete
                  ? `${themeColors.primary}40`
                  : `${themeColors.surface}60`,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    background: step.isComplete
                      ? `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`
                      : `${themeColors.surface}80`,
                  }}
                >
                  <step.icon
                    className="w-5 h-5"
                    style={{
                      color: step.isComplete ? "white" : themeColors.text.secondary,
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className="text-sm font-semibold"
                      style={{ color: themeColors.text.primary }}
                    >
                      {step.title}
                    </h3>
                    {step.isComplete ? (
                      <CheckCircle2
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: themeColors.primary }}
                      />
                    ) : (
                      <Circle
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: themeColors.text.secondary }}
                      />
                    )}
                  </div>
                  
                  <p
                    className="text-xs mb-1"
                    style={{ color: themeColors.text.secondary }}
                  >
                    {step.description}
                  </p>
                  
                  {step.count > 0 && (
                    <span
                      className="text-xs font-medium"
                      style={{ color: themeColors.primary }}
                    >
                      {step.count} registrados
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <motion.button
            onClick={handleStartWizard}
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg text-white overflow-hidden shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {/* Brillo animado en el botón */}
            <motion.div
              className="absolute inset-0 bg-white"
              initial={{ x: "-100%", opacity: 0 }}
              whileHover={{ x: "100%", opacity: 0.2 }}
              transition={{ duration: 0.6 }}
            />

            <span className="relative z-10">
              {onboardingStatus.completionPercentage > 0
                ? "Continuar Configuración"
                : "Comenzar Ahora"}
            </span>
            
            <motion.div
              className="relative z-10"
              animate={{ x: isHovered ? 5 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ArrowRight className="w-6 h-6" />
            </motion.div>
          </motion.button>

          <p
            className="mt-4 text-sm"
            style={{ color: themeColors.text.secondary }}
          >
            ⚡ Configuración guiada paso a paso • Solo toma 5-10 minutos
          </p>
        </div>

        {/* Next Steps Hints */}
        {onboardingStatus.nextSteps.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 pt-6 border-t"
            style={{ borderColor: `${themeColors.primary}20` }}
          >
            <p
              className="text-sm font-medium mb-3"
              style={{ color: themeColors.text.secondary }}
            >
              Próximos pasos sugeridos:
            </p>
            <ul className="space-y-2">
              {onboardingStatus.nextSteps.map((step, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-2 text-sm"
                  style={{ color: themeColors.text.primary }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: themeColors.primary }}
                  />
                  {step}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
