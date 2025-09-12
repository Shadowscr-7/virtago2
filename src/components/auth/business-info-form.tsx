"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";

const businessInfoSchema = z.object({
  businessName: z
    .string()
    .min(2, "El nombre de la empresa debe tener al menos 2 caracteres"),
  businessType: z.string().min(1, "El tipo de empresa es requerido"),
  rfc: z.string().min(12, "El RFC debe tener al least 12 caracteres"),
  businessAddress: z
    .string()
    .min(5, "La dirección comercial debe tener al menos 5 caracteres"),
  businessCity: z.string().min(2, "La ciudad es requerida"),
  businessCountry: z.string().min(2, "El país es requerido"),
  businessPhone: z
    .string()
    .min(10, "El teléfono comercial debe tener al menos 10 dígitos"),
  businessEmail: z.string().email("Email comercial inválido"),
  website: z.string().url("Website inválido").optional().or(z.literal("")),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres"),
  yearsInBusiness: z.string().min(1, "Los años en el negocio son requeridos"),
  numberOfEmployees: z.string().min(1, "El número de empleados es requerido"),
});

type BusinessInfoFormData = z.infer<typeof businessInfoSchema>;

interface BusinessInfoFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

const businessTypes = [
  "Distribuidor mayorista",
  "Tienda minorista",
  "Empresa de servicios",
  "Manufacturera",
  "Importador/Exportador",
  "E-commerce",
  "Franquicia",
  "Otro",
];

const employeeRanges = [
  "1-5",
  "6-10",
  "11-25",
  "26-50",
  "51-100",
  "101-500",
  "500+",
];

