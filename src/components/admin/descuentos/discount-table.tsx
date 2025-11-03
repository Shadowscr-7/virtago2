"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Eye,
  Edit,
  Trash2,
  Calendar,
  Check,
  X,
  Tag,
  ChevronLeft,
  ChevronRight,
  Percent,
  DollarSign,
  Gift,
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

// Tipos para descuentos
interface DiscountCondition {
  id: string;
  tipoCondicion: 'CATEGORIA' | 'PRODUCTO' | 'MONTO_MINIMO' | 'CANTIDAD_MINIMA' | 'CLIENTE_VIP';
  valorCondicion: string | number;
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

interface DiscountTableProps {
  discounts: DiscountItem[];
  selectedDiscounts: string[];
  onSelectDiscount: (discountId: string) => void;
  onSelectAll: () => void;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  startIndex: number;
  totalItems: number;
}

export const DiscountTable: React.FC<DiscountTableProps> = ({
  discounts,
  selectedDiscounts,
  onSelectDiscount,
  onSelectAll,
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onPreviousPage,
  onNextPage,
  startIndex,
  totalItems,
}) => {
  const { themeColors } = useTheme();
  const router = useRouter();

  const getStatusColor = (discount: DiscountItem) => {
    const isExpired = new Date(discount.validoHasta) < new Date();
    if (isExpired) {
      return "bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300";
    }
    if (discount.activo) {
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    }
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
  };

  const getStatusText = (discount: DiscountItem) => {
    const isExpired = new Date(discount.validoHasta) < new Date();
    if (isExpired) return "VENCIDO";
    return discount.activo ? "ACTIVO" : "INACTIVO";
  };

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case "PORCENTAJE":
        return <Percent className="w-4 h-4" />;
      case "MONTO_FIJO":
        return <DollarSign className="w-4 h-4" />;
      case "COMPRA_LLEVA":
        return <Gift className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  const formatValue = (discount: DiscountItem) => {
    switch (discount.tipo) {
      case "PORCENTAJE":
        return `${discount.valor}%`;
      case "MONTO_FIJO":
        return `$${discount.valor}`;
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

  const getUsagePercentage = (discount: DiscountItem) => {
    if (!discount.usoMaximo) return 0;
    return (discount.usoActual / discount.usoMaximo) * 100;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl border shadow-lg overflow-hidden"
      style={{
        backgroundColor: themeColors.surface + "70",
        borderColor: themeColors.primary + "30",
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead
            className="backdrop-blur-sm"
            style={{
              backgroundColor: themeColors.surface + "80",
              borderColor: themeColors.primary + "20",
            }}
          >
            <tr>
              <th className="px-4 py-3 text-left">
                <div className="flex items-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedDiscounts.length === discounts.length && discounts.length > 0}
                      onChange={onSelectAll}
                      className="sr-only peer"
                    />
                    <div
                      className="relative w-5 h-5 bg-white/50 dark:bg-slate-600/50 border-2 border-gray-300 dark:border-gray-500 rounded-md transition-all duration-200 peer-hover:border-purple-400"
                      style={{
                        borderColor:
                          selectedDiscounts.length === discounts.length && discounts.length > 0
                            ? themeColors.primary
                            : undefined,
                        background:
                          selectedDiscounts.length === discounts.length && discounts.length > 0
                            ? `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`
                            : undefined,
                      }}
                    >
                      <Check className="absolute inset-0 w-3 h-3 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" />
                    </div>
                  </label>
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>
                Descuento
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>
                Descripción
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>
                Válido Hasta
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>
                Acumulativo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
            {discounts.map((discount, index) => (
              <motion.tr
                key={discount.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group hover:bg-opacity-10 transition-all duration-300 backdrop-blur-sm"
                style={{
                  background: "transparent",
                }}
                whileHover={{
                  background: `linear-gradient(to right, ${themeColors.primary}10, ${themeColors.secondary}10)`,
                }}
              >
                <td className="px-4 py-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedDiscounts.includes(discount.id)}
                      onChange={() => onSelectDiscount(discount.id)}
                      className="sr-only peer"
                    />
                    <div
                      className="relative w-5 h-5 bg-white/50 dark:bg-slate-600/50 border-2 border-gray-300 dark:border-gray-500 rounded-md transition-all duration-200 peer-hover:border-purple-400 group-hover:border-purple-300"
                      style={{
                        borderColor: selectedDiscounts.includes(discount.id) ? themeColors.primary : undefined,
                        background: selectedDiscounts.includes(discount.id)
                          ? `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`
                          : undefined,
                      }}
                    >
                      <Check className="absolute inset-0 w-3 h-3 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" />
                    </div>
                  </label>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg"
                      style={{
                        backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
                      }}
                    >
                      {getTypeIcon(discount.tipo)}
                    </div>
                    <div>
                      <div
                        className="font-semibold text-sm transition-colors duration-200 hover:underline cursor-pointer"
                        style={{ color: themeColors.text.primary }}
                        onClick={() => router.push(`/admin/descuentos/${discount.id}`)}
                      >
                        {discount.nombre}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold" style={{ color: themeColors.primary }}>
                          {formatValue(discount)}
                        </span>
                        {discount.codigoDescuento && (
                          <span
                            className="text-xs px-2 py-1 rounded-full font-mono"
                            style={{
                              backgroundColor: `${themeColors.secondary}20`,
                              color: themeColors.secondary,
                            }}
                          >
                            {discount.codigoDescuento}
                          </span>
                        )}
                      </div>
                      {discount.usoMaximo && (
                        <div className="mt-1">
                          <div className="flex items-center gap-2 text-xs" style={{ color: themeColors.text.secondary }}>
                            <span>{discount.usoActual}/{discount.usoMaximo} usos</span>
                          </div>
                          <div className="w-20 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                            <div
                              className="h-1 rounded-full transition-all duration-300"
                              style={{
                                width: `${getUsagePercentage(discount)}%`,
                                backgroundColor: themeColors.primary,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="max-w-xs">
                    <p className="text-sm truncate" style={{ color: themeColors.text.primary }}>
                      {discount.descripcion}
                    </p>
                    {discount.condiciones.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {discount.condiciones.slice(0, 2).map((condicion) => (
                          <span
                            key={condicion.id}
                            className="text-xs px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: `${themeColors.accent}20`,
                              color: themeColors.accent,
                            }}
                          >
                            {condicion.tipoCondicion}
                          </span>
                        ))}
                        {discount.condiciones.length > 2 && (
                          <span
                            className="text-xs px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: `${themeColors.accent}20`,
                              color: themeColors.accent,
                            }}
                          >
                            +{discount.condiciones.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" style={{ color: themeColors.text.secondary }} />
                    <span className="text-sm" style={{ color: themeColors.text.primary }}>
                      {formatDate(discount.validoHasta)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {discount.acumulativo ? (
                      <div className="flex items-center gap-1">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600 dark:text-green-400">Sí</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <X className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-600 dark:text-red-400">No</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(discount)}`}>
                    {getStatusText(discount)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <motion.button
                      whileHover={{
                        scale: 1.1,
                        color: themeColors.secondary,
                      }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => router.push(`/admin/descuentos/${discount.id}`)}
                      className="p-2 text-gray-400 transition-colors duration-200"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{
                        scale: 1.1,
                        color: themeColors.primary,
                      }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => router.push(`/admin/descuentos/${discount.id}/editar`)}
                      className="p-2 text-gray-400 transition-colors duration-200"
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t" style={{ borderColor: themeColors.primary + "20" }}>
          <div className="flex items-center justify-between">
            <div className="text-sm" style={{ color: themeColors.text.secondary }}>
              Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, totalItems)} de{" "}
              {totalItems} resultados
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onPreviousPage}
                disabled={currentPage === 1}
                className="p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  color: currentPage === 1 ? themeColors.text.secondary : themeColors.text.primary,
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <motion.button
                    key={page}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onPageChange(page)}
                    className="w-8 h-8 rounded-lg text-sm font-medium transition-all"
                    style={{
                      ...(currentPage === page && {
                        backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
                        color: "white",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }),
                      ...(currentPage !== page && {
                        color: themeColors.text.secondary,
                      }),
                    }}
                  >
                    {page}
                  </motion.button>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNextPage}
                disabled={currentPage === totalPages}
                className="p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  color: currentPage === totalPages ? themeColors.text.secondary : themeColors.text.primary,
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
