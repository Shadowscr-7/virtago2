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
  UserPlus,
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
  const [oauthLoading, setOauthLoading] = useState<"google" | "microsoft" | null>(null);
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
      onSuccess?.();
    } catch {
      // Los errores ya se muestran vía toast desde el store
    }
  };

  // OAuth registration — same flow as login: backend returns user+token,
  // if user is new (isNew=true) they go to userType selection (rolePending=true via loginWithOAuth).
  const handleGoogleRegister = () => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      alert("Google OAuth no está configurado. El administrador debe agregar NEXT_PUBLIC_GOOGLE_CLIENT_ID al .env.");
      return;
    }
    setOauthLoading("google");
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback/google`);
    const scope = encodeURIComponent("openid email profile");
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline`;
  };

  const handleMicrosoftRegister = () => {
    const msClientId = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID;
    if (!msClientId) {
      alert("Microsoft OAuth no está configurado. El administrador debe agregar NEXT_PUBLIC_MICROSOFT_CLIENT_ID al .env.");
      return;
    }
    setOauthLoading("microsoft");
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback/microsoft`);
    const scope = encodeURIComponent("openid email profile User.Read");
    window.location.href = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${msClientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: "" };

    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;

    let text = "Débil";
    if (strength >= 75) text = "Fuerte";
    else if (strength >= 50) text = "Media";

    return { strength, text };
  };

  const passwordStrength = getPasswordStrength(password || "");

  const inputBase =
    "w-full py-3 border-2 rounded-lg text-sm transition-all duration-200 focus:outline-none bg-white";

  const getInputStyle = (hasError: boolean) => ({
    borderColor: hasError ? "#ef4444" : themeColors.border,
    color: themeColors.text.primary,
  });

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>, hasError: boolean) => {
    if (!hasError) {
      e.target.style.borderColor = themeColors.primary;
      e.target.style.boxShadow = `0 0 0 3px ${themeColors.primary}20`;
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>, hasError: boolean) => {
    if (!hasError) {
      e.target.style.borderColor = themeColors.border;
      e.target.style.boxShadow = "none";
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Crear Cuenta</h1>
              <p className="text-white/80 text-sm flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                Registro exclusivo para empresas B2B
              </p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="px-8 py-7">
          {/* OAuth Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex flex-col gap-3 mb-5"
          >
            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleRegister}
              disabled={!!oauthLoading || isLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg border-2 font-medium text-sm transition-all duration-200 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                borderColor: themeColors.border,
                color: themeColors.text.primary,
                backgroundColor: "#ffffff",
              }}
            >
              {oauthLoading === "google" ? (
                <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                  <path d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z" fill="#4285F4"/>
                  <path d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z" fill="#34A853"/>
                  <path d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z" fill="#FBBC04"/>
                  <path d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z" fill="#EA4335"/>
                </svg>
              )}
              Registrarse con Google
            </button>

            {/* Microsoft */}
            <button
              type="button"
              onClick={handleMicrosoftRegister}
              disabled={!!oauthLoading || isLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg border-2 font-medium text-sm transition-all duration-200 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                borderColor: themeColors.border,
                color: themeColors.text.primary,
                backgroundColor: "#ffffff",
              }}
            >
              {oauthLoading === "microsoft" ? (
                <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 21 21" fill="none">
                  <path d="M0 0H10V10H0V0Z" fill="#F25022"/>
                  <path d="M11 0H21V10H11V0Z" fill="#7FBA00"/>
                  <path d="M0 11H10V21H0V11Z" fill="#00A4EF"/>
                  <path d="M11 11H21V21H11V11Z" fill="#FFB900"/>
                </svg>
              )}
              Registrarse con Microsoft
            </button>
          </motion.div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ backgroundColor: themeColors.border }} />
            <span className="text-xs font-medium" style={{ color: themeColors.text.muted }}>
              o continuar con email
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: themeColors.border }} />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label
                  className="block text-sm font-semibold mb-1.5"
                  style={{ color: themeColors.text.primary }}
                >
                  Nombre *
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                    style={{ color: themeColors.text.muted }}
                  />
                  <input
                    {...register("firstName")}
                    className={cn(inputBase, "pl-10 pr-4")}
                    style={getInputStyle(!!errors.firstName)}
                    onFocus={(e) => handleFocus(e, !!errors.firstName)}
                    onBlur={(e) => handleBlur(e, !!errors.firstName)}
                    placeholder="Juan"
                  />
                </div>
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.firstName.message}
                  </p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 }}
              >
                <label
                  className="block text-sm font-semibold mb-1.5"
                  style={{ color: themeColors.text.primary }}
                >
                  Apellido *
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                    style={{ color: themeColors.text.muted }}
                  />
                  <input
                    {...register("lastName")}
                    className={cn(inputBase, "pl-10 pr-4")}
                    style={getInputStyle(!!errors.lastName)}
                    onFocus={(e) => handleFocus(e, !!errors.lastName)}
                    onBlur={(e) => handleBlur(e, !!errors.lastName)}
                    placeholder="Pérez"
                  />
                </div>
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.lastName.message}
                  </p>
                )}
              </motion.div>
            </div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <label
                className="block text-sm font-semibold mb-1.5"
                style={{ color: themeColors.text.primary }}
              >
                Correo electrónico *
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                  style={{ color: themeColors.text.muted }}
                />
                <input
                  {...register("email")}
                  type="email"
                  className={cn(inputBase, "pl-10 pr-4")}
                  style={getInputStyle(!!errors.email)}
                  onFocus={(e) => handleFocus(e, !!errors.email)}
                  onBlur={(e) => handleBlur(e, !!errors.email)}
                  placeholder="juan@empresa.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </motion.div>

            {/* Contraseña */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label
                className="block text-sm font-semibold mb-1.5"
                style={{ color: themeColors.text.primary }}
              >
                Contraseña *
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                  style={{ color: themeColors.text.muted }}
                />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className={cn(inputBase, "pl-10 pr-12")}
                  style={getInputStyle(!!errors.password)}
                  onFocus={(e) => handleFocus(e, !!errors.password)}
                  onBlur={(e) => handleBlur(e, !!errors.password)}
                  placeholder="••••••••"
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

              {/* Indicador de fuerza */}
              {password && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs" style={{ color: themeColors.text.muted }}>
                      Fuerza de contraseña
                    </span>
                    <span
                      className="text-xs font-medium"
                      style={{
                        color:
                          passwordStrength.strength >= 75
                            ? "#16a34a"
                            : passwordStrength.strength >= 50
                              ? "#d97706"
                              : "#dc2626",
                      }}
                    >
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div
                    className="w-full rounded-full h-1.5"
                    style={{ backgroundColor: themeColors.surface }}
                  >
                    <div
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${passwordStrength.strength}%`,
                        backgroundColor:
                          passwordStrength.strength >= 75
                            ? "#16a34a"
                            : passwordStrength.strength >= 50
                              ? "#d97706"
                              : "#dc2626",
                      }}
                    />
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </motion.div>

            {/* Confirmar contraseña */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <label
                className="block text-sm font-semibold mb-1.5"
                style={{ color: themeColors.text.primary }}
              >
                Confirmar contraseña *
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                  style={{ color: themeColors.text.muted }}
                />
                <input
                  {...register("passwordConfirmation")}
                  type={showConfirmPassword ? "text" : "password"}
                  className={cn(inputBase, "pl-10 pr-12")}
                  style={getInputStyle(!!errors.passwordConfirmation)}
                  onFocus={(e) => handleFocus(e, !!errors.passwordConfirmation)}
                  onBlur={(e) => handleBlur(e, !!errors.passwordConfirmation)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: themeColors.text.muted }}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.passwordConfirmation && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.passwordConfirmation.message}
                </p>
              )}
            </motion.div>

            {/* Botón submit */}
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading || !!oauthLoading}
              className="w-full py-3 px-6 rounded-lg font-semibold text-white text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                boxShadow: `0 4px 14px ${themeColors.primary}40`,
              }}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                <>
                  Continuar
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-5 text-center"
          >
            <p className="text-sm" style={{ color: themeColors.text.secondary }}>
              ¿Ya tienes cuenta?{" "}
              <button
                className="font-semibold transition-colors hover:underline"
                style={{ color: themeColors.primary }}
              >
                Iniciar sesión
              </button>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
