"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search,
  Download,
  Upload,
  Plus,
  Eye,
  Edit,
  Package,
  Star,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Check,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useAuthStore } from "@/lib/auth-store";
import { useTheme } from "@/contexts/theme-context";
import { StyledSelect } from "@/components/ui/styled-select";

// Datos de ejemplo - después esto vendrá del servidor
const mockProducts = [
  {
    id: "PRO001",
    name: "iPhone 15 Pro Max 256GB",
    sku: "SKU-31118",
    description: "iPhone 15 Pro Max con 256GB de almacenamiento",
    category: "Electrónicos",
    brand: "Apple",
    supplier: "Tech Distribution SA",
    price: 24999,
    costPrice: 18000,
    stock: 45,
    minStock: 10,
    maxStock: 100,
    status: "ACTIVO",
    rating: 4.8,
    totalSales: 156,
    lastSale: "2024-09-10",
    createdAt: "2024-01-15",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
  },
  {
    id: "PRO002",
    name: 'MacBook Pro 16" M3',
    sku: "SKU-39108",
    description: "MacBook Pro 16 pulgadas con chip M3",
    category: "Informática",
    brand: "Apple",
    supplier: "Apple Authorized",
    price: 45999,
    costPrice: 35000,
    stock: 23,
    minStock: 5,
    maxStock: 50,
    status: "ACTIVO",
    rating: 4.9,
    totalSales: 89,
    lastSale: "2024-09-11",
    createdAt: "2024-02-10",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
  },
  {
    id: "PRO003",
    name: "Samsung Galaxy S24 Ultra",
    sku: "SKU-14497",
    description: "Samsung Galaxy S24 Ultra con S Pen",
    category: "Electrónicos",
    brand: "Samsung",
    supplier: "Samsung Electronics",
    price: 22999,
    costPrice: 17500,
    stock: 67,
    minStock: 15,
    maxStock: 80,
    status: "ACTIVO",
    rating: 4.7,
    totalSales: 234,
    lastSale: "2024-09-12",
    createdAt: "2024-01-20",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
  },
  {
    id: "PRO004",
    name: "AirPods Pro 2da Gen",
    sku: "SKU-92135",
    description: "AirPods Pro de segunda generación",
    category: "Electrónicos",
    brand: "Apple",
    supplier: "Tech Distribution SA",
    price: 5999,
    costPrice: 4200,
    stock: 12,
    minStock: 20,
    maxStock: 100,
    status: "BAJO_STOCK",
    rating: 4.6,
    totalSales: 345,
    lastSale: "2024-09-09",
    createdAt: "2024-03-05",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
  },
  {
    id: "PRO005",
    name: "Dell XPS 13 Plus",
    sku: "SKU-10524",
    description: "Dell XPS 13 Plus Ultrabook",
    category: "Informática",
    brand: "Dell",
    supplier: "Dell Business",
    price: 28999,
    costPrice: 22000,
    stock: 8,
    minStock: 10,
    maxStock: 40,
    status: "BAJO_STOCK",
    rating: 4.5,
    totalSales: 78,
    lastSale: "2024-09-08",
    createdAt: "2024-02-28",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
  },
  {
    id: "PRO006",
    name: "LG UltraWide 34WP65C",
    sku: "SKU-82050",
    description: "Monitor LG UltraWide 34 pulgadas",
    category: "Informática",
    brand: "LG",
    supplier: "LG Electronics",
    price: 8999,
    costPrice: 6800,
    stock: 34,
    minStock: 8,
    maxStock: 60,
    status: "ACTIVO",
    rating: 4.4,
    totalSales: 123,
    lastSale: "2024-09-11",
    createdAt: "2024-01-10",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400",
  },
  {
    id: "PRO007",
    name: "Herman Miller Aeron",
    sku: "SKU-75576",
    description: "Silla ergonómica Herman Miller Aeron",
    category: "Oficina",
    brand: "Herman Miller",
    supplier: "Office Premium",
    price: 15999,
    costPrice: 12000,
    stock: 0,
    minStock: 5,
    maxStock: 25,
    status: "SIN_STOCK",
    rating: 4.9,
    totalSales: 45,
    lastSale: "2024-08-15",
    createdAt: "2024-04-12",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
  },
  {
    id: "PRO008",
    name: "Canon EOS R5",
    sku: "SKU-98737",
    description: "Cámara Canon EOS R5 profesional",
    category: "Fotografía",
    brand: "Canon",
    supplier: "Canon Professional",
    price: 67999,
    costPrice: 52000,
    stock: 15,
    minStock: 3,
    maxStock: 20,
    status: "ACTIVO",
    rating: 4.8,
    totalSales: 23,
    lastSale: "2024-09-07",
    createdAt: "2024-03-20",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400",
  },
  {
    id: "PRO009",
    name: "Sony WH-1000XM5",
    sku: "SKU-08645",
    description: "Auriculares Sony WH-1000XM5",
    category: "Electrónicos",
    brand: "Sony",
    supplier: "Sony Audio",
    price: 7999,
    costPrice: 5800,
    stock: 89,
    minStock: 25,
    maxStock: 120,
    status: "ACTIVO",
    rating: 4.7,
    totalSales: 267,
    lastSale: "2024-09-12",
    createdAt: "2024-02-15",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
  },
  {
    id: "PRO010",
    name: 'iPad Pro 12.9" M2',
    sku: "SKU-45689",
    description: "iPad Pro 12.9 pulgadas con chip M2",
    category: "Informática",
    brand: "Apple",
    supplier: "Tech Distribution SA",
    price: 21999,
    costPrice: 16500,
    stock: 56,
    minStock: 12,
    maxStock: 80,
    status: "ACTIVO",
    rating: 4.6,
    totalSales: 134,
    lastSale: "2024-09-10",
    createdAt: "2024-01-25",
    image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400",
  },
];

