"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { StyledSelect } from "@/components/ui/styled-select";

interface DiscountFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
  accumulativeFilter: string;
  onAccumulativeChange: (value: string) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
}

export const DiscountFilters: React.FC<DiscountFiltersProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  accumulativeFilter,
  onAccumulativeChange,
  itemsPerPage,
  onItemsPerPageChange,
}) => {
  const { themeColors } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm"
    >
      {/* Búsqueda */}
      <div className="mb-4">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
            style={{ color: themeColors.text.secondary }}
          />
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all placeholder-gray-400"
            style={{
              color: themeColors.text.primary,
              "--tw-ring-color": `${themeColors.primary}40`,
            } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 min-w-[200px]">
          <StyledSelect
            value={statusFilter}
            onChange={onStatusChange}
            options={[
              { value: "all", label: "Todos los estados" },
              { value: "activo", label: "Activo" },
              { value: "inactivo", label: "Inactivo" },
              { value: "vencido", label: "Vencido" },
            ]}
          />
        </div>

        <div className="flex-1 min-w-[180px]">
          <StyledSelect
            value={typeFilter}
            onChange={onTypeChange}
            options={[
              { value: "all", label: "Todos los tipos" },
              { value: "PORCENTAJE", label: "Porcentaje" },
              { value: "MONTO_FIJO", label: "Monto Fijo" },
              { value: "COMPRA_LLEVA", label: "Compra y Lleva" },
            ]}
          />
        </div>

        <div className="flex-1 min-w-[180px]">
          <StyledSelect
            value={accumulativeFilter}
            onChange={onAccumulativeChange}
            options={[
              { value: "all", label: "Todos" },
              { value: "si", label: "Acumulativo" },
              { value: "no", label: "No Acumulativo" },
            ]}
          />
        </div>

        <div className="w-full sm:w-32">
          <StyledSelect
            value={itemsPerPage.toString()}
            onChange={(value: string) => onItemsPerPageChange(Number(value))}
            options={[
              { value: "5", label: "5 filas" },
              { value: "10", label: "10 filas" },
              { value: "25", label: "25 filas" },
              { value: "50", label: "50 filas" },
            ]}
          />
        </div>
      </div>
    </motion.div>
  );
};
