"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Tag,
  Users,
  TrendingUp,
  Settings,
  AlertTriangle,
  Info,
  Percent,
  DollarSign,
  Gift,
  Target,
  Package,
  ShoppingCart,
  Crown,
  Link,
  Copy,
  Check,
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { AdminLayout } from "@/components/admin/admin-layout";
import http from "@/api/http-client";
import { toast } from "sonner";

// Tipos para descuentos
interface DiscountCondition {
  id: string;
  tipoCondicion: 
    | 'CATEGORIA' 
    | 'PRODUCTO' 
    | 'MARCA'
    | 'MONTO_MINIMO' 
    | 'CANTIDAD_MINIMA'
    | 'CANTIDAD_MAXIMA'
    | 'CLIENTE_VIP'
    | 'CLIENTE_NUEVO'
    | 'CLIENTE_MAYORISTA'
    | 'METODO_PAGO'
    | 'REGION'
    | 'CANAL_VENTA'
    | 'DIA_SEMANA'
    | 'RANGO_HORARIO'
    | 'EXCLUIR_OFERTAS'
    | 'PRIMER_PEDIDO';
  valorCondicion: string | number;
  descripcion?: string;
}

interface DiscountRelation {
  id: string;
  descuentoRelacionadoId: string;
  tipoRelacion: 'CASCADA' | 'SOBRESCRIBIR' | 'REQUERIDO' | 'CONFLICTO' | 'COMBINABLE';
  nombre?: string;
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
  // Campos adicionales del backend
  currency?: string;
  validFrom?: string;
  status?: string;
  priority?: number;
  customerType?: string;
  channel?: string;
  region?: string;
  category?: string;
  tags?: string[];
  notes?: string;
  createdBy?: string;
  distributorCode?: string;
  customFields?: Record<string, unknown>;
}

interface DiscountUsage {
  id: string;
  fecha: string;
  cliente: string;
  email: string;
  pedidoId: string;
  montoDescuento: number;
  montoTotal: number;
}

