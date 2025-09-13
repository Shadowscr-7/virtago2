"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
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
}) => {
  const { themeColors } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-col xl:flex-row gap-4 p-6 backdrop-blur-xl rounded-2xl border shadow-lg"
      style={{
        backgroundColor: themeColors.surface + "70",
        borderColor: themeColors.primary + "30",
      }}
    >
      {/* Primera fila - Búsqueda y filtros */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1">
        {/* Búsqueda */}
        <div className="flex-1 lg:flex-[2] relative">
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
            style={{ color: themeColors.text.secondary }}
          />
          <input
            type="text"
            placeholder="Buscar por código, nombre o proveedor..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all placeholder-gray-400 backdrop-blur-sm"
            style={{
              backgroundColor: themeColors.surface + "60",
              borderColor: themeColors.primary + "30",
              color: themeColors.text.primary,
              "--tw-ring-color": `${themeColors.primary}50`,
            } as React.CSSProperties}
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3 lg:flex-[3]">
          <div className="flex-1 min-w-[200px]">
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

          <div className="flex-1 min-w-[180px]">
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

          <div className="flex-1 min-w-[180px]">
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

          <div className="w-full sm:w-32">
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
      </div>
    </motion.div>
  );
};
