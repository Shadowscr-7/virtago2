/**
 * Empty state para invitar al usuario a configurar el sistema por primera vez.
 * Se muestra cuando el distribuidor no tiene datos cargados.
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  DollarSign,
  Package,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/theme-context";
import { useAuthStore } from "@/store/auth";
import { OnboardingStatus } from "@/services/onboarding.service";

interface EmptyStateWizardCardProps {
  onboardingStatus: OnboardingStatus;
}

export function EmptyStateWizardCard({ onboardingStatus }: EmptyStateWizardCardProps) {
  const router = useRouter();
  const { themeColors } = useTheme();
  const { user } = useAuthStore();
  const [isHovered, setIsHovered] = useState(false);
  const userName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Usuario";

  const steps = [
    {
      icon: Package,
      title: "Importar Productos",
      description: "Carga tu catalogo completo",
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
      className="relative overflow-hidden rounded-3xl border bg-white shadow-xl"
      style={{ borderColor: `${themeColors.primary}30` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative p-8 md:p-12">
        <div className="mb-8 grid gap-6 md:grid-cols-[1fr_220px] md:items-center">
          <div>
            <h2
              className="mb-3 text-3xl font-bold md:text-4xl"
              style={{ color: themeColors.primary }}
            >
              {userName} ya estas en Virtago. Deja que Kairos te asista en esta instancia.
            </h2>
            <p
              className="text-base md:text-lg"
              style={{ color: themeColors.text.secondary }}
            >
              Inicia nuestra carga asistida de informacion directo de tu RP.
            </p>
          </div>

          <div className="flex min-h-64 items-center justify-center">
            <Image
              src="/images/asist.png"
              alt="Kairos"
              width={180}
              height={260}
              className="h-64 w-auto object-contain"
              priority
            />
          </div>
        </div>

        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <span
              className="text-sm font-medium"
              style={{ color: themeColors.text.secondary }}
            >
              Progreso de configuracion
            </span>
            <span
              className="text-sm font-bold"
              style={{ color: themeColors.primary }}
            >
              {onboardingStatus.completionPercentage}%
            </span>
          </div>

          <div
            className="h-3 overflow-hidden rounded-full"
            style={{ backgroundColor: `${themeColors.surface}60` }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: themeColors.primary }}
              initial={{ width: 0 }}
              animate={{ width: `${onboardingStatus.completionPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
              className="relative rounded-xl border bg-white p-4"
              style={{
                borderColor: step.isComplete
                  ? `${themeColors.primary}40`
                  : themeColors.border,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: step.isComplete ? themeColors.primary : "#ffffff",
                    border: step.isComplete ? "none" : `1px solid ${themeColors.border}`,
                  }}
                >
                  <step.icon
                    className="h-5 w-5"
                    style={{
                      color: step.isComplete ? "#ffffff" : themeColors.text.secondary,
                    }}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h3
                      className="text-sm font-semibold"
                      style={{ color: themeColors.text.primary }}
                    >
                      {step.title}
                    </h3>
                    {step.isComplete ? (
                      <CheckCircle2
                        className="h-4 w-4 flex-shrink-0"
                        style={{ color: themeColors.primary }}
                      />
                    ) : (
                      <Circle
                        className="h-4 w-4 flex-shrink-0"
                        style={{ color: themeColors.text.secondary }}
                      />
                    )}
                  </div>

                  <p
                    className="mb-1 text-xs"
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

        <div className="text-center">
          <motion.button
            onClick={handleStartWizard}
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-xl px-8 py-4 text-lg font-bold text-white shadow-lg"
            style={{ backgroundColor: themeColors.primary }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <span className="relative z-10">
              {onboardingStatus.completionPercentage > 0
                ? "Continuar Configuracion"
                : "Comenzar Ahora"}
            </span>

            <motion.div
              className="relative z-10"
              animate={{ x: isHovered ? 5 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ArrowRight className="h-6 w-6" />
            </motion.div>
          </motion.button>

          <p
            className="mt-4 text-sm"
            style={{ color: themeColors.text.secondary }}
          >
            Configuracion guiada paso a paso. Solo toma 5-10 minutos.
          </p>
        </div>

        {onboardingStatus.nextSteps.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 border-t pt-6"
            style={{ borderColor: `${themeColors.primary}20` }}
          >
            <p
              className="mb-3 text-sm font-medium"
              style={{ color: themeColors.text.secondary }}
            >
              Proximos pasos sugeridos:
            </p>
            <ul className="space-y-2">
              {onboardingStatus.nextSteps.map((step, index) => (
                <motion.li
                  key={step}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-2 text-sm"
                  style={{ color: themeColors.text.primary }}
                >
                  <div
                    className="h-1.5 w-1.5 rounded-full"
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
