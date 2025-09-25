"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Building2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { useTheme } from "@/contexts/theme-context";

const registerSchema = z
  .object({
    firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Las contraseñas no coinciden",
    path: ["passwordConfirmation"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { themeColors } = useTheme();

  const { register: registerUser, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      
      // Si llegamos aquí, el registro fue exitoso
      console.log("✅ Usuario registrado exitosamente");
      onSuccess?.();
    } catch (error) {
      console.error("❌ Error en registro:", error);
      // Los errores ya se muestran vía toast desde el store
    }
  };

  // Indicador de fuerza de contraseña
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: "" };

    let strength = 0;
    const requirements = [];

    if (password.length >= 8) {
      strength += 25;
      requirements.push("8+ caracteres");
    }
    if (/[A-Z]/.test(password)) {
      strength += 25;
      requirements.push("Mayúscula");
    }
    if (/[a-z]/.test(password)) {
      strength += 25;
      requirements.push("Minúscula");
    }
    if (/[0-9]/.test(password)) {
      strength += 25;
      requirements.push("Número");
    }

    let text = "Débil";
    let color = "bg-red-500";

    if (strength >= 75) {
      text = "Fuerte";
      color = "bg-green-500";
    } else if (strength >= 50) {
      text = "Media";
      color = "bg-yellow-500";
    }

    return { strength, text, color, requirements };
  };

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

  const passwordStrength = getPasswordStrength(password || "");

  return (
    <div className="w-full max-w-md mx-auto">
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
            Crear Cuenta
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex items-center justify-center gap-2"
            style={{ color: themeColors.text.secondary }}
          >
            <Building2 className="h-4 w-4" />
            Registro para empresas B2B
          </motion.p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Nombre y Apellido */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: themeColors.text.primary }}
              >
                Nombre *
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
                  style={{ color: themeColors.text.secondary }}
                />
                <input
                  {...register("firstName")}
                  className={cn(
                    "w-full pl-10 pr-4 py-3 border rounded-lg transition-all duration-300 focus:outline-none",
                    errors.firstName && "border-red-500",
                  )}
                  style={{
                    ...inputStyle,
                    ...(errors.firstName && { borderColor: "#ef4444" }),
                  }}
                  onFocus={(e) => {
                    if (!errors.firstName) {
                      Object.assign(
                        (e.target as HTMLInputElement).style,
                        inputFocusStyle,
                      );
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.firstName) {
                      Object.assign(
                        (e.target as HTMLInputElement).style,
                        inputStyle,
                      );
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (!errors.firstName) {
                      Object.assign(
                        (e.target as HTMLInputElement).style,
                        inputHoverStyle,
                      );
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (
                      !errors.firstName &&
                      document.activeElement !== e.target
                    ) {
                      Object.assign(
                        (e.target as HTMLInputElement).style,
                        inputStyle,
                      );
                    }
                  }}
                  placeholder="Juan"
                />
              </div>
              {errors.firstName && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: themeColors.text.primary }}
              >
                Apellido *
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
                  style={{ color: themeColors.text.secondary }}
                />
                <input
                  {...register("lastName")}
                  className={cn(
                    "w-full pl-10 pr-4 py-3 border rounded-lg transition-all duration-300 focus:outline-none",
                    errors.lastName && "border-red-500",
                  )}
                  style={{
                    ...inputStyle,
                    ...(errors.lastName && { borderColor: "#ef4444" }),
                  }}
                  onFocus={(e) => {
                    if (!errors.lastName) {
                      Object.assign(
                        (e.target as HTMLInputElement).style,
                        inputFocusStyle,
                      );
                    }
                  }}
                  onBlur={(e) => {
                    if (!errors.lastName) {
                      Object.assign(
                        (e.target as HTMLInputElement).style,
                        inputStyle,
                      );
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (!errors.lastName) {
                      Object.assign(
                        (e.target as HTMLInputElement).style,
                        inputHoverStyle,
                      );
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (
                      !errors.lastName &&
                      document.activeElement !== e.target
                    ) {
                      Object.assign(
                        (e.target as HTMLInputElement).style,
                        inputStyle,
                      );
                    }
                  }}
                  placeholder="Pérez"
                />
              </div>
              {errors.lastName && (
                <p className="text-red-400 text-sm mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: themeColors.text.primary }}
            >
              Correo electrónico *
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
                style={{ color: themeColors.text.secondary }}
              />
              <input
                {...register("email")}
                type="email"
                className={cn(
                  "w-full pl-10 pr-4 py-3 border rounded-lg transition-all duration-300 focus:outline-none",
                  errors.email && "border-red-500",
                )}
                style={{
                  ...inputStyle,
                  ...(errors.email && { borderColor: "#ef4444" }),
                }}
                onFocus={(e) => {
                  if (!errors.email) {
                    Object.assign(
                      (e.target as HTMLInputElement).style,
                      inputFocusStyle,
                    );
                  }
                }}
                onBlur={(e) => {
                  if (!errors.email) {
                    Object.assign(
                      (e.target as HTMLInputElement).style,
                      inputStyle,
                    );
                  }
                }}
                onMouseEnter={(e) => {
                  if (!errors.email) {
                    Object.assign(
                      (e.target as HTMLInputElement).style,
                      inputHoverStyle,
                    );
                  }
                }}
                onMouseLeave={(e) => {
                  if (!errors.email && document.activeElement !== e.target) {
                    Object.assign(
                      (e.target as HTMLInputElement).style,
                      inputStyle,
                    );
                  }
                }}
                placeholder="juan@empresa.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: themeColors.text.primary }}
            >
              Contraseña *
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
                style={{ color: themeColors.text.secondary }}
              />
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                className={cn(
                  "w-full pl-10 pr-12 py-3 border rounded-lg transition-all duration-300 focus:outline-none",
                  errors.password && "border-red-500",
                )}
                style={{
                  ...inputStyle,
                  ...(errors.password && { borderColor: "#ef4444" }),
                }}
                onFocus={(e) => {
                  if (!errors.password) {
                    Object.assign(
                      (e.target as HTMLInputElement).style,
                      inputFocusStyle,
                    );
                  }
                }}
                onBlur={(e) => {
                  if (!errors.password) {
                    Object.assign(
                      (e.target as HTMLInputElement).style,
                      inputStyle,
                    );
                  }
                }}
                onMouseEnter={(e) => {
                  if (!errors.password) {
                    Object.assign(
                      (e.target as HTMLInputElement).style,
                      inputHoverStyle,
                    );
                  }
                }}
                onMouseLeave={(e) => {
                  if (!errors.password && document.activeElement !== e.target) {
                    Object.assign(
                      (e.target as HTMLInputElement).style,
                      inputStyle,
                    );
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

            {/* Indicador de fuerza de contraseña */}
            {password && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span
                    className="text-xs"
                    style={{ color: themeColors.text.secondary }}
                  >
                    Fuerza de contraseña
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: themeColors.text.secondary }}
                  >
                    {passwordStrength.text}
                  </span>
                </div>
                <div
                  className="w-full rounded-full h-2"
                  style={{ backgroundColor: themeColors.surface + "40" }}
                >
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${passwordStrength.strength}%`,
                      backgroundColor:
                        passwordStrength.strength >= 75
                          ? themeColors.accent
                          : passwordStrength.strength >= 50
                            ? "#f59e0b"
                            : "#ef4444",
                    }}
                  />
                </div>
              </div>
            )}

            {errors.password && (
              <p className="text-red-400 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: themeColors.text.primary }}
            >
              Confirmar contraseña *
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
                style={{ color: themeColors.text.secondary }}
              />
              <input
                {...register("passwordConfirmation")}
                type={showConfirmPassword ? "text" : "password"}
                className={cn(
                  "w-full pl-10 pr-12 py-3 border rounded-lg transition-all duration-300 focus:outline-none",
                  errors.passwordConfirmation && "border-red-500",
                )}
                style={{
                  ...inputStyle,
                  ...(errors.passwordConfirmation && {
                    borderColor: "#ef4444",
                  }),
                }}
                onFocus={(e) => {
                  if (!errors.passwordConfirmation) {
                    Object.assign(
                      (e.target as HTMLInputElement).style,
                      inputFocusStyle,
                    );
                  }
                }}
                onBlur={(e) => {
                  if (!errors.passwordConfirmation) {
                    Object.assign(
                      (e.target as HTMLInputElement).style,
                      inputStyle,
                    );
                  }
                }}
                onMouseEnter={(e) => {
                  if (!errors.passwordConfirmation) {
                    Object.assign(
                      (e.target as HTMLInputElement).style,
                      inputHoverStyle,
                    );
                  }
                }}
                onMouseLeave={(e) => {
                  if (
                    !errors.passwordConfirmation &&
                    document.activeElement !== e.target
                  ) {
                    Object.assign(
                      (e.target as HTMLInputElement).style,
                      inputStyle,
                    );
                  }
                }}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors"
                style={{ color: themeColors.text.secondary }}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.passwordConfirmation && (
              <p className="text-red-400 text-sm mt-1">
                {errors.passwordConfirmation.message}
              </p>
            )}
          </motion.div>

          {/* Botón de registro */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300",
              "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent",
              "disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
              isLoading && "animate-pulse",
            )}
            style={{
              background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
              boxShadow: `0 0 0 2px ${themeColors.primary}50`,
            }}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creando cuenta...
              </>
            ) : (
              <>
                Continuar
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="mt-6 text-center"
        >
          <p className="text-sm" style={{ color: themeColors.text.secondary }}>
            ¿Ya tienes cuenta?{" "}
            <button
              className="font-medium transition-colors"
              style={{ color: themeColors.primary }}
            >
              Iniciar sesión
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
