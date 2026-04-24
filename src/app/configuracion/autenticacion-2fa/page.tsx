"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Smartphone,
  ArrowLeft,
  QrCode,
  Key,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useTheme } from "@/contexts/theme-context";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Autenticacion2FAPage() {
  const { user } = useAuthStore();
  const { themeColors } = useTheme();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes] = useState([
    "1234-5678", "9876-5432", "2468-1357", "8642-9753",
    "1357-2468", "9753-8642", "5432-9876", "1111-2222",
  ]);
  const [copied, setCopied] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"
        style={{ background: `linear-gradient(135deg, ${themeColors.surface}, #ffffff, ${themeColors.primary}10)` }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 rounded-2xl"
          style={{ backgroundColor: "#ffffff", boxShadow: `0 20px 60px ${themeColors.primary}20`, border: `1px solid ${themeColors.border}` }}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}>
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-4" style={{ color: themeColors.text.primary }}>Acceso Denegado</h1>
          <p className="mb-6" style={{ color: themeColors.text.secondary }}>Debes iniciar sesión para configurar 2FA</p>
          <Link href="/login" className="inline-block px-6 py-3 rounded-lg font-semibold text-white transition-all"
            style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}>
            Iniciar Sesión
          </Link>
        </motion.div>
      </div>
    );
  }

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const infoBoxStyle = { backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}>
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: themeColors.text.primary }}>
                Configurar Autenticación 2FA
              </h3>
              <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                Agrega una capa extra de seguridad a tu cuenta con la verificación en dos pasos
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl" style={infoBoxStyle}>
                <h4 className="font-semibold text-sm mb-2" style={{ color: themeColors.text.primary }}>¿Qué es la autenticación 2FA?</h4>
                <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                  La autenticación en dos factores requiere un código adicional de tu teléfono cada vez que inicies sesión, haciendo tu cuenta mucho más segura.
                </p>
              </div>

              <div className="p-4 rounded-xl" style={infoBoxStyle}>
                <h4 className="font-semibold text-sm mb-2" style={{ color: themeColors.text.primary }}>Necesitarás:</h4>
                <ul className="text-sm space-y-1" style={{ color: themeColors.text.secondary }}>
                  <li>• Una app autenticadora (Google Authenticator, Authy, etc.)</li>
                  <li>• Tu teléfono móvil</li>
                  <li>• Unos minutos para la configuración</li>
                </ul>
              </div>
            </div>

            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              onClick={() => setStep(2)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm text-white transition-all"
              style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`, boxShadow: `0 4px 14px ${themeColors.primary}40` }}>
              <Smartphone className="w-4 h-4" />
              Comenzar Configuración
            </motion.button>
          </motion.div>
        );

      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2" style={{ color: themeColors.text.primary }}>Escanea el código QR</h3>
              <p className="text-sm" style={{ color: themeColors.text.secondary }}>Usa tu app autenticadora para escanear el código</p>
            </div>

            <div className="flex justify-center">
              <div className="w-48 h-48 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: "#ffffff", border: `2px solid ${themeColors.border}`, boxShadow: `0 4px 20px ${themeColors.primary}15` }}>
                <QrCode className="w-32 h-32" style={{ color: themeColors.text.primary }} />
              </div>
            </div>

            <div className="p-4 rounded-xl" style={infoBoxStyle}>
              <h4 className="font-semibold text-sm mb-2" style={{ color: themeColors.text.primary }}>Instrucciones:</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside" style={{ color: themeColors.text.secondary }}>
                <li>Abre tu app autenticadora en el móvil</li>
                <li>Selecciona &quot;Agregar cuenta&quot; o &quot;Escanear QR&quot;</li>
                <li>Escanea este código QR</li>
                <li>Ingresa el código de 6 dígitos que aparece</li>
              </ol>
            </div>

            <div className="p-4 rounded-xl"
              style={{ backgroundColor: `${themeColors.primary}08`, border: `1px solid ${themeColors.primary}20` }}>
              <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                <strong style={{ color: themeColors.text.primary }}>Código manual:</strong> Si no puedes escanear, ingresa manualmente:
                <code className="block mt-2 font-mono text-xs p-2 rounded text-center"
                  style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}`, color: themeColors.text.primary }}>
                  JBSWY3DPEHPK3PXP
                </code>
              </p>
            </div>

            <div className="flex gap-3">
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-lg font-semibold text-sm border-2 transition-all"
                style={{ borderColor: themeColors.border, color: themeColors.text.secondary, backgroundColor: "#ffffff" }}>
                Anterior
              </motion.button>
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={() => setStep(3)}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-white transition-all"
                style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}>
                <Key className="w-4 h-4" />
                Continuar
              </motion.button>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2" style={{ color: themeColors.text.primary }}>Verificar configuración</h3>
              <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                Ingresa el código de 6 dígitos de tu app autenticadora
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
                Código de verificación
              </label>
              <input type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                className="w-full px-4 py-3 border-2 rounded-lg text-center text-xl font-mono transition-all duration-200 focus:outline-none bg-white"
                style={{ borderColor: themeColors.border, color: themeColors.text.primary }}
                onFocus={(e) => { e.target.style.borderColor = themeColors.primary; e.target.style.boxShadow = `0 0 0 3px ${themeColors.primary}20`; }}
                onBlur={(e) => { e.target.style.borderColor = themeColors.border; e.target.style.boxShadow = "none"; }}
                placeholder="123456" />
            </div>

            <div className="flex gap-3">
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-lg font-semibold text-sm border-2 transition-all"
                style={{ borderColor: themeColors.border, color: themeColors.text.secondary, backgroundColor: "#ffffff" }}>
                Anterior
              </motion.button>
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={() => setStep(4)}
                disabled={verificationCode.length !== 6}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}>
                <Check className="w-4 h-4" />
                Verificar y Activar
              </motion.button>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}>
                <Check className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: themeColors.text.primary }}>¡2FA Activado!</h3>
              <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                Tu cuenta ahora está protegida con autenticación en dos factores
              </p>
            </div>

            <div className="p-4 rounded-xl" style={{ backgroundColor: "#fffbeb", border: "1px solid #fcd34d" }}>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2" style={{ color: "#b45309" }}>
                <AlertCircle className="w-4 h-4" />
                Códigos de respaldo
              </h4>
              <p className="text-xs mb-3" style={{ color: "#92400e" }}>
                Guarda estos códigos en un lugar seguro. Puedes usarlos para acceder a tu cuenta si pierdes tu teléfono.
              </p>

              <div className="p-3 rounded-lg mb-3" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="p-2 rounded text-center"
                      style={{ backgroundColor: "#ffffff", border: `1px solid ${themeColors.border}`, color: themeColors.text.primary }}>
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={copyBackupCodes}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all"
                style={{ backgroundColor: "#fef3c7", border: "1px solid #fcd34d", color: "#92400e" }}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "¡Copiados!" : "Copiar códigos"}
              </motion.button>
            </div>

            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              onClick={() => router.push("/configuracion")}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm text-white transition-all"
              style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`, boxShadow: `0 4px 14px ${themeColors.primary}40` }}>
              <Shield className="w-4 h-4" />
              Finalizar configuración
            </motion.button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pt-6"
      style={{ background: `linear-gradient(135deg, ${themeColors.surface} 0%, #ffffff 50%, ${themeColors.primary}08 100%)` }}>
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link href="/configuracion"
              className="inline-flex items-center gap-2 text-sm font-medium mb-4 hover:underline transition-colors"
              style={{ color: themeColors.primary }}>
              <ArrowLeft className="w-4 h-4" />
              Volver a Configuración
            </Link>
            <h1 className="text-2xl font-bold mb-3" style={{ color: themeColors.text.primary }}>Autenticación 2FA</h1>

            {/* Progress bar */}
            <div className="flex items-center gap-2 mb-1">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex-1 h-2 rounded-full transition-all"
                  style={{ backgroundColor: stepNumber <= step ? themeColors.primary : themeColors.border }} />
              ))}
            </div>
            <p className="text-xs" style={{ color: themeColors.text.muted }}>Paso {step} de 4</p>
          </div>

          {/* Main card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: "#ffffff", boxShadow: `0 20px 60px ${themeColors.primary}15, 0 4px 20px rgba(0,0,0,0.06)`, border: `1px solid ${themeColors.border}` }}>
            {/* Card header */}
            <div className="px-6 pt-6 pb-4"
              style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">Seguridad avanzada</h2>
              </div>
            </div>

            <div className="p-6">
              {renderStep()}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
