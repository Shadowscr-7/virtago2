"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Save,
  X,
  Calendar,
  DollarSign,
  Percent,
  Ticket,
  Package,
  Loader2,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Target,
  Clock,
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { AdminLayout } from "@/components/admin/admin-layout";
import { EnhancedSelect } from "@/components/ui/enhanced-select";
import { EnhancedDatePicker } from "@/components/ui/enhanced-datepicker";

// Schema de validación
const couponSchema = z.object({
  code: z.string().min(3, "El código debe tener al menos 3 caracteres").max(20, "El código no puede tener más de 20 caracteres"),
  name: z.string().min(1, "El nombre es requerido").max(100, "El nombre no puede tener más de 100 caracteres"),
  description: z.string().max(500, "La descripción no puede tener más de 500 caracteres").optional(),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"], {
    message: "Selecciona un tipo de descuento",
  }),
  value: z.number().min(0, "El valor debe ser mayor a 0"),
  minOrderAmount: z.number().min(0, "El monto mínimo debe ser mayor o igual a 0").optional(),
  maxUses: z.number().min(1, "El límite de usos debe ser al menos 1").optional(),
  startDate: z.string().min(1, "La fecha de inicio es requerida"),
  endDate: z.string().min(1, "La fecha de fin es requerida"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  categories: z.array(z.string()).optional(),
  products: z.array(z.string()).optional(),
});

type CouponForm = z.infer<typeof couponSchema>;

const availableCategories = [
  { id: "electronics", name: "Electrónicos" },
  { id: "clothing", name: "Ropa" },
  { id: "home", name: "Hogar" },
  { id: "sports", name: "Deportes" },
  { id: "beauty", name: "Belleza" },
  { id: "books", name: "Libros" },
  { id: "automotive", name: "Automotriz" },
  { id: "toys", name: "Juguetes" },
];

const couponTemplates = [
  {
    id: "welcome",
    name: "Cupón de Bienvenida",
    description: "Descuento para nuevos clientes",
    type: "PERCENTAGE" as const,
    value: 10,
    icon: <Sparkles className="w-6 h-6" />,
    color: "#3b82f6",
  },
  {
    id: "seasonal",
    name: "Descuento Estacional",
    description: "Para promociones por temporada",
    type: "PERCENTAGE" as const,
    value: 25,
    icon: <Target className="w-6 h-6" />,
    color: "#f59e0b",
  },
  {
    id: "free_shipping",
    name: "Envío Gratis",
    description: "Cupón de envío gratuito",
    type: "FREE_SHIPPING" as const,
    value: 0,
    icon: <Ticket className="w-6 h-6" />,
    color: "#8b5cf6",
  },
  {
    id: "fixed_amount",
    name: "Monto Fijo",
    description: "Descuento de cantidad fija",
    type: "FIXED_AMOUNT" as const,
    value: 10000,
    icon: <DollarSign className="w-6 h-6" />,
    color: "#10b981",
  },
];