export function BusinessInfoForm({ onBack, onSuccess }: BusinessInfoFormProps) {
  const { updateBusinessInfo, isLoading, completeRegistration } =
    useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessInfoFormData>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      businessCountry: "México",
      website: "",
    },
  });

  const onSubmit = async (data: BusinessInfoFormData) => {
    try {
      await updateBusinessInfo(data);
      await completeRegistration();
      onSuccess();
    } catch (error) {
      console.error("Error updating business info:", error);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.6 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8 relative">
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute -top-2 -left-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </motion.button>

          <motion.div
            initial={{ scale: 0.5, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500" />
              <div className="absolute inset-2 rounded-full bg-slate-900 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-3xl font-bold text-white mb-2"
          >
            Información de Empresa
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-white/70"
          >
            Completa los datos de tu empresa para acceso a precios mayoristas
          </motion.p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información básica de la empresa */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna izquierda */}
            <div className="space-y-6">
              {/* Nombre de la empresa */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Nombre de la empresa *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
                  <input
                    {...register("businessName")}
                    className={cn(
                      "w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50",
                      "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
                      errors.businessName &&
                        "border-red-500 focus:ring-red-500",
                    )}
                    placeholder="Distribuidora ABC S.A. de C.V."
                  />
                </div>
                {errors.businessName && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.businessName.message}
                  </p>
                )}
              </motion.div>

              {/* Tipo de empresa */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Tipo de empresa *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
                  <select
                    {...register("businessType")}
                    className={cn(
                      "w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white",
                      "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
                      errors.businessType &&
                        "border-red-500 focus:ring-red-500",
                    )}
                  >
                    <option value="" className="bg-slate-800">
                      Selecciona un tipo
                    </option>
                    {businessTypes.map((type) => (
                      <option key={type} value={type} className="bg-slate-800">
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.businessType && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.businessType.message}
                  </p>
                )}
              </motion.div>

              {/* RFC */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <label className="block text-white/90 text-sm font-medium mb-2">
                  RFC *
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
                  <input
                    {...register("rfc")}
                    className={cn(
                      "w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 uppercase",
                      "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
                      errors.rfc && "border-red-500 focus:ring-red-500",
                    )}
                    placeholder="ABC123456ABC"
                    style={{ textTransform: "uppercase" }}
                  />
                </div>
                {errors.rfc && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.rfc.message}
                  </p>
                )}
              </motion.div>

              {/* Teléfono comercial */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Teléfono comercial *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
                  <input
                    {...register("businessPhone")}
                    type="tel"
                    className={cn(
                      "w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50",
                      "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
                      errors.businessPhone &&
                        "border-red-500 focus:ring-red-500",
                    )}
                    placeholder="+52 55 1234 5678"
                  />
                </div>
                {errors.businessPhone && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.businessPhone.message}
                  </p>
                )}
              </motion.div>

              {/* Email comercial */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
              >
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Email comercial *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
                  <input
                    {...register("businessEmail")}
                    type="email"
                    className={cn(
                      "w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50",
                      "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
                      errors.businessEmail &&
                        "border-red-500 focus:ring-red-500",
                    )}
                    placeholder="contacto@empresa.com"
                  />
                </div>
                {errors.businessEmail && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.businessEmail.message}
                  </p>
                )}
              </motion.div>

              {/* Website */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
              >
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Sitio web (opcional)
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
                  <input
                    {...register("website")}
                    type="url"
                    className={cn(
                      "w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50",
                      "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
                      errors.website && "border-red-500 focus:ring-red-500",
                    )}
                    placeholder="https://www.empresa.com"
                  />
                </div>
                {errors.website && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.website.message}
                  </p>
                )}
              </motion.div>
            </div>

            {/* Columna derecha */}
            <div className="space-y-6">
              {/* Dirección comercial */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Dirección comercial *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
                  <input
                    {...register("businessAddress")}
                    className={cn(
                      "w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50",
                      "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
                      errors.businessAddress &&
                        "border-red-500 focus:ring-red-500",
                    )}
                    placeholder="Av. Insurgentes 123, Col. Centro"
                  />
                </div>
                {errors.businessAddress && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.businessAddress.message}
                  </p>
                )}
              </motion.div>

              {/* Ciudad y País */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Ciudad *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
                    <input
                      {...register("businessCity")}
                      className={cn(
                        "w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50",
                        "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
                        errors.businessCity &&
                          "border-red-500 focus:ring-red-500",
                      )}
                      placeholder="Ciudad de México"
                    />
                  </div>
                  {errors.businessCity && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.businessCity.message}
                    </p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    País *
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
                    <select
                      {...register("businessCountry")}
                      className={cn(
                        "w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white",
                        "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
                        errors.businessCountry &&
                          "border-red-500 focus:ring-red-500",
                      )}
                    >
                      <option value="México" className="bg-slate-800">
                        México
                      </option>
                      <option value="Estados Unidos" className="bg-slate-800">
                        Estados Unidos
                      </option>
                      <option value="Canadá" className="bg-slate-800">
                        Canadá
                      </option>
                      <option value="España" className="bg-slate-800">
                        España
                      </option>
                      <option value="Colombia" className="bg-slate-800">
                        Colombia
                      </option>
                      <option value="Argentina" className="bg-slate-800">
                        Argentina
                      </option>
                      <option value="Chile" className="bg-slate-800">
                        Chile
                      </option>
                      <option value="Perú" className="bg-slate-800">
                        Perú
                      </option>
                    </select>
                  </div>
                  {errors.businessCountry && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.businessCountry.message}
                    </p>
                  )}
                </motion.div>
              </div>

              {/* Años en el negocio y empleados */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Años en el negocio *
                  </label>
                  <input
                    {...register("yearsInBusiness")}
                    type="number"
                    min="0"
                    max="100"
                    className={cn(
                      "w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50",
                      "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
                      errors.yearsInBusiness &&
                        "border-red-500 focus:ring-red-500",
                    )}
                    placeholder="5"
                  />
                  {errors.yearsInBusiness && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.yearsInBusiness.message}
                    </p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                >
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Número de empleados *
                  </label>
                  <select
                    {...register("numberOfEmployees")}
                    className={cn(
                      "w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white",
                      "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
                      errors.numberOfEmployees &&
                        "border-red-500 focus:ring-red-500",
                    )}
                  >
                    <option value="" className="bg-slate-800">
                      Selecciona rango
                    </option>
                    {employeeRanges.map((range) => (
                      <option
                        key={range}
                        value={range}
                        className="bg-slate-800"
                      >
                        {range} empleados
                      </option>
                    ))}
                  </select>
                  {errors.numberOfEmployees && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.numberOfEmployees.message}
                    </p>
                  )}
                </motion.div>
              </div>

              {/* Descripción */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
              >
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Descripción de la empresa *
                </label>
                <textarea
                  {...register("description")}
                  rows={4}
                  className={cn(
                    "w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 resize-none",
                    "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all",
                    errors.description && "border-red-500 focus:ring-red-500",
                  )}
                  placeholder="Describe brevemente tu empresa, productos que distribuyes, mercado objetivo, etc."
                />
                {errors.description && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.description.message}
                  </p>
                )}
              </motion.div>
            </div>
          </div>

          {/* Botón completar registro */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-300",
              "bg-gradient-to-r from-green-500 via-blue-500 to-purple-500",
              "hover:from-green-600 hover:via-blue-600 hover:to-purple-600",
              "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent",
              "disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
              isLoading && "animate-pulse",
            )}
          >
            {isLoading ? (
              <>
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Completando registro...
              </>
            ) : (
              <>
                <CheckCircle className="h-6 w-6" />
                Completar registro
                <ArrowRight className="h-6 w-6" />
              </>
            )}
          </motion.button>
        </form>

        {/* Progreso */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.6 }}
          className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/70 text-sm">Progreso del registro</span>
            <span className="text-white/70 text-sm">100%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 1.5, duration: 1 }}
              className="h-2 rounded-full bg-gradient-to-r from-green-500 to-purple-500"
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
