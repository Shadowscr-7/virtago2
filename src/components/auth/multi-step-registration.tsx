"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/auth";
import { useTheme } from "@/contexts/theme-context";
import { RegisterForm } from "./register-form";
import { OTPVerification } from "./otp-verification";
import { UserTypeSelection } from "./user-type-selection";
import { PersonalInfoForm } from "./personal-info-form";
import { BusinessInfoForm } from "./business-info-form";
import { PlanSelection } from "./plan-selection";
import { RegistrationSuccess } from "./registration-success";

export function MultiStepRegistration() {
  const { registrationStep, registrationData, resetRegistration } =
    useAuthStore();
  const { themeColors } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevent hydration issues
  }

  const renderStep = () => {
    switch (registrationStep) {
      case "initial":
        return (
          <RegisterForm
            key="register"
            onSuccess={() => {
              // El store maneja el cambio de paso automáticamente
            }}
          />
        );

      case "otp":
        return (
          <OTPVerification
            key="otp"
            email={registrationData?.email || ""}
            onBack={() => resetRegistration()}
            onSuccess={() => {
              // El store maneja el cambio de paso automáticamente
            }}
          />
        );

      case "userType":
        return (
          <UserTypeSelection
            key="userType"
            onBack={() => resetRegistration()}
            onSuccess={() => {
              // El store maneja el cambio de paso automáticamente
            }}
          />
        );

      case "personalInfo":
        return (
          <PersonalInfoForm
            key="personalInfo"
            onBack={() => resetRegistration()}
            onSuccess={() => {
              // El store maneja el cambio de paso automáticamente
            }}
          />
        );

      case "businessInfo":
        return (
          <BusinessInfoForm
            key="businessInfo"
            onBack={() => resetRegistration()}
            onSuccess={() => {
              // El store maneja el cambio de paso automáticamente
            }}
          />
        );

      case "planSelection":
        return (
          <PlanSelection
            key="planSelection"
            onBack={() => resetRegistration()}
            onPlanSelected={() => {
              // NO llamar selectPlan aquí - ya se maneja en el componente PlanSelection
              // Solo proceder al siguiente paso si llegamos aquí (significa que selectPlan fue exitoso)
              console.log("✅ Plan seleccionado exitosamente, continuando al siguiente paso...");
            }}
          />
        );

      case "completed":
        return <RegistrationSuccess key="success" />;

      default:
        return (
          <RegisterForm
            key="register-default"
            onSuccess={() => {
              // El store maneja el cambio de paso automáticamente
            }}
          />
        );
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 pb-8 bg-white"
    >

      {/* Indicador de progreso */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 rounded-full px-6 py-3 border"
          style={{
            backgroundColor: "#ffffff",
            borderColor: themeColors.border,
            boxShadow: `0 2px 12px ${themeColors.primary}15`,
          }}
        >
          {[
            "initial",
            "otp",
            "userType",
            "personalInfo",
            "businessInfo",
            "planSelection",
            "completed",
          ].map((step, index) => {
            const isActive = registrationStep === step;
            const isCompleted =
              [
                "initial",
                "otp",
                "userType",
                "personalInfo",
                "businessInfo",
                "planSelection",
                "completed",
              ].indexOf(registrationStep) > index;

            return (
              <motion.div
                key={step}
                className="w-3 h-3 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: isActive
                    ? themeColors.primary
                    : isCompleted
                      ? themeColors.accent
                      : themeColors.border,
                }}
                animate={{
                  scale: isActive ? 1.25 : 1,
                }}
              />
            );
          })}
        </motion.div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 w-full">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
        
        {/* Información adicional en el footer */}
        <div className="mt-8 flex justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-sm"
            style={{ color: themeColors.text.secondary }}
          >
            <p>
              ¿Necesitas ayuda? Contacta a soporte en{" "}
              <a
                href="mailto:soporte@virtago.com"
                className="transition-colors"
                style={{
                  color: themeColors.primary,
                }}
              >
                soporte@virtago.com
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
