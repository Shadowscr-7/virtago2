"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Download, Upload, Plus, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useTheme } from "@/contexts/theme-context";
import { DiscountStatistics, DiscountFilters, DiscountTable } from "@/components/admin/descuentos";
import { toast } from "sonner";
import http from "@/api/http-client";

// Tipos para descuentos del backend
interface BackendDiscount {
  id: string;
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
  customer_type: string;
  channel: string;
  region: string;
  category: string;
  tags: string[];
  notes?: string;
  created_by: string;
  conditions: Record<string, unknown>;
  applicable_to: Array<{
    type: string;
    value: string;
  }>;
  customFields: Record<string, unknown>;
  start_date: string;
  end_date: string;
  discount_type: string;
  is_active: boolean;
  distributorCode: string;
  discountId: string;
  createdAt: string;
  updatedAt: string;
}

// Tipos para descuentos en el frontend
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

// Función para mapear descuentos del backend al formato del frontend
function mapBackendDiscountToFrontend(backend: BackendDiscount): DiscountItem {
  // Mapear tipo de descuento
  let tipo: 'PORCENTAJE' | 'MONTO_FIJO' | 'COMPRA_LLEVA' = 'PORCENTAJE';
  if (backend.discount_type === 'percentage') {
    tipo = 'PORCENTAJE';
  } else if (backend.discount_type === 'fixed') {
    tipo = 'MONTO_FIJO';
  } else if (backend.discount_type === 'bogo') {
    tipo = 'COMPRA_LLEVA';
  }

  // Mapear condiciones
  const condiciones: DiscountCondition[] = [];
  
  // Agregar condición de monto mínimo si existe
  if (backend.conditions?.min_purchase_amount) {
    condiciones.push({
      id: `cond_min_${backend.id}`,
      tipoCondicion: 'MONTO_MINIMO',
      valorCondicion: backend.conditions.min_purchase_amount as number,
    });
  }

  // Agregar condición de cantidad mínima si existe
  if (backend.conditions?.min_items) {
    condiciones.push({
      id: `cond_qty_${backend.id}`,
      tipoCondicion: 'CANTIDAD_MINIMA',
      valorCondicion: backend.conditions.min_items as number,
    });
  }

  // Mapear applicable_to a condiciones
  backend.applicable_to?.forEach((app, index) => {
    if (app.type === 'category') {
      condiciones.push({
        id: `cond_cat_${backend.id}_${index}`,
        tipoCondicion: 'CATEGORIA',
        valorCondicion: app.value,
      });
    } else if (app.type === 'product') {
      condiciones.push({
        id: `cond_prod_${backend.id}_${index}`,
        tipoCondicion: 'PRODUCTO',
        valorCondicion: app.value,
      });
    }
  });

  // Verificar si es VIP
  if (backend.customer_type === 'vip') {
    condiciones.push({
      id: `cond_vip_${backend.id}`,
      tipoCondicion: 'CLIENTE_VIP',
      valorCondicion: 'VIP',
    });
  }

  return {
    id: backend.id,
    nombre: backend.name,
    descripcion: backend.description,
    validoHasta: backend.valid_to,
    acumulativo: backend.is_cumulative,
    activo: backend.status === 'active',
    tipo,
    valor: backend.discount_value,
    codigoDescuento: backend.discount_id,
    usoMaximo: undefined, // No viene en el backend actual
    usoActual: 0, // No viene en el backend actual
    fechaCreacion: backend.createdAt,
    fechaModificacion: backend.updatedAt,
    condiciones,
    relaciones: [], // Por ahora vacío, agregar si el backend lo soporta
  };
}

export default function DescuentosAdminPage() {
  const router = useRouter();
  const { themeColors } = useTheme();
  const [discounts, setDiscounts] = useState<DiscountItem[]>([]);
  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [accumulativeFilter, setAccumulativeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDiscounts, setTotalDiscounts] = useState(0);

  // Cargar descuentos desde la API
  const loadDiscounts = async (page = 1) => {
    setIsLoading(true);
    try {
      // Construir parámetros
      const params: Record<string, string> = {
        page: page.toString(),
        limit: itemsPerPage.toString(),
      };

      // Agregar filtros si están activos
      if (searchQuery) {
        params.search = searchQuery;
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (typeFilter !== 'all') {
        params.discount_type = typeFilter;
      }

      console.log('🔍 Cargando descuentos con params:', params);

      // Llamar a la API usando httpClient
      const response = await http.get<{
        success: boolean;
        message: string;
        data?: BackendDiscount[];
        pagination?: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
          hasNextPage: boolean;
          hasPrevPage: boolean;
        };
      }>('/discounts', { params });

      console.log('📦 Respuesta de la API:', response);

      // Mapear los datos del backend al formato del frontend
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const backendDiscounts: BackendDiscount[] = (response.data as any)?.data || [];
      const mappedDiscounts: DiscountItem[] = backendDiscounts.map(mapBackendDiscountToFrontend);
      
      setDiscounts(mappedDiscounts);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pagination = (response.data as any)?.pagination;
      setTotalDiscounts(pagination?.total || mappedDiscounts.length);
      setTotalPages(pagination?.totalPages || 1);
      setCurrentPage(page);
      
      console.log(`✅ ${mappedDiscounts.length} descuentos cargados y mapeados`);
    } catch (error) {
      console.error('❌ Error al cargar descuentos:', error);
      toast.error('Error al cargar descuentos');
      setDiscounts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar descuentos al montar el componente
  useEffect(() => {
    loadDiscounts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recargar cuando cambian los filtros
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadDiscounts(1);
    }, 500); // Debounce de 500ms para búsqueda

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, typeFilter, searchQuery, itemsPerPage]);

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
      selectedDiscounts.length === discounts.length
        ? []
        : discounts.map((discount) => discount.id)
    );
  };

  const handlePageChange = (page: number) => {
    loadDiscounts(page);
    setSelectedDiscounts([]); // Limpiar selección al cambiar página
  };

  // Estadísticas
  const stats = {
    total: totalDiscounts || discounts.length,
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
              Descuentos
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
              onClick={() => router.push("/admin/descuentos/nuevo-template")}
              className="px-4 py-2 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg relative group"
              style={{
                backgroundImage: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
              }}
            >
              <Plus className="w-4 h-4" />
              Nuevo con Template
              <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                NUEVO
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/admin/descuentos/nuevo")}
              className="px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 border"
              style={{
                backgroundColor: themeColors.surface + "60",
                borderColor: themeColors.primary + "30",
                color: themeColors.text.primary,
              }}
            >
              <Plus className="w-4 h-4" />
              Modo Avanzado
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

        {/* Tabla de descuentos o estado de carga */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Loader2 className="w-12 h-12 animate-spin" style={{ color: themeColors.primary }} />
            <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando descuentos...</p>
          </motion.div>
        ) : discounts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <p className="text-xl font-semibold text-gray-600 dark:text-gray-300">
              No hay descuentos
            </p>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Comienza agregando tu primer descuento
            </p>
          </motion.div>
        ) : (
          <DiscountTable
            discounts={discounts}
            selectedDiscounts={selectedDiscounts}
            onSelectDiscount={handleSelectDiscount}
            onSelectAll={handleSelectAll}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onPreviousPage={() => handlePageChange(Math.max(1, currentPage - 1))}
            onNextPage={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            startIndex={(currentPage - 1) * itemsPerPage}
            totalItems={totalDiscounts}
          />
        )}
      </div>
    </AdminLayout>
  );
}
