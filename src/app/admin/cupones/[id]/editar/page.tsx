"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Save,
  X,
  DollarSign,
  Percent,
  Ticket,
  Package,
  Loader2,
  AlertCircle,
  CheckCircle,
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

interface CouponData {
  id: string;
  code: string;
  name: string;
  description: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  value: number;
  minOrderAmount?: number;
  maxUses?: number;
  currentUses: number;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED" | "USED_UP";
  categories?: string[];
  products?: string[];
}

// Mock data
const mockCouponData: CouponData = {
  id: "1",
  code: "BLACKFRIDAY25",
  name: "Black Friday 25%",
  description: "Descuento especial del 25% para Black Friday. Válido para productos seleccionados de las categorías de electrónicos y ropa. Compra mínima de $50.000.",
  type: "PERCENTAGE",
  value: 25,
  minOrderAmount: 50000,
  maxUses: 1000,
  currentUses: 347,
  startDate: "2025-11-25",
  endDate: "2025-11-30",
  status: "ACTIVE",
  categories: ["electronics", "clothing"],
};

const availableCategories = [
  { id: "electronics", name: "Electrónicos" },
  { id: "clothing", name: "Ropa" },
  { id: "home", name: "Hogar" },
  { id: "sports", name: "Deportes" },
  { id: "beauty", name: "Belleza" },
  { id: "books", name: "Libros" },
];

export default function EditCouponPage() {
  const { themeColors } = useTheme();
  const router = useRouter();
  const params = useParams();
  const couponId = params.id as string;
  
  const [coupon, setCoupon] = useState<CouponData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CouponForm>({
    resolver: zodResolver(couponSchema),
  });

  const watchType = watch("type");

  useEffect(() => {
    const loadCoupon = async () => {
      setLoading(true);
      // Simular carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCoupon(mockCouponData);
      setSelectedCategories(mockCouponData.categories || []);
      
      // Rellenar el formulario
      reset({
        code: mockCouponData.code,
        name: mockCouponData.name,
        description: mockCouponData.description,
        type: mockCouponData.type,
        value: mockCouponData.value,
        minOrderAmount: mockCouponData.minOrderAmount,
        maxUses: mockCouponData.maxUses,
        startDate: mockCouponData.startDate,
        endDate: mockCouponData.endDate,
        status: mockCouponData.status === "EXPIRED" || mockCouponData.status === "USED_UP" ? "INACTIVE" : mockCouponData.status,
        categories: mockCouponData.categories,
      });
      
      setLoading(false);
    };

    loadCoupon();
  }, [couponId, reset]);

  const onSubmit = async (data: CouponForm) => {
    setSaving(true);
    
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log("Datos del cupón editado:", { ...data, categories: selectedCategories });
      
      // Redirigir a detalles del cupón
      router.push(`/admin/cupones/${couponId}`);
    } catch (error) {
      console.error("Error al guardar el cupón:", error);
    } finally {
      setSaving(false);
    }
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: themeColors.primary }}></div>
        </div>
      </AdminLayout>
    );
  }

  if (!coupon) {
    return (
      <AdminLayout>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4" style={{ color: themeColors.text.primary }}>
            Cupón no encontrado
          </h2>
          <button
            onClick={() => router.push("/admin/cupones")}
            className="px-4 py-2 rounded-lg"
            style={{
              backgroundColor: themeColors.primary,
              color: "white",
            }}
          >
            Volver a Cupones
          </button>
        </div>
      </AdminLayout>
    );
  }

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
              onClick={() => router.push(`/admin/cupones/${couponId}`)}
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
                Editar Cupón
              </h1>
              <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                Dashboard → Cupones → {coupon.code} → Editar
              </p>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información Básica */}
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
              <h3 className="text-lg font-bold mb-6" style={{ color: themeColors.text.primary }}>
                Información Básica
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
                    Código del Cupón *
                  </label>
                  <input
                    {...register("code")}
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: `${themeColors.surface}50`,
                      borderColor: errors.code ? "#ef4444" : `${themeColors.primary}30`,
                      color: themeColors.text.primary,
                    }}
                    placeholder="Ej: BLACKFRIDAY25"
                  />
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
              transition={{ delay: 0.2 }}
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
              transition={{ delay: 0.3 }}
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
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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

            {/* Estadísticas Actuales */}
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
              <h3 className="text-lg font-bold mb-4" style={{ color: themeColors.text.primary }}>
                Estadísticas Actuales
              </h3>
              
              <div className="space-y-4">
                <div className="text-center p-4 rounded-xl" style={{ backgroundColor: `${themeColors.primary}10` }}>
                  <div className="text-2xl font-bold mb-1" style={{ color: themeColors.text.primary }}>
                    {coupon.currentUses}
                  </div>
                  <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                    Usos Actuales
                  </div>
                </div>
                
                {coupon.maxUses && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: themeColors.text.secondary }}>Progreso:</span>
                      <span style={{ color: themeColors.text.primary }}>
                        {Math.round((coupon.currentUses / coupon.maxUses) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min((coupon.currentUses / coupon.maxUses) * 100, 100)}%`,
                          backgroundColor: themeColors.primary,
                        }}
                      ></div>
                    </div>
                  </div>
                )}
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
                className="w-full px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3"
                style={{
                  backgroundColor: saving ? `${themeColors.primary}60` : themeColors.primary,
                  color: "white",
                }}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Guardar Cambios
                  </>
                )}
              </motion.button>

              <motion.button
                type="button"
                onClick={() => router.push(`/admin/cupones/${couponId}`)}
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
        </form>
      </div>
    </AdminLayout>
  );
}
