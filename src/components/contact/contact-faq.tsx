"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  HelpCircle,
  MessageCircle,
  Clock,
  Users,
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

export function ContactFAQ() {
  const { themeColors } = useTheme();
  const [openItems, setOpenItems] = useState<number[]>([0]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const faqs = [
    {
      category: "General",
      icon: HelpCircle,
      color: themeColors.primary,
      questions: [
        {
          question: "¿Qué es Virtago y cómo funciona?",
          answer:
            "Virtago es una plataforma B2B especializada en la distribución de productos para empresas. Conectamos distribuidores con clientes empresariales, ofreciendo precios mayoristas, gestión de inventario y logística especializada.",
        },
        {
          question: "¿Cómo puedo convertirme en distribuidor?",
          answer:
            "Para ser distribuidor de Virtago, necesitas completar nuestro proceso de registro, presentar documentación empresarial, cumplir con requisitos mínimos de volumen y pasar por un proceso de verificación. Contacta a nuestro equipo comercial para más información.",
        },
        {
          question: "¿Cuáles son los métodos de pago disponibles?",
          answer:
            "Aceptamos transferencias bancarias, tarjetas de crédito empresariales, cheques certificados y ofrecemos términos de crédito para distribuidores calificados. Los términos específicos dependen del tipo de cuenta y historial crediticio.",
        },
      ],
    },
    {
      category: "Productos y Precios",
      icon: MessageCircle,
      color: themeColors.secondary,
      questions: [
        {
          question: "¿Por qué no veo precios sin registrarme?",
          answer:
            "Virtago es una plataforma B2B exclusiva. Los precios mayoristas y términos comerciales solo están disponibles para usuarios registrados y verificados para proteger nuestras políticas de precios y mantener la exclusividad del canal.",
        },
        {
          question: "¿Qué marcas y productos manejan?",
          answer:
            "Trabajamos con más de 200 marcas reconocidas en categorías como electrónicos, hogar, herramientas, oficina y más. Nuestro catálogo se actualiza constantemente con nuevos productos y marcas.",
        },
        {
          question: "¿Ofrecen productos personalizados o bajo marca propia?",
          answer:
            "Sí, para distribuidores de alto volumen ofrecemos servicios de marca blanca, personalización de productos y desarrollo de líneas exclusivas. Contacta a nuestro equipo comercial para conocer los requisitos.",
        },
      ],
    },
    {
      category: "Envíos y Logística",
      icon: Clock,
      color: themeColors.accent,
      questions: [
        {
          question: "¿Cuáles son los tiempos de entrega?",
          answer:
            "Los tiempos varían según la ubicación y tipo de producto: CDMX y área metropolitana 24-48 horas, interior de la república 3-5 días hábiles. Para productos especiales o bajo pedido, puede tomar 7-15 días hábiles.",
        },
        {
          question: "¿Tienen cobertura nacional?",
          answer:
            "Sí, tenemos cobertura en todo México a través de nuestra red de centros de distribución y alianzas logísticas. Ofrecemos envío a domicilio, puntos de entrega y servicios especializados para carga pesada.",
        },
        {
          question: "¿Qué pasa si mi pedido llega dañado?",
          answer:
            "Tenemos una política de garantía completa. Si tu pedido llega dañado, reporta el incidente dentro de 24 horas con fotos del producto y empaque. Reemplazaremos el producto sin costo adicional.",
        },
      ],
    },
    {
      category: "Soporte y Cuenta",
      icon: Users,
      color: themeColors.primary,
      questions: [
        {
          question: "¿Cómo puedo actualizar mi información de facturación?",
          answer:
            "Puedes actualizar tu información desde tu panel de usuario en la sección 'Mi Cuenta' > 'Datos Fiscales'. Para cambios en razón social o RFC, necesitarás verificación adicional contactando a soporte.",
        },
        {
          question: "¿Ofrecen capacitación para usar la plataforma?",
          answer:
            "Sí, ofrecemos capacitación gratuita para todos los distribuidores. Incluye sesiones en línea, materiales de apoyo y un gestor de cuenta dedicado para resolver dudas operativas.",
        },
        {
          question: "¿Cómo funciona el sistema de crédito?",
          answer:
            "El crédito se asigna basado en historial crediticio, volumen de compras y referencias comerciales. Los términos van desde 15 hasta 90 días según la calificación. Evaluamos las solicitudes de crédito mensualmente.",
        },
      ],
    },
  ];

  return (
    <section 
      className="py-20"
      style={{ backgroundColor: themeColors.surface + "30" }}
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
              Preguntas
            </span>
            <br />
            <span 
              className="bg-gradient-to-r bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`
              }}
            >
              Frecuentes
            </span>
          </h2>
          <p 
            className="text-xl max-w-2xl mx-auto"
            style={{ color: themeColors.text.secondary }}
          >
            Encuentra respuestas rápidas a las consultas más comunes sobre
            nuestros servicios y plataforma.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {faqs.map((category, categoryIndex) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1, duration: 0.8 }}
                viewport={{ once: true }}
                className="rounded-3xl p-6 shadow-lg border"
                style={{
                  backgroundColor: themeColors.surface + "80",
                  borderColor: themeColors.primary + "20"
                }}
              >
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: category.color }}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 
                    className="text-xl font-bold"
                    style={{ color: themeColors.text.primary }}
                  >
                    {category.category}
                  </h3>
                </div>

                {/* Questions */}
                <div className="space-y-3">
                  {category.questions.map((faq, questionIndex) => {
                    const globalIndex = categoryIndex * 10 + questionIndex;
                    const isOpen = openItems.includes(globalIndex);

                    return (
                      <div
                        key={questionIndex}
                        className="border rounded-xl overflow-hidden"
                        style={{ borderColor: themeColors.primary + "20" }}
                      >
                        <button
                          onClick={() => toggleItem(globalIndex)}
                          className="w-full px-4 py-4 text-left flex items-center justify-between transition-colors"
                          style={{
                            backgroundColor: isOpen ? themeColors.primary + "10" : "transparent"
                          }}
                        >
                          <span 
                            className="font-medium pr-4"
                            style={{ color: themeColors.text.primary }}
                          >
                            {faq.question}
                          </span>
                          <motion.div
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown 
                              className="h-5 w-5" 
                              style={{ color: themeColors.text.secondary }}
                            />
                          </motion.div>
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div 
                                className="px-4 pb-4 leading-relaxed"
                                style={{ color: themeColors.text.secondary }}
                              >
                                {faq.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div 
            className="backdrop-blur-sm rounded-3xl p-8 border"
            style={{
              background: `linear-gradient(135deg, ${themeColors.primary}10, ${themeColors.secondary}10, ${themeColors.accent}10)`,
              borderColor: themeColors.primary + "20"
            }}
          >
            <h3 
              className="text-2xl font-bold mb-4"
              style={{ color: themeColors.text.primary }}
            >
              ¿No encuentras lo que buscas?
            </h3>
            <p 
              className="mb-6 max-w-2xl mx-auto"
              style={{ color: themeColors.text.secondary }}
            >
              Nuestro equipo de soporte está disponible para ayudarte con
              cualquier consulta específica sobre nuestros productos y
              servicios.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                className="px-8 py-3 text-white rounded-xl transition-all inline-flex items-center justify-center gap-2"
                style={{
                  backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`
                }}
              >
                <MessageCircle className="h-5 w-5" />
                Contactar Soporte
              </button>
              <button 
                className="px-8 py-3 rounded-xl transition-all border"
                style={{
                  backgroundColor: themeColors.surface + "50",
                  color: themeColors.text.primary,
                  borderColor: themeColors.primary + "30"
                }}
              >
                Ver Más FAQs
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
