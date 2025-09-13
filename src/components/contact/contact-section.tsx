"use client";

import { motion } from "framer-motion";
import { ContactHero } from "./contact-hero";
import { ContactInfo } from "./contact-info";
import { ContactForm } from "./contact-form";
import { ContactMap } from "./contact-map";
import { ContactFAQ } from "./contact-faq";
import { useTheme } from "@/contexts/theme-context";

export function ContactSection() {
  const { themeColors } = useTheme();

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, 
          ${themeColors.surface}50 0%, 
          ${themeColors.primary}15 25%, 
          ${themeColors.secondary}20 50%, 
          ${themeColors.accent}15 75%, 
          ${themeColors.surface}40 100%)`
      }}
    >
      {/* Gradiente de overlay adicional para más profundidad */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top center, 
            ${themeColors.primary}10 0%, 
            transparent 60%, 
            ${themeColors.secondary}15 100%)`
        }}
      />
      
      {/* Patrón de puntos sutil para textura */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, ${themeColors.primary}20 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />
      
      {/* Contenido con z-index relativo */}
      <div className="relative z-10">
        {/* Hero Section */}
        <ContactHero />

        {/* Contact Information Grid */}
        <ContactInfo />

        {/* Contact Form & Map Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <ContactForm />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <ContactMap />
            </motion.div>
          </div>
        </div>

        {/* FAQ Section */}
        <ContactFAQ />
      </div>
    </div>
  );
}