export default function ProductsAdminPage() {
  const { user } = useAuthStore();
  const { themeColors } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    show: boolean;
    productId: string;
    action: "delete" | "activate" | "deactivate";
  }>({ show: false, productId: "", action: "delete" });

  // Función para obtener colores del tema para productos
  const getProductColor = (index: number) => {
    const colors = [themeColors.primary, themeColors.secondary, themeColors.accent];
    return colors[index % colors.length];
  };

  if (!user || user.role !== "distribuidor") {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-8 backdrop-blur-lg rounded-2xl shadow-xl border"
            style={{
              backgroundColor: themeColors.surface + "80",
              borderColor: themeColors.primary + "20"
            }}
          >
            <div 
              className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(45deg, ${themeColors.primary}, ${themeColors.secondary})`
              }}
            >
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <h2 
              className="text-xl font-bold mb-2"
              style={{ color: themeColors.text.primary }}
            >
              Acceso Denegado
            </h2>
            <p style={{ color: themeColors.text.secondary }}>
              No tienes permisos para acceder a esta sección.
            </p>
          </motion.div>
        </div>
      </AdminLayout>
    );
  }

  // Filtrar productos basado en la búsqueda y filtros
  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" || product.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Paginación
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === currentProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(currentProducts.map((product) => product.id));
    }
  };

  const handleDownloadTemplate = () => {
    console.log("Descargando plantilla Excel de productos...");
  };

  const handleImportProducts = () => {
    console.log("Abriendo selector de archivo para importar productos...");
  };

  const handleAddProduct = () => {
    router.push("/admin/productos/nuevo");
  };

  const handleViewProduct = (productId: string) => {
    router.push(`/admin/productos/${productId}`);
  };

  const handleEditProduct = (productId: string) => {
    router.push(`/admin/productos/${productId}?mode=edit`);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "ACTIVO":
        return {
          label: "Activo",
          color: themeColors.accent,
        };
      case "BAJO_STOCK":
        return {
          label: "Bajo Stock",
          color: themeColors.secondary,
        };
      case "SIN_STOCK":
        return {
          label: "Sin Stock",
          color: themeColors.primary,
        };
      case "INACTIVO":
        return {
          label: "Inactivo",
          color: themeColors.text.secondary,
        };
      default:
        return {
          label: "Desconocido",
          color: themeColors.text.secondary,
        };
    }
  };

  const getStockIcon = (stock: number, minStock: number) => {
    if (stock === 0) return <Minus className="w-4 h-4" />;
    if (stock <= minStock) return <TrendingDown className="w-4 h-4" />;
    return <TrendingUp className="w-4 h-4" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: "UYU",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateMargin = (price: number, cost: number) => {
    const margin = ((price - cost) / price) * 100;
    return margin.toFixed(1);
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
                backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`
              }}
            >
              Gestión de Productos
            </h1>
            <p style={{ color: themeColors.text.secondary }}>
              Administra tu catálogo de productos y control de inventario
            </p>
          </div>
        </motion.div>

        {/* Filtros y Acciones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col xl:flex-row gap-4 p-6 backdrop-blur-xl rounded-2xl border shadow-lg"
          style={{
            backgroundColor: themeColors.surface + "70",
            borderColor: themeColors.primary + "30"
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
                placeholder="Buscar por nombre, SKU, marca o descripción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all placeholder-gray-400 backdrop-blur-sm"
                style={{
                  backgroundColor: themeColors.surface + "60",
                  borderColor: themeColors.primary + "30",
                  color: themeColors.text.primary,
                  "--tw-ring-color": themeColors.primary + "50"
                } as React.CSSProperties}
              />
            </div>

            {/* Filtro por categoría */}
            <div className="w-full lg:w-56 relative z-1">
              <StyledSelect
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[
                  { value: "all", label: "Todas las categorías" },
                  { value: "Electrónicos", label: "Electrónicos" },
                  { value: "Informática", label: "Informática" },
                  { value: "Oficina", label: "Oficina" },
                  { value: "Fotografía", label: "Fotografía" },
                ]}
              />
            </div>

            {/* Filtro por estado */}
            <div className="w-full lg:w-48 relative z-1">
              <StyledSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: "all", label: "Todos los estados" },
                  { value: "ACTIVO", label: "Activos" },
                  { value: "BAJO_STOCK", label: "Bajo Stock" },
                  { value: "SIN_STOCK", label: "Sin Stock" },
                  { value: "INACTIVO", label: "Inactivos" },
                ]}
              />
            </div>

            {/* Items por página */}
            <div className="w-full lg:w-32 relative z-1">
              <StyledSelect
                value={itemsPerPage.toString()}
                onChange={(value) => setItemsPerPage(Number(value))}
                options={[
                  { value: "5", label: "5 filas" },
                  { value: "10", label: "10 filas" },
                  { value: "25", label: "25 filas" },
                  { value: "50", label: "50 filas" },
                ]}
              />
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddProduct}
              className="flex items-center gap-2 px-5 py-3 rounded-xl transition-all backdrop-blur-sm border font-medium"
              style={{
                backgroundColor: themeColors.primary + "20",
                color: themeColors.text.primary,
                borderColor: themeColors.primary + "40"
              }}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Agregar</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-5 py-3 rounded-xl transition-all backdrop-blur-sm border font-medium"
              style={{
                backgroundColor: themeColors.accent + "20",
                color: themeColors.text.primary,
                borderColor: themeColors.accent + "40"
              }}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Plantilla</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleImportProducts}
              className="flex items-center gap-2 px-5 py-3 rounded-xl transition-all backdrop-blur-sm border font-medium"
              style={{
                backgroundColor: themeColors.secondary + "20",
                color: themeColors.text.primary,
                borderColor: themeColors.secondary + "40"
              }}
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Importar</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Tabla */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-xl rounded-2xl border overflow-hidden shadow-xl"
          style={{
            backgroundColor: themeColors.surface + "70",
            borderColor: themeColors.primary + "30"
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead 
                className="backdrop-blur-sm"
                style={{
                  background: `linear-gradient(90deg, ${themeColors.primary}20, ${themeColors.secondary}20)`
                }}
              >
                <tr>
                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={
                            selectedProducts.length ===
                              currentProducts.length &&
                            currentProducts.length > 0
                          }
                          onChange={handleSelectAll}
                          className="sr-only peer"
                        />
                        <div 
                          className="relative w-5 h-5 border-2 rounded-md transition-all duration-200"
                          style={{
                            backgroundColor: themeColors.surface + "50",
                            borderColor: themeColors.primary + "60"
                          }}
                        >
                          <Check className="absolute inset-0 w-3 h-3 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" />
                        </div>
                      </label>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: themeColors.text.primary }}
                  >
                    Producto
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: themeColors.text.primary }}
                  >
                    SKU
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: themeColors.text.primary }}
                  >
                    Precios
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: themeColors.text.primary }}
                  >
                    Stock
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: themeColors.text.primary }}
                  >
                    Estado
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: themeColors.text.primary }}
                  >
                    Valoración
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: themeColors.text.primary }}
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody 
                className="divide-y"
                style={{ 
                  "--tw-divide-opacity": "0.3",
                  borderColor: themeColors.primary + "30"
                } as React.CSSProperties}
              >
                {currentProducts.map((product, index) => {
                  const statusInfo = getStatusInfo(product.status);
                  const margin = calculateMargin(product.price, product.costPrice);
                  const productColor = getProductColor(index);

                  return (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group transition-all duration-300 backdrop-blur-sm hover:backdrop-blur-md"
                      style={{
                        "--hover-bg": `linear-gradient(90deg, ${themeColors.primary}10, ${themeColors.secondary}10)`
                      } as React.CSSProperties}
                      onMouseEnter={(e) => {
                        const target = e.currentTarget as HTMLElement;
                        target.style.background = `linear-gradient(90deg, ${themeColors.primary}10, ${themeColors.secondary}10)`;
                      }}
                      onMouseLeave={(e) => {
                        const target = e.currentTarget as HTMLElement;
                        target.style.background = "transparent";
                      }}
                    >
                      <td className="px-4 py-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => handleSelectProduct(product.id)}
                            className="sr-only peer"
                          />
                          <div 
                            className="relative w-5 h-5 border-2 rounded-md transition-all duration-200"
                            style={{
                              backgroundColor: themeColors.surface + "50",
                              borderColor: themeColors.primary + "60"
                            }}
                          >
                            <Check className="absolute inset-0 w-3 h-3 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" />
                          </div>
                        </label>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg overflow-hidden"
                            style={{
                              background: `linear-gradient(45deg, ${productColor}, ${productColor}90)`
                            }}
                          >
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.name}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-8 h-8" />
                            )}
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <div 
                              className="font-semibold text-sm truncate"
                              style={{ color: themeColors.text.primary }}
                            >
                              {product.name}
                            </div>
                            <div 
                              className="text-xs"
                              style={{ color: themeColors.text.secondary }}
                            >
                              {product.brand} • {product.category}
                            </div>
                            <div 
                              className="text-xs"
                              style={{ color: themeColors.text.secondary }}
                            >
                              {product.totalSales} ventas
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div 
                            className="text-sm font-mono px-2 py-1 rounded-md inline-block"
                            style={{
                              backgroundColor: themeColors.secondary + "20",
                              color: themeColors.text.primary
                            }}
                          >
                            {product.sku}
                          </div>
                          <div 
                            className="text-xs"
                            style={{ color: themeColors.text.secondary }}
                          >
                            Desde{" "}
                            {new Date(product.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-2">
                          <div 
                            className="text-lg font-bold bg-gradient-to-r bg-clip-text text-transparent"
                            style={{
                              backgroundImage: `linear-gradient(to right, ${productColor}, ${productColor}90)`
                            }}
                          >
                            {formatCurrency(product.price)}
                          </div>
                          <div 
                            className="text-xs"
                            style={{ color: themeColors.text.secondary }}
                          >
                            Costo: {formatCurrency(product.costPrice)}
                          </div>
                          <div 
                            className="text-xs px-2 py-1 rounded-full inline-block"
                            style={{
                              backgroundColor: themeColors.accent + "20",
                              color: themeColors.text.primary
                            }}
                          >
                            +{margin}% margen
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="p-2 rounded-lg"
                              style={{
                                backgroundColor: product.stock === 0
                                  ? themeColors.primary + "20"
                                  : product.stock <= product.minStock
                                    ? themeColors.secondary + "20"
                                    : themeColors.accent + "20",
                                color: product.stock === 0
                                  ? themeColors.primary
                                  : product.stock <= product.minStock
                                    ? themeColors.secondary
                                    : themeColors.accent
                              }}
                            >
                              {getStockIcon(product.stock, product.minStock)}
                            </div>
                            <div>
                              <div 
                                className="text-xl font-bold"
                                style={{ color: themeColors.text.primary }}
                              >
                                {product.stock}
                              </div>
                              <div 
                                className="text-xs"
                                style={{ color: themeColors.text.secondary }}
                              >
                                Min: {product.minStock}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold transition-all backdrop-blur-sm border"
                          style={{
                            backgroundColor: statusInfo.color + "20",
                            color: statusInfo.color,
                            borderColor: statusInfo.color + "40"
                          }}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star 
                              className="w-4 h-4 fill-current"
                              style={{ color: themeColors.accent }}
                            />
                            <span 
                              className="text-sm font-semibold"
                              style={{ color: themeColors.text.primary }}
                            >
                              {product.rating.toFixed(1)}
                            </span>
                          </div>
                          <div 
                            className="text-xs"
                            style={{ color: themeColors.text.secondary }}
                          >
                            ({product.totalSales} reseñas)
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleViewProduct(product.id)}
                            className="p-3 rounded-xl transition-all backdrop-blur-sm border"
                            style={{
                              backgroundColor: themeColors.secondary + "20",
                              color: themeColors.secondary,
                              borderColor: themeColors.secondary + "40"
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEditProduct(product.id)}
                            className="p-3 rounded-xl transition-all backdrop-blur-sm border"
                            style={{
                              backgroundColor: themeColors.primary + "20",
                              color: themeColors.primary,
                              borderColor: themeColors.primary + "40"
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div 
            className="px-4 py-3 border-t backdrop-blur-sm"
            style={{
              borderColor: themeColors.primary + "30",
              backgroundColor: themeColors.surface + "30"
            }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div 
                className="text-sm px-3 py-2 rounded-lg backdrop-blur-sm"
                style={{
                  backgroundColor: themeColors.surface + "50",
                  color: themeColors.text.secondary
                }}
              >
                Mostrando{" "}
                <span 
                  className="font-semibold"
                  style={{ color: themeColors.primary }}
                >
                  {startIndex + 1}
                </span>{" "}
                a{" "}
                <span 
                  className="font-semibold"
                  style={{ color: themeColors.primary }}
                >
                  {Math.min(endIndex, filteredProducts.length)}
                </span>{" "}
                de{" "}
                <span 
                  className="font-semibold"
                  style={{ color: themeColors.primary }}
                >
                  {filteredProducts.length}
                </span>{" "}
                productos
              </div>

              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05, x: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-3 rounded-xl border disabled:opacity-50 disabled:cursor-not-allowed transition-all backdrop-blur-sm"
                  style={{
                    backgroundColor: themeColors.surface + "60",
                    borderColor: themeColors.primary + "30",
                    color: themeColors.text.primary
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </motion.button>

                <div className="flex items-center gap-2">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    const isActive = currentPage === pageNum;
                    return (
                      <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-10 h-10 rounded-xl text-sm font-semibold transition-all backdrop-blur-sm border"
                        style={{
                          backgroundColor: isActive 
                            ? `linear-gradient(45deg, ${themeColors.primary}, ${themeColors.secondary})` 
                            : themeColors.surface + "60",
                          borderColor: isActive 
                            ? themeColors.primary + "60" 
                            : themeColors.primary + "30",
                          color: isActive 
                            ? "white" 
                            : themeColors.text.primary,
                          background: isActive 
                            ? `linear-gradient(45deg, ${themeColors.primary}, ${themeColors.secondary})` 
                            : themeColors.surface + "60"
                        }}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  })}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05, x: 2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-3 rounded-xl border disabled:opacity-50 disabled:cursor-not-allowed transition-all backdrop-blur-sm"
                  style={{
                    backgroundColor: themeColors.surface + "60",
                    borderColor: themeColors.primary + "30",
                    color: themeColors.text.primary
                  }}
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Modal de Confirmación */}
        {showConfirmDialog.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-2xl p-6 max-w-md w-full border"
              style={{
                backgroundColor: themeColors.surface + "95",
                borderColor: themeColors.primary + "30"
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: themeColors.accent + "20"
                  }}
                >
                  <AlertTriangle 
                    className="w-6 h-6"
                    style={{ color: themeColors.accent }}
                  />
                </div>
                <div>
                  <h3 
                    className="text-lg font-semibold"
                    style={{ color: themeColors.text.primary }}
                  >
                    Confirmar Acción
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: themeColors.text.secondary }}
                  >
                    Esta acción afectará el producto
                  </p>
                </div>
              </div>

              <p 
                className="mb-6"
                style={{ color: themeColors.text.secondary }}
              >
                ¿Estás seguro que deseas realizar esta acción?
              </p>

              <div className="flex gap-3 justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    setShowConfirmDialog({
                      show: false,
                      productId: "",
                      action: "delete",
                    })
                  }
                  className="px-4 py-2 rounded-lg transition-all"
                  style={{
                    color: themeColors.text.secondary,
                    backgroundColor: themeColors.surface + "50"
                  }}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    setShowConfirmDialog({
                      show: false,
                      productId: "",
                      action: "delete",
                    })
                  }
                  className="px-4 py-2 text-white rounded-lg transition-all"
                  style={{
                    background: `linear-gradient(45deg, ${themeColors.primary}, ${themeColors.secondary})`
                  }}
                >
                  Confirmar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
}