export default function DiscountDetailPage() {
  const { themeColors } = useTheme();
  const router = useRouter();
  const params = useParams();
  const discountId = params.id as string;

  const [discount, setDiscount] = useState<DiscountItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'general' | 'condiciones' | 'relaciones' | 'usos'>('general');
  const [copied, setCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Datos de ejemplo
  const mockUsages: DiscountUsage[] = [
    {
      id: "1",
      fecha: "2024-11-20",
      cliente: "Juan Pérez",
      email: "juan@email.com",
      pedidoId: "PED-001",
      montoDescuento: 12500,
      montoTotal: 50000
    },
    {
      id: "2",
      fecha: "2024-11-19",
      cliente: "María García",
      email: "maria@email.com",
      pedidoId: "PED-002",
      montoDescuento: 15000,
      montoTotal: 60000
    },
    {
      id: "3",
      fecha: "2024-11-18",
      cliente: "Carlos López",
      email: "carlos@email.com",
      pedidoId: "PED-003",
      montoDescuento: 20000,
      montoTotal: 80000
    },
  ];

  useEffect(() => {
    const loadDiscount = async () => {
      if (!discountId) return;

      setLoading(true);
      try {
        console.log(`🔍 Cargando descuento ID: ${discountId}`);
        
        const response = await http.get<{
          success: boolean;
          message?: string;
          discount?: {
            discount_id: string;
            name: string;
            description: string;
            type: string;
            discount_value: number;
            currency: string;
            valid_from: string;
            valid_to: string;
            status: string;
            priority: number;
            is_cumulative: boolean;
            customer_type?: string;
            channel?: string;
            region?: string;
            category?: string;
            tags?: string[];
            notes?: string;
            created_by?: string;
            conditions?: Record<string, unknown>;
            applicable_to?: Array<{
              type: string;
              value: string;
            }>;
            customFields?: Record<string, unknown>;
            start_date?: string;
            end_date?: string;
            discount_type: string;
            is_active: boolean;
            usage_count?: number;
            usage_limit?: number;
            distributorCode?: string;
            discountId: string;
            createdAt: string;
            updatedAt: string;
          };
        }>(`/discount/${discountId}`);

        console.log('📦 Respuesta de la API:', response);

        if (!response.data?.discount) {
          throw new Error('No se encontró el descuento');
        }

        const backendData = response.data.discount;

        // Mapear tipo de descuento
        let tipo: 'PORCENTAJE' | 'MONTO_FIJO' | 'COMPRA_LLEVA' = 'PORCENTAJE';
        if (backendData.discount_type === 'percentage' || backendData.type === 'percentage') {
          tipo = 'PORCENTAJE';
        } else if (backendData.discount_type === 'fixed' || backendData.type === 'fixed') {
          tipo = 'MONTO_FIJO';
        } else if (backendData.discount_type === 'bogo' || backendData.type === 'bogo') {
          tipo = 'COMPRA_LLEVA';
        }

        // Mapear condiciones desde el backend
        const condiciones: DiscountCondition[] = [];
        
        if (backendData.conditions) {
          // Monto mínimo
          if (backendData.conditions.min_purchase_amount) {
            condiciones.push({
              id: `cond_min_${backendData.discountId}`,
              tipoCondicion: 'MONTO_MINIMO',
              valorCondicion: backendData.conditions.min_purchase_amount as number,
              descripcion: `Compra mínima de $${(backendData.conditions.min_purchase_amount as number).toLocaleString()}`
            });
          }

          // Cantidad mínima
          if (backendData.conditions.min_items) {
            condiciones.push({
              id: `cond_items_${backendData.discountId}`,
              tipoCondicion: 'CANTIDAD_MINIMA',
              valorCondicion: backendData.conditions.min_items as number,
              descripcion: `Mínimo ${backendData.conditions.min_items} items`
            });
          }

          // Cliente VIP
          if (backendData.conditions.customer_type || backendData.customer_type) {
            const customerType = (backendData.conditions.customer_type || backendData.customer_type) as string;
            condiciones.push({
              id: `cond_vip_${backendData.discountId}`,
              tipoCondicion: 'CLIENTE_VIP',
              valorCondicion: customerType,
              descripcion: `Solo clientes ${customerType}`
            });
          }

          // Condiciones adicionales de clearance
          if (backendData.conditions.limited_stock) {
            condiciones.push({
              id: `cond_stock_${backendData.discountId}`,
              tipoCondicion: 'CANTIDAD_MINIMA',
              valorCondicion: 'limited',
              descripcion: 'Stock limitado'
            });
          }

          if (backendData.conditions.while_supplies_last) {
            condiciones.push({
              id: `cond_supplies_${backendData.discountId}`,
              tipoCondicion: 'CANTIDAD_MINIMA',
              valorCondicion: 'supplies_last',
              descripcion: 'Hasta agotar stock'
            });
          }

          if (backendData.conditions.final_sale) {
            condiciones.push({
              id: `cond_final_${backendData.discountId}`,
              tipoCondicion: 'CANTIDAD_MINIMA',
              valorCondicion: 'final_sale',
              descripcion: 'Venta final - No reembolsable'
            });
          }
        }

        // Agregar condiciones desde applicable_to
        if (backendData.applicable_to && Array.isArray(backendData.applicable_to)) {
          backendData.applicable_to.forEach((item: { type: string; value: string }, index: number) => {
            if (item.type === 'category') {
              condiciones.push({
                id: `cond_cat_${index}`,
                tipoCondicion: 'CATEGORIA',
                valorCondicion: item.value,
                descripcion: `Categoría: ${item.value}`
              });
            } else if (item.type === 'product') {
              condiciones.push({
                id: `cond_prod_${index}`,
                tipoCondicion: 'PRODUCTO',
                valorCondicion: item.value,
                descripcion: `Producto: ${item.value}`
              });
            }
          });
        }

        // Mapear relaciones (actualmente vacío, se puede expandir)
        const relaciones: DiscountRelation[] = [];

        const mappedDiscount: DiscountItem = {
          id: backendData.discountId,
          nombre: backendData.name,
          descripcion: backendData.description || 'Sin descripción',
          validoHasta: backendData.valid_to || backendData.end_date || '',
          acumulativo: backendData.is_cumulative || false,
          activo: backendData.is_active || backendData.status === 'active',
          tipo,
          valor: backendData.discount_value,
          codigoDescuento: backendData.discount_id,
          usoMaximo: backendData.usage_limit,
          usoActual: backendData.usage_count || 0,
          fechaCreacion: backendData.createdAt,
          fechaModificacion: backendData.updatedAt,
          condiciones,
          relaciones,
          // Campos adicionales
          currency: backendData.currency,
          validFrom: backendData.valid_from || backendData.start_date,
          status: backendData.status,
          priority: backendData.priority,
          customerType: backendData.customer_type,
          channel: backendData.channel,
          region: backendData.region,
          category: backendData.category,
          tags: backendData.tags,
          notes: backendData.notes,
          createdBy: backendData.created_by,
          distributorCode: backendData.distributorCode,
          customFields: backendData.customFields,
        };

        setDiscount(mappedDiscount);
        console.log('✅ Descuento cargado y mapeado:', mappedDiscount);
      } catch (error) {
        console.error('❌ Error al cargar descuento:', error);
        toast.error('Error al cargar el descuento');
        setDiscount(null);
      } finally {
        setLoading(false);
      }
    };

    loadDiscount();
  }, [discountId]);

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

  const getRelationColor = (tipo: string) => {
    switch (tipo) {
      case "CASCADA":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case "SOBRESCRIBIR":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
      case "REQUERIDO":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "CONFLICTO":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300";
    }
  };

  const formatValue = (discount: DiscountItem) => {
    switch (discount.tipo) {
      case "PORCENTAJE":
        return `${discount.valor}%`;
      case "MONTO_FIJO":
        return `$${discount.valor.toLocaleString()}`;
      case "COMPRA_LLEVA":
        return `${discount.valor}x${discount.valor - 1}`;
      default:
        return discount.valor.toString();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getUsagePercentage = () => {
    if (!discount?.usoMaximo) return 0;
    return (discount.usoActual / discount.usoMaximo) * 100;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      console.log('🗑️ Eliminando descuento ID:', discountId);
      
      await http.delete(`/discount/${discountId}`);
      
      console.log('✅ Descuento eliminado exitosamente');
      toast.success('Descuento eliminado exitosamente');
      
      router.push('/admin/descuentos');
    } catch (error) {
      console.error('❌ Error al eliminar descuento:', error);
      toast.error('Error al eliminar el descuento');
      setDeleting(false);
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
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl p-6 rounded-2xl border"
          style={{
            backgroundColor: themeColors.surface + "70",
            borderColor: themeColors.primary + "30",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/admin/descuentos")}
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
                  {getTypeIcon(discount.tipo)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: themeColors.text.primary }}>
                    {discount.nombre}
                  </h1>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-lg font-bold" style={{ color: themeColors.primary }}>
                      {formatValue(discount)}
                    </span>
                    {discount.codigoDescuento && (
                      <div className="flex items-center gap-2">
                        <span
                          className="px-3 py-1 rounded-full font-mono text-sm"
                          style={{
                            backgroundColor: `${themeColors.secondary}20`,
                            color: themeColors.secondary,
                          }}
                        >
                          {discount.codigoDescuento}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => copyToClipboard(discount.codigoDescuento || "")}
                          className="p-1 rounded text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(`/admin/descuentos/${discount.id}/editar`)}
                className="px-4 py-2 border rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
                style={{
                  backgroundColor: themeColors.surface + "60",
                  borderColor: themeColors.primary + "30",
                  color: themeColors.text.primary,
                }}
              >
                <Edit className="w-4 h-4" />
                Editar
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 border rounded-xl font-medium transition-all duration-200 flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </motion.button>
            </div>
          </div>
        </motion.div>

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
              { id: 'general', label: 'General', icon: Info },
              { id: 'condiciones', label: 'Condiciones', icon: Target },
              { id: 'relaciones', label: 'Relaciones', icon: Link },
              { id: 'usos', label: 'Historial de Usos', icon: TrendingUp },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id as 'general' | 'condiciones' | 'relaciones' | 'usos')}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: `${themeColors.primary}10` }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-5 h-5" style={{ color: themeColors.primary }} />
                      <span className="font-medium" style={{ color: themeColors.text.primary }}>
                        Válido Hasta
                      </span>
                    </div>
                    <p className="text-lg font-bold" style={{ color: themeColors.primary }}>
                      {formatDate(discount.validoHasta)}
                    </p>
                  </div>

                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: `${themeColors.secondary}10` }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-5 h-5" style={{ color: themeColors.secondary }} />
                      <span className="font-medium" style={{ color: themeColors.text.primary }}>
                        Usos
                      </span>
                    </div>
                    <p className="text-lg font-bold" style={{ color: themeColors.secondary }}>
                      {discount.usoActual} / {discount.usoMaximo || '∞'}
                    </p>
                    {discount.usoMaximo && (
                      <div className="mt-2">
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${getUsagePercentage()}%`,
                              backgroundColor: themeColors.secondary,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: `${themeColors.accent}10` }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Settings className="w-5 h-5" style={{ color: themeColors.accent }} />
                      <span className="font-medium" style={{ color: themeColors.text.primary }}>
                        Estado
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          discount.activo
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                      >
                        {discount.activo ? "ACTIVO" : "INACTIVO"}
                      </span>
                      {discount.acumulativo && (
                        <span
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                          style={{
                            backgroundColor: `${themeColors.accent}20`,
                            color: themeColors.accent,
                          }}
                        >
                          ACUMULATIVO
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                <div
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: themeColors.surface + "50" }}
                >
                  <h3 className="font-semibold mb-3" style={{ color: themeColors.text.primary }}>
                    Descripción
                  </h3>
                  <p style={{ color: themeColors.text.secondary }}>
                    {discount.descripcion}
                  </p>
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: themeColors.surface + "50" }}
                  >
                    <h3 className="font-semibold mb-2" style={{ color: themeColors.text.primary }}>
                      Fecha de Creación
                    </h3>
                    <p style={{ color: themeColors.text.secondary }}>
                      {formatDate(discount.fechaCreacion)}
                    </p>
                  </div>

                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: themeColors.surface + "50" }}
                  >
                    <h3 className="font-semibold mb-2" style={{ color: themeColors.text.primary }}>
                      Última Modificación
                    </h3>
                    <p style={{ color: themeColors.text.secondary }}>
                      {formatDate(discount.fechaModificacion)}
                    </p>
                  </div>
                </div>

                {/* Información Adicional */}
                {(discount.currency || discount.region || discount.channel || discount.category || discount.distributorCode || discount.createdBy) && (
                  <div
                    className="p-6 rounded-xl"
                    style={{ backgroundColor: themeColors.surface + "50" }}
                  >
                    <h3 className="font-semibold mb-4 text-lg" style={{ color: themeColors.text.primary }}>
                      Información Adicional
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {discount.currency && (
                        <div className="flex items-start gap-3">
                          <DollarSign className="w-5 h-5 mt-0.5" style={{ color: themeColors.primary }} />
                          <div>
                            <p className="text-sm font-medium" style={{ color: themeColors.text.secondary }}>
                              Moneda
                            </p>
                            <p className="font-semibold" style={{ color: themeColors.text.primary }}>
                              {discount.currency}
                            </p>
                          </div>
                        </div>
                      )}

                      {discount.region && (
                        <div className="flex items-start gap-3">
                          <Target className="w-5 h-5 mt-0.5" style={{ color: themeColors.primary }} />
                          <div>
                            <p className="text-sm font-medium" style={{ color: themeColors.text.secondary }}>
                              Región
                            </p>
                            <p className="font-semibold" style={{ color: themeColors.text.primary }}>
                              {discount.region}
                            </p>
                          </div>
                        </div>
                      )}

                      {discount.channel && (
                        <div className="flex items-start gap-3">
                          <ShoppingCart className="w-5 h-5 mt-0.5" style={{ color: themeColors.primary }} />
                          <div>
                            <p className="text-sm font-medium" style={{ color: themeColors.text.secondary }}>
                              Canal
                            </p>
                            <p className="font-semibold" style={{ color: themeColors.text.primary }}>
                              {discount.channel}
                            </p>
                          </div>
                        </div>
                      )}

                      {discount.category && (
                        <div className="flex items-start gap-3">
                          <Package className="w-5 h-5 mt-0.5" style={{ color: themeColors.primary }} />
                          <div>
                            <p className="text-sm font-medium" style={{ color: themeColors.text.secondary }}>
                              Categoría
                            </p>
                            <p className="font-semibold" style={{ color: themeColors.text.primary }}>
                              {discount.category}
                            </p>
                          </div>
                        </div>
                      )}

                      {discount.customerType && (
                        <div className="flex items-start gap-3">
                          <Crown className="w-5 h-5 mt-0.5" style={{ color: themeColors.primary }} />
                          <div>
                            <p className="text-sm font-medium" style={{ color: themeColors.text.secondary }}>
                              Tipo de Cliente
                            </p>
                            <p className="font-semibold" style={{ color: themeColors.text.primary }}>
                              {discount.customerType}
                            </p>
                          </div>
                        </div>
                      )}

                      {discount.distributorCode && (
                        <div className="flex items-start gap-3">
                          <Tag className="w-5 h-5 mt-0.5" style={{ color: themeColors.primary }} />
                          <div>
                            <p className="text-sm font-medium" style={{ color: themeColors.text.secondary }}>
                              Código Distribuidor
                            </p>
                            <p className="font-semibold" style={{ color: themeColors.text.primary }}>
                              {discount.distributorCode}
                            </p>
                          </div>
                        </div>
                      )}

                      {discount.createdBy && (
                        <div className="flex items-start gap-3">
                          <Users className="w-5 h-5 mt-0.5" style={{ color: themeColors.primary }} />
                          <div>
                            <p className="text-sm font-medium" style={{ color: themeColors.text.secondary }}>
                              Creado Por
                            </p>
                            <p className="font-semibold" style={{ color: themeColors.text.primary }}>
                              {discount.createdBy}
                            </p>
                          </div>
                        </div>
                      )}

                      {discount.priority !== undefined && (
                        <div className="flex items-start gap-3">
                          <TrendingUp className="w-5 h-5 mt-0.5" style={{ color: themeColors.primary }} />
                          <div>
                            <p className="text-sm font-medium" style={{ color: themeColors.text.secondary }}>
                              Prioridad
                            </p>
                            <p className="font-semibold" style={{ color: themeColors.text.primary }}>
                              {discount.priority}
                            </p>
                          </div>
                        </div>
                      )}

                      {discount.validFrom && (
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 mt-0.5" style={{ color: themeColors.primary }} />
                          <div>
                            <p className="text-sm font-medium" style={{ color: themeColors.text.secondary }}>
                              Válido Desde
                            </p>
                            <p className="font-semibold" style={{ color: themeColors.text.primary }}>
                              {formatDate(discount.validFrom)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {discount.tags && discount.tags.length > 0 && (
                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: themeColors.surface + "50" }}
                  >
                    <h3 className="font-semibold mb-3" style={{ color: themeColors.text.primary }}>
                      Etiquetas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {discount.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full text-sm font-medium"
                          style={{
                            backgroundColor: `${themeColors.primary}20`,
                            color: themeColors.primary,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notas */}
                {discount.notes && (
                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: themeColors.surface + "50" }}
                  >
                    <h3 className="font-semibold mb-3" style={{ color: themeColors.text.primary }}>
                      Notas
                    </h3>
                    <p style={{ color: themeColors.text.secondary }}>
                      {discount.notes}
                    </p>
                  </div>
                )}

                {/* Custom Fields */}
                {discount.customFields && Object.keys(discount.customFields).length > 0 && (
                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: themeColors.surface + "50" }}
                  >
                    <h3 className="font-semibold mb-3" style={{ color: themeColors.text.primary }}>
                      Campos Personalizados
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(discount.customFields).map(([key, value]) => (
                        <div key={key} className="flex flex-col gap-1">
                          <p className="text-sm font-medium" style={{ color: themeColors.text.secondary }}>
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                          <p className="font-semibold" style={{ color: themeColors.text.primary }}>
                            {typeof value === 'boolean' ? (value ? 'Sí' : 'No') : String(value)}
                          </p>
                        </div>
                      ))}
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
                {discount.condiciones.length > 0 ? (
                  <div className="grid gap-4">
                    {discount.condiciones.map((condicion, index) => (
                      <motion.div
                        key={condicion.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-xl border"
                        style={{
                          backgroundColor: themeColors.surface + "50",
                          borderColor: themeColors.primary + "20",
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                              backgroundColor: `${themeColors.primary}20`,
                              color: themeColors.primary,
                            }}
                          >
                            {getConditionIcon(condicion.tipoCondicion)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium mb-1" style={{ color: themeColors.text.primary }}>
                              {condicion.tipoCondicion.replace('_', ' ')}
                            </h4>
                            <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                              {condicion.descripcion || `Valor: ${condicion.valorCondicion}`}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: themeColors.text.secondary }} />
                    <p style={{ color: themeColors.text.secondary }}>
                      No hay condiciones configuradas para este descuento
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
                {discount.relaciones.length > 0 ? (
                  <div className="grid gap-4">
                    {discount.relaciones.map((relacion, index) => (
                      <motion.div
                        key={relacion.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-xl border"
                        style={{
                          backgroundColor: themeColors.surface + "50",
                          borderColor: themeColors.primary + "20",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Link className="w-5 h-5" style={{ color: themeColors.primary }} />
                            <div>
                              <h4 className="font-medium" style={{ color: themeColors.text.primary }}>
                                {relacion.nombre || `Descuento ${relacion.descuentoRelacionadoId}`}
                              </h4>
                              <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                                Relación de tipo: {relacion.tipoRelacion}
                              </p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRelationColor(relacion.tipoRelacion)}`}>
                            {relacion.tipoRelacion}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Link className="w-12 h-12 mx-auto mb-4" style={{ color: themeColors.text.secondary }} />
                    <p style={{ color: themeColors.text.secondary }}>
                      No hay relaciones configuradas para este descuento
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'usos' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {mockUsages.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b" style={{ borderColor: themeColors.primary + "20" }}>
                          <th className="text-left py-3 px-4 font-medium" style={{ color: themeColors.text.primary }}>
                            Fecha
                          </th>
                          <th className="text-left py-3 px-4 font-medium" style={{ color: themeColors.text.primary }}>
                            Cliente
                          </th>
                          <th className="text-left py-3 px-4 font-medium" style={{ color: themeColors.text.primary }}>
                            Pedido
                          </th>
                          <th className="text-left py-3 px-4 font-medium" style={{ color: themeColors.text.primary }}>
                            Descuento
                          </th>
                          <th className="text-left py-3 px-4 font-medium" style={{ color: themeColors.text.primary }}>
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockUsages.map((uso, index) => (
                          <motion.tr
                            key={uso.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="border-b"
                            style={{ borderColor: themeColors.primary + "10" }}
                          >
                            <td className="py-3 px-4" style={{ color: themeColors.text.secondary }}>
                              {formatDate(uso.fecha)}
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium" style={{ color: themeColors.text.primary }}>
                                  {uso.cliente}
                                </p>
                                <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                                  {uso.email}
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className="px-2 py-1 rounded text-sm font-mono"
                                style={{
                                  backgroundColor: `${themeColors.primary}20`,
                                  color: themeColors.primary,
                                }}
                              >
                                {uso.pedidoId}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-medium" style={{ color: themeColors.secondary }}>
                              -${uso.montoDescuento.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 font-medium" style={{ color: themeColors.text.primary }}>
                              ${uso.montoTotal.toLocaleString()}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4" style={{ color: themeColors.text.secondary }} />
                    <p style={{ color: themeColors.text.secondary }}>
                      No hay registros de uso para este descuento
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Modal de Confirmación de Eliminación */}
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => !deleting && setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl border p-6 max-w-md w-full"
              style={{
                backgroundColor: themeColors.surface,
                borderColor: themeColors.primary + "30",
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-100 dark:bg-red-900/20">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: themeColors.text.primary }}>
                    Eliminar Descuento
                  </h3>
                  <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>

              <p className="mb-6" style={{ color: themeColors.text.secondary }}>
                ¿Estás seguro de que deseas eliminar el descuento <strong style={{ color: themeColors.text.primary }}>{discount?.nombre}</strong>?
                {discount && discount.usoActual > 0 && (
                  <span className="block mt-2 text-red-600 dark:text-red-400">
                    Este descuento ya ha sido usado {discount.usoActual} {discount.usoActual === 1 ? 'vez' : 'veces'}.
                  </span>
                )}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-200 border"
                  style={{
                    backgroundColor: themeColors.surface + "60",
                    borderColor: themeColors.primary + "30",
                    color: themeColors.text.primary,
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 rounded-xl font-medium transition-all duration-200 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
}
