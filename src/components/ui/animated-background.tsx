"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/contexts/theme-context";

export function AnimatedBackground() {
  const { themeColors } = useTheme();

  return (
    <>
      <div className="fixed inset-0 overflow-hidden -z-20">
        {/* Gradiente base */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at top, ${themeColors.primary}10, transparent 50%), 
                        radial-gradient(ellipse at bottom right, ${themeColors.secondary}15, transparent 50%),
                        radial-gradient(ellipse at top left, ${themeColors.accent}08, transparent 50%)`,
          }}
        />

        {/* Círculos animados */}
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10"
          style={{
            background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-8"
          style={{
            background: `linear-gradient(225deg, ${themeColors.accent}, ${themeColors.primary})`,
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <motion.div
          className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full opacity-6"
          style={{
            background: `radial-gradient(circle, ${themeColors.secondary}, transparent 70%)`,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Círculo adicional en el centro */}
        <motion.div
          className="absolute top-1/3 left-1/3 w-48 h-48 rounded-full opacity-4"
          style={{
            background: `conic-gradient(from 0deg, ${themeColors.primary}30, ${themeColors.secondary}30, ${themeColors.accent}30, ${themeColors.primary}30)`,
          }}
          animate={{
            rotate: [0, 360],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Partículas flotantes */}
        {Array.from({ length: 8 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full opacity-40"
            style={{
              background:
                i % 2 === 0 ? themeColors.primary : themeColors.secondary,
              left: `${15 + i * 12}%`,
              top: `${20 + i * 8}%`,
            }}
            animate={{
              y: [-15, -35, -15],
              x: [-5, 5, -5],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 4 + i * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}

        {/* Ondas suaves */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `conic-gradient(from 0deg at 50% 50%, transparent, ${themeColors.primary}05, transparent, ${themeColors.secondary}05, transparent)`,
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Mesh gradient overlay */}
        <div
          className="absolute inset-0 opacity-25"
          style={{
            background: `
              radial-gradient(circle at 25% 25%, ${themeColors.primary}20 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, ${themeColors.secondary}20 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, ${themeColors.accent}15 0%, transparent 50%),
              linear-gradient(45deg, transparent 30%, ${themeColors.primary}05 50%, transparent 70%)
            `,
          }}
        />
      </div>

      {/* Overlay para mejorar legibilidad */}
      <div className="fixed inset-0 bg-background/40 backdrop-blur-[0.3px] -z-10" />
    </>
  );
}
