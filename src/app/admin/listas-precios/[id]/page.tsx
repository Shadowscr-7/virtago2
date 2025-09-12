"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft,
  Save,
  Edit,
  Trash2,
  Plus,
  DollarSign,
  FileText,
  TrendingUp,
  Package,
  Download,
  Search
} from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { StyledSelect } from "@/components/ui/styled-select"

interface PriceListDetail {
  id: string
  nombre: string
  moneda: 'USD' | 'UYU' | 'EUR' | 'BRL'
  fechaInicio: string
  fechaFin: string
  estado: 'ACTIVO' | 'INACTIVO' | 'VENCIDO' | 'PROGRAMADO'
  tipo: 'GENERAL' | 'MAYORISTA' | 'MINORISTA' | 'PROMOCIONAL' | 'ESPECIAL'
  descripcion: string
  descuentoGeneral: number
  montoMinimo: number
  productos: ProductPrice[]
  creadoPor: string
  fechaCreacion: string
  ultimaModificacion: string
}

interface ProductPrice {
  id: string
  productId: string
  nombre: string
  sku: string
  categoria: string
  precioBase: number
  precioLista: number
  descuento: number
  margen: number
  ultimaActualizacion: string
}

// Datos de ejemplo
const mockPriceListDetail: PriceListDetail = {
  id: "PL001",
  nombre: "Lista Invierno 2025",
  moneda: "UYU",
  fechaInicio: "2025-08-09",
  fechaFin: "2025-12-31",
  estado: "ACTIVO",
  tipo: "GENERAL",
  descripcion: "Lista de precios para la temporada de invierno 2025, incluye productos estacionales y promociones especiales.",
  descuentoGeneral: 0,
  montoMinimo: 1000,
  creadoPor: "Admin",
  fechaCreacion: "2025-08-01T10:00:00Z",
  ultimaModificacion: "2025-09-12T15:30:00Z",
  productos: [
    {
      id: "PP001",
      productId: "PRO001",
      nombre: "iPhone 15 Pro Max 256GB",
      sku: "SKU-31118",
      categoria: "Electrónicos",
      precioBase: 18000,
      precioLista: 24999,
      descuento: 0,
      margen: 38.9,
      ultimaActualizacion: "2025-09-10T14:20:00Z"
    },
    {
      id: "PP002",
      productId: "PRO002",
      nombre: "MacBook Pro 16\" M3",
      sku: "SKU-39188",
      categoria: "Informática",
      precioBase: 35000,
      precioLista: 45999,
      descuento: 5,
      margen: 31.4,
      ultimaActualizacion: "2025-09-09T11:15:00Z"
    },
    {
      id: "PP003",
      productId: "PRO003",
      nombre: "Samsung Galaxy S24 Ultra",
      sku: "SKU-14497",
      categoria: "Electrónicos",
      precioBase: 16000,
      precioLista: 22999,
      descuento: 0,
      margen: 43.7,
      ultimaActualizacion: "2025-09-08T16:45:00Z"
    },
    {
      id: "PP004",
      productId: "PRO004",
      nombre: "AirPods Pro 2da Gen",
      sku: "SKU-92135",
      categoria: "Electrónicos",
      precioBase: 4200,
      precioLista: 5999,
      descuento: 10,
      margen: 42.8,
      ultimaActualizacion: "2025-09-07T09:30:00Z"
    },
    {
      id: "PP005",
      productId: "PRO005",
      nombre: "Dell XPS 13 Plus",
      sku: "SKU-18524",
      categoria: "Informática",
      precioBase: 22000,
      precioLista: 28999,
      descuento: 0,
      margen: 31.8,
      ultimaActualizacion: "2025-09-06T13:20:00Z"
    }
  ]
}

