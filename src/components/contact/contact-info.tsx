"use client"

import { motion } from "framer-motion"
import { 
  HeadphonesIcon, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  MessageCircle, 
  Shield,
  Clock,
  Globe
} from "lucide-react"

export function ContactInfo() {
  const departments = [
    {
      title: "Atención al Cliente",
      description: "Soporte general y consultas sobre productos",
      icon: HeadphonesIcon,
      contact: "soporte@virtago.com",
      phone: "+52 55 1234 5678",
      hours: "Lun - Vie: 8:00 - 20:00",
      gradient: "from-blue-500 to-cyan-500",
      features: ["Soporte 24/7", "Chat en vivo", "Respuesta < 2 horas"]
    },
    {
      title: "Ventas B2B",
      description: "Consultas comerciales y oportunidades de negocio",
      icon: TrendingUp,
      contact: "ventas@virtago.com",
      phone: "+52 55 1234 5679",
      hours: "Lun - Vie: 9:00 - 18:00",
      gradient: "from-green-500 to-emerald-500",
      features: ["Cotizaciones", "Precios mayoristas", "Planes personalizados"]
    },
    {
      title: "Distribuidores",
      description: "Soporte especializado para socios distribuidores",
      icon: Users,
      contact: "distribuidores@virtago.com",
      phone: "+52 55 1234 5680",
      hours: "Lun - Vie: 9:00 - 18:00",
      gradient: "from-purple-500 to-pink-500",
      features: ["Gestor dedicado", "Capacitaciones", "Material promocional"]
    },
    {
      title: "Soporte Técnico",
      description: "Asistencia técnica y problemas de plataforma",
      icon: Shield,
      contact: "tecnico@virtago.com",
      phone: "+52 55 1234 5681",
      hours: "Lun - Dom: 24/7",
      gradient: "from-orange-500 to-red-500",
      features: ["Soporte remoto", "Diagnósticos", "Actualizaciones"]
    }
  ]

  return (
    <section className="py-20 bg-white/50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-6">
            <span className="bg-gradient-to-r from-slate-900 to-purple-900 dark:from-white dark:to-purple-100 bg-clip-text text-transparent">
              Departamentos de
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Atención
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Nuestro equipo especializado está organizado para brindarte la mejor atención según tus necesidades específicas.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {departments.map((dept, index) => {
            const Icon = dept.icon
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
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-slate-700 h-full">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${dept.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-purple-600 transition-colors">
                    {dept.title}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                    {dept.description}
                  </p>

                  {/* Contact Info */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <MessageCircle className="h-4 w-4 text-purple-500" />
                      <span className="text-foreground font-medium">{dept.contact}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <HeadphonesIcon className="h-4 w-4 text-green-500" />
                      <span className="text-foreground font-medium">{dept.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-muted-foreground">{dept.hours}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    {dept.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                        <span className="text-xs text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Contact Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full mt-6 py-3 px-4 rounded-xl bg-gradient-to-r ${dept.gradient} text-white font-medium text-sm hover:shadow-lg transition-all duration-300`}
                  >
                    Contactar Ahora
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Additional Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 dark:border-slate-700/50"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <Globe className="h-8 w-8 text-purple-500 mx-auto mb-4" />
              <h4 className="font-semibold text-foreground mb-2">Cobertura Nacional</h4>
              <p className="text-sm text-muted-foreground">Atendemos todo México con envíos a nivel nacional</p>
            </div>
            <div>
              <ShoppingCart className="h-8 w-8 text-pink-500 mx-auto mb-4" />
              <h4 className="font-semibold text-foreground mb-2">+10,000 Productos</h4>
              <p className="text-sm text-muted-foreground">Catálogo amplio de marcas reconocidas</p>
            </div>
            <div>
              <Users className="h-8 w-8 text-cyan-500 mx-auto mb-4" />
              <h4 className="font-semibold text-foreground mb-2">+500 Distribuidores</h4>
              <p className="text-sm text-muted-foreground">Red consolidada de socios comerciales</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
