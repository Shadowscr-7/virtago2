"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";
import { useAuthStore, getRedirectForRole, UserRole } from "@/store/auth";
import { useTheme } from "@/contexts/theme-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OTPVerification } from "@/components/auth/otp-verification";
import { RoleSelection } from "@/components/auth/role-selection";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, loginWithOAuth, loginOtpStep, rolePending, user, isAuthenticated } = useAuthStore();
  const { themeColors } = useTheme();
  const router = useRouter();

  // Redirect when auth complete and no role pending
  useEffect(() => {
    if (isAuthenticated && !rolePending && !loginOtpStep && user?.role) {
      router.push(getRedirectForRole(user.role as UserRole));
    }
  }, [isAuthenticated, rolePending, loginOtpStep, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    try {
      await login(email, password);
      // After login(), loginOtpStep will be true — component will render OTP screen
    } catch {
      // Errors shown via toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // Google OAuth: use @react-oauth/google or manual redirect
    // For now, show a toast informing the user that setup is needed
    // When NEXT_PUBLIC_GOOGLE_CLIENT_ID is set, this will trigger the real OAuth flow
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      alert("Google OAuth no está configurado. El administrador debe agregar NEXT_PUBLIC_GOOGLE_CLIENT_ID al .env.");
      return;
    }
    // Redirect to Google OAuth endpoint
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback/google`);
    const scope = encodeURIComponent("openid email profile");
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline`;
  };

  const handleMicrosoftLogin = async () => {
    const msClientId = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID;
    if (!msClientId) {
      alert("Microsoft OAuth no está configurado. El administrador debe agregar NEXT_PUBLIC_MICROSOFT_CLIENT_ID al .env.");
      return;
    }
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback/microsoft`);
    const scope = encodeURIComponent("openid email profile User.Read");
    window.location.href = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${msClientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
  };

  // Step: OTP verification after email+password login
  if (loginOtpStep && user?.email) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: `linear-gradient(135deg, ${themeColors.surface} 0%, #ffffff 40%, ${themeColors.primary}10 100%)`,
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: themeColors.primary }} />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: themeColors.secondary }} />
        </div>
        <div className="relative z-10 w-full">
          <LoginOTPStep email={user.email} />
        </div>
      </div>
    );
  }

  // Step: Role selection for new users
  if (rolePending) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: `linear-gradient(135deg, ${themeColors.surface} 0%, #ffffff 40%, ${themeColors.primary}10 100%)`,
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: themeColors.primary }} />
        </div>
        <div className="relative z-10 w-full max-w-lg">
          <RoleSelection />
        </div>
      </div>
    );
  }

  // Main login form
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `linear-gradient(135deg, ${themeColors.surface} 0%, #ffffff 40%, ${themeColors.primary}10 100%)`,
      }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: themeColors.primary }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: themeColors.secondary }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back button */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:underline"
            style={{ color: themeColors.text.secondary }}
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </motion.div>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl overflow-hidden bg-white"
          style={{
            boxShadow: `0 20px 60px ${themeColors.primary}20, 0 4px 20px rgba(0,0,0,0.08)`,
            border: `1px solid ${themeColors.border}`,
          }}
        >
          {/* Header */}
          <div
            className="px-8 pt-8 pb-6 text-white"
            style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
          >
            <div className="text-center">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-black text-white">V</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Bienvenido de vuelta</h1>
              <p className="text-white/80 text-sm mt-1">Accedé a tu cuenta de Virtago</p>
            </div>
          </div>

          {/* Form body */}
          <div className="px-8 py-7">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: themeColors.text.muted }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border-2 text-sm transition-all duration-200 focus:outline-none bg-white"
                    style={{ borderColor: themeColors.border, color: themeColors.text.primary }}
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
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: themeColors.text.muted }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 rounded-lg border-2 text-sm transition-all duration-200 focus:outline-none bg-white"
                    style={{ borderColor: themeColors.border, color: themeColors.text.primary }}
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
                <div className="flex justify-end mt-1.5">
                  <a href="#" className="text-xs font-medium transition-colors hover:underline" style={{ color: themeColors.primary }}>
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </div>

              {/* Submit */}
              <motion.button
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
                  "Iniciar sesión"
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 h-px" style={{ backgroundColor: themeColors.border }} />
              <span className="text-xs font-medium" style={{ color: themeColors.text.muted }}>o continuá con</span>
              <div className="flex-1 h-px" style={{ backgroundColor: themeColors.border }} />
            </div>

            {/* OAuth buttons */}
            <div className="space-y-3">
              {/* Google */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-3 px-4 rounded-lg border-2 font-medium text-sm flex items-center justify-center gap-3 transition-all duration-200"
                style={{
                  borderColor: themeColors.border,
                  backgroundColor: "#ffffff",
                  color: themeColors.text.primary,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#dadce0";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.12)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = themeColors.border;
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                }}
              >
                {/* Google SVG icon */}
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.20455C17.64 8.56637 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8196H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
                  <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8196L12.0477 13.5614C11.2418 14.1014 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
                  <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957275C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
                  <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
                </svg>
                Continuar con Google
              </motion.button>

              {/* Microsoft */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="button"
                onClick={handleMicrosoftLogin}
                className="w-full py-3 px-4 rounded-lg border-2 font-medium text-sm flex items-center justify-center gap-3 transition-all duration-200"
                style={{
                  borderColor: themeColors.border,
                  backgroundColor: "#ffffff",
                  color: themeColors.text.primary,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#dadce0";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.12)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = themeColors.border;
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                }}
              >
                {/* Microsoft SVG icon */}
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0H8.57143V8.57143H0V0Z" fill="#F25022"/>
                  <path d="M9.42857 0H18V8.57143H9.42857V0Z" fill="#7FBA00"/>
                  <path d="M0 9.42857H8.57143V18H0V9.42857Z" fill="#00A4EF"/>
                  <path d="M9.42857 9.42857H18V18H9.42857V9.42857Z" fill="#FFB900"/>
                </svg>
                Continuar con Microsoft
              </motion.button>
            </div>

            {/* Register link */}
            <div className="mt-6 text-center">
              <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                ¿No tenés cuenta?{" "}
                <Link
                  href="/register"
                  className="font-semibold transition-colors hover:underline"
                  style={{ color: themeColors.primary }}
                >
                  Empezar gratis
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/** OTP step shown after email+password login */
function LoginOTPStep({ email }: { email: string }) {
  const { verifyLoginOTP, rolePending, user, isLoading } = useAuthStore();
  const { themeColors } = useTheme();
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(1800);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const handleOTPChange = (element: HTMLInputElement, index: number) => {
    const raw = element.value.replace(/\D/g, "");
    if (!raw) return;
    const digit = raw.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && element.nextSibling) (element.nextSibling as HTMLInputElement).focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && e.currentTarget.previousSibling) (e.currentTarget.previousSibling as HTMLInputElement).focus();
      setOtp([...otp.map((d, idx) => (idx === index ? "" : d))]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    if (!digits.length) return;
    const newOtp = new Array(6).fill("");
    digits.forEach((d, i) => { newOtp[i] = d; });
    setOtp(newOtp);
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) return;
    try {
      await verifyLoginOTP(code);
      // After OTP: if rolePending, the parent component handles showing RoleSelection
      // If not, useEffect in LoginPage will redirect
    } catch {
      setOtp(new Array(6).fill(""));
    }
  };

  const isComplete = otp.every((d) => d !== "");

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden bg-white"
        style={{
          boxShadow: `0 20px 60px ${themeColors.primary}20`,
          border: `1px solid ${themeColors.border}`,
        }}
      >
        <div
          className="px-8 pt-8 pb-6 text-white"
          style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
        >
          <div className="text-center">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Verificá tu email</h2>
            <p className="text-white/80 text-sm mt-1">Código enviado a {email}</p>
          </div>
        </div>

        <div className="px-8 py-7">
          <p className="text-sm text-center mb-5" style={{ color: themeColors.text.secondary }}>
            Ingresá el código de 6 dígitos. Expira en{" "}
            <span className="font-semibold" style={{ color: timeLeft < 300 ? "#dc2626" : themeColors.primary }}>
              {formatTime(timeLeft)}
            </span>
          </p>

          {/* OTP inputs */}
          <div className="flex justify-center gap-2.5 mb-6">
            {otp.map((data, index) => (
              <input
                key={index}
                className="otp-input w-11 h-12 text-center text-lg font-bold rounded-lg border-2 focus:outline-none transition-all duration-200 bg-white"
                style={{
                  backgroundColor: data ? `${themeColors.primary}10` : "#ffffff",
                  borderColor: data ? themeColors.primary : themeColors.border,
                  color: themeColors.text.primary,
                }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={data}
                onChange={(e) => handleOTPChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                onFocus={(e) => {
                  e.target.select();
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

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleVerify}
            disabled={!isComplete || isLoading}
            className="w-full py-3 px-6 rounded-lg font-semibold text-white text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
              boxShadow: `0 4px 14px ${themeColors.primary}40`,
            }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verificando...
              </span>
            ) : (
              "Verificar código"
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
