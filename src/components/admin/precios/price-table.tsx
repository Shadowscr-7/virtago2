"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Eye,
  Edit,
  Trash2,
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVO":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "INACTIVO":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      case "VENCIDO":
        return "bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300";
      case "PROGRAMADO":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300";
    }
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="backdrop-blur-xl rounded-2xl border shadow-lg overflow-hidden"
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
                      checked={selectedPrices.length === prices.length && prices.length > 0}
                      onChange={onSelectAll}
                      className="sr-only peer"
                    />
                    <div
                      className="relative w-5 h-5 bg-white/50 dark:bg-slate-600/50 border-2 border-gray-300 dark:border-gray-500 rounded-md transition-all duration-200 peer-hover:border-purple-400"
                      style={{
                        borderColor:
                          selectedPrices.length === prices.length && prices.length > 0
                            ? themeColors.primary
                            : undefined,
                        background:
                          selectedPrices.length === prices.length && prices.length > 0
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
                Cod. Producto
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>
                Min. Cant. Venta
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>
                Precio
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>
                Moneda
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>
                Fecha Fin
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>
                Inc. IVA
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
            {prices.map((price, index) => (
              <motion.tr
                key={price.id}
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
                      checked={selectedPrices.includes(price.id)}
                      onChange={() => onSelectPrice(price.id)}
                      className="sr-only peer"
                    />
                    <div
                      className="relative w-5 h-5 bg-white/50 dark:bg-slate-600/50 border-2 border-gray-300 dark:border-gray-500 rounded-md transition-all duration-200 peer-hover:border-purple-400 group-hover:border-purple-300"
                      style={{
                        borderColor: selectedPrices.includes(price.id) ? themeColors.primary : undefined,
                        background: selectedPrices.includes(price.id)
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
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div
                        className="font-semibold text-sm transition-colors duration-200 hover:underline cursor-pointer"
                        style={{ color: themeColors.text.primary }}
                        onClick={() => router.push(`/admin/precios/${price.id}`)}
                      >
                        {price.productCode}
                      </div>
                      <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                        {price.productName}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: themeColors.text.primary }}>
                      {price.minQuantity}
                    </span>
                    <span className="text-xs" style={{ color: themeColors.text.secondary }}>
                      unidades
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
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: `${themeColors.secondary}20`,
                          color: themeColors.secondary,
                        }}
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
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" style={{ color: themeColors.text.secondary }} />
                    <span className="text-sm" style={{ color: themeColors.text.primary }}>
                      {formatDate(price.endDate)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {price.includeIVA ? (
                      <div className="flex items-center gap-1">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600 dark:text-green-400">Sí</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-600 dark:text-red-400">No</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(price.status)}`}>
                    {price.status}
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
                      onClick={() => router.push(`/admin/precios/${price.id}`)}
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
                      onClick={() => router.push(`/admin/precios/${price.id}/editar`)}
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
