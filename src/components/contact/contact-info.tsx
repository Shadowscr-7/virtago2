"use client";

import { motion } from "framer-motion";
import {
  HeadphonesIcon,
  Users,
  ShoppingCart,
  TrendingUp,
  MessageCircle,
  Shield,
  Clock,
  Globe,
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

export function ContactInfo() {
  const { themeColors } = useTheme();

  const departments = [
    {
      title: "Atención al Cliente",
      description: "Soporte general y consultas sobre productos",
      icon: HeadphonesIcon,
      contact: "soporte@virtago.com",
      phone: "+52 55 1234 5678",
      hours: "Lun - Vie: 8:00 - 20:00",
      color: themeColors.primary,
      features: ["Soporte 24/7", "Chat en vivo", "Respuesta < 2 horas"],
    },
    {
      title: "Ventas B2B",
      description: "Consultas comerciales y oportunidades de negocio",
      icon: TrendingUp,
      contact: "ventas@virtago.com",
      phone: "+52 55 1234 5679",
      hours: "Lun - Vie: 9:00 - 18:00",
      color: themeColors.secondary,
      features: ["Cotizaciones", "Precios mayoristas", "Planes personalizados"],
    },
    {
      title: "Distribuidores",
      description: "Soporte especializado para socios distribuidores",
      icon: Users,
      contact: "distribuidores@virtago.com",
      phone: "+52 55 1234 5680",
      hours: "Lun - Vie: 9:00 - 18:00",
      color: themeColors.accent,
      features: ["Gestor dedicado", "Capacitaciones", "Material promocional"],
    },
    {
      title: "Soporte Técnico",
      description: "Asistencia técnica y problemas de plataforma",
      icon: Shield,
      contact: "tecnico@virtago.com",
      phone: "+52 55 1234 5681",
      hours: "Lun - Dom: 24/7",
      color: themeColors.primary,
      features: ["Soporte remoto", "Diagnósticos", "Actualizaciones"],
    },
  ];

  return (
    <section 
      className="py-20"
      style={{ backgroundColor: themeColors.surface + "50" }}
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-6">
            <span style={{ color: themeColors.text.primary }}>
              Departamentos de
            </span>
            <br />
            <span 
              className="bg-gradient-to-r bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`
              }}
            >
              Atención
            </span>
          </h2>
          <p 
            className="text-xl max-w-2xl mx-auto"
            style={{ color: themeColors.text.secondary }}
          >
            Nuestro equipo especializado está organizado para brindarte la mejor
            atención según tus necesidades específicas.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {departments.map((dept, index) => {
            const Icon = dept.icon;
            return (
              <motion.div
                key={dept.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group"
              >
                <div 
                  className="rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border h-full"
                  style={{
                    backgroundColor: themeColors.surface + "80",
                    borderColor: themeColors.primary + "20"
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: dept.color }}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3 
                    className="text-xl font-bold mb-3 group-hover:opacity-80 transition-opacity"
                    style={{ color: themeColors.text.primary }}
                  >
                    {dept.title}
                  </h3>

                  {/* Description */}
                  <p 
                    className="mb-6 text-sm leading-relaxed"
                    style={{ color: themeColors.text.secondary }}
                  >
                    {dept.description}
                  </p>

                  {/* Contact Info */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <MessageCircle className="h-4 w-4" style={{ color: themeColors.primary }} />
                      <span 
                        className="font-medium"
                        style={{ color: themeColors.text.primary }}
                      >
                        {dept.contact}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <HeadphonesIcon className="h-4 w-4" style={{ color: themeColors.secondary }} />
                      <span 
                        className="font-medium"
                        style={{ color: themeColors.text.primary }}
                      >
                        {dept.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" style={{ color: themeColors.accent }} />
                      <span style={{ color: themeColors.text.secondary }}>
                        {dept.hours}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    {dept.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-center gap-2"
                      >
                        <div 
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: dept.color }}
                        />
                        <span 
                          className="text-xs"
                          style={{ color: themeColors.text.secondary }}
                        >
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Contact Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full mt-6 py-3 px-4 rounded-xl text-white font-medium text-sm hover:shadow-lg transition-all duration-300"
                    style={{ backgroundColor: dept.color }}
                  >
                    Contactar Ahora
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Additional Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 backdrop-blur-sm rounded-3xl p-8 border"
          style={{
            backgroundColor: themeColors.primary + "10",
            borderColor: themeColors.primary + "20"
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <Globe className="h-8 w-8 mx-auto mb-4" style={{ color: themeColors.primary }} />
              <h4 
                className="font-semibold mb-2"
                style={{ color: themeColors.text.primary }}
              >
                Cobertura Nacional
              </h4>
              <p 
                className="text-sm"
                style={{ color: themeColors.text.secondary }}
              >
                Atendemos todo México con envíos a nivel nacional
              </p>
            </div>
            <div>
              <ShoppingCart className="h-8 w-8 mx-auto mb-4" style={{ color: themeColors.secondary }} />
              <h4 
                className="font-semibold mb-2"
                style={{ color: themeColors.text.primary }}
              >
                +10,000 Productos
              </h4>
              <p 
                className="text-sm"
                style={{ color: themeColors.text.secondary }}
              >
                Catálogo amplio de marcas reconocidas
              </p>
            </div>
            <div>
              <Users className="h-8 w-8 mx-auto mb-4" style={{ color: themeColors.accent }} />
              <h4 
                className="font-semibold mb-2"
                style={{ color: themeColors.text.primary }}
              >
                +500 Distribuidores
              </h4>
              <p 
                className="text-sm"
                style={{ color: themeColors.text.secondary }}
              >
                Red consolidada de socios comerciales
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