export default function NewCouponPage() {
  const { themeColors } = useTheme();
  const router = useRouter();
  
  const [saving, setSaving] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<CouponForm>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      status: "ACTIVE",
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días
    },
  });

  const watchType = watch("type");

  const onSubmit = async (data: CouponForm) => {
    setSaving(true);
    
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log("Datos del nuevo cupón:", { ...data, categories: selectedCategories });
      
      // Redirigir a la lista de cupones
      router.push("/admin/cupones");
    } catch (error) {
      console.error("Error al crear el cupón:", error);
    } finally {
      setSaving(false);
    }
  };

  const applyTemplate = (template: typeof couponTemplates[0]) => {
    setSelectedTemplate(template.id);
    setValue("type", template.type);
    setValue("value", template.value);
    
    // Generar código automático basado en el template
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const code = `${template.id.toUpperCase()}_${randomSuffix}`;
    setValue("code", code);
    setValue("name", template.name);
    setValue("description", template.description);
  };

  const generateRandomCode = () => {
    const prefix = "COUPON";
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}_${randomSuffix}`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PERCENTAGE":
        return <Percent className="w-5 h-5" />;
      case "FIXED_AMOUNT":
        return <DollarSign className="w-5 h-5" />;
      case "FREE_SHIPPING":
        return <Ticket className="w-5 h-5" />;
      default:
        return <Percent className="w-5 h-5" />;
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin/cupones")}
              className="p-2 rounded-xl transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: `${themeColors.surface}80`,
                color: themeColors.text.primary,
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: themeColors.text.primary }}>
                Crear Nuevo Cupón
              </h1>
              <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                Dashboard → Cupones → Nuevo Cupón
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Templates */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="backdrop-blur-xl p-6 rounded-2xl border"
              style={{
                backgroundColor: `${themeColors.surface}70`,
                borderColor: `${themeColors.primary}30`,
              }}
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: themeColors.text.primary }}>
                Plantillas de Cupones
              </h3>
              <p className="text-sm mb-6" style={{ color: themeColors.text.secondary }}>
                Selecciona una plantilla para empezar rápidamente o crea tu cupón desde cero.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {couponTemplates.map((template) => (
                  <motion.button
                    key={template.id}
                    type="button"
                    onClick={() => applyTemplate(template)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 rounded-xl border-2 text-left transition-all duration-200"
                    style={{
                      borderColor: selectedTemplate === template.id ? template.color : `${themeColors.primary}30`,
                      backgroundColor: selectedTemplate === template.id ? `${template.color}20` : `${themeColors.surface}50`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: `${template.color}20`,
                          color: template.color,
                        }}
                      >
                        {template.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1" style={{ color: themeColors.text.primary }}>
                          {template.name}
                        </h4>
                        <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                          {template.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span 
                            className="text-xs px-2 py-1 rounded"
                            style={{ 
                              backgroundColor: `${template.color}20`,
                              color: template.color,
                            }}
                          >
                            {template.type === "PERCENTAGE" ? `${template.value}%` : 
                             template.type === "FIXED_AMOUNT" ? `$${template.value}` : 
                             "Gratis"}
                          </span>
                        </div>
                      </div>
                      {selectedTemplate === template.id && (
                        <CheckCircle className="w-5 h-5" style={{ color: template.color }} />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Información Básica */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="backdrop-blur-xl p-6 rounded-2xl border"
                style={{
                  backgroundColor: `${themeColors.surface}70`,
                  borderColor: `${themeColors.primary}30`,
                }}
              >
                <h3 className="text-lg font-bold mb-6" style={{ color: themeColors.text.primary }}>
                  Información Básica
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
                      Código del Cupón *
                    </label>
                    <div className="flex gap-2">
                      <input
                        {...register("code")}
                        type="text"
                        className="flex-1 px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: `${themeColors.surface}50`,
                          borderColor: errors.code ? "#ef4444" : `${themeColors.primary}30`,
                          color: themeColors.text.primary,
                        }}
                        placeholder="Ej: BLACKFRIDAY25"
                      />
                      <button
                        type="button"
                        onClick={() => setValue("code", generateRandomCode())}
                        className="px-4 py-3 rounded-xl border transition-all duration-200"
                        style={{
                          backgroundColor: `${themeColors.primary}20`,
                          borderColor: `${themeColors.primary}30`,
                          color: themeColors.primary,
                        }}
                      >
                        Auto
                      </button>
                    </div>
                    {errors.code && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.code.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
                      Nombre del Cupón *
                    </label>
                    <input
                      {...register("name")}
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: `${themeColors.surface}50`,
                        borderColor: errors.name ? "#ef4444" : `${themeColors.primary}30`,
                        color: themeColors.text.primary,
                      }}
                      placeholder="Ej: Black Friday 25%"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
                    Descripción
                  </label>
                  <textarea
                    {...register("description")}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 resize-none"
                    style={{
                      backgroundColor: `${themeColors.surface}50`,
                      borderColor: errors.description ? "#ef4444" : `${themeColors.primary}30`,
                      color: themeColors.text.primary,
                    }}
                    placeholder="Descripción del cupón..."
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </motion.div>

              {/* Configuración del Descuento */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="backdrop-blur-xl p-6 rounded-2xl border"
                style={{
                  backgroundColor: `${themeColors.surface}70`,
                  borderColor: `${themeColors.primary}30`,
                }}
              >
                <h3 className="text-lg font-bold mb-6" style={{ color: themeColors.text.primary }}>
                  Configuración del Descuento
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {[
                    { value: "PERCENTAGE", label: "Porcentaje", icon: <Percent className="w-5 h-5" />, color: "#3b82f6" },
                    { value: "FIXED_AMOUNT", label: "Monto Fijo", icon: <DollarSign className="w-5 h-5" />, color: "#10b981" },
                    { value: "FREE_SHIPPING", label: "Envío Gratis", icon: <Ticket className="w-5 h-5" />, color: "#8b5cf6" },
                  ].map((type) => (
                    <label
                      key={type.value}
                      className="relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105"
                      style={{
                        borderColor: watchType === type.value ? type.color : `${themeColors.primary}30`,
                        backgroundColor: watchType === type.value ? `${type.color}20` : `${themeColors.surface}50`,
                      }}
                    >
                      <input
                        {...register("type")}
                        type="radio"
                        value={type.value}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{
                            backgroundColor: `${type.color}20`,
                            color: type.color,
                          }}
                        >
                          {type.icon}
                        </div>
                        <span className="font-medium" style={{ color: themeColors.text.primary }}>
                          {type.label}
                        </span>
                      </div>
                      {watchType === type.value && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="w-5 h-5" style={{ color: type.color }} />
                        </div>
                      )}
                    </label>
                  ))}
                </div>

                {errors.type && (
                  <p className="text-red-500 text-sm mb-4 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.type.message}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
                      {watchType === "PERCENTAGE" ? "Porcentaje (%)" : 
                       watchType === "FIXED_AMOUNT" ? "Monto ($)" : 
                       "Valor"} *
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        {getTypeIcon(watchType)}
                      </div>
                      <input
                        {...register("value", { valueAsNumber: true })}
                        type="number"
                        step={watchType === "PERCENTAGE" ? "0.01" : "1"}
                        min="0"
                        max={watchType === "PERCENTAGE" ? "100" : undefined}
                        disabled={watchType === "FREE_SHIPPING"}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: watchType === "FREE_SHIPPING" ? `${themeColors.surface}30` : `${themeColors.surface}50`,
                          borderColor: errors.value ? "#ef4444" : `${themeColors.primary}30`,
                          color: themeColors.text.primary,
                        }}
                        placeholder={watchType === "FREE_SHIPPING" ? "0" : "0"}
                      />
                    </div>
                    {errors.value && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.value.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
                      Compra Mínima ($)
                    </label>
                    <input
                      {...register("minOrderAmount", { valueAsNumber: true })}
                      type="number"
                      min="0"
                      step="1000"
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: `${themeColors.surface}50`,
                        borderColor: errors.minOrderAmount ? "#ef4444" : `${themeColors.primary}30`,
                        color: themeColors.text.primary,
                      }}
                      placeholder="0"
                    />
                    {errors.minOrderAmount && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.minOrderAmount.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
                      Límite de Usos
                    </label>
                    <input
                      {...register("maxUses", { valueAsNumber: true })}
                      type="number"
                      min="1"
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: `${themeColors.surface}50`,
                        borderColor: errors.maxUses ? "#ef4444" : `${themeColors.primary}30`,
                        color: themeColors.text.primary,
                      }}
                      placeholder="Sin límite"
                    />
                    {errors.maxUses && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.maxUses.message}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Categorías Aplicables */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="backdrop-blur-xl p-6 rounded-2xl border"
                style={{
                  backgroundColor: `${themeColors.surface}70`,
                  borderColor: `${themeColors.primary}30`,
                }}
              >
                <h3 className="text-lg font-bold mb-4" style={{ color: themeColors.text.primary }}>
                  Categorías Aplicables
                </h3>
                <p className="text-sm mb-6" style={{ color: themeColors.text.secondary }}>
                  Selecciona las categorías donde se puede aplicar este cupón. Si no seleccionas ninguna, se aplicará a todos los productos.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableCategories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center p-3 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-105"
                      style={{
                        borderColor: selectedCategories.includes(category.id) ? themeColors.primary : `${themeColors.primary}30`,
                        backgroundColor: selectedCategories.includes(category.id) ? `${themeColors.primary}20` : `${themeColors.surface}50`,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => toggleCategory(category.id)}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{
                            backgroundColor: selectedCategories.includes(category.id) ? themeColors.primary : `${themeColors.primary}20`,
                            color: selectedCategories.includes(category.id) ? "white" : themeColors.primary,
                          }}
                        >
                          <Package className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium" style={{ color: themeColors.text.primary }}>
                          {category.name}
                        </span>
                      </div>
                      {selectedCategories.includes(category.id) && (
                        <div className="ml-auto">
                          <CheckCircle className="w-4 h-4" style={{ color: themeColors.primary }} />
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </motion.div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Estado y Fechas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="backdrop-blur-xl p-6 rounded-2xl border"
              style={{
                backgroundColor: `${themeColors.surface}70`,
                borderColor: `${themeColors.primary}30`,
              }}
            >
              <h3 className="text-lg font-bold mb-6" style={{ color: themeColors.text.primary }}>
                Estado y Vigencia
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
                    Estado *
                  </label>
                  <EnhancedSelect
                    options={[
                      { value: "ACTIVE", label: "Activo", icon: <CheckCircle className="w-4 h-4" /> },
                      { value: "INACTIVE", label: "Inactivo", icon: <Clock className="w-4 h-4" /> },
                    ]}
                    value={watch("status")}
                    onChange={(value) => setValue("status", value as "ACTIVE" | "INACTIVE")}
                    placeholder="Seleccionar estado"
                    error={!!errors.status}
                  />
                  {errors.status && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.status.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
                    Fecha de Inicio *
                  </label>
                  <EnhancedDatePicker
                    value={watch("startDate") ? new Date(watch("startDate")).toISOString() : ""}
                    onChange={(date) => setValue("startDate", date ? new Date(date).toISOString().split('T')[0] : "")}
                    placeholder="Seleccionar fecha de inicio"
                    error={!!errors.startDate}
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.startDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
                    Fecha de Fin *
                  </label>
                  <EnhancedDatePicker
                    value={watch("endDate") ? new Date(watch("endDate")).toISOString() : ""}
                    onChange={(date) => setValue("endDate", date ? new Date(date).toISOString().split('T')[0] : "")}
                    placeholder="Seleccionar fecha de fin"
                    error={!!errors.endDate}
                    minDate={watch("startDate")}
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.endDate.message}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Acciones */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <motion.button
                type="submit"
                disabled={saving}
                whileHover={{ scale: saving ? 1 : 1.02 }}
                whileTap={{ scale: saving ? 1 : 0.98 }}
                onClick={handleSubmit(onSubmit)}
                className="w-full px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3"
                style={{
                  backgroundColor: saving ? `${themeColors.primary}60` : themeColors.primary,
                  color: "white",
                }}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Crear Cupón
                  </>
                )}
              </motion.button>

              <motion.button
                type="button"
                onClick={() => router.push("/admin/cupones")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3"
                style={{
                  backgroundColor: `${themeColors.surface}80`,
                  color: themeColors.text.primary,
                  border: `1px solid ${themeColors.primary}30`,
                }}
              >
                <X className="w-5 h-5" />
                Cancelar
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
