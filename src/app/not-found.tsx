"use client";

import { motion } from "framer-motion";
import { Search, Home, ArrowLeft, RefreshCw, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/theme-context";

export default function NotFound() {
  const router = useRouter();
  const { themeColors } = useTheme();

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `linear-gradient(135deg, ${themeColors.surface} 0%, #ffffff 40%, ${themeColors.primary}10 100%)`,
      }}
    >
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: themeColors.primary }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: themeColors.secondary }}
        />
      </div>

      {/* Contenido */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center max-w-xl mx-auto"
      >
        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="rounded-2xl overflow-hidden mb-8"
          style={{
            backgroundColor: "#ffffff",
            boxShadow: `0 20px 60px ${themeColors.primary}20, 0 4px 20px rgba(0,0,0,0.08)`,
            border: `1px solid ${themeColors.border}`,
          }}
        >
          {/* Header */}
          <div
            className="px-8 pt-8 pb-6"
            style={{
              background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
            }}
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center"
            >
              <AlertTriangle className="w-8 h-8 text-white" />
            </motion.div>
            <div className="text-5xl font-bold text-white mb-2">404</div>
            <h1 className="text-xl font-bold text-white">Página no encontrada</h1>
          </div>

          <div className="px-8 py-6">
            <p className="mb-6" style={{ color: themeColors.text.secondary }}>
              La página que buscas no existe o ha sido movida. No te preocupes, te ayudamos a encontrar lo que necesitas.
            </p>

            {/* Sugerencias */}
            <div
              className="rounded-xl p-4 mb-6 text-left"
              style={{
                backgroundColor: themeColors.surface,
                border: `1px solid ${themeColors.border}`,
              }}
            >
              <h3 className="text-sm font-semibold mb-3" style={{ color: themeColors.text.primary }}>
                ¿Qué puedes hacer?
              </h3>
              <div className="space-y-2">
                {[
                  { icon: Search, text: "Buscar productos en el catálogo" },
                  { icon: Home, text: "Ir a la página principal" },
                  { icon: RefreshCw, text: "Recargar la página" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm" style={{ color: themeColors.text.secondary }}>
                    <item.icon className="w-4 h-4 flex-shrink-0" style={{ color: themeColors.primary }} />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.back()}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-white text-sm flex-1"
                style={{
                  background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                  boxShadow: `0 4px 14px ${themeColors.primary}40`,
                }}
              >
                <ArrowLeft className="w-4 h-4" />
                Volver Atrás
              </motion.button>

              <Link href="/" className="flex-1">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm border-2 w-full"
                  style={{
                    borderColor: themeColors.border,
                    color: themeColors.text.secondary,
                    backgroundColor: "#ffffff",
                  }}
                >
                  <Home className="w-4 h-4" />
                  Ir al Inicio
                </motion.div>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Links útiles */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-sm mb-3" style={{ color: themeColors.text.muted }}>
            Enlaces útiles:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {[
              { name: "Productos", href: "/productos" },
              { name: "Marcas", href: "/marcas" },
              { name: "Ofertas", href: "/ofertas" },
              { name: "Contacto", href: "/contacto" },
            ].map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="font-medium transition-colors hover:underline"
                style={{ color: themeColors.primary }}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
