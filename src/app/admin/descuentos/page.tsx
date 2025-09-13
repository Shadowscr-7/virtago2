"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Download, Upload, Plus } from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useTheme } from "@/contexts/theme-context";
import { DiscountStatistics, DiscountFilters, DiscountTable } from "@/components/admin/descuentos";

// Tipos para descuentos
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

// Datos de ejemplo
const mockDiscounts: DiscountItem[] = [
  {
    id: "DESC001",
    nombre: "Descuento Black Friday",
    descripcion: "Descuento especial para Black Friday en categoría electrónicos",
    validoHasta: "2025-11-30",
    acumulativo: false,
    activo: true,
    tipo: "PORCENTAJE",
    valor: 25,
    codigoDescuento: "BLACKFRIDAY25",
    usoMaximo: 1000,
    usoActual: 287,
    fechaCreacion: "2024-10-01",
    fechaModificacion: "2024-11-15",
    condiciones: [
      { id: "C1", tipoCondicion: "CATEGORIA", valorCondicion: "Electrónicos" },
      { id: "C2", tipoCondicion: "MONTO_MINIMO", valorCondicion: 500 }
    ],
    relaciones: []
  },
  {
    id: "DESC002", 
    nombre: "Descuento Cliente VIP",
    descripcion: "Descuento permanente para clientes VIP",
    validoHasta: "2025-12-31",
    acumulativo: true,
    activo: true,
    tipo: "PORCENTAJE",
    valor: 15,
    usoMaximo: undefined,
    usoActual: 1524,
    fechaCreacion: "2024-01-01",
    fechaModificacion: "2024-09-10",
    condiciones: [
      { id: "C3", tipoCondicion: "CLIENTE_VIP", valorCondicion: "VIP" }
    ],
    relaciones: [
      { id: "R1", descuentoRelacionadoId: "DESC001", tipoRelacion: "CASCADA" }
    ]
  },
  {
    id: "DESC003",
    nombre: "3x2 en Accesorios",
    descripcion: "Promoción 3x2 en toda la categoría de accesorios",
    validoHasta: "2025-10-15",
    acumulativo: false,
    activo: true,
    tipo: "COMPRA_LLEVA",
    valor: 3,
    codigoDescuento: "3X2ACC",
    usoMaximo: 500,
    usoActual: 156,
    fechaCreacion: "2024-09-01",
    fechaModificacion: "2024-09-20",
    condiciones: [
      { id: "C4", tipoCondicion: "CATEGORIA", valorCondicion: "Accesorios" },
      { id: "C5", tipoCondicion: "CANTIDAD_MINIMA", valorCondicion: 3 }
    ],
    relaciones: []
  },
  {
    id: "DESC004",
    nombre: "Descuento Nuevo Cliente",
    descripcion: "Descuento de bienvenida para nuevos clientes",
    validoHasta: "2025-12-31",
    acumulativo: false,
    activo: false,
    tipo: "MONTO_FIJO",
    valor: 50,
    codigoDescuento: "BIENVENIDO50",
    usoMaximo: 10000,
    usoActual: 3245,
    fechaCreacion: "2024-06-01",
    fechaModificacion: "2024-11-01",
    condiciones: [
      { id: "C6", tipoCondicion: "MONTO_MINIMO", valorCondicion: 200 }
    ],
    relaciones: []
  },
  {
    id: "DESC005",
    nombre: "Descuento Informática",
    descripcion: "Descuento especial en productos de informática",
    validoHasta: "2025-09-30",
    acumulativo: true,
    activo: true,
    tipo: "PORCENTAJE",
    valor: 20,
    codigoDescuento: "INFO20",
    usoMaximo: 750,
    usoActual: 89,
    fechaCreacion: "2024-08-15",
    fechaModificacion: "2024-09-05",
    condiciones: [
      { id: "C7", tipoCondicion: "CATEGORIA", valorCondicion: "Informática" },
      { id: "C8", tipoCondicion: "MONTO_MINIMO", valorCondicion: 300 }
    ],
    relaciones: [
      { id: "R2", descuentoRelacionadoId: "DESC002", tipoRelacion: "REQUERIDO" }
    ]
  }
];

