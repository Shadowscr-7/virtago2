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

// Tipos para descuentos
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
    // Simular carga de datos
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
            tipoRelacion: "CASCADA",
            nombre: "Descuento Navidad"
          },
          {
            id: "2",
            descuentoRelacionadoId: "desc-3",
            tipoRelacion: "CONFLICTO",
            nombre: "Descuento Empleados"
          }
        ]
      };
      
      setDiscount(mockDiscount);
      setLoading(false);
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
      </div>
    </AdminLayout>
  );
}
