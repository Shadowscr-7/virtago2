"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface OfferBannerProps {
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  ctaText?: string;
  ctaLink?: string;
  discount?: string;
  variant?: "primary" | "secondary";
  className?: string;
}

export function OfferBanner({
  title,
  subtitle,
  description,
  image,
  ctaText = "Ver ofertas",
  ctaLink = "#",
  discount,
  variant = "primary",
  className,
}: OfferBannerProps) {
  const isPrimary = variant === "primary";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative overflow-hidden rounded-2xl group cursor-pointer",
        isPrimary ? "h-64 md:h-80" : "h-48 md:h-56",
        className,
      )}
    >
      {/* Fondo con gradiente */}
      <div
        className={cn(
          "absolute inset-0",
          isPrimary
            ? "bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-600"
            : "bg-gradient-to-br from-slate-800 via-purple-800 to-slate-900",
        )}
      />

      {/* Patrón de fondo animado */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(255,255,255,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(255,255,255,0.1),transparent_50%)]" />
      </div>

      {/* Partículas flotantes */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(isPrimary ? 8 : 5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
            className="absolute w-2 h-2 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Imagen del producto/marca (si se proporciona) */}
      {image && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-20 group-hover:opacity-30 transition-opacity">
          <Image
            src={image}
            alt={title}
            width={isPrimary ? 200 : 150}
            height={isPrimary ? 200 : 150}
            className="object-contain"
          />
        </div>
      )}

      {/* Contenido */}
      <div className="relative h-full flex flex-col justify-center p-6 md:p-8 text-white z-10">
        {/* Badge de descuento */}
        {discount && (
          <motion.div
            initial={{ scale: 0, rotate: -12 }}
            animate={{ scale: 1, rotate: -12 }}
            className="inline-flex items-center gap-1 w-fit mb-4 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold"
          >
            <Sparkles className="h-3 w-3" />
            {discount}
          </motion.div>
        )}

        {/* Subtítulo */}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm md:text-base text-white/80 mb-2"
          >
            {subtitle}
          </motion.p>
        )}

        {/* Título principal */}
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className={cn(
            "font-bold text-white mb-4 leading-tight",
            isPrimary ? "text-2xl md:text-4xl" : "text-xl md:text-2xl",
          )}
        >
          {title}
        </motion.h2>

        {/* Descripción */}
        {description && (
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="text-sm md:text-base text-white/90 mb-6 max-w-md"
          >
            {description}
          </motion.p>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.a
            href={ctaLink}
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full font-semibold text-white transition-all duration-300 group/cta"
          >
            <Zap className="h-4 w-4" />
            {ctaText}
            <ArrowRight className="h-4 w-4 group-hover/cta:translate-x-1 transition-transform" />
          </motion.a>
        </motion.div>
      </div>

      {/* Efecto de brillo en hover */}
      <motion.div
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
      />
    </motion.div>
  );
}
