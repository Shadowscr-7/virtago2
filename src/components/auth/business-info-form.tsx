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
import { useTheme } from "@/contexts/theme-context";

const businessInfoSchema = z.object({
  businessName: z.string().min(2, "El nombre de la empresa debe tener al menos 2 caracteres"),
  businessType: z.string().min(1, "El tipo de empresa es requerido"),
  ruc: z.string().min(11, "El RUC debe tener al menos 11 caracteres"),
  distributorCode: z.string().min(3, "El código de distribuidor debe tener al menos 3 caracteres"),
  businessAddress: z.string().min(5, "La dirección comercial debe tener al menos 5 caracteres"),
  businessCity: z.string().min(2, "La ciudad es requerida"),
  businessCountry: z.string().min(2, "El país es requerido"),
  businessPhone: z.string().min(10, "El teléfono comercial debe tener al menos 10 dígitos"),
  businessEmail: z.string().email("Email comercial inválido"),
  website: z.string().url("Website inválido").optional().or(z.literal("")),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  yearsInBusiness: z.string().min(1, "Los años en el negocio son requeridos"),
  numberOfEmployees: z.string().min(1, "El número de empleados es requerido"),
});

type BusinessInfoFormData = z.infer<typeof businessInfoSchema>;

interface BusinessInfoFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

const businessTypes = [
  "Distribuidor mayorista", "Tienda minorista", "Empresa de servicios",
  "Manufacturera", "Importador/Exportador", "E-commerce", "Franquicia", "Otro",
];

const employeeRanges = ["1-5", "6-10", "11-25", "26-50", "51-100", "101-500", "500+"];

const COUNTRIES = [
  "Uruguay", "Argentina", "Brasil", "Chile", "Paraguay",
  "Colombia", "Perú", "México", "España",
];

