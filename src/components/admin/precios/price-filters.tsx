"use client";

import { motion } from "framer-motion";
import { Search, Upload, Download, Plus } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { StyledSelect } from "@/components/ui/styled-select";

interface PriceFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  currencyFilter: string;
  onCurrencyChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  onImport?: () => void;
  onDownloadFormat?: () => void;
  onAddPrice?: () => void;
}

export const PriceFilters: React.FC<PriceFiltersProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  currencyFilter,
  onCurrencyChange,
  categoryFilter,
  onCategoryChange,
  itemsPerPage,
  onItemsPerPageChange,
  onImport,
  onDownloadFormat,
  onAddPrice,
}) => {
  const { themeColors } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
    >
      {/* Búsqueda, filtros y botones en una sola fila */}
      <div className="flex flex-col xl:flex-row gap-4">
        {/* Búsqueda */}
        <div className="xl:w-64 relative">
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
            style={{ color: themeColors.primary }}
          />
          <input
            type="text"
            placeholder="Buscar por código, nombre o proveedor..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all placeholder-gray-400"
            style={{
              "--tw-ring-color": `${themeColors.primary}40`,
            } as React.CSSProperties}
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="w-full sm:flex-1 relative z-1">
            <StyledSelect
              value={statusFilter}
              onChange={onStatusChange}
              options={[
                { value: "all", label: "Todos los estados" },
                { value: "ACTIVO", label: "Activo" },
                { value: "INACTIVO", label: "Inactivo" },
                { value: "VENCIDO", label: "Vencido" },
                { value: "PROGRAMADO", label: "Programado" },
              ]}
            />
          </div>

          <div className="w-full sm:flex-1 relative z-1">
            <StyledSelect
              value={currencyFilter}
              onChange={onCurrencyChange}
              options={[
                { value: "all", label: "Todas las monedas" },
                { value: "USD", label: "USD" },
                { value: "UYU", label: "UYU" },
                { value: "EUR", label: "EUR" },
                { value: "BRL", label: "BRL" },
              ]}
            />
          </div>

          <div className="w-full sm:flex-1 relative z-10">
            <StyledSelect
              value={categoryFilter}
              onChange={onCategoryChange}
              options={[
                { value: "all", label: "Todas las categorías" },
                { value: "Electrónicos", label: "Electrónicos" },
                { value: "Informática", label: "Informática" },
                { value: "Accesorios", label: "Accesorios" },
              ]}
            />
          </div>

          <div className="w-full sm:w-32 relative z-1">
            <StyledSelect
              value={itemsPerPage.toString()}
              onChange={(value) => onItemsPerPageChange(Number(value))}
              options={[
                { value: "5", label: "5 filas" },
                { value: "10", label: "10 filas" },
                { value: "25", label: "25 filas" },
                { value: "50", label: "50 filas" },
              ]}
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 xl:flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onDownloadFormat}
            className="flex items-center gap-2 px-5 py-3 rounded-xl transition-all border border-gray-200 font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onImport}
            className="flex items-center gap-2 px-5 py-3 rounded-xl transition-all border border-gray-200 font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Importar</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAddPrice}
            className="flex items-center gap-2 px-5 py-3 rounded-xl transition-all text-white font-medium bg-red-700 hover:bg-red-800"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Agregar</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
