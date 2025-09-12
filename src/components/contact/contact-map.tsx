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

export function ContactMap() {
  const offices = [
    {
      name: "Oficina Principal",
      address: "Av. Insurgentes Sur 123, Col. Roma Norte",
      city: "Ciudad de México, CDMX 06700",
      phone: "+52 55 1234 5678",
      email: "contacto@virtago.com",
      hours: "Lun - Vie: 9:00 - 18:00",
      type: "Matriz",
    },
    {
      name: "Centro de Distribución",
      address: "Carretera México-Puebla Km 15.5",
      city: "Ixtapaluca, Estado de México 56530",
      phone: "+52 55 1234 5679",
      email: "logistica@virtago.com",
      hours: "Lun - Sáb: 8:00 - 17:00",
      type: "Almacén",
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
        className="bg-white dark:bg-slate-800 rounded-3xl p-2 shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden"
      >
        <div className="relative h-80 bg-gradient-to-br from-purple-100 via-pink-50 to-cyan-100 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-cyan-900/20 rounded-2xl flex items-center justify-center">
          {/* Placeholder del mapa */}
          <div className="text-center">
            <MapPin className="h-16 w-16 text-purple-500 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-foreground mb-2">
              Mapa Interactivo
            </h4>
            <p className="text-muted-foreground mb-4">
              Encuentra nuestras ubicaciones en Ciudad de México
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all inline-flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              Ver en Google Maps
            </button>
          </div>

          {/* Overlay de ubicaciones */}
          <div className="absolute top-4 right-4">
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl p-3 shadow-lg">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                2 Ubicaciones
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
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    office.type === "Matriz"
                      ? "bg-gradient-to-r from-purple-500 to-pink-500"
                      : "bg-gradient-to-r from-blue-500 to-cyan-500"
                  }`}
                >
                  <Building2 className="h-6 w-6 text-white" />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-lg font-semibold text-foreground">
                    {office.name}
                  </h4>
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium ${
                      office.type === "Matriz"
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    }`}
                  >
                    {office.type}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-foreground font-medium">
                        {office.address}
                      </p>
                      <p className="text-muted-foreground">{office.city}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-500" />
                    <span className="text-foreground">{office.phone}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <span className="text-foreground">{office.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-muted-foreground">
                      {office.hours}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all">
                    Obtener Direcciones
                  </button>
                  <button className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-foreground text-xs rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-all">
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
        className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-slate-700/50"
      >
        <h4 className="text-lg font-semibold text-foreground mb-4">
          Información de Visitantes
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-foreground mb-2">
              Citas Programadas
            </h5>
            <p className="text-muted-foreground">
              Para visitas comerciales, programa tu cita con 24 horas de
              anticipación.
            </p>
          </div>
          <div>
            <h5 className="font-medium text-foreground mb-2">
              Estacionamiento
            </h5>
            <p className="text-muted-foreground">
              Contamos con estacionamiento gratuito para visitantes en ambas
              ubicaciones.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
