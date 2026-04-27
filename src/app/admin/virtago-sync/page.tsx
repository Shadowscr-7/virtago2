"use client";

import { motion } from "framer-motion";
import {
  MonitorDown,
  FolderOpen,
  Zap,
  RefreshCw,
  CheckCircle,
  ArrowRight,
  Download,
  Windows,
  Apple,
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { AdminLayout } from "@/components/admin/admin-layout";

const DOWNLOAD_URL_WIN = "https://github.com/Shadowscr-7/virtago2/releases/download/Virtago-Sync/VirtagoSync-1.0.0-win32-x64.zip";
const DOWNLOAD_URL_MAC = "https://virtago-releases.s3.amazonaws.com/sync/VirtagoSync-latest.dmg";

const STEPS = [
  {
    number: "01",
    title: "Descargá e instalá",
    desc: "Instalación silenciosa en menos de 2 minutos. Se crea acceso directo en el escritorio.",
    icon: Download,
  },
  {
    number: "02",
    title: "Iniciá sesión",
    desc: "Usás las mismas credenciales de tu cuenta Virtago. Sin contraseñas extra.",
    icon: CheckCircle,
  },
  {
    number: "03",
    title: "Elegí tu carpeta",
    desc: "Seleccionás una carpeta raíz. La app crea las subcarpetas automáticamente.",
    icon: FolderOpen,
  },
  {
    number: "04",
    title: "Sincronizá",
    desc: "Tirás tus archivos XLS/CSV en las subcarpetas y hacés clic en Sincronizar. La primera vez te pide mapear las columnas, las siguientes veces es automático.",
    icon: Zap,
  },
];

const FOLDERS = [
  { name: "clientes", desc: "Clientes / Comercios" },
  { name: "productos", desc: "Catálogo de productos" },
  { name: "listas-precio", desc: "Listas de precio" },
  { name: "precios", desc: "Precios por lista" },
  { name: "descuentos", desc: "Descuentos y promociones" },
];

const FEATURES = [
  "Soporta XLS, XLSX y CSV de cualquier ERP",
  "Mapeo de columnas automático con IA",
  "El perfil de mapeo se guarda para siempre",
  "Detecta archivos sin cambios y los omite",
  "Progreso y log en tiempo real",
  "Actualizaciones automáticas silenciosas",
];

export default function VirtagoSyncPage() {
  const { themeColors } = useTheme();

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4"
            style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
          >
            <MonitorDown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-3" style={{ color: themeColors.text.primary }}>
            Virtago Sync
          </h1>
          <p className="text-lg mb-2" style={{ color: themeColors.text.secondary }}>
            Sincronizá tu ERP con Virtago en menos de 30 minutos.
          </p>
          <p className="text-sm" style={{ color: themeColors.text.secondary }}>
            Sin importaciones manuales. Sin reformateo de archivos. Sin fricciones.
          </p>
        </motion.div>

        {/* Download buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <motion.a
            href={DOWNLOAD_URL_WIN}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-white font-semibold text-lg shadow-lg"
            style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-13.051-1.8"/>
            </svg>
            Descargar para Windows
          </motion.a>
          <motion.a
            href={DOWNLOAD_URL_MAC}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg border"
            style={{
              backgroundColor: `${themeColors.surface}80`,
              color: themeColors.text.primary,
              borderColor: `${themeColors.primary}30`,
            }}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Descargar para macOS
          </motion.a>
        </motion.div>

        {/* Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-xl p-6 rounded-2xl border mb-8"
          style={{
            backgroundColor: `${themeColors.surface}70`,
            borderColor: `${themeColors.primary}30`,
          }}
        >
          <h2 className="text-xl font-bold mb-6" style={{ color: themeColors.text.primary }}>
            ¿Cómo funciona?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex gap-4"
                >
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg"
                    style={{
                      background: `linear-gradient(135deg, ${themeColors.primary}30, ${themeColors.secondary}30)`,
                      color: themeColors.primary,
                    }}
                  >
                    {step.number}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4" style={{ color: themeColors.primary }} />
                      <h3 className="font-semibold" style={{ color: themeColors.text.primary }}>
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Folder structure */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="backdrop-blur-xl p-6 rounded-2xl border"
            style={{
              backgroundColor: `${themeColors.surface}70`,
              borderColor: `${themeColors.primary}30`,
            }}
          >
            <h2 className="text-base font-bold mb-4" style={{ color: themeColors.text.primary }}>
              Estructura de carpetas
            </h2>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex items-center gap-2" style={{ color: themeColors.text.secondary }}>
                <FolderOpen className="w-4 h-4" style={{ color: themeColors.primary }} />
                <span style={{ color: themeColors.text.primary }}>Mi Carpeta Raíz/</span>
              </div>
              {FOLDERS.map((f) => (
                <div key={f.name} className="flex items-center gap-2 ml-5">
                  <ArrowRight className="w-3 h-3" style={{ color: themeColors.primary }} />
                  <FolderOpen className="w-4 h-4" style={{ color: `${themeColors.secondary}` }} />
                  <span style={{ color: themeColors.text.primary }}>{f.name}/</span>
                  <span className="text-xs" style={{ color: themeColors.text.secondary }}>
                    — {f.desc}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="backdrop-blur-xl p-6 rounded-2xl border"
            style={{
              backgroundColor: `${themeColors.surface}70`,
              borderColor: `${themeColors.primary}30`,
            }}
          >
            <h2 className="text-base font-bold mb-4" style={{ color: themeColors.text.primary }}>
              Características
            </h2>
            <ul className="space-y-2.5">
              {FEATURES.map((feat) => (
                <li key={feat} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: themeColors.primary }} />
                  <span style={{ color: themeColors.text.secondary }}>{feat}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Timing callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl border text-center"
          style={{
            background: `linear-gradient(135deg, ${themeColors.primary}15, ${themeColors.secondary}10)`,
            borderColor: `${themeColors.primary}30`,
          }}
        >
          <RefreshCw className="w-8 h-8 mx-auto mb-3" style={{ color: themeColors.primary }} />
          <h3 className="text-lg font-bold mb-1" style={{ color: themeColors.text.primary }}>
            Primera sincronización: menos de 30 minutos
          </h3>
          <p className="text-sm" style={{ color: themeColors.text.secondary }}>
            Las siguientes sincronizaciones toman <strong style={{ color: themeColors.text.primary }}>menos de 10 segundos</strong>.
            Solo tirás los archivos en las carpetas y hacés clic en Sincronizar.
          </p>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
