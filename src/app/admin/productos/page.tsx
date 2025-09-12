"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Image from "next/image"
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
  Minus
} from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { useAuthStore } from "@/lib/auth-store"
import { StyledSelect } from "@/components/ui/styled-select"

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
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"
  },
  {
    id: "PRO002",
    name: "MacBook Pro 16\" M3",
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
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400"
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
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"
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
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
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
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400"
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
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400"
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
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400"
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
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400"
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
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
  },
  {
    id: "PRO010",
    name: "iPad Pro 12.9\" M2",
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
    image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400"
  }
]

export default function ProductsAdminPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    show: boolean
    productId: string
    action: 'delete' | 'activate' | 'deactivate'
  }>({ show: false, productId: '', action: 'delete' })

  if (!user || user.role !== 'distribuidor') {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Acceso Denegado</h2>
            <p className="text-gray-600">No tienes permisos para acceder a esta sección.</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  // Filtrar productos basado en la búsqueda y filtros
  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    const matchesStatus = statusFilter === "all" || product.status === statusFilter
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Paginación
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = filteredProducts.slice(startIndex, endIndex)

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleSelectAll = () => {
    if (selectedProducts.length === currentProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(currentProducts.map(product => product.id))
    }
  }

  const handleDownloadTemplate = () => {
    console.log("Descargando plantilla Excel de productos...")
  }

  const handleImportProducts = () => {
    console.log("Abriendo selector de archivo para importar productos...")
  }

  const handleAddProduct = () => {
    router.push("/admin/productos/nuevo")
  }

  const handleViewProduct = (productId: string) => {
    router.push(`/admin/productos/${productId}`)
  }

  const handleEditProduct = (productId: string) => {
    router.push(`/admin/productos/${productId}?mode=edit`)
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "ACTIVO":
        return {
          label: "Activo",
          className: "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 dark:text-green-300 border-green-500/30"
        }
      case "BAJO_STOCK":
        return {
          label: "Bajo Stock",
          className: "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30"
        }
      case "SIN_STOCK":
        return {
          label: "Sin Stock",
          className: "bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-700 dark:text-red-300 border-red-500/30"
        }
      case "INACTIVO":
        return {
          label: "Inactivo",
          className: "bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-700 dark:text-gray-300 border-gray-500/30"
        }
      default:
        return {
          label: "Desconocido",
          className: "bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-700 dark:text-gray-300 border-gray-500/30"
        }
    }
  }

  const getStockIcon = (stock: number, minStock: number) => {
    if (stock === 0) return <Minus className="w-4 h-4" />
    if (stock <= minStock) return <TrendingDown className="w-4 h-4" />
    return <TrendingUp className="w-4 h-4" />
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const calculateMargin = (price: number, cost: number) => {
    const margin = ((price - cost) / price) * 100
    return margin.toFixed(1)
  }

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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Gestión de Productos
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Administra tu catálogo de productos y control de inventario
            </p>
          </div>
        </motion.div>

        {/* Filtros y Acciones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col xl:flex-row gap-4 p-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg"
        >
          {/* Primera fila - Búsqueda y filtros */}
          <div className="flex flex-col lg:flex-row gap-4 flex-1">
            {/* Búsqueda */}
            <div className="flex-1 lg:flex-[2] relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, SKU, marca o descripción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/60 dark:bg-slate-700/60 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all placeholder-gray-400 backdrop-blur-sm"
              />
            </div>

            {/* Filtro por categoría */}
            <div className="w-full lg:w-56 relative z-30">
              <StyledSelect
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[
                  { value: "all", label: "Todas las categorías" },
                  { value: "Electrónicos", label: "Electrónicos" },
                  { value: "Informática", label: "Informática" },
                  { value: "Oficina", label: "Oficina" },
                  { value: "Fotografía", label: "Fotografía" }
                ]}
              />
            </div>

            {/* Filtro por estado */}
            <div className="w-full lg:w-48 relative z-20">
              <StyledSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: "all", label: "Todos los estados" },
                  { value: "ACTIVO", label: "Activos" },
                  { value: "BAJO_STOCK", label: "Bajo Stock" },
                  { value: "SIN_STOCK", label: "Sin Stock" },
                  { value: "INACTIVO", label: "Inactivos" }
                ]}
              />
            </div>

            {/* Items por página */}
            <div className="w-full lg:w-32 relative z-10">
              <StyledSelect
                value={itemsPerPage.toString()}
                onChange={(value) => setItemsPerPage(Number(value))}
                options={[
                  { value: "5", label: "5 filas" },
                  { value: "10", label: "10 filas" },
                  { value: "25", label: "25 filas" },
                  { value: "50", label: "50 filas" }
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
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-700 dark:text-purple-300 rounded-xl transition-all backdrop-blur-sm border border-purple-500/20"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Agregar</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 text-green-700 dark:text-green-300 rounded-xl transition-all backdrop-blur-sm border border-green-500/20"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Plantilla</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleImportProducts}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 text-blue-700 dark:text-blue-300 rounded-xl transition-all backdrop-blur-sm border border-blue-500/20"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Importar</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Tabla */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-white/30 overflow-hidden shadow-xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-slate-700/80 dark:to-slate-600/80 backdrop-blur-sm">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedProducts.length === currentProducts.length && currentProducts.length > 0}
                          onChange={handleSelectAll}
                          className="sr-only peer"
                        />
                        <div className="relative w-5 h-5 bg-white/50 dark:bg-slate-600/50 border-2 border-gray-300 dark:border-gray-500 rounded-md peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500 peer-checked:border-purple-500 transition-all duration-200 peer-hover:border-purple-400">
                          <Check className="absolute inset-0 w-3 h-3 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" />
                        </div>
                      </label>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Precios
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Valoración
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/30 dark:divide-gray-700/30">
                {currentProducts.map((product, index) => {
                  const statusInfo = getStatusInfo(product.status)
                  const margin = calculateMargin(product.price, product.costPrice)
                  
                  return (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-300 backdrop-blur-sm"
                    >
                      <td className="px-4 py-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => handleSelectProduct(product.id)}
                            className="sr-only peer"
                          />
                          <div className="relative w-5 h-5 bg-white/50 dark:bg-slate-600/50 border-2 border-gray-300 dark:border-gray-500 rounded-md peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500 peer-checked:border-purple-500 transition-all duration-200 peer-hover:border-purple-400 group-hover:border-purple-300">
                            <Check className="absolute inset-0 w-3 h-3 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" />
                          </div>
                        </label>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <motion.div 
                            whileHover={{ scale: 1.1 }}
                            className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg overflow-hidden"
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
                            <div className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {product.brand} • {product.category}
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              {product.totalSales} ventas
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="text-sm font-mono bg-blue-100/50 dark:bg-blue-900/20 px-2 py-1 rounded-md inline-block text-blue-700 dark:text-blue-300">
                            {product.sku}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Desde {new Date(product.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-2">
                          <div className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {formatCurrency(product.price)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Costo: {formatCurrency(product.costPrice)}
                          </div>
                          <div className="text-xs bg-green-100/50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2 py-1 rounded-full inline-block">
                            +{margin}% margen
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${
                              product.stock === 0 ? 'bg-red-100/50 dark:bg-red-900/20 text-red-600' :
                              product.stock <= product.minStock ? 'bg-yellow-100/50 dark:bg-yellow-900/20 text-yellow-600' :
                              'bg-green-100/50 dark:bg-green-900/20 text-green-600'
                            }`}>
                              {getStockIcon(product.stock, product.minStock)}
                            </div>
                            <div>
                              <div className="text-xl font-bold text-gray-900 dark:text-white">
                                {product.stock}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Min: {product.minStock}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold transition-all backdrop-blur-sm border ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {product.rating.toFixed(1)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
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
                            className="p-3 text-blue-600 hover:text-blue-700 bg-blue-50/50 hover:bg-blue-100/70 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-xl transition-all backdrop-blur-sm border border-blue-200/30"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEditProduct(product.id)}
                            className="p-3 text-purple-600 hover:text-purple-700 bg-purple-50/50 hover:bg-purple-100/70 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 rounded-xl transition-all backdrop-blur-sm border border-purple-200/30"
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="px-4 py-3 border-t border-gray-200/30 dark:border-gray-700/30 bg-gray-50/30 dark:bg-slate-700/30 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-300 bg-white/50 dark:bg-slate-600/50 px-3 py-2 rounded-lg backdrop-blur-sm">
                Mostrando <span className="font-semibold text-purple-600">{startIndex + 1}</span> a <span className="font-semibold text-purple-600">{Math.min(endIndex, filteredProducts.length)}</span> de <span className="font-semibold text-purple-600">{filteredProducts.length}</span> productos
              </div>
              
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05, x: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-3 rounded-xl bg-white/60 dark:bg-slate-700/60 border border-white/30 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/80 dark:hover:bg-slate-600/80 transition-all backdrop-blur-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </motion.button>
                
                <div className="flex items-center gap-2">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + 1
                    return (
                      <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all backdrop-blur-sm ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg border border-purple-400'
                            : 'bg-white/60 dark:bg-slate-700/60 border border-white/30 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {pageNum}
                      </motion.button>
                    )
                  })}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05, x: 2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-3 rounded-xl bg-white/60 dark:bg-slate-700/60 border border-white/30 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/80 dark:hover:bg-slate-600/80 transition-all backdrop-blur-sm"
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-white/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Confirmar Acción
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Esta acción afectará el producto
                  </p>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                ¿Estás seguro que deseas realizar esta acción?
              </p>
              
              <div className="flex gap-3 justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowConfirmDialog({ show: false, productId: '', action: 'delete' })}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowConfirmDialog({ show: false, productId: '', action: 'delete' })}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  Confirmar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  )
}
