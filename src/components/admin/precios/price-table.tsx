"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Eye,
  Edit,
  Calendar,
  Check,
  Package,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

// Tipos para precios
interface PriceItem {
  id: string;
  productCode: string;
  productName: string;
  minQuantity: number;
  price: number;
  currency: 'USD' | 'UYU' | 'EUR' | 'BRL';
  endDate: string;
  includeIVA: boolean;
  status: 'ACTIVO' | 'INACTIVO' | 'VENCIDO' | 'PROGRAMADO';
  createdAt: string;
  updatedAt: string;
  margin?: number;
  costPrice?: number;
  category?: string;
  supplier?: string;
}

interface PriceTableProps {
  prices: PriceItem[];
  selectedPrices: string[];
  onSelectPrice: (priceId: string) => void;
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

export const PriceTable: React.FC<PriceTableProps> = ({
  prices,
  selectedPrices,
  onSelectPrice,
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
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    show: boolean;
    priceId: string;
    currentState: boolean;
  }>({
    show: false,
    priceId: "",
    currentState: false,
  });

  const handleStatusClick = (priceId: string, currentStatus: string) => {
    setShowConfirmDialog({
      show: true,
      priceId: priceId,
      currentState: currentStatus === "ACTIVO",
    });
  };

  const confirmStatusChange = async () => {
    const priceId = showConfirmDialog.priceId;
    const currentStatus = showConfirmDialog.currentState;

    // TODO: Implementar cambio de estado en el backend
    console.log(`Cambiar estado del precio ${priceId} de ${currentStatus ? "ACTIVO" : "INACTIVO"} a ${currentStatus ? "INACTIVO" : "ACTIVO"}`);

    // Cerrar modal
    setShowConfirmDialog({ show: false, priceId: "", currentState: false });
  };

  const formatCurrency = (value: number, currency: string) => {
    const symbols = { USD: "$", UYU: "$U", EUR: "€", BRL: "R$" };
    return `${symbols[currency as keyof typeof symbols] || "$"} ${value.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "ACTIVO":
        return "bg-green-50 text-green-700 border border-green-200";
      case "INACTIVO":
        return "bg-gray-100 text-gray-600 border border-gray-200";
      case "VENCIDO":
        return "bg-red-50 text-red-700 border border-red-200";
      case "PROGRAMADO":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      default:
        return "bg-gray-100 text-gray-600 border border-gray-200";
    }
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
                      checked={selectedPrices.length === prices.length && prices.length > 0}
                      onChange={onSelectAll}
                      className="sr-only peer"
                    />
                    <div
                      className="relative w-5 h-5 bg-white border-2 border-gray-300 rounded-md transition-all duration-200"
                      style={{
                        borderColor:
                          selectedPrices.length === prices.length && prices.length > 0
                            ? themeColors.primary
                            : undefined,
                        backgroundColor:
                          selectedPrices.length === prices.length && prices.length > 0
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
                Cod. Producto
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Min. Cant. Venta
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Precio
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Moneda
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Fecha Fin
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Inc. IVA
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Estado
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {prices.map((price, index) => (
              <motion.tr
                key={price.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-red-50 transition-colors duration-150"
              >
                <td className="px-4 py-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPrices.includes(price.id)}
                      onChange={() => onSelectPrice(price.id)}
                      className="sr-only peer"
                    />
                    <div
                      className="relative w-5 h-5 bg-white border-2 border-gray-300 rounded-md transition-all duration-200"
                      style={{
                        borderColor: selectedPrices.includes(price.id) ? themeColors.primary : undefined,
                        backgroundColor: selectedPrices.includes(price.id) ? themeColors.primary : undefined,
                      }}
                    >
                      <Check className="absolute inset-0 w-3 h-3 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" />
                    </div>
                  </label>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: themeColors.primary + "15" }}
                    >
                      <Package className="w-4 h-4" style={{ color: themeColors.primary }} />
                    </div>
                    <div>
                      <div
                        className="font-semibold text-sm transition-colors duration-200 hover:underline cursor-pointer"
                        style={{ color: themeColors.text.primary }}
                        onClick={() => router.push(`/admin/precios/${price.id}`)}
                      >
                        {price.productCode}
                      </div>
                      <div className="text-xs text-gray-500">
                        {price.productName}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium" style={{ color: themeColors.text.primary }}>
                      {price.minQuantity}
                    </span>
                    <span className="text-xs text-gray-400">
                      uds
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold" style={{ color: themeColors.primary }}>
                      {formatCurrency(price.price, price.currency)}
                    </span>
                    {price.margin && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full bg-red-50 text-red-700"
                      >
                        +{price.margin}%
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-mono font-medium" style={{ color: themeColors.text.primary }}>
                    {price.currency}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {formatDate(price.endDate)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {price.includeIVA ? (
                      <div className="flex items-center gap-1">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700">Sí</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">No</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleStatusClick(price.id, price.status)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${getStatusStyles(price.status)}`}
                  >
                    {price.status}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => router.push(`/admin/precios/${price.id}`)}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
                      title="Ver"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => router.push(`/admin/precios/${price.id}/editar`)}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
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
              Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, totalItems)} de{" "}
              {totalItems} resultados
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className="w-8 h-8 rounded-lg text-sm font-medium transition-all"
                    style={
                      currentPage === page
                        ? { backgroundColor: themeColors.primary, color: "white" }
                        : { color: themeColors.text.secondary }
                    }
                  >
                    {page}
                  </button>
                ))}
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

      {/* Modal de Confirmación - Cambio de Estado */}
      {showConfirmDialog.show && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onClick={() => setShowConfirmDialog({ show: false, priceId: "", currentState: false })}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-md w-full border border-gray-200 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-red-50">
                <AlertTriangle className="w-5 h-5 text-red-700" />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: themeColors.text.primary }}>
                  Confirmar Cambio de Estado
                </h3>
                <p className="text-sm text-gray-500">
                  Esta acción afectará el acceso del cliente
                </p>
              </div>
            </div>

            <p className="mb-6 text-gray-600">
              ¿Estás seguro que deseas{" "}
              {showConfirmDialog.currentState ? "desactivar" : "activar"} este precio?
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmDialog({ show: false, priceId: "", currentState: false })}
                className="px-4 py-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmStatusChange}
                className="px-4 py-2 text-white rounded-lg bg-red-700 hover:bg-red-800 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
