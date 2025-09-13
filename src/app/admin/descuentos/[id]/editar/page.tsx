"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Calendar,
  Tag,
  Percent,
  DollarSign,
  Gift,
  Target,
  Package,
  ShoppingCart,
  Crown,
  Link,
  AlertCircle,
  Info,
  Eye,
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { AdminLayout } from "@/components/admin/admin-layout";
import { ThemedSelect } from "@/components/ui/themed-select";

// Schema de validación
const discountSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().min(1, "La descripción es requerida"),
  tipo: z.enum(["PORCENTAJE", "MONTO_FIJO", "COMPRA_LLEVA"]),
  valor: z.number().min(0, "El valor debe ser mayor a 0"),
  validoHasta: z.string().min(1, "La fecha de vencimiento es requerida"),
  codigoDescuento: z.string().optional(),
  usoMaximo: z.number().optional(),
  acumulativo: z.boolean(),
  activo: z.boolean(),
  modoAplicacion: z.enum(["ACUMULABLE", "EXCLUSIVO", "CASCADA"]),
  tipoDescuento: z.enum(["PORCENTAJE", "FIJO", "BOGO", "COMBO", "VOLUMEN", "CLIENTE_ESPECIFICO", "DIA_Y_HORA", "ESCALONADO"]),
  prioridad: z.number().min(1, "La prioridad debe ser mayor a 0"),
  moneda: z.enum(["UYU", "USD", "EUR", "BRL"]),
});

type DiscountFormData = z.infer<typeof discountSchema>;

// Tipos para condiciones y relaciones
interface DiscountCondition {
  id: string;
  tipoCondicion: 'CATEGORIA' | 'PRODUCTO' | 'MONTO_MINIMO' | 'CANTIDAD_MINIMA' | 'CLIENTE_VIP';
  valorCondicion: string | number;
  descripcion?: string;
}

interface DiscountRelation {
  id: string;
  descuentoRelacionadoId: string;
  tipoRelacion: 'CASCADA' | 'SOBRESCRIBIR' | 'REQUERIDO' | 'CONFLICTO';
}

interface DiscountItem {
  id: string;
  nombre: string;
  descripcion: string;
  validoHasta: string;
  acumulativo: boolean;
  activo: boolean;
  tipo: 'PORCENTAJE' | 'MONTO_FIJO' | 'COMPRA_LLEVA';
  valor: number;
  codigoDescuento?: string;
  usoMaximo?: number;
  usoActual: number;
  fechaCreacion: string;
  fechaModificacion: string;
  condiciones: DiscountCondition[];
  relaciones: DiscountRelation[];
}

