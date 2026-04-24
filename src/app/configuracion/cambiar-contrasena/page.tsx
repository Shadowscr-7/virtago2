"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, ArrowLeft, Check, X, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useTheme } from "@/contexts/theme-context";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CambiarContrasenaPage() {
  const { user } = useAuthStore();
  const { themeColors } = useTheme();
  const router = useRouter();
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: `linear-gradient(135deg, ${themeColors.surface}, #ffffff, ${themeColors.primary}10)` }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 rounded-2xl"
          style={{ backgroundColor: "#ffffff", boxShadow: `0 20px 60px ${themeColors.primary}20`, border: `1px solid ${themeColors.border}` }}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
               style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}>
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-4" style={{ color: themeColors.text.primary }}>Acceso Denegado</h1>
          <p className="mb-6" style={{ color: themeColors.text.secondary }}>Debes iniciar sesión para cambiar la contraseña</p>
          <Link href="/login" className="inline-block px-6 py-3 rounded-lg font-semibold text-white transition-all"
                style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}>
            Iniciar Sesión
          </Link>
        </motion.div>
      </div>
    );
  }

  const validatePassword = (password: string) => [
    { test: password.length >= 8, text: "Al menos 8 caracteres" },
    { test: /[A-Z]/.test(password), text: "Una mayúscula" },
    { test: /[a-z]/.test(password), text: "Una minúscula" },
    { test: /\d/.test(password), text: "Un número" },
    { test: /[!@#$%^&*]/.test(password), text: "Un carácter especial" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const passwordRequirements = validatePassword(passwords.new);
  const isFormValid = passwords.current && passwords.new && passwords.confirm && passwords.new === passwords.confirm;

  const inputClass = "w-full px-4 py-3 pr-12 border-2 rounded-lg text-sm transition-all duration-200 focus:outline-none bg-white";
  const inputStyle = { borderColor: themeColors.border, color: themeColors.text.primary };
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = themeColors.primary;
    e.target.style.boxShadow = `0 0 0 3px ${themeColors.primary}20`;
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = themeColors.border;
    e.target.style.boxShadow = "none";
  };

  return (
    <div
      className="min-h-screen pt-6"
      style={{ background: `linear-gradient(135deg, ${themeColors.surface} 0%, #ffffff 50%, ${themeColors.primary}08 100%)` }}
    >
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/configuracion"
              className="inline-flex items-center gap-2 text-sm font-medium mb-4 hover:underline transition-colors"
              style={{ color: themeColors.primary }}
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a Configuración
            </Link>
            <h1 className="text-2xl font-bold mb-1" style={{ color: themeColors.text.primary }}>
              Cambiar Contraseña
            </h1>
            <p className="text-sm" style={{ color: themeColors.text.secondary }}>
              Actualiza tu contraseña para mantener tu cuenta segura
            </p>
          </div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor: "#ffffff",
              boxShadow: `0 20px 60px ${themeColors.primary}15, 0 4px 20px rgba(0,0,0,0.06)`,
              border: `1px solid ${themeColors.border}`,
            }}
          >
            {/* Card header */}
            <div
              className="px-6 pt-6 pb-4"
              style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <Lock className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">Seguridad de la cuenta</h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Contraseña Actual */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
                  Contraseña Actual
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwords.current}
                    onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                    className={inputClass}
                    style={inputStyle}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    placeholder="Ingresa tu contraseña actual"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: themeColors.text.muted }}
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Nueva Contraseña */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwords.new}
                    onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                    className={inputClass}
                    style={inputStyle}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    placeholder="Ingresa tu nueva contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: themeColors.text.muted }}
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {passwords.new && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 p-3 rounded-xl"
                    style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}
                  >
                    <p className="text-xs font-medium mb-2" style={{ color: themeColors.text.secondary }}>
                      Requisitos:
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {passwordRequirements.map((req, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs">
                          {req.test ? (
                            <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                          ) : (
                            <X className="w-3 h-3 text-red-400 flex-shrink-0" />
                          )}
                          <span style={{ color: req.test ? "#16a34a" : themeColors.text.muted }}>{req.text}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Confirmar */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwords.confirm}
                    onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                    className={inputClass}
                    style={inputStyle}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    placeholder="Confirma tu nueva contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: themeColors.text.muted }}
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwords.confirm && passwords.new !== passwords.confirm && (
                  <div className="flex items-center gap-2 mt-1.5 text-red-500 text-xs">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Las contraseñas no coinciden
                  </div>
                )}
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={!isFormValid}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-white text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                    boxShadow: `0 4px 14px ${themeColors.primary}40`,
                  }}
                >
                  <Lock className="w-4 h-4" />
                  Cambiar Contraseña
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="button"
                  onClick={() => router.back()}
                  className="px-5 py-2.5 rounded-lg font-semibold text-sm border-2 transition-all"
                  style={{ borderColor: themeColors.border, color: themeColors.text.secondary, backgroundColor: "#ffffff" }}
                >
                  Cancelar
                </motion.button>
              </div>
            </form>

            {/* Consejos */}
            <div
              className="mx-6 mb-6 p-4 rounded-xl"
              style={{ backgroundColor: `${themeColors.primary}08`, border: `1px solid ${themeColors.primary}20` }}
            >
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: themeColors.primary }}>
                <AlertCircle className="w-4 h-4" />
                Consejos de Seguridad
              </h3>
              <ul className="text-xs space-y-1" style={{ color: themeColors.text.secondary }}>
                <li>• Usa una contraseña única que no uses en otros sitios</li>
                <li>• Evita información personal como nombres o fechas</li>
                <li>• Considera usar un gestor de contraseñas</li>
                <li>• Cambia tu contraseña regularmente</li>
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
