"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowLeft,
  Building2,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/components/ui/toast";
import { setToastFunction } from "@/components/cart/cart-store";
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
  const { showToast } = useToast();
  const router = useRouter();

  // Estilos dinámicos para inputs
  const inputStyle = {
    backgroundColor: themeColors.surface + "40",
    borderColor: themeColors.primary + "30",
    color: themeColors.text.primary,
    transition: "all 0.3s ease",
  };

  const inputFocusStyle = {
    borderColor: themeColors.primary,
    boxShadow: `0 0 20px ${themeColors.primary}60, 0 0 0 2px ${themeColors.primary}80`,
    backgroundColor: themeColors.surface + "60",
  };

  const inputHoverStyle = {
    borderColor: themeColors.primary + "60",
    boxShadow: `0 0 10px ${themeColors.primary}40`,
  };

  // Set up toast function
  useEffect(() => {
    setToastFunction(showToast);
  }, [showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      showToast({
        title: "Campos requeridos",
        description: "Por favor completa email y contraseña",
        type: "warning",
      });
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        showToast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión exitosamente",
          type: "success",
        });
        router.push("/");
      } else {
        showToast({
          title: "Error de autenticación",
          description: "Email o contraseña incorrectos",
          type: "error",
        });
      }
    } catch {
      showToast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fillTestUser = (userType: "cliente" | "distribuidor") => {
    if (userType === "cliente") {
      setEmail("cliente@virtago.com");
    } else {
      setEmail("distribuidor@virtago.com");
    }
    setPassword("123456");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `linear-gradient(135deg, ${themeColors.background}, ${themeColors.primary}20, ${themeColors.background})`,
      }}
    >
      {/* Partículas de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              x: [0, Math.random() * 200 - 100],
              y: [0, Math.random() * 200 - 100],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: themeColors.primary + "60",
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Botón de regreso */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 transition-colors"
            style={{
              color: themeColors.text.secondary,
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </motion.div>

        {/* Formulario */}
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
          {/* Logo y título */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.5, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-16 h-16 mx-auto mb-4"
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
                  <span
                    className="text-2xl font-bold"
                    style={{ color: themeColors.primary }}
                  >
                    V
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl font-bold mb-2"
              style={{ color: themeColors.text.primary }}
            >
              Iniciar Sesión
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              style={{ color: themeColors.text.secondary }}
            >
              Accede a precios exclusivos B2B
            </motion.p>
          </div>

          {/* Test Users Info */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4 mb-6"
          >
            <p className="text-blue-200 text-sm mb-3">
              🔐 Datos de prueba disponibles:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillTestUser("cliente")}
                className="text-left p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <div className="text-white text-xs font-medium">👩‍💼 Cliente</div>
                <div className="text-white/70 text-xs">María González</div>
              </button>
              <button
                type="button"
                onClick={() => fillTestUser("distribuidor")}
                className="text-left p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <div className="text-white text-xs font-medium">
                  👨‍💼 Distribuidor
                </div>
                <div className="text-white/70 text-xs">Carlos Rodríguez</div>
              </button>
            </div>
            <p className="text-blue-200/70 text-xs mt-2">
              Contraseña para ambos: <code>123456</code>
            </p>
          </motion.div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: themeColors.text.primary }}
              >
                Correo electrónico
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
                  style={{ color: themeColors.text.secondary }}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg transition-all duration-300 focus:outline-none"
                  style={inputStyle}
                  onFocus={(e) => {
                    Object.assign(e.target.style, inputFocusStyle);
                  }}
                  onBlur={(e) => {
                    Object.assign(e.target.style, inputStyle);
                  }}
                  onMouseEnter={(e) => {
                    Object.assign(e.target.style, inputHoverStyle);
                  }}
                  onMouseLeave={(e) => {
                    if (document.activeElement !== e.target) {
                      Object.assign(e.target.style, inputStyle);
                    }
                  }}
                  placeholder="tu@empresa.com"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: themeColors.text.primary }}
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
                  style={{ color: themeColors.text.secondary }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border rounded-lg transition-all duration-300 focus:outline-none"
                  style={inputStyle}
                  onFocus={(e) => {
                    Object.assign(e.target.style, inputFocusStyle);
                  }}
                  onBlur={(e) => {
                    Object.assign(e.target.style, inputStyle);
                  }}
                  onMouseEnter={(e) => {
                    Object.assign(e.target.style, inputHoverStyle);
                  }}
                  onMouseLeave={(e) => {
                    if (document.activeElement !== e.target) {
                      Object.assign(e.target.style, inputStyle);
                    }
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors"
                  style={{ color: themeColors.text.secondary }}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Recordarme y olvidé contraseña */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex items-center justify-between"
            >
              <StyledSwitch
                checked={rememberMe}
                onChange={setRememberMe}
                label="Recordarme"
              />
              <a
                href="#"
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                isLoading && "animate-pulse",
              )}
              style={{
                background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                boxShadow: `0 0 0 2px ${themeColors.primary}50`,
              }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Iniciando sesión...
                </div>
              ) : (
                "Iniciar Sesión"
              )}
            </motion.button>
          </form>

          {/* Registro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-white/70">
              ¿No tienes cuenta?{" "}
              <Link
                href="/register"
                className="font-medium transition-colors hover:underline"
                style={{ color: themeColors.primary }}
              >
                Regístrate aquí
              </Link>
            </p>
          </motion.div>

          {/* Badge B2B */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-6 flex items-center justify-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10"
          >
            <Building2
              className="h-4 w-4"
              style={{ color: themeColors.primary }}
            />
            <span className="text-sm text-white/70">
              Plataforma exclusiva para empresas
            </span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
