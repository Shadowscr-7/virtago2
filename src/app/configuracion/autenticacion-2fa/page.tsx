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
import { useAuthStore } from "@/lib/auth-store";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Autenticacion2FAPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [step, setStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes] = useState([
    "1234-5678",
    "9876-5432",
    "2468-1357",
    "8642-9753",
    "1357-2468",
    "9753-8642",
    "5432-9876",
    "1111-2222",
  ]);
  const [copied, setCopied] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="flex items-center justify-center min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Acceso Denegado
            </h1>
            <p className="text-muted-foreground mb-6">
              Debes iniciar sesión para configurar 2FA
            </p>
            <Link
              href="/login"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Iniciar Sesión
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const copyBackupCodes = () => {
    const codesText = backupCodes.join("\n");
    navigator.clipboard.writeText(codesText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Configurar Autenticación 2FA
              </h3>
              <p className="text-gray-300">
                Agrega una capa extra de seguridad a tu cuenta con la
                verificación en dos pasos
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h4 className="text-white font-medium mb-2">
                  ¿Qué es la autenticación 2FA?
                </h4>
                <p className="text-gray-300 text-sm">
                  La autenticación en dos factores requiere un código adicional
                  de tu teléfono cada vez que inicies sesión, haciendo tu cuenta
                  mucho más segura.
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h4 className="text-white font-medium mb-2">Necesitarás:</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>
                    • Una app autenticadora (Google Authenticator, Authy, etc.)
                  </li>
                  <li>• Tu teléfono móvil</li>
                  <li>• Unos minutos para la configuración</li>
                </ul>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep(2)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all"
            >
              <Smartphone className="w-4 h-4" />
              Comenzar Configuración
            </motion.button>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-4">
                Escanea el código QR
              </h3>
            </div>

            <div className="space-y-4">
              {/* QR Code simulado */}
              <div className="flex justify-center">
                <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center">
                  <QrCode className="w-32 h-32 text-gray-800" />
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h4 className="text-white font-medium mb-2">Instrucciones:</h4>
                <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
                  <li>Abre tu app autenticadora en el móvil</li>
                  <li>Selecciona "Agregar cuenta" o "Escanear QR"</li>
                  <li>Escanea este código QR</li>
                  <li>Ingresa el código de 6 dígitos que aparece</li>
                </ol>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-200 text-sm">
                  <strong>Código manual:</strong> Si no puedes escanear, ingresa
                  manualmente:
                  <code className="block mt-1 font-mono text-xs bg-white/10 p-2 rounded">
                    JBSWY3DPEHPK3PXP
                  </code>
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(1)}
                className="px-6 py-3 bg-white/10 text-gray-300 font-medium rounded-lg hover:bg-white/20 hover:text-white transition-all border border-white/20"
              >
                Anterior
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(3)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all"
              >
                <Key className="w-4 h-4" />
                Continuar
              </motion.button>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-4">
                Verificar configuración
              </h3>
              <p className="text-gray-300">
                Ingresa el código de 6 dígitos de tu app autenticadora
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Código de verificación
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-center text-xl font-mono placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="123456"
              />
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-white/10 text-gray-300 font-medium rounded-lg hover:bg-white/20 hover:text-white transition-all border border-white/20"
              >
                Anterior
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(4)}
                disabled={verificationCode.length !== 6}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                Verificar y Activar
              </motion.button>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                ¡2FA Activado!
              </h3>
              <p className="text-gray-300">
                Tu cuenta ahora está protegida con autenticación en dos factores
              </p>
            </div>

            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <h4 className="text-orange-300 font-medium mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Códigos de respaldo
              </h4>
              <p className="text-orange-200 text-sm mb-3">
                Guarda estos códigos en un lugar seguro. Puedes usarlos para
                acceder a tu cuenta si pierdes tu teléfono.
              </p>

              <div className="bg-white/10 rounded-lg p-4 mb-3">
                <div className="grid grid-cols-2 gap-2 font-mono text-sm text-white">
                  {backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="bg-white/10 p-2 rounded text-center"
                    >
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={copyBackupCodes}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500/20 text-orange-200 rounded-lg hover:bg-orange-500/30 transition-all"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? "Copiados!" : "Copiar códigos"}
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setTwoFAEnabled(true);
                router.push("/configuracion");
              }}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-6">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/configuracion"
              className="inline-flex items-center gap-2 text-purple-300 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a Configuración
            </Link>

            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-4"
            >
              Autenticación 2FA
            </motion.h1>

            {/* Progress indicator */}
            <div className="flex items-center gap-2 mb-4">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className={`flex-1 h-2 rounded-full transition-all ${
                    stepNumber <= step ? "bg-green-500" : "bg-white/20"
                  }`}
                />
              ))}
            </div>
            <p className="text-gray-300">Paso {step} de 4</p>
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
          >
            {renderStep()}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
