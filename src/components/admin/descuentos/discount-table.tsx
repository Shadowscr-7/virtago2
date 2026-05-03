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
}

interface DiscountRelation {
  id: string;
  descuentoRelacionadoId: string;
  tipoRelacion: 'CASCADA' | 'SOBRESCRIBIR' | 'REQUERIDO' | 'CONFLICTO' | 'COMBINABLE';
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
  budgetLimit?: number;
  reintegroPercentage?: number;
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
      return "bg-gray-100 text-gray-700";
    }
    if (discount.activo) {
      return "bg-green-50 text-green-700 border border-green-200";
    }
    return "bg-red-50 text-red-700 border border-red-200";
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
      className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-red-100">
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
                      className="relative w-5 h-5 bg-white border-2 border-gray-300 rounded-md transition-all duration-200"
                      style={{
                        borderColor:
                          selectedDiscounts.length === discounts.length && discounts.length > 0
                            ? themeColors.primary
                            : undefined,
                        backgroundColor:
                          selectedDiscounts.length === discounts.length && discounts.length > 0
                            ? themeColors.primary
                            : undefined,
                      }}
                    >
                      <Check className="absolute inset-0 w-3 h-3 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" />
                    </div>
                  </label>
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Descuento
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Descripción
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Válido Hasta
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Acumulativo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {discounts.map((discount, index) => (
              <motion.tr
                key={discount.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-red-50 transition-colors duration-150"
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
                      className="relative w-5 h-5 bg-white border-2 border-gray-300 rounded-md transition-all duration-200"
                      style={{
                        borderColor: selectedDiscounts.includes(discount.id) ? themeColors.primary : undefined,
                        backgroundColor: selectedDiscounts.includes(discount.id) ? themeColors.primary : undefined,
                      }}
                    >
                      <Check className="absolute inset-0 w-3 h-3 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" />
                    </div>
                  </label>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{
                        backgroundColor: themeColors.primary + "15",
                        color: themeColors.primary,
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
                            className="text-xs px-2 py-1 rounded-full font-mono bg-red-50 text-red-700"
                          >
                            {discount.codigoDescuento}
                          </span>
                        )}
                      </div>
                      {discount.budgetLimit && (
                        <span
                          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-mono mt-1 bg-red-50 text-red-700"
                        >
                          <DollarSign className="w-3 h-3" />
                          Tope: {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(discount.budgetLimit)}
                        </span>
                      )}
                      {!!discount.reintegroPercentage && discount.reintegroPercentage > 0 && (
                        <span
                          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-mono mt-1 ml-1 bg-red-50 text-red-700"
                        >
                          <Percent className="w-3 h-3" />
                          Reintegro {discount.reintegroPercentage}%
                        </span>
                      )}
                      {discount.usoMaximo && (
                        <div className="mt-1">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{discount.usoActual}/{discount.usoMaximo} usos</span>
                          </div>
                          <div className="w-20 h-1 bg-gray-200 rounded-full mt-1">
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
                            className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-700"
                          >
                            {condicion.tipoCondicion}
                          </span>
                        ))}
                        {discount.condiciones.length > 2 && (
                          <span
                            className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-700"
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
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {formatDate(discount.validoHasta)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {discount.acumulativo ? (
                      <div className="flex items-center gap-1">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-700">Sí</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <X className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">No</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(discount)}`}>
                    {getStatusText(discount)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => router.push(`/admin/descuentos/${discount.id}`)}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => router.push(`/admin/descuentos/${discount.id}/editar`)}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Mostrando{" "}
              <span className="font-semibold" style={{ color: themeColors.primary }}>
                {discounts.length > 0 ? startIndex + 1 : 0}
              </span>{" "}
              a{" "}
              <span className="font-semibold" style={{ color: themeColors.primary }}>
                {Math.min(startIndex + itemsPerPage, totalItems)}
              </span>{" "}
              de{" "}
              <span className="font-semibold" style={{ color: themeColors.primary }}>
                {totalItems}
              </span>{" "}
              descuentos
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onPreviousPage}
                disabled={currentPage === 1}
                className="p-2 rounded-lg transition-colors text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex gap-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = i + 1;
                  const isActive = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className="w-8 h-8 rounded-lg text-sm font-medium transition-all"
                      style={
                        isActive
                          ? { backgroundColor: themeColors.primary, color: "white" }
                          : { color: themeColors.text.secondary }
                      }
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={onNextPage}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg transition-colors text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
