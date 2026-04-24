"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, ArrowRight, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { useTheme } from "@/contexts/theme-context";

interface OTPVerificationProps {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
}

export function OTPVerification({ email, onBack, onSuccess }: OTPVerificationProps) {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(1800);
  const [canResend, setCanResend] = useState(false);
  const { themeColors } = useTheme();
  const { verifyOTP, resendOTP, isLoading } = useAuthStore();

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const progress = ((1800 - timeLeft) / 1800) * 100;

  const handleOTPChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
    if (element.value !== "" && element.nextSibling) {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && e.currentTarget.previousSibling) {
        (e.currentTarget.previousSibling as HTMLInputElement).focus();
      }
      setOtp([...otp.map((d, idx) => (idx === index ? "" : d))]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text");
    const pasteArray = pasteData
      .slice(0, 6)
      .split("")
      .filter((char) => !isNaN(Number(char)));

    if (pasteArray.length === 6) {
      setOtp(pasteArray);
      const inputs = document.querySelectorAll(".otp-input");
      (inputs[5] as HTMLInputElement).focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) return;
    try {
      await verifyOTP(otpCode);
      onSuccess();
    } catch {
      setOtp(new Array(6).fill(""));
      const firstInput = document.querySelector(".otp-input") as HTMLInputElement;
      firstInput?.focus();
    }
  };

  const handleResendOTP = async () => {
    try {
      await resendOTP();
      setTimeLeft(1800);
      setCanResend(false);
      setOtp(new Array(6).fill(""));
    } catch {
      // error shown via toast
    }
  };

  const isOTPComplete = otp.every((digit) => digit !== "");

  const timerColor =
    timeLeft > 300 ? "#16a34a" : timeLeft > 60 ? "#d97706" : "#dc2626";

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "#ffffff",
          boxShadow: `0 20px 60px ${themeColors.primary}20, 0 4px 20px rgba(0,0,0,0.08)`,
          border: `1px solid ${themeColors.border}`,
        }}
      >
        {/* Header con gradiente */}
        <div
          className="px-8 pt-8 pb-6 text-white"
          style={{
            background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 text-white" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Verificar Email</h1>
                <p className="text-white/80 text-sm">Código de 6 dígitos</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-7">
          {/* Descripción */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-6"
          >
            <p className="text-sm" style={{ color: themeColors.text.secondary }}>
              Hemos enviado un código de 6 dígitos a
            </p>
            <p className="font-semibold mt-1" style={{ color: themeColors.text.primary }}>
              {email}
            </p>
          </motion.div>

          {/* Timer circular */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative w-20 h-20 mx-auto mb-6"
          >
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" stroke={themeColors.border} strokeWidth="8" fill="none" />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                stroke={timerColor}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={283}
                strokeDashoffset={283 - (progress / 100) * 283}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold" style={{ color: timerColor }}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </motion.div>

          {/* Inputs OTP */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-6"
          >
            <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
              {otp.map((data, index) => (
                <motion.input
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
                  className="otp-input w-11 h-12 text-center text-lg font-bold rounded-lg border-2 focus:outline-none transition-all duration-200"
                  style={{
                    backgroundColor: data ? `${themeColors.primary}10` : "#ffffff",
                    borderColor: data ? themeColors.primary : themeColors.border,
                    color: themeColors.text.primary,
                  }}
                  type="text"
                  maxLength={1}
                  value={data}
                  onChange={(e) => handleOTPChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onFocus={(e) => {
                    e.target.style.borderColor = themeColors.primary;
                    e.target.style.boxShadow = `0 0 0 3px ${themeColors.primary}20`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = data ? themeColors.primary : themeColors.border;
                    e.target.style.boxShadow = "none";
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Botones */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <button
              onClick={handleVerifyOTP}
              disabled={!isOTPComplete || isLoading}
              className="w-full py-3 px-6 rounded-lg font-semibold text-white text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                boxShadow: `0 4px 14px ${themeColors.primary}40`,
              }}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  Verificar código
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {canResend ? (
              <button
                onClick={handleResendOTP}
                className="w-full py-3 px-6 rounded-lg font-semibold text-sm border-2 transition-all duration-300 flex items-center justify-center gap-2"
                style={{
                  borderColor: themeColors.border,
                  color: themeColors.text.secondary,
                  backgroundColor: "#ffffff",
                }}
              >
                <RefreshCw className="h-4 w-4" />
                Reenviar código
              </button>
            ) : (
              <p className="text-center text-sm" style={{ color: themeColors.text.muted }}>
                Nuevo código disponible en {formatTime(timeLeft)}
              </p>
            )}
          </motion.div>

          {/* Instrucciones */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-5 p-4 rounded-xl"
            style={{
              backgroundColor: themeColors.surface,
              border: `1px solid ${themeColors.border}`,
            }}
          >
            <h4 className="text-sm font-semibold mb-2" style={{ color: themeColors.text.primary }}>
              Instrucciones:
            </h4>
            <ul className="text-sm space-y-1" style={{ color: themeColors.text.secondary }}>
              <li>• Revisa tu bandeja de entrada y spam</li>
              <li>• El código expira en 30 minutos</li>
              <li>• Puedes pegar el código completo</li>
            </ul>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