export function BusinessInfoForm({ onBack, onSuccess }: BusinessInfoFormProps) {
  const { updateBusinessInfo, isLoading } = useAuthStore();
  const { themeColors } = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessInfoFormData>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: { businessCountry: "Uruguay", website: "" },
  });

  const onSubmit = async (data: BusinessInfoFormData) => {
    try {
      await updateBusinessInfo(data);
      onSuccess();
    } catch {
      // error shown via toast
    }
  };

  const inputBase = "w-full py-3 border-2 rounded-lg text-sm transition-all duration-200 focus:outline-none bg-white";

  const getStyle = (hasError: boolean) => ({
    borderColor: hasError ? "#ef4444" : themeColors.border,
    color: themeColors.text.primary,
  });

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, hasError: boolean) => {
    if (!hasError) {
      (e.target as HTMLElement).style.borderColor = themeColors.primary;
      (e.target as HTMLElement).style.boxShadow = `0 0 0 3px ${themeColors.primary}20`;
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, hasError: boolean) => {
    if (!hasError) {
      (e.target as HTMLElement).style.borderColor = themeColors.border;
      (e.target as HTMLElement).style.boxShadow = "none";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "#ffffff",
          boxShadow: `0 20px 60px ${themeColors.primary}20, 0 4px 20px rgba(0,0,0,0.08)`,
          border: `1px solid ${themeColors.border}`,
        }}
      >
        {/* Header */}
        <div
          className="px-8 pt-8 pb-6 text-white"
          style={{
            background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
          }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 text-white" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Información de Empresa</h1>
                <p className="text-white/80 text-sm">Datos para acceso a precios mayoristas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Columna izquierda */}
              <div className="space-y-5">
                {/* Nombre empresa */}
                <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
                    Nombre de la empresa *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: themeColors.text.muted }} />
                    <input
                      {...register("businessName")}
                      className={cn(inputBase, "pl-10 pr-4")}
                      style={getStyle(!!errors.businessName)}
                      onFocus={(e) => handleFocus(e, !!errors.businessName)}
                      onBlur={(e) => handleBlur(e, !!errors.businessName)}
                      placeholder="Distribuidora ABC S.A."
                    />
                  </div>
                  {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName.message}</p>}
                </motion.div>

                {/* Tipo empresa */}
                <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }}>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
                    Tipo de empresa *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: themeColors.text.muted }} />
                    <select
                      {...register("businessType")}
                      className={cn(inputBase, "pl-10 pr-4")}
                      style={getStyle(!!errors.businessType)}
                      onFocus={(e) => handleFocus(e, !!errors.businessType)}
                      onBlur={(e) => handleBlur(e, !!errors.businessType)}
                    >
                      <option value="">Selecciona un tipo</option>
                      {businessTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  {errors.businessType && <p className="text-red-500 text-xs mt-1">{errors.businessType.message}</p>}
                </motion.div>

                {/* RUC */}
                <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.14 }}>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
                    RUC *
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: themeColors.text.muted }} />
                    <input
                      {...register("ruc")}
                      className={cn(inputBase, "pl-10 pr-4")}
                      style={getStyle(!!errors.ruc)}
                      onFocus={(e) => handleFocus(e, !!errors.ruc)}
                      onBlur={(e) => handleBlur(e, !!errors.ruc)}
                      placeholder="21.123.456.789-0"
                    />
                  </div>
                  {errors.ruc && <p className="text-red-500 text-xs mt-1">{errors.ruc.message}</p>}
                </motion.div>

                {/* Código Distribuidor */}
                <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.16 }}>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
                    Código/ID de Distribuidor *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: themeColors.text.muted }} />
                    <input
                      {...register("distributorCode")}
                      className={cn(inputBase, "pl-10 pr-4 uppercase")}
                      style={getStyle(!!errors.distributorCode)}
                      onFocus={(e) => handleFocus(e, !!errors.distributorCode)}
                      onBlur={(e) => handleBlur(e, !!errors.distributorCode)}
                      placeholder="DIST-UY-001"
                    />
                  </div>
                  {errors.distributorCode && <p className="text-red-500 text-xs mt-1">{errors.distributorCode.message}</p>}
                  <p className="text-xs mt-1" style={{ color: themeColors.text.muted }}>
                    Código único asignado o identificador de distribuidor
                  </p>
                </motion.div>

                {/* Teléfono */}
                <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18 }}>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
                    Teléfono comercial *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: themeColors.text.muted }} />
                    <input
                      {...register("businessPhone")}
                      type="tel"
                      className={cn(inputBase, "pl-10 pr-4")}
                      style={getStyle(!!errors.businessPhone)}
                      onFocus={(e) => handleFocus(e, !!errors.businessPhone)}
                      onBlur={(e) => handleBlur(e, !!errors.businessPhone)}
                      placeholder="+598 2 123 4567"
                    />
                  </div>
                  {errors.businessPhone && <p className="text-red-500 text-xs mt-1">{errors.businessPhone.message}</p>}
                </motion.div>

                {/* Email */}
                <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
                    Email comercial *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: themeColors.text.muted }} />
                    <input
                      {...register("businessEmail")}
                      type="email"
                      className={cn(inputBase, "pl-10 pr-4")}
                      style={getStyle(!!errors.businessEmail)}
                      onFocus={(e) => handleFocus(e, !!errors.businessEmail)}
                      onBlur={(e) => handleBlur(e, !!errors.businessEmail)}
                      placeholder="contacto@empresa.com.uy"
                    />
                  </div>
                  {errors.businessEmail && <p className="text-red-500 text-xs mt-1">{errors.businessEmail.message}</p>}
                </motion.div>

                {/* Website */}
                <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.22 }}>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
                    Sitio web (opcional)
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: themeColors.text.muted }} />
                    <input
                      {...register("website")}
                      type="url"
                      className={cn(inputBase, "pl-10 pr-4")}
                      style={getStyle(!!errors.website)}
                      onFocus={(e) => handleFocus(e, !!errors.website)}
                      onBlur={(e) => handleBlur(e, !!errors.website)}
                      placeholder="https://www.empresa.com.uy"
                    />
                  </div>
                  {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website.message}</p>}
                </motion.div>
              </div>

              {/* Columna derecha */}
              <div className="space-y-5">
                {/* Dirección */}
                <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
                    Dirección comercial *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: themeColors.text.muted }} />
                    <input
                      {...register("businessAddress")}
                      className={cn(inputBase, "pl-10 pr-4")}
                      style={getStyle(!!errors.businessAddress)}
                      onFocus={(e) => handleFocus(e, !!errors.businessAddress)}
                      onBlur={(e) => handleBlur(e, !!errors.businessAddress)}
                      placeholder="18 de Julio 1234, Montevideo"
                    />
                  </div>
                  {errors.businessAddress && <p className="text-red-500 text-xs mt-1">{errors.businessAddress.message}</p>}
                </motion.div>

                {/* Ciudad y País */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.13 }}>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
                      Ciudad *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: themeColors.text.muted }} />
                      <input
                        {...register("businessCity")}
                        className={cn(inputBase, "pl-10 pr-4")}
                        style={getStyle(!!errors.businessCity)}
                        onFocus={(e) => handleFocus(e, !!errors.businessCity)}
                        onBlur={(e) => handleBlur(e, !!errors.businessCity)}
                        placeholder="Montevideo"
                      />
                    </div>
                    {errors.businessCity && <p className="text-red-500 text-xs mt-1">{errors.businessCity.message}</p>}
                  </motion.div>

                  <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
                      País *
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: themeColors.text.muted }} />
                      <select
                        {...register("businessCountry")}
                        className={cn(inputBase, "pl-10 pr-4")}
                        style={getStyle(!!errors.businessCountry)}
                        onFocus={(e) => handleFocus(e, !!errors.businessCountry)}
                        onBlur={(e) => handleBlur(e, !!errors.businessCountry)}
                      >
                        {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    {errors.businessCountry && <p className="text-red-500 text-xs mt-1">{errors.businessCountry.message}</p>}
                  </motion.div>
                </div>

                {/* Años y empleados */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.17 }}>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
                      Años en el negocio *
                    </label>
                    <input
                      {...register("yearsInBusiness")}
                      type="number"
                      min="0"
                      max="100"
                      className={cn(inputBase, "px-4")}
                      style={getStyle(!!errors.yearsInBusiness)}
                      onFocus={(e) => handleFocus(e, !!errors.yearsInBusiness)}
                      onBlur={(e) => handleBlur(e, !!errors.yearsInBusiness)}
                      placeholder="5"
                    />
                    {errors.yearsInBusiness && <p className="text-red-500 text-xs mt-1">{errors.yearsInBusiness.message}</p>}
                  </motion.div>

                  <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.19 }}>
                    <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
                      Número de empleados *
                    </label>
                    <select
                      {...register("numberOfEmployees")}
                      className={cn(inputBase, "px-4")}
                      style={getStyle(!!errors.numberOfEmployees)}
                      onFocus={(e) => handleFocus(e, !!errors.numberOfEmployees)}
                      onBlur={(e) => handleBlur(e, !!errors.numberOfEmployees)}
                    >
                      <option value="">Selecciona rango</option>
                      {employeeRanges.map((r) => (
                        <option key={r} value={r}>{r} empleados</option>
                      ))}
                    </select>
                    {errors.numberOfEmployees && <p className="text-red-500 text-xs mt-1">{errors.numberOfEmployees.message}</p>}
                  </motion.div>
                </div>

                {/* Descripción */}
                <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.21 }}>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: themeColors.text.primary }}>
                    Descripción de la empresa *
                  </label>
                  <textarea
                    {...register("description")}
                    rows={5}
                    className="w-full px-4 py-3 border-2 rounded-lg text-sm transition-all duration-200 focus:outline-none bg-white resize-none"
                    style={getStyle(!!errors.description)}
                    onFocus={(e) => handleFocus(e, !!errors.description)}
                    onBlur={(e) => handleBlur(e, !!errors.description)}
                    placeholder="Describe brevemente tu empresa, productos que distribuyes, mercado objetivo, etc."
                  />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                </motion.div>
              </div>
            </div>

            {/* Botón */}
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 rounded-lg font-semibold text-white text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                boxShadow: `0 4px 14px ${themeColors.primary}40`,
              }}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Completando registro...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Continuar a selección de plan
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Progreso */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 p-4 rounded-xl"
            style={{
              backgroundColor: themeColors.surface,
              border: `1px solid ${themeColors.border}`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm" style={{ color: themeColors.text.secondary }}>
                Progreso del registro
              </span>
              <span className="text-sm font-medium" style={{ color: themeColors.text.primary }}>71%</span>
            </div>
            <div className="w-full rounded-full h-1.5" style={{ backgroundColor: themeColors.border }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "71%" }}
                transition={{ delay: 0.6, duration: 1 }}
                className="h-1.5 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${themeColors.primary}, ${themeColors.secondary})`,
                }}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
