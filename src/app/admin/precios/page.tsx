"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Download, Upload, Plus } from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useTheme } from "@/contexts/theme-context";
import { PriceFilters, PriceStatistics, PriceTable } from "@/components/admin/precios";

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

// Datos de ejemplo
const mockPrices: PriceItem[] = [
  {
    id: "P001",
    productCode: "2",
    productName: "iPhone 15 Pro Max 256GB",
    minQuantity: 2,
    price: 1450,
    currency: "UYU",
    endDate: "2025-12-31",
    includeIVA: false,
    status: "INACTIVO",
    createdAt: "2024-01-15",
    updatedAt: "2024-09-12",
    margin: 28.5,
    costPrice: 1037,
    category: "Electrónicos",
    supplier: "Tech Distribution"
  },
  {
    id: "P002",
    productCode: "SKU-39108",
    productName: "MacBook Pro 16\" M3",
    minQuantity: 1,
    price: 2850,
    currency: "USD",
    endDate: "2025-12-31",
    includeIVA: true,
    status: "ACTIVO",
    createdAt: "2024-02-10",
    updatedAt: "2024-09-11",
    margin: 35.2,
    costPrice: 1848,
    category: "Informática",
    supplier: "Apple Authorized"
  },
  {
    id: "P003",
    productCode: "SAM-S24U",
    productName: "Samsung Galaxy S24 Ultra",
    minQuantity: 3,
    price: 1250,
    currency: "USD",
    endDate: "2025-11-30",
    includeIVA: true,
    status: "ACTIVO",
    createdAt: "2024-01-20",
    updatedAt: "2024-09-10",
    margin: 22.8,
    costPrice: 965,
    category: "Electrónicos",
    supplier: "Samsung Electronics"
  },
  {
    id: "P004",
    productCode: "APL-AIRP2",
    productName: "AirPods Pro 2da Gen",
    minQuantity: 5,
    price: 180,
    currency: "USD",
    endDate: "2025-10-15",
    includeIVA: false,
    status: "ACTIVO",
    createdAt: "2024-03-05",
    updatedAt: "2024-09-09",
    margin: 40.0,
    costPrice: 108,
    category: "Electrónicos",
    supplier: "Tech Distribution"
  },
  {
    id: "P005",
    productCode: "HP-PAV15",
    productName: "HP Pavilion 15\"",
    minQuantity: 1,
    price: 850,
    currency: "USD",
    endDate: "2025-09-30",
    includeIVA: true,
    status: "VENCIDO",
    createdAt: "2024-04-12",
    updatedAt: "2024-09-08",
    margin: 18.5,
    costPrice: 693,
    category: "Informática",
    supplier: "HP Inc"
  }
];

export default function PreciosAdminPage() {
  const router = useRouter();
  const { themeColors } = useTheme();
  const [prices] = useState<PriceItem[]>(mockPrices);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currencyFilter, setCurrencyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filtrar precios
  const filteredPrices = prices.filter((price) => {
    const matchesSearch =
      price.productCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      price.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (price.supplier && price.supplier.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || price.status === statusFilter;
    const matchesCurrency = currencyFilter === "all" || price.currency === currencyFilter;
    const matchesCategory = categoryFilter === "all" || price.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCurrency && matchesCategory;
  });

  // Ordenar precios por fecha de actualización (más reciente primero)
  const sortedPrices = [...filteredPrices].sort((a, b) => {
    const aValue = new Date(a.updatedAt).getTime();
    const bValue = new Date(b.updatedAt).getTime();
    return bValue - aValue;
  });

  // Paginación
  const totalPages = Math.ceil(sortedPrices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPrices = sortedPrices.slice(startIndex, startIndex + itemsPerPage);

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
      selectedPrices.length === currentPrices.length
        ? []
        : currentPrices.map((price) => price.id)
    );
  };

  // Estadísticas
  const stats = {
    total: prices.length,
    activos: prices.filter((price) => price.status === "ACTIVO").length,
    inactivos: prices.filter((price) => price.status === "INACTIVO").length,
    totalValue: prices.reduce((acc, price) => acc + price.price, 0),
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
              Precios
            </h1>
            <p style={{ color: themeColors.text.secondary }}>
              Administra y gestiona los precios de tus productos
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
              onClick={() => router.push("/admin/precios/nuevo")}
              className="px-4 py-2 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg"
              style={{
                backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
              }}
            >
              <Plus className="w-4 h-4" />
              Agregar Precio
            </motion.button>
          </div>
        </motion.div>

        {/* Estadísticas */}
        <PriceStatistics stats={stats} />

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
          onItemsPerPageChange={setItemsPerPage}
        />

        {/* Tabla de precios */}
        <PriceTable
          prices={currentPrices}
          selectedPrices={selectedPrices}
          onSelectPrice={handleSelectPrice}
          onSelectAll={handleSelectAll}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onPreviousPage={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          onNextPage={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          startIndex={startIndex}
          totalItems={sortedPrices.length}
        />
      </div>
    </AdminLayout>
  );
}