export default function DescuentosAdminPage() {
  const router = useRouter();
  const { themeColors } = useTheme();
  const [discounts] = useState<DiscountItem[]>(mockDiscounts);
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [accumulativeFilter, setAccumulativeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filtrar descuentos
  const filteredDiscounts = discounts.filter((discount) => {
    const matchesSearch =
      discount.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discount.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (discount.codigoDescuento && discount.codigoDescuento.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "activo" && discount.activo) ||
      (statusFilter === "inactivo" && !discount.activo) ||
      (statusFilter === "vencido" && new Date(discount.validoHasta) < new Date());

    const matchesType = typeFilter === "all" || discount.tipo === typeFilter;
    const matchesAccumulative = 
      accumulativeFilter === "all" ||
      (accumulativeFilter === "si" && discount.acumulativo) ||
      (accumulativeFilter === "no" && !discount.acumulativo);

    return matchesSearch && matchesStatus && matchesType && matchesAccumulative;
  });

  // Ordenar descuentos por fecha de modificación (más reciente primero)
  const sortedDiscounts = [...filteredDiscounts].sort((a, b) => {
    const aValue = new Date(a.fechaModificacion).getTime();
    const bValue = new Date(b.fechaModificacion).getTime();
    return bValue - aValue;
  });

  // Paginación
  const totalPages = Math.ceil(sortedDiscounts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDiscounts = sortedDiscounts.slice(startIndex, startIndex + itemsPerPage);

  // Handlers
  const handleSelectDiscount = (discountId: string) => {
    setSelectedDiscounts((prev) =>
      prev.includes(discountId)
        ? prev.filter((id) => id !== discountId)
        : [...prev, discountId]
    );
  };

  const handleSelectAll = () => {
    setSelectedDiscounts(
      selectedDiscounts.length === currentDiscounts.length
        ? []
        : currentDiscounts.map((discount) => discount.id)
    );
  };

  // Estadísticas
  const stats = {
    total: discounts.length,
    activos: discounts.filter((discount) => discount.activo).length,
    inactivos: discounts.filter((discount) => !discount.activo).length,
    vencidos: discounts.filter((discount) => new Date(discount.validoHasta) < new Date()).length,
    totalUsos: discounts.reduce((acc, discount) => acc + discount.usoActual, 0),
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1
              className="text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
              }}
            >
              Listas De Descuentos
            </h1>
            <p style={{ color: themeColors.text.secondary }}>
              Administra y gestiona los descuentos y promociones
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg"
              style={{
                backgroundImage: `linear-gradient(to right, ${themeColors.secondary}, ${themeColors.accent})`,
              }}
            >
              <Upload className="w-4 h-4" />
              Importar
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 border rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
              style={{
                backgroundColor: themeColors.surface + "60",
                borderColor: themeColors.primary + "30",
                color: themeColors.text.primary,
              }}
            >
              <Download className="w-4 h-4" />
              Descargar Formato
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/admin/descuentos/nuevo")}
              className="px-4 py-2 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg"
              style={{
                backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
              }}
            >
              <Plus className="w-4 h-4" />
              Agregar Descuento
            </motion.button>
          </div>
        </motion.div>

        {/* Estadísticas */}
        <DiscountStatistics stats={stats} />

        {/* Filtros y búsqueda */}
        <DiscountFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          accumulativeFilter={accumulativeFilter}
          onAccumulativeChange={setAccumulativeFilter}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
        />

        {/* Tabla de descuentos */}
        <DiscountTable
          discounts={currentDiscounts}
          selectedDiscounts={selectedDiscounts}
          onSelectDiscount={handleSelectDiscount}
          onSelectAll={handleSelectAll}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onPreviousPage={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          onNextPage={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          startIndex={startIndex}
          totalItems={sortedDiscounts.length}
        />
      </div>
    </AdminLayout>
  );
}
