"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Building2, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useTheme } from "@/contexts/theme-context";
import { StyledSwitch } from "@/components/ui/styled-switch";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const { login } = useAuthStore();
  const { themeColors } = useTheme();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch {
      // Errores mostrados vía toast desde el store
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `linear-gradient(135deg, ${themeColors.surface} 0%, #ffffff 40%, ${themeColors.primary}10 100%)`,
      }}
    >
      {/* Decoración de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: themeColors.primary }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: themeColors.secondary }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Botón de regreso */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:underline"
            style={{ color: themeColors.text.secondary }}
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </motion.div>

        {/* Card principal */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl overflow-hidden"
          style={{
            boxShadow: `0 20px 60px ${themeColors.primary}20, 0 4px 20px rgba(0,0,0,0.08)`,
            border: `1px solid ${themeColors.border}`,
            backgroundColor: "#ffffff",
          }}
        >
          {/* Header con color del tema */}
          <div
            className="px-8 pt-8 pb-6 text-white"
            style={{
              background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
            }}
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Iniciar Sesión</h1>
                <p className="text-white/80 text-sm">Accede a precios exclusivos B2B</p>
              </div>
            </div>
          </div>

          {/* Cuerpo del formulario */}
          <div className="px-8 py-7">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label
                  className="block text-sm font-semibold mb-1.5"
                  style={{ color: themeColors.text.primary }}
                >
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                    style={{ color: themeColors.text.muted }}
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@empresa.com"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border-2 text-sm transition-all duration-200 focus:outline-none bg-white"
                    style={{
                      borderColor: themeColors.border,
                      color: themeColors.text.primary,
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = themeColors.primary;
                      e.target.style.boxShadow = `0 0 0 3px ${themeColors.primary}20`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = themeColors.border;
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
              </motion.div>

              {/* Contraseña */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <label
                  className="block text-sm font-semibold mb-1.5"
                  style={{ color: themeColors.text.primary }}
                >
                  Contraseña
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                    style={{ color: themeColors.text.muted }}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 rounded-lg border-2 text-sm transition-all duration-200 focus:outline-none bg-white"
                    style={{
                      borderColor: themeColors.border,
                      color: themeColors.text.primary,
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = themeColors.primary;
                      e.target.style.boxShadow = `0 0 0 3px ${themeColors.primary}20`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = themeColors.border;
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: themeColors.text.muted }}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </motion.div>

              {/* Recordarme + olvidé contraseña */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-between"
              >
                <StyledSwitch
                  checked={rememberMe}
                  onChange={setRememberMe}
                  label="Recordarme"
                />
                <a
                  href="#"
                  className="text-sm font-medium transition-colors hover:underline"
                  style={{ color: themeColors.primary }}
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </motion.div>

              {/* Botón submit */}
              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 rounded-lg font-semibold text-white text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                  boxShadow: `0 4px 14px ${themeColors.primary}40`,
                }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Iniciando sesión...
                  </span>
                ) : (
                  "Iniciar Sesión"
                )}
              </motion.button>
            </form>

            {/* Divisor */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex-1 h-px" style={{ backgroundColor: themeColors.border }} />
              <span className="text-xs" style={{ color: themeColors.text.muted }}>o</span>
              <div className="flex-1 h-px" style={{ backgroundColor: themeColors.border }} />
            </div>

            {/* Registro */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-5 text-center"
            >
              <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                ¿No tienes cuenta?{" "}
                <Link
                  href="/register"
                  className="font-semibold transition-colors hover:underline"
                  style={{ color: themeColors.primary }}
                >
                  Regístrate aquí
                </Link>
              </p>
            </motion.div>

            {/* Badge B2B */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 }}
              className="mt-5 flex items-center justify-center gap-2 p-3 rounded-xl"
              style={{
                backgroundColor: themeColors.surface,
                border: `1px solid ${themeColors.border}`,
              }}
            >
              <Building2 className="h-4 w-4" style={{ color: themeColors.primary }} />
              <span className="text-sm font-medium" style={{ color: themeColors.text.secondary }}>
                Plataforma exclusiva para empresas
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
