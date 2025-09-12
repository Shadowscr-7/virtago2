"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, ArrowRight, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";

interface OTPVerificationProps {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
}

export function OTPVerification({
  email,
  onBack,
  onSuccess,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutos en segundos
  const [canResend, setCanResend] = useState(false);

  const { verifyOTP, resendOTP, isLoading } = useAuthStore();

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Formatear tiempo restante
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Calcular progreso del timer
  const progress = ((1800 - timeLeft) / 1800) * 100;

  // Manejar cambio en input OTP
  const handleOTPChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Enfocar siguiente input
    if (element.value !== "" && element.nextSibling) {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  // Manejar teclas especiales
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && e.currentTarget.previousSibling) {
        (e.currentTarget.previousSibling as HTMLInputElement).focus();
      }
      setOtp([...otp.map((d, idx) => (idx === index ? "" : d))]);
    }
  };

  // Pegar código OTP
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text");
    const pasteArray = pasteData
      .slice(0, 6)
      .split("")
      .filter((char) => !isNaN(Number(char)));

    if (pasteArray.length === 6) {
      setOtp(pasteArray);
      // Enfocar último input
      const inputs = document.querySelectorAll(".otp-input");
      (inputs[5] as HTMLInputElement).focus();
    }
  };

  // Verificar OTP
  const handleVerifyOTP = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) return;

    try {
      await verifyOTP(otpCode);
      onSuccess();
    } catch (error) {
      console.error("Error verifying OTP:", error);
      // Reset OTP en caso de error
      setOtp(new Array(6).fill(""));
      const firstInput = document.querySelector(
        ".otp-input",
      ) as HTMLInputElement;
      firstInput?.focus();
    }
  };

  // Reenviar OTP
  const handleResendOTP = async () => {
    try {
      await resendOTP();
      setTimeLeft(1800); // Reset timer
      setCanResend(false);
      setOtp(new Array(6).fill("")); // Reset OTP
    } catch (error) {
      console.error("Error resending OTP:", error);
    }
  };

  const isOTPComplete = otp.every((digit) => digit !== "");

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.6 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-6 left-6 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </motion.button>

          <motion.div
            initial={{ scale: 0.5, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500" />
              <div className="absolute inset-2 rounded-full bg-slate-900 flex items-center justify-center">
                <Mail className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-3xl font-bold text-white mb-2"
          >
            Verificar Email
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-white/70 text-center"
          >
            Hemos enviado un código de 6 dígitos a
            <br />
            <span className="text-white font-medium">{email}</span>
          </motion.p>
        </div>

        {/* Timer circular */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="relative w-24 h-24 mx-auto mb-8"
        >
          {/* Círculo de fondo */}
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="10"
              fill="none"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              stroke={
                timeLeft > 300
                  ? "#10B981"
                  : timeLeft > 60
                    ? "#F59E0B"
                    : "#EF4444"
              }
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={283}
              strokeDashoffset={283 - (progress / 100) * 283}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Tiempo restante */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={cn(
                "text-sm font-bold transition-colors",
                timeLeft > 300
                  ? "text-green-400"
                  : timeLeft > 60
                    ? "text-yellow-400"
                    : "text-red-400",
              )}
            >
              {formatTime(timeLeft)}
            </span>
          </div>
        </motion.div>

        {/* Inputs OTP */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex justify-center gap-3" onPaste={handlePaste}>
            {otp.map((data, index) => (
              <motion.input
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
                className={cn(
                  "otp-input w-12 h-12 text-center text-xl font-bold",
                  "bg-white/10 border border-white/20 rounded-lg text-white",
                  "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                  "transition-all duration-200",
                  data && "bg-white/20 border-purple-500",
                )}
                type="text"
                maxLength={1}
                value={data}
                onChange={(e) => handleOTPChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onFocus={(e) => e.target.select()}
              />
            ))}
          </div>
        </motion.div>

        {/* Botones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="space-y-4"
        >
          {/* Botón verificar */}
          <button
            onClick={handleVerifyOTP}
            disabled={!isOTPComplete || isLoading}
            className={cn(
              "w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300",
              "bg-gradient-to-r from-green-500 via-blue-500 to-purple-500",
              "hover:from-green-600 hover:via-blue-600 hover:to-purple-600",
              "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent",
              "disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
              (!isOTPComplete || isLoading) && "animate-pulse",
            )}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                Verificar código
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>

          {/* Botón reenviar */}
          {canResend ? (
            <button
              onClick={handleResendOTP}
              className="w-full py-3 px-6 rounded-lg font-semibold text-white/70 border border-white/20 hover:text-white hover:border-white/40 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-5 w-5" />
              Reenviar código
            </button>
          ) : (
            <p className="text-center text-white/50 text-sm">
              Podrás solicitar un nuevo código en {formatTime(timeLeft)}
            </p>
          )}
        </motion.div>

        {/* Instrucciones */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10"
        >
          <h4 className="text-white/90 font-medium mb-2">Instrucciones:</h4>
          <ul className="text-white/70 text-sm space-y-1">
            <li>• Revisa tu bandeja de entrada y spam</li>
            <li>• El código expira en 30 minutos</li>
            <li>• Puedes pegar el código completo</li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}
