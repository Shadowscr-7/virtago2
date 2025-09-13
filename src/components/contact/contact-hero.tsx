"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Sparkles } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

export function ContactHero() {
  const { themeColors } = useTheme();

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: themeColors.primary + "10" }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: themeColors.secondary + "10" }}
        />
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: themeColors.accent + "10" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Animated Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-20 h-20 mx-auto mb-8"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary}, ${themeColors.accent})`
                }}
              />
              <div 
                className="absolute inset-1 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: themeColors.background }}
              >
                <span 
                  className="text-2xl font-bold"
                  style={{ color: themeColors.primary }}
                >
                  V
                </span>
              </div>

              {/* Floating sparkles */}
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                }}
                className="absolute -inset-6"
              >
                <Sparkles className="absolute top-0 right-0 h-4 w-4" style={{ color: themeColors.accent }} />
                <Sparkles className="absolute bottom-0 left-0 h-3 w-3" style={{ color: themeColors.primary }} />
                <Sparkles className="absolute top-1/2 left-0 h-2 w-2" style={{ color: themeColors.secondary }} />
                <Sparkles className="absolute bottom-0 right-1/3 h-3 w-3" style={{ color: themeColors.accent }} />
              </motion.div>
            </div>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold mb-6"
          >
            <span style={{ color: themeColors.text.primary }}>
              Contacta con
            </span>
            <br />
            <span 
              className="bg-gradient-to-r bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary}, ${themeColors.accent})`
              }}
            >
              Virtago
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl mb-12 max-w-2xl mx-auto leading-relaxed"
            style={{ color: themeColors.text.secondary }}
          >
            Estamos aquí para ayudarte. Nuestro equipo de expertos está listo
            para responder tus consultas y brindarte el mejor soporte para tu
            negocio B2B.
          </motion.p>

          {/* Quick Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {[
              {
                icon: Phone,
                title: "Llámanos",
                value: "+52 55 1234 5678",
                color: themeColors.primary,
              },
              {
                icon: Mail,
                title: "Escríbenos",
                value: "contacto@virtago.com",
                color: themeColors.secondary,
              },
              {
                icon: MapPin,
                title: "Visítanos",
                value: "Ciudad de México, MX",
                color: themeColors.accent,
              },
              {
                icon: Clock,
                title: "Horarios",
                value: "Lun - Vie 9:00 - 18:00",
                color: themeColors.primary,
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -5, scale: 1.05 }}
                  className="backdrop-blur-sm rounded-2xl p-6 border hover:shadow-xl transition-all duration-300"
                  style={{
                    backgroundColor: themeColors.surface + "50",
                    borderColor: themeColors.primary + "20"
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto"
                    style={{ backgroundColor: item.color }}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 
                    className="font-semibold mb-2"
                    style={{ color: themeColors.text.primary }}
                  >
                    {item.title}
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: themeColors.text.secondary }}
                  >
                    {item.value}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
