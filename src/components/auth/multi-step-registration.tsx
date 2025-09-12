"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/auth";
import { RegisterForm } from "./register-form";
import { OTPVerification } from "./otp-verification";
import { UserTypeSelection } from "./user-type-selection";
import { PersonalInfoForm } from "./personal-info-form";
import { BusinessInfoForm } from "./business-info-form";
import { RegistrationSuccess } from "./registration-success";

export function MultiStepRegistration() {
  const { registrationStep, registrationData, resetRegistration } =
    useAuthStore();
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Partículas de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      {/* Indicador de progreso */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 bg-white/10 backdrop-blur-lg rounded-full px-6 py-3 border border-white/20"
        >
          {[
            "initial",
            "otp",
            "userType",
            "personalInfo",
            "businessInfo",
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
                "completed",
              ].indexOf(registrationStep) > index;

            return (
              <motion.div
                key={step}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 scale-125"
                    : isCompleted
                      ? "bg-green-500"
                      : "bg-white/30"
                }`}
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
      </div>

      {/* Información adicional en el footer */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-white/50 text-sm"
        >
          <p>
            ¿Necesitas ayuda? Contacta a soporte en{" "}
            <a
              href="mailto:soporte@virtago.com"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              soporte@virtago.com
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
