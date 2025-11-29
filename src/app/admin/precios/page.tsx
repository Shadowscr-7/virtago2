"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useTheme } from "@/contexts/theme-context";
import { PriceFilters, PriceTable } from "@/components/admin/precios";
import { PriceImportModal } from "@/components/admin/precios/price-import-modal";
import http from "@/api/http-client";
import { toast } from "sonner";

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

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function PreciosAdminPage() {
  const router = useRouter();
  const { themeColors } = useTheme();
  const [prices, setPrices] = useState<PriceItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currencyFilter, setCurrencyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Cargar precios desde el API con paginación en servidor
  useEffect(() => {
    const loadPrices = async () => {
      setIsLoading(true);
      try {
        // Construir parámetros de consulta
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
        });

        // Agregar filtros si están activos
        if (statusFilter !== "all") {
          params.append("status", statusFilter.toLowerCase());
        }
        if (currencyFilter !== "all") {
          params.append("currency", currencyFilter);
        }
        if (searchQuery) {
          params.append("search", searchQuery);
        }

        const response = await http.get(`/price/?${params.toString()}`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = response.data as any;
        
        console.log("📦 Respuesta del API de precios:", result);
        
        // Mapear datos del backend al formato del frontend
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pricesData = (result.data || []).map((item: any) => ({
          id: item.priceId || item.price_id || item.id,
          productCode: item.productSku || item.product_id || "",
          productName: item.productName || item.name || "",
          minQuantity: item.minQuantity || item.min_quantity || 1,
          price: item.basePrice || item.base_price || item.salePrice || item.sale_price || 0,
          currency: (item.currency || "USD").toUpperCase(),
          endDate: item.validFrom || item.valid_from || new Date().toISOString(),
          includeIVA: item.taxIncluded || item.tax_included || false,
          status: item.status === "active" ? "ACTIVO" : item.status === "inactive" ? "INACTIVO" : "ACTIVO",
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
          margin: item.margin || item.margin_percentage || 0,
          costPrice: item.costPrice || item.cost_price || 0,
          category: item.category || "",
          supplier: item.supplier || "",
        }));
        
        setPrices(pricesData);
        
        // Actualizar información de paginación
        if (result.pagination) {
          setPagination({
            page: result.pagination.page || 1,
            limit: result.pagination.limit || itemsPerPage,
            total: result.pagination.total || 0,
            totalPages: result.pagination.totalPages || 0,
            hasNextPage: result.pagination.hasNextPage || false,
            hasPrevPage: result.pagination.hasPrevPage || false,
          });
        }
        
        console.log("✅ Precios cargados:", pricesData.length);
      } catch (error) {
        console.error("❌ Error cargando precios:", error);
        toast.error("Error al cargar los precios");
      } finally {
        setIsLoading(false);
      }
    };

    loadPrices();
  }, [currentPage, itemsPerPage, statusFilter, currencyFilter, searchQuery]);

  // Handlers
  const handleSelectPrice = (priceId: string) => {
    setSelectedPrices((prev) =>
      prev.includes(priceId)
        ? prev.filter((id) => id !== priceId)
        : [...prev, priceId]
    );
  };

  const handleSelectAll = () => {
    setSelectedPrices(
      selectedPrices.length === prices.length
        ? []
        : prices.map((price: PriceItem) => price.id)
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedPrices([]); // Limpiar selección al cambiar de página
  };

  const handlePreviousPage = () => {
    if (pagination.hasPrevPage) {
      setCurrentPage((prev) => prev - 1);
      setSelectedPrices([]);
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      setCurrentPage((prev) => prev + 1);
      setSelectedPrices([]);
    }
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Resetear a la primera página
    setSelectedPrices([]);
  };

  const handleImportSuccess = () => {
    // Recargar los precios después de una importación exitosa
    setCurrentPage(1);
    setIsLoading(true);
    // El useEffect se encargará de recargar los datos
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-3xl p-6 shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${themeColors.surface}95, ${themeColors.surface}90)`,
          }}
        >
          <div>
            <h1
              className="text-3xl font-bold"
              style={{
                backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Precios
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Administra y gestiona los precios de tus productos
            </p>
          </div>
        </motion.div>

        {/* Filtros y búsqueda */}
        <PriceFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          currencyFilter={currencyFilter}
          onCurrencyChange={setCurrencyFilter}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          onImport={() => setIsImportModalOpen(true)}
          onDownloadFormat={() => {
            // TODO: Implementar descarga de formato
            toast.info("Función de descarga en desarrollo");
          }}
          onAddPrice={() => router.push("/admin/precios/nuevo")}
        />

        {/* Tabla de precios */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-12"
          >
            <div className="text-center">
              <div
                className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
                style={{ borderColor: themeColors.primary }}
              ></div>
              <p className="text-gray-600 dark:text-gray-300">
                Cargando precios...
              </p>
            </div>
          </motion.div>
        ) : (
          <PriceTable
            prices={prices}
            selectedPrices={selectedPrices}
            onSelectPrice={handleSelectPrice}
            onSelectAll={handleSelectAll}
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            itemsPerPage={pagination.limit}
            onPageChange={handlePageChange}
            onPreviousPage={handlePreviousPage}
            onNextPage={handleNextPage}
            startIndex={(pagination.page - 1) * pagination.limit}
            totalItems={pagination.total}
          />
        )}

        {/* Modal de importación */}
        <PriceImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onSuccess={handleImportSuccess}
        />
      </div>
    </AdminLayout>
  );
}