export default function PriceListDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [priceList, setPriceList] = useState<PriceListDetail>(mockPriceListDetail)
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [hasChanges, setHasChanges] = useState(false)

  // Nota: El ID de la lista se obtendría de params.id en una implementación real
  console.log('Price list ID:', params.id)

  // Filtrar productos
  const filteredProducts = priceList.productos.filter(product => {
    const matchesSearch = product.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.categoria === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleSave = () => {
    // Aquí iría la lógica para guardar los cambios
    setIsEditing(false)
    setHasChanges(false)
  }

  const handleFieldChange = (field: keyof PriceListDetail, value: string | number) => {
    setPriceList(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleProductPriceChange = (productId: string, field: keyof ProductPrice, value: number) => {
    setPriceList(prev => ({
      ...prev,
      productos: prev.productos.map(product => 
        product.id === productId 
          ? { ...product, [field]: value, ultimaActualizacion: new Date().toISOString() }
          : product
      )
    }))
    setHasChanges(true)
  }

  const formatCurrency = (value: number) => {
    const symbols = { USD: '$', UYU: '$U', EUR: '€', BRL: 'R$' }
    return `${symbols[priceList.moneda] || '$'} ${value.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Estadísticas
  const stats = {
    totalProductos: priceList.productos.length,
    valorPromedio: priceList.productos.reduce((acc, p) => acc + p.precioLista, 0) / priceList.productos.length,
    margenPromedio: priceList.productos.reduce((acc, p) => acc + p.margen, 0) / priceList.productos.length,
    valorTotal: priceList.productos.reduce((acc, p) => acc + p.precioLista, 0)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header con navegación */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-white/80 to-gray-50/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.back()}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isEditing ? (
                      <input
                        type="text"
                        value={priceList.nombre}
                        onChange={(e) => handleFieldChange('nombre', e.target.value)}
                        className="bg-transparent border-b-2 border-purple-500 focus:outline-none"
                      />
                    ) : (
                      priceList.nombre
                    )}
                  </h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    priceList.estado === 'ACTIVO' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {priceList.estado}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                  {priceList.tipo} • {priceList.moneda} • {stats.totalProductos} productos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {hasChanges && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-amber-600 dark:text-amber-400 text-sm font-medium"
                >
                  Cambios sin guardar
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar
              </motion.button>

              {isEditing ? (
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setIsEditing(false)
                      setHasChanges(false)
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Guardar
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Estadísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {[
            { title: "Total Productos", value: stats.totalProductos, icon: Package, color: "from-blue-500 to-cyan-500" },
            { title: "Valor Promedio", value: formatCurrency(stats.valorPromedio), icon: DollarSign, color: "from-green-500 to-emerald-500" },
            { title: "Margen Promedio", value: `${stats.margenPromedio.toFixed(1)}%`, icon: TrendingUp, color: "from-purple-500 to-pink-500" },
            { title: "Valor Total", value: formatCurrency(stats.valorTotal), icon: FileText, color: "from-orange-500 to-red-500" }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-white/70 to-gray-50/70 dark:from-slate-800/70 dark:to-slate-700/70 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {typeof stat.value === 'string' ? stat.value : stat.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{stat.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Información de la lista */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-white/80 to-gray-50/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-2xl p-6 shadow-xl"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Información de la Lista
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              {isEditing ? (
                <textarea
                  value={priceList.descripcion}
                  onChange={(e) => handleFieldChange('descripcion', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-white/60 dark:bg-slate-700/60 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{priceList.descripcion}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Lista
              </label>
              {isEditing ? (
                <StyledSelect
                  value={priceList.tipo}
                  onChange={(value) => handleFieldChange('tipo', value)}
                  options={[
                    { value: "GENERAL", label: "General" },
                    { value: "MAYORISTA", label: "Mayorista" },
                    { value: "MINORISTA", label: "Minorista" },
                    { value: "PROMOCIONAL", label: "Promocional" },
                    { value: "ESPECIAL", label: "Especial" }
                  ]}
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{priceList.tipo}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha de Inicio
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={priceList.fechaInicio}
                  onChange={(e) => handleFieldChange('fechaInicio', e.target.value)}
                  className="w-full px-3 py-2 bg-white/60 dark:bg-slate-700/60 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{formatDate(priceList.fechaInicio)}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha de Fin
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={priceList.fechaFin}
                  onChange={(e) => handleFieldChange('fechaFin', e.target.value)}
                  className="w-full px-3 py-2 bg-white/60 dark:bg-slate-700/60 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{formatDate(priceList.fechaFin)}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descuento General (%)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={priceList.descuentoGeneral}
                  onChange={(e) => handleFieldChange('descuentoGeneral', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white/60 dark:bg-slate-700/60 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{priceList.descuentoGeneral}%</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Monto Mínimo
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="0"
                  value={priceList.montoMinimo}
                  onChange={(e) => handleFieldChange('montoMinimo', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white/60 dark:bg-slate-700/60 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{formatCurrency(priceList.montoMinimo)}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Filtros para productos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-white/80 to-gray-50/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Productos en la Lista ({filteredProducts.length})
            </h3>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                />
              </div>

              {/* Filtro por categoría */}
              <div className="w-48 relative z-10">
                <StyledSelect
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  options={[
                    { value: "all", label: "Todas las categorías" },
                    { value: "Electrónicos", label: "Electrónicos" },
                    { value: "Informática", label: "Informática" },
                    { value: "Oficina", label: "Oficina" }
                  ]}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Agregar Producto
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Tabla de productos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-white/80 to-gray-50/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-slate-700/80 dark:to-slate-600/80 backdrop-blur-sm">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Precio Base
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Precio Lista
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Descuento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Margen
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                {filteredProducts.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-200"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {product.nombre}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {product.sku}
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                            {product.categoria}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          value={product.precioBase}
                          onChange={(e) => handleProductPriceChange(product.id, 'precioBase', Number(e.target.value))}
                          className="w-24 px-2 py-1 bg-white/60 dark:bg-slate-700/60 border border-gray-300 dark:border-gray-600 rounded text-sm"
                        />
                      ) : (
                        <span className="text-sm text-gray-900 dark:text-white">
                          {formatCurrency(product.precioBase)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          value={product.precioLista}
                          onChange={(e) => handleProductPriceChange(product.id, 'precioLista', Number(e.target.value))}
                          className="w-24 px-2 py-1 bg-white/60 dark:bg-slate-700/60 border border-gray-300 dark:border-gray-600 rounded text-sm"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(product.precioLista)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={product.descuento}
                          onChange={(e) => handleProductPriceChange(product.id, 'descuento', Number(e.target.value))}
                          className="w-16 px-2 py-1 bg-white/60 dark:bg-slate-700/60 border border-gray-300 dark:border-gray-600 rounded text-sm"
                        />
                      ) : (
                        <span className={`text-sm font-medium ${
                          product.descuento > 0 
                            ? 'text-orange-600 dark:text-orange-400' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {product.descuento}%
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${
                        product.margen >= 40 
                          ? 'text-green-600 dark:text-green-400' 
                          : product.margen >= 25 
                          ? 'text-yellow-600 dark:text-yellow-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {product.margen.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
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
        </motion.div>
      </div>
    </AdminLayout>
  )
}