export default function EditDiscountPage() {
  const { themeColors } = useTheme();
  const router = useRouter();
  const params = useParams();
  const discountId = params.id as string;

  const [discount, setDiscount] = useState<DiscountItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [conditions, setConditions] = useState<DiscountCondition[]>([]);
  const [relations, setRelations] = useState<DiscountRelation[]>([]);
  const [activeTab, setActiveTab] = useState<'general' | 'condiciones' | 'relaciones'>('general');

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<DiscountFormData>({
    resolver: zodResolver(discountSchema),
  });

  const watchedTipo = watch("tipo");

  // Cargar datos del descuento
  useEffect(() => {
    const loadDiscount = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos de ejemplo
      const mockDiscount: DiscountItem = {
        id: discountId,
        nombre: "Descuento Black Friday",
        descripcion: "Descuento especial para la campaña de Black Friday. Válido para productos seleccionados con condiciones específicas.",
        validoHasta: "2024-11-30",
        acumulativo: true,
        activo: true,
        tipo: "PORCENTAJE",
        valor: 25,
        codigoDescuento: "BLACKFRIDAY25",
        usoMaximo: 1000,
        usoActual: 347,
        fechaCreacion: "2024-11-01",
        fechaModificacion: "2024-11-15",
        condiciones: [
          {
            id: "1",
            tipoCondicion: "MONTO_MINIMO",
            valorCondicion: 50000,
            descripcion: "Compra mínima de $50.000"
          },
          {
            id: "2",
            tipoCondicion: "CATEGORIA",
            valorCondicion: "electronics",
            descripcion: "Solo productos de electrónicos"
          },
          {
            id: "3",
            tipoCondicion: "CLIENTE_VIP",
            valorCondicion: "premium",
            descripcion: "Solo clientes Premium"
          }
        ],
        relaciones: [
          {
            id: "1",
            descuentoRelacionadoId: "desc-2",
            tipoRelacion: "CASCADA"
          },
          {
            id: "2",
            descuentoRelacionadoId: "desc-3",
            tipoRelacion: "CONFLICTO"
          }
        ]
      };
      
      setDiscount(mockDiscount);
      setConditions(mockDiscount.condiciones);
      setRelations(mockDiscount.relaciones);
      
      // Llenar el formulario con los datos existentes
      reset({
        nombre: mockDiscount.nombre,
        descripcion: mockDiscount.descripcion,
        tipo: mockDiscount.tipo,
        valor: mockDiscount.valor,
        validoHasta: mockDiscount.validoHasta,
        codigoDescuento: mockDiscount.codigoDescuento,
        usoMaximo: mockDiscount.usoMaximo,
        acumulativo: mockDiscount.acumulativo,
        activo: mockDiscount.activo,
        modoAplicacion: "ACUMULABLE",
        tipoDescuento: "PORCENTAJE",
        prioridad: 1,
        moneda: "UYU",
      });
      
      setLoading(false);
    };

    loadDiscount();
  }, [discountId, reset]);

  const onSubmit = async (data: DiscountFormData) => {
    setSaving(true);
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log("Datos actualizados del descuento:", data);
      console.log("Condiciones actualizadas:", conditions);
      console.log("Relaciones actualizadas:", relations);
      
      router.push(`/admin/descuentos/${discountId}`);
    } catch (error) {
      console.error("Error al actualizar descuento:", error);
    } finally {
      setSaving(false);
    }
  };

  const addCondition = () => {
    const newCondition: DiscountCondition = {
      id: `condition-${Date.now()}`,
      tipoCondicion: 'MONTO_MINIMO',
      valorCondicion: '',
    };
    setConditions([...conditions, newCondition]);
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  const updateCondition = (id: string, field: keyof DiscountCondition, value: string | number) => {
    setConditions(conditions.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const addRelation = () => {
    const newRelation: DiscountRelation = {
      id: `relation-${Date.now()}`,
      descuentoRelacionadoId: '',
      tipoRelacion: 'CASCADA',
    };
    setRelations([...relations, newRelation]);
  };

  const removeRelation = (id: string) => {
    setRelations(relations.filter(r => r.id !== id));
  };

  const updateRelation = (id: string, field: keyof DiscountRelation, value: string) => {
    setRelations(relations.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
  };

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case "PORCENTAJE":
        return <Percent className="w-5 h-5" />;
      case "MONTO_FIJO":
        return <DollarSign className="w-5 h-5" />;
      case "COMPRA_LLEVA":
        return <Gift className="w-5 h-5" />;
      default:
        return <Tag className="w-5 h-5" />;
    }
  };

  const getConditionIcon = (tipo: string) => {
    switch (tipo) {
      case "CATEGORIA":
        return <Package className="w-4 h-4" />;
      case "PRODUCTO":
        return <Tag className="w-4 h-4" />;
      case "MONTO_MINIMO":
        return <DollarSign className="w-4 h-4" />;
      case "CANTIDAD_MINIMA":
        return <ShoppingCart className="w-4 h-4" />;
      case "CLIENTE_VIP":
        return <Crown className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getValuePlaceholder = (tipo: string) => {
    switch (tipo) {
      case "PORCENTAJE":
        return "Ej: 25 (para 25%)";
      case "MONTO_FIJO":
        return "Ej: 10000 (para $10.000)";
      case "COMPRA_LLEVA":
        return "Ej: 3 (para 3x2)";
      default:
        return "Ingrese el valor";
    }
  };

  const getConditionPlaceholder = (tipo: string) => {
    switch (tipo) {
      case "CATEGORIA":
        return "ID de la categoría";
      case "PRODUCTO":
        return "ID del producto";
      case "MONTO_MINIMO":
        return "Monto mínimo en pesos";
      case "CANTIDAD_MINIMA":
        return "Cantidad mínima de items";
      case "CLIENTE_VIP":
        return "Tipo de cliente VIP";
      default:
        return "Valor de la condición";
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: themeColors.primary }}></div>
        </div>
      </AdminLayout>
    );
  }

  if (!discount) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4" style={{ color: themeColors.text.primary }}>
            Descuento no encontrado
          </h2>
          <button
            onClick={() => router.push("/admin/descuentos")}
            className="px-4 py-2 rounded-lg"
            style={{
              backgroundColor: themeColors.primary,
              color: "white",
            }}
          >
            Volver a Descuentos
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Header simple sin card */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(`/admin/descuentos/${discountId}`)}
                className="p-2 rounded-xl transition-colors"
                style={{
                  backgroundColor: themeColors.surface + "60",
                  color: themeColors.text.primary,
                }}
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>

              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
                  }}
                >
                  {getTypeIcon(watchedTipo || discount.tipo)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: themeColors.text.primary }}>
                    Editar Descuento
                  </h1>
                  <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                    {discount.nombre}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/admin/descuentos/${discountId}`)}
                className="px-4 py-2 border rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
                style={{
                  backgroundColor: themeColors.surface + "60",
                  borderColor: themeColors.primary + "30",
                  color: themeColors.text.primary,
                }}
              >
                <Eye className="w-4 h-4" />
                Ver Descuento
              </motion.button>

              <motion.button
                type="submit"
                disabled={saving || !isDirty}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg disabled:opacity-50"
                style={{
                  backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
                }}
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? "Guardando..." : "Guardar Cambios"}
              </motion.button>
            </div>
          </motion.div>

          {/* Indicador de cambios sin guardar */}
          {isDirty && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 rounded-lg border border-orange-300 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-600"
            >
              <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Tienes cambios sin guardar</span>
              </div>
            </motion.div>
          )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="backdrop-blur-xl rounded-2xl border overflow-hidden"
          style={{
            backgroundColor: themeColors.surface + "70",
            borderColor: themeColors.primary + "30",
          }}
        >
          <div className="flex border-b" style={{ borderColor: themeColors.primary + "20" }}>
            {[
              { id: 'general', label: 'Información General', icon: Info },
              { id: 'condiciones', label: 'Condiciones', icon: Target },
              { id: 'relaciones', label: 'Relaciones', icon: Link },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id as 'general' | 'condiciones' | 'relaciones')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-b-2'
                    : 'hover:bg-opacity-10'
                }`}
                style={{
                  ...(activeTab === tab.id && {
                    borderBottomColor: themeColors.primary,
                    color: themeColors.primary,
                    backgroundColor: `${themeColors.primary}10`,
                  }),
                  ...(activeTab !== tab.id && {
                    color: themeColors.text.secondary,
                  }),
                }}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </motion.button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'general' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Información básica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
                      Nombre del Descuento *
                    </label>
                    <Controller
                      name="nombre"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="Ej: Descuento Black Friday"
                          className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2"
                          style={{
                            backgroundColor: themeColors.surface + "50",
                            borderColor: errors.nombre ? "#ef4444" : themeColors.primary + "30",
                            color: themeColors.text.primary,
                          }}
                        />
                      )}
                    />
                    {errors.nombre && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.nombre.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
                      Tipo de Descuento *
                    </label>
                    <Controller
                      name="tipo"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2"
                          style={{
                            backgroundColor: themeColors.surface + "50",
                            borderColor: themeColors.primary + "30",
                            color: themeColors.text.primary,
                          }}
                        >
                          <option value="PORCENTAJE">Porcentaje (%)</option>
                          <option value="MONTO_FIJO">Monto Fijo ($)</option>
                          <option value="COMPRA_LLEVA">Compra y Lleva (NxM)</option>
                        </select>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
                    Descripción *
                  </label>
                  <Controller
                    name="descripcion"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows={3}
                        placeholder="Describe el descuento y sus características..."
                        className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 resize-none"
                        style={{
                          backgroundColor: themeColors.surface + "50",
                          borderColor: errors.descripcion ? "#ef4444" : themeColors.primary + "30",
                          color: themeColors.text.primary,
                        }}
                      />
                    )}
                  />
                  {errors.descripcion && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.descripcion.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
                      Valor del Descuento *
                    </label>
                    <Controller
                      name="valor"
                      control={control}
                      render={({ field: { onChange, value, ...field } }) => (
                        <input
                          {...field}
                          type="number"
                          value={value || ""}
                          onChange={(e) => onChange(Number(e.target.value))}
                          placeholder={getValuePlaceholder(watchedTipo || discount.tipo)}
                          className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2"
                          style={{
                            backgroundColor: themeColors.surface + "50",
                            borderColor: errors.valor ? "#ef4444" : themeColors.primary + "30",
                            color: themeColors.text.primary,
                          }}
                        />
                      )}
                    />
                    {errors.valor && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.valor.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
                      Válido Hasta *
                    </label>
                    <Controller
                      name="validoHasta"
                      control={control}
                      render={({ field }) => (
                        <div className="relative">
                          <input
                            {...field}
                            type="date"
                            className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2"
                            style={{
                              backgroundColor: themeColors.surface + "50",
                              borderColor: errors.validoHasta ? "#ef4444" : themeColors.primary + "30",
                              color: themeColors.text.primary,
                            }}
                          />
                          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: themeColors.text.secondary }} />
                        </div>
                      )}
                    />
                    {errors.validoHasta && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.validoHasta.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
                      Código de Descuento (Opcional)
                    </label>
                    <Controller
                      name="codigoDescuento"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          placeholder="Ej: BLACKFRIDAY25"
                          className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 font-mono"
                          style={{
                            backgroundColor: themeColors.surface + "50",
                            borderColor: themeColors.primary + "30",
                            color: themeColors.text.primary,
                          }}
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
                      Uso Máximo (Opcional)
                    </label>
                    <Controller
                      name="usoMaximo"
                      control={control}
                      render={({ field: { onChange, value, ...field } }) => (
                        <input
                          {...field}
                          type="number"
                          value={value || ""}
                          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="Dejar vacío para ilimitado"
                          className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2"
                          style={{
                            backgroundColor: themeColors.surface + "50",
                            borderColor: themeColors.primary + "30",
                            color: themeColors.text.primary,
                          }}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Nuevos campos de configuración */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
                      Modo de Aplicación *
                    </label>
                    <Controller
                      name="modoAplicacion"
                      control={control}
                      render={({ field }) => (
                        <ThemedSelect
                          value={field.value || "ACUMULABLE"}
                          onChange={field.onChange}
                          options={[
                            { value: "ACUMULABLE", label: "Acumulable" },
                            { value: "EXCLUSIVO", label: "Exclusivo" },
                            { value: "CASCADA", label: "Cascada" },
                          ]}
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
                      Tipo de Descuento *
                    </label>
                    <Controller
                      name="tipoDescuento"
                      control={control}
                      render={({ field }) => (
                        <ThemedSelect
                          value={field.value || "PORCENTAJE"}
                          onChange={field.onChange}
                          options={[
                            { value: "PORCENTAJE", label: "Porcentaje" },
                            { value: "FIJO", label: "Fijo" },
                            { value: "BOGO", label: "BOGO" },
                            { value: "COMBO", label: "Combo" },
                            { value: "VOLUMEN", label: "Volumen" },
                            { value: "CLIENTE_ESPECIFICO", label: "Cliente Específico" },
                            { value: "DIA_Y_HORA", label: "Día y Hora" },
                            { value: "ESCALONADO", label: "Escalonado" },
                          ]}
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
                      Prioridad *
                    </label>
                    <Controller
                      name="prioridad"
                      control={control}
                      render={({ field: { onChange, value, ...field } }) => (
                        <input
                          {...field}
                          type="number"
                          min="1"
                          value={value || ""}
                          onChange={(e) => onChange(Number(e.target.value))}
                          placeholder="1"
                          className="w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2"
                          style={{
                            backgroundColor: themeColors.surface + "50",
                            borderColor: errors.prioridad ? "#ef4444" : themeColors.primary + "30",
                            color: themeColors.text.primary,
                          }}
                        />
                      )}
                    />
                    {errors.prioridad && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.prioridad.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
                      Moneda *
                    </label>
                    <Controller
                      name="moneda"
                      control={control}
                      render={({ field }) => (
                        <ThemedSelect
                          value={field.value || "UYU"}
                          onChange={field.onChange}
                          options={[
                            { value: "UYU", label: "UYU - Peso Uruguayo" },
                            { value: "USD", label: "USD - Dólar Americano" },
                            { value: "EUR", label: "EUR - Euro" },
                            { value: "BRL", label: "BRL - Real Brasileño" },
                          ]}
                        />
                      )}
                    />
                  </div>

                  <div className="flex items-end">
                    <div
                      className="w-full p-4 rounded-xl border"
                      style={{
                        backgroundColor: `${themeColors.accent}10`,
                        borderColor: `${themeColors.accent}30`,
                      }}
                    >
                      <p className="text-sm font-medium mb-1" style={{ color: themeColors.text.primary }}>
                        Información
                      </p>
                      <p className="text-xs" style={{ color: themeColors.text.secondary }}>
                        La prioridad determina el orden de aplicación de los descuentos. Mayor número = mayor prioridad.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Configuraciones */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold" style={{ color: themeColors.text.primary }}>
                    Configuraciones
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Controller
                      name="acumulativo"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <label className="flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200"
                          style={{
                            backgroundColor: value ? `${themeColors.primary}10` : themeColors.surface + "50",
                            borderColor: value ? themeColors.primary : themeColors.primary + "30",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={onChange}
                            className="w-5 h-5 rounded"
                            style={{ accentColor: themeColors.primary }}
                          />
                          <div>
                            <span className="font-medium" style={{ color: themeColors.text.primary }}>
                              Descuento Acumulativo
                            </span>
                            <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                              Se puede combinar con otros descuentos
                            </p>
                          </div>
                        </label>
                      )}
                    />

                    <Controller
                      name="activo"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <label className="flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200"
                          style={{
                            backgroundColor: value ? `${themeColors.secondary}10` : themeColors.surface + "50",
                            borderColor: value ? themeColors.secondary : themeColors.primary + "30",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={onChange}
                            className="w-5 h-5 rounded"
                            style={{ accentColor: themeColors.secondary }}
                          />
                          <div>
                            <span className="font-medium" style={{ color: themeColors.text.primary }}>
                              Descuento Activo
                            </span>
                            <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                              El descuento estará disponible inmediatamente
                            </p>
                          </div>
                        </label>
                      )}
                    />
                  </div>
                </div>

                {/* Información de uso actual */}
                {discount.usoActual > 0 && (
                  <div
                    className="p-4 rounded-xl border"
                    style={{
                      backgroundColor: `${themeColors.accent}10`,
                      borderColor: `${themeColors.accent}30`,
                    }}
                  >
                    <h4 className="font-medium mb-2" style={{ color: themeColors.text.primary }}>
                      Estadísticas de Uso
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span style={{ color: themeColors.text.secondary }}>Usos actuales:</span>
                        <span className="ml-2 font-semibold" style={{ color: themeColors.accent }}>
                          {discount.usoActual}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: themeColors.text.secondary }}>Creado:</span>
                        <span className="ml-2" style={{ color: themeColors.text.primary }}>
                          {new Date(discount.fechaCreacion).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'condiciones' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: themeColors.text.primary }}>
                      Condiciones del Descuento
                    </h3>
                    <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                      Define las condiciones que deben cumplirse para aplicar el descuento
                    </p>
                  </div>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={addCondition}
                    className="px-4 py-2 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg"
                    style={{
                      backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Agregar Condición
                  </motion.button>
                </div>

                {conditions.length > 0 ? (
                  <div className="space-y-4">
                    {conditions.map((condition, index) => (
                      <motion.div
                        key={condition.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-xl border"
                        style={{
                          backgroundColor: themeColors.surface + "50",
                          borderColor: themeColors.primary + "20",
                        }}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                            style={{
                              backgroundColor: `${themeColors.primary}20`,
                              color: themeColors.primary,
                            }}
                          >
                            {getConditionIcon(condition.tipoCondicion)}
                          </div>

                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <select
                                value={condition.tipoCondicion}
                                onChange={(e) => updateCondition(condition.id, 'tipoCondicion', e.target.value)}
                                className="px-4 py-3 rounded-xl border text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                                style={{
                                  backgroundColor: themeColors.surface + "50",
                                  borderColor: themeColors.primary + "30",
                                  color: themeColors.text.primary,
                                }}
                              >
                                <option value="CATEGORIA">Categoría</option>
                                <option value="PRODUCTO">Producto</option>
                                <option value="MONTO_MINIMO">Monto Mínimo</option>
                                <option value="CANTIDAD_MINIMA">Cantidad Mínima</option>
                                <option value="CLIENTE_VIP">Cliente VIP</option>
                              </select>

                              <input
                                type={condition.tipoCondicion === 'MONTO_MINIMO' || condition.tipoCondicion === 'CANTIDAD_MINIMA' ? 'number' : 'text'}
                                value={condition.valorCondicion}
                                onChange={(e) => updateCondition(condition.id, 'valorCondicion', 
                                  condition.tipoCondicion === 'MONTO_MINIMO' || condition.tipoCondicion === 'CANTIDAD_MINIMA' 
                                    ? Number(e.target.value) 
                                    : e.target.value
                                )}
                                placeholder={getConditionPlaceholder(condition.tipoCondicion)}
                                className="px-4 py-3 rounded-xl border text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                                style={{
                                  backgroundColor: themeColors.surface + "50",
                                  borderColor: themeColors.primary + "30",
                                  color: themeColors.text.primary,
                                }}
                              />
                            </div>

                            <input
                              type="text"
                              value={condition.descripcion || ''}
                              onChange={(e) => updateCondition(condition.id, 'descripcion', e.target.value)}
                              placeholder="Descripción de la condición (opcional)"
                              className="w-full px-4 py-3 rounded-xl border text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                              style={{
                                backgroundColor: themeColors.surface + "50",
                                borderColor: themeColors.primary + "30",
                                color: themeColors.text.primary,
                              }}
                            />
                          </div>

                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeCondition(condition.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 rounded-xl border-2 border-dashed" style={{ borderColor: themeColors.primary + "30" }}>
                    <Target className="w-12 h-12 mx-auto mb-4" style={{ color: themeColors.text.secondary }} />
                    <p style={{ color: themeColors.text.secondary }}>
                      No hay condiciones configuradas. Haz clic en &quot;Agregar Condición&quot; para comenzar.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'relaciones' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: themeColors.text.primary }}>
                      Relaciones con Otros Descuentos
                    </h3>
                    <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                      Define cómo interactúa este descuento con otros descuentos del sistema
                    </p>
                  </div>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={addRelation}
                    className="px-4 py-2 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg"
                    style={{
                      backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Agregar Relación
                  </motion.button>
                </div>

                {relations.length > 0 ? (
                  <div className="space-y-4">
                    {relations.map((relation, index) => (
                      <motion.div
                        key={relation.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-xl border"
                        style={{
                          backgroundColor: themeColors.surface + "50",
                          borderColor: themeColors.primary + "20",
                        }}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                            style={{
                              backgroundColor: `${themeColors.secondary}20`,
                              color: themeColors.secondary,
                            }}
                          >
                            <Link className="w-5 h-5" />
                          </div>

                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <select
                                value={relation.tipoRelacion}
                                onChange={(e) => updateRelation(relation.id, 'tipoRelacion', e.target.value)}
                                className="px-4 py-3 rounded-xl border text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                                style={{
                                  backgroundColor: themeColors.surface + "50",
                                  borderColor: themeColors.primary + "30",
                                  color: themeColors.text.primary,
                                }}
                              >
                                <option value="CASCADA">Cascada</option>
                                <option value="SOBRESCRIBIR">Sobrescribir</option>
                                <option value="REQUERIDO">Requerido</option>
                                <option value="CONFLICTO">Conflicto</option>
                              </select>

                              <input
                                type="text"
                                value={relation.descuentoRelacionadoId}
                                onChange={(e) => updateRelation(relation.id, 'descuentoRelacionadoId', e.target.value)}
                                placeholder="ID del descuento relacionado"
                                className="px-4 py-3 rounded-xl border text-sm transition-all duration-200 focus:outline-none focus:ring-2"
                                style={{
                                  backgroundColor: themeColors.surface + "50",
                                  borderColor: themeColors.primary + "30",
                                  color: themeColors.text.primary,
                                }}
                              />
                            </div>
                          </div>

                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeRelation(relation.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 rounded-xl border-2 border-dashed" style={{ borderColor: themeColors.primary + "30" }}>
                    <Link className="w-12 h-12 mx-auto mb-4" style={{ color: themeColors.text.secondary }} />
                    <p style={{ color: themeColors.text.secondary }}>
                      No hay relaciones configuradas. Haz clic en &quot;Agregar Relación&quot; para comenzar.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </form>
      </div>
    </AdminLayout>
  );
}
