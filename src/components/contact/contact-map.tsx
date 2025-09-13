"use client";

import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Navigation,
  Building2,
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

export function ContactMap() {
  const { themeColors } = useTheme();

  const offices = [
    {
      name: "Oficina Principal",
      address: "Av. Insurgentes Sur 123, Col. Roma Norte",
      city: "Ciudad de México, CDMX 06700",
      phone: "+52 55 1234 5678",
      email: "contacto@virtago.com",
      hours: "Lun - Vie: 9:00 - 18:00",
      type: "Matriz",
      color: themeColors.primary,
    },
    {
      name: "Centro de Distribución",
      address: "Carretera México-Puebla Km 15.5",
      city: "Ixtapaluca, Estado de México 56530",
      phone: "+52 55 1234 5679",
      email: "logistica@virtago.com",
      hours: "Lun - Sáb: 8:00 - 17:00",
      type: "Almacén",
      color: themeColors.secondary,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Mapa */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="rounded-3xl p-2 shadow-xl border overflow-hidden"
        style={{
          backgroundColor: themeColors.surface + "90",
          borderColor: themeColors.primary + "20"
        }}
      >
        <div 
          className="relative h-80 rounded-2xl flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${themeColors.primary}10, ${themeColors.secondary}10, ${themeColors.accent}10)`
          }}
        >
          {/* Placeholder del mapa */}
          <div className="text-center">
            <MapPin 
              className="h-16 w-16 mx-auto mb-4" 
              style={{ color: themeColors.primary }}
            />
            <h4 
              className="text-xl font-semibold mb-2"
              style={{ color: themeColors.text.primary }}
            >
              Mapa Interactivo
            </h4>
            <p 
              className="mb-4"
              style={{ color: themeColors.text.secondary }}
            >
              Encuentra nuestras ubicaciones en Ciudad de México
            </p>
            <button 
              className="px-6 py-3 text-white rounded-xl transition-all inline-flex items-center gap-2"
              style={{
                backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`
              }}
            >
              <Navigation className="h-4 w-4" />
              Ver en Google Maps
            </button>
          </div>

          {/* Overlay de ubicaciones */}
          <div className="absolute top-4 right-4">
            <div 
              className="backdrop-blur-sm rounded-xl p-3 shadow-lg"
              style={{ backgroundColor: themeColors.surface + "90" }}
            >
              <div className="flex items-center gap-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{ backgroundColor: themeColors.accent }}
                />
                <span style={{ color: themeColors.text.primary }}>
                  2 Ubicaciones
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Lista de oficinas */}
      <div className="space-y-4">
        {offices.map((office, index) => (
          <motion.div
            key={office.name}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.8 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
            className="rounded-2xl p-6 shadow-lg border hover:shadow-xl transition-all duration-300"
            style={{
              backgroundColor: themeColors.surface + "90",
              borderColor: themeColors.primary + "20"
            }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: office.color }}
                >
                  <Building2 className="h-6 w-6 text-white" />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 
                    className="text-lg font-semibold"
                    style={{ color: themeColors.text.primary }}
                  >
                    {office.name}
                  </h4>
                  <span
                    className="px-2 py-1 text-xs rounded-full font-medium"
                    style={{
                      backgroundColor: office.color + "20",
                      color: office.color
                    }}
                  >
                    {office.type}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin 
                      className="h-4 w-4 mt-0.5 flex-shrink-0" 
                      style={{ color: themeColors.primary }}
                    />
                    <div>
                      <p 
                        className="font-medium"
                        style={{ color: themeColors.text.primary }}
                      >
                        {office.address}
                      </p>
                      <p style={{ color: themeColors.text.secondary }}>
                        {office.city}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone 
                      className="h-4 w-4" 
                      style={{ color: themeColors.secondary }}
                    />
                    <span style={{ color: themeColors.text.primary }}>
                      {office.phone}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail 
                      className="h-4 w-4" 
                      style={{ color: themeColors.accent }}
                    />
                    <span style={{ color: themeColors.text.primary }}>
                      {office.email}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock 
                      className="h-4 w-4" 
                      style={{ color: themeColors.primary }}
                    />
                    <span style={{ color: themeColors.text.secondary }}>
                      {office.hours}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button 
                    className="px-4 py-2 text-white text-xs rounded-lg transition-all"
                    style={{
                      backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`
                    }}
                  >
                    Obtener Direcciones
                  </button>
                  <button 
                    className="px-4 py-2 text-xs rounded-lg transition-all border"
                    style={{
                      backgroundColor: themeColors.surface + "50",
                      color: themeColors.text.primary,
                      borderColor: themeColors.primary + "30"
                    }}
                  >
                    Llamar Ahora
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Información adicional */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        viewport={{ once: true }}
        className="backdrop-blur-sm rounded-2xl p-6 border"
        style={{
          background: `linear-gradient(135deg, ${themeColors.primary}10, ${themeColors.secondary}10, ${themeColors.accent}10)`,
          borderColor: themeColors.primary + "20"
        }}
      >
        <h4 
          className="text-lg font-semibold mb-4"
          style={{ color: themeColors.text.primary }}
        >
          Información de Visitantes
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 
              className="font-medium mb-2"
              style={{ color: themeColors.text.primary }}
            >
              Citas Programadas
            </h5>
            <p style={{ color: themeColors.text.secondary }}>
              Para visitas comerciales, programa tu cita con 24 horas de
              anticipación.
            </p>
          </div>
          <div>
            <h5 
              className="font-medium mb-2"
              style={{ color: themeColors.text.primary }}
            >
              Estacionamiento
            </h5>
            <p style={{ color: themeColors.text.secondary }}>
              Contamos con estacionamiento gratuito para visitantes en ambas
              ubicaciones.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
