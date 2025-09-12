"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { 
  Send, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  MessageSquare, 
  CheckCircle,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"

const contactSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
  company: z.string().min(2, "El nombre de la empresa es requerido"),
  subject: z.string().min(5, "El asunto debe tener al menos 5 caracteres"),
  message: z.string().min(20, "El mensaje debe tener al menos 20 caracteres"),
  department: z.string().min(1, "Selecciona un departamento"),
  urgency: z.string().min(1, "Selecciona el nivel de urgencia")
})

type ContactFormData = z.infer<typeof contactSchema>

export function ContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema)
  })

  const departments = [
    { value: "ventas", label: "Ventas B2B" },
    { value: "soporte", label: "Soporte Técnico" },
    { value: "distribuidores", label: "Distribuidores" },
    { value: "general", label: "Consulta General" }
  ]

  const urgencyLevels = [
    { value: "baja", label: "Baja - Consulta general" },
    { value: "media", label: "Media - Necesito respuesta pronto" },
    { value: "alta", label: "Alta - Es urgente" },
    { value: "critica", label: "Crítica - Problema grave" }
  ]

  const onSubmit = async (data: ContactFormData) => {
    setIsLoading(true)
    try {
      // Simular envío del formulario
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('Form data:', data)
      setIsSubmitted(true)
      reset()
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-slate-700"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
            className="w-16 h-16 mx-auto mb-6"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
          </motion.div>
          
          <h3 className="text-2xl font-bold text-foreground mb-4">¡Mensaje Enviado!</h3>
          <p className="text-muted-foreground mb-6">
            Gracias por contactarnos. Nuestro equipo te responderá en las próximas 24 horas.
          </p>
          
          <button
            onClick={() => setIsSubmitted(false)}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Enviar otro mensaje
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-slate-700"
    >
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-foreground mb-2">Envíanos un Mensaje</h3>
        <p className="text-muted-foreground">
          Completa el formulario y nos pondremos en contacto contigo lo antes posible.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Nombre y Apellido */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Nombre *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <input
                {...register("firstName")}
                className={cn(
                  "w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-foreground placeholder-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
                  errors.firstName && "border-red-500 focus:ring-red-500"
                )}
                placeholder="Juan"
              />
            </div>
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Apellido *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <input
                {...register("lastName")}
                className={cn(
                  "w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-foreground placeholder-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
                  errors.lastName && "border-red-500 focus:ring-red-500"
                )}
                placeholder="Pérez"
              />
            </div>
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Email y Teléfono */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <input
                {...register("email")}
                type="email"
                className={cn(
                  "w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-foreground placeholder-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
                  errors.email && "border-red-500 focus:ring-red-500"
                )}
                placeholder="juan@empresa.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Teléfono *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <input
                {...register("phone")}
                type="tel"
                className={cn(
                  "w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-foreground placeholder-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
                  errors.phone && "border-red-500 focus:ring-red-500"
                )}
                placeholder="+52 55 1234 5678"
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>
        </div>

        {/* Empresa */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Empresa *
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <input
              {...register("company")}
              className={cn(
                "w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-foreground placeholder-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
                errors.company && "border-red-500 focus:ring-red-500"
              )}
              placeholder="Distribuidora ABC S.A. de C.V."
            />
          </div>
          {errors.company && (
            <p className="text-red-500 text-sm mt-1">{errors.company.message}</p>
          )}
        </div>

        {/* Departamento y Urgencia */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Departamento *
            </label>
            <select
              {...register("department")}
              className={cn(
                "w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-foreground",
                "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
                errors.department && "border-red-500 focus:ring-red-500"
              )}
            >
              <option value="">Selecciona un departamento</option>
              {departments.map((dept) => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </select>
            {errors.department && (
              <p className="text-red-500 text-sm mt-1">{errors.department.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Urgencia *
            </label>
            <select
              {...register("urgency")}
              className={cn(
                "w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-foreground",
                "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
                errors.urgency && "border-red-500 focus:ring-red-500"
              )}
            >
              <option value="">Selecciona la urgencia</option>
              {urgencyLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
            {errors.urgency && (
              <p className="text-red-500 text-sm mt-1">{errors.urgency.message}</p>
            )}
          </div>
        </div>

        {/* Asunto */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Asunto *
          </label>
          <input
            {...register("subject")}
            className={cn(
              "w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-foreground placeholder-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
              errors.subject && "border-red-500 focus:ring-red-500"
            )}
            placeholder="Consulta sobre precios mayoristas"
          />
          {errors.subject && (
            <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
          )}
        </div>

        {/* Mensaje */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Mensaje *
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 text-muted-foreground h-5 w-5" />
            <textarea
              {...register("message")}
              rows={5}
              className={cn(
                "w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-foreground placeholder-muted-foreground resize-none",
                "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
                errors.message && "border-red-500 focus:ring-red-500"
              )}
              placeholder="Describe tu consulta o solicitud detalladamente..."
            />
          </div>
          {errors.message && (
            <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
          )}
        </div>

        {/* Botón de envío */}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300",
            "bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500",
            "hover:from-purple-600 hover:via-pink-600 hover:to-cyan-600",
            "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
            isLoading && "animate-pulse"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Enviando mensaje...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              Enviar Mensaje
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  )
}
