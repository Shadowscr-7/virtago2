"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { 
  Search, 
  Download, 
  Upload, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  DollarSign,
  Calendar,
  TrendingUp,
  FileText,
  Check,
  ChevronLeft,
  ChevronRight,
  Package
} from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { StyledSelect } from "@/components/ui/styled-select"

interface PriceList {
  id: string
  nombre: string
  moneda: 'USD' | 'UYU' | 'EUR' | 'BRL'
  fechaInicio: string
  fechaFin: string
  estado: 'ACTIVO' | 'INACTIVO' | 'VENCIDO' | 'PROGRAMADO'
  cantidadProductos: number
  valorPromedio: number
  ultimaActualizacion: string
  creadoPor: string
  tipo: 'GENERAL' | 'MAYORISTA' | 'MINORISTA' | 'PROMOCIONAL' | 'ESPECIAL'
}

// Datos de ejemplo
const mockPriceLists: PriceList[] = [
  {
    id: "PL001",
    nombre: "Lista Invierno 2025",
    moneda: "UYU",
    fechaInicio: "2025-08-09",
    fechaFin: "2025-12-31",
    estado: "INACTIVO",
    cantidadProductos: 156,
    valorPromedio: 40230,
    ultimaActualizacion: "2025-09-12T15:30:00Z",
    creadoPor: "Admin",
    tipo: "GENERAL"
  },
  {
    id: "PL002",
    nombre: "Lista Precios 3",
    moneda: "USD",
    fechaInicio: "2025-08-09",
    fechaFin: "2025-12-31",
    estado: "ACTIVO",
    cantidadProductos: 69,
    valorPromedio: 1250,
    ultimaActualizacion: "2025-09-11T12:45:00Z",
    creadoPor: "Admin",
    tipo: "MAYORISTA"
  },
  {
    id: "PL003",
    nombre: "Lista Precios 7",
    moneda: "USD",
    fechaInicio: "2025-08-09",
    fechaFin: "2025-12-31",
    estado: "ACTIVO",
    cantidadProductos: 234,
    valorPromedio: 1890,
    ultimaActualizacion: "2025-09-10T09:20:00Z",
    creadoPor: "Admin",
    tipo: "MINORISTA"
  },
  {
    id: "PL004",
    nombre: "Lista Precios 2",
    moneda: "UYU",
    fechaInicio: "2025-08-09",
    fechaFin: "2025-12-31",
    estado: "ACTIVO",
    cantidadProductos: 67,
    valorPromedio: 36750,
    ultimaActualizacion: "2025-09-09T16:10:00Z",
    creadoPor: "Admin",
    tipo: "PROMOCIONAL"
  },
  {
    id: "PL005",
    nombre: "Lista Precios 6",
    moneda: "UYU",
    fechaInicio: "2025-08-09",
    fechaFin: "2025-12-31",
    estado: "ACTIVO",
    cantidadProductos: 45,
    valorPromedio: 52100,
    ultimaActualizacion: "2025-09-08T14:35:00Z",
    creadoPor: "Admin",
    tipo: "ESPECIAL"
  },
  {
    id: "PL006",
    nombre: "Lista Precios 5",
    moneda: "USD",
    fechaInicio: "2025-08-09",
    fechaFin: "2025-12-31",
    estado: "INACTIVO",
    cantidadProductos: 78,
    valorPromedio: 670,
    ultimaActualizacion: "2025-09-07T11:25:00Z",
    creadoPor: "Admin",
    tipo: "GENERAL"
  },
  {
    id: "PL007",
    nombre: "Lista Precios 1",
    moneda: "USD",
    fechaInicio: "2025-08-09",
    fechaFin: "2025-12-31",
    estado: "INACTIVO",
    cantidadProductos: 92,
    valorPromedio: 1120,
    ultimaActualizacion: "2025-09-06T13:20:00Z",
    creadoPor: "Admin",
    tipo: "MAYORISTA"
  },
  {
    id: "PL008",
    nombre: "Lista Precios 8",
    moneda: "UYU",
    fechaInicio: "2025-08-09",
    fechaFin: "2025-12-31",
    estado: "ACTIVO",
    cantidadProductos: 189,
    valorPromedio: 41800,
    ultimaActualizacion: "2025-09-05T10:10:00Z",
    creadoPor: "Admin",
    tipo: "MINORISTA"
  },
  {
    id: "PL009",
    nombre: "Lista Precios 4",
    moneda: "UYU",
    fechaInicio: "2025-08-09",
    fechaFin: "2025-12-31",
    estado: "ACTIVO",
    cantidadProductos: 134,
    valorPromedio: 47300,
    ultimaActualizacion: "2025-09-04T08:55:00Z",
    creadoPor: "Admin",
    tipo: "GENERAL"
  },
  {
    id: "PL010",
    nombre: "Lista Precios 10",
    moneda: "UYU",
    fechaInicio: "2025-08-09",
    fechaFin: "2025-12-31",
    estado: "ACTIVO",
    cantidadProductos: 201,
    valorPromedio: 47300,
    ultimaActualizacion: "2025-09-03T17:40:00Z",
    creadoPor: "Admin",
    tipo: "GENERAL"
  }
]

export default function PriceListsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currencyFilter, setCurrencyFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedLists, setSelectedLists] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Filtrar listas
  const filteredLists = mockPriceLists.filter(list => {
    const matchesSearch = list.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         list.moneda.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || list.estado === statusFilter
    const matchesCurrency = currencyFilter === "all" || list.moneda === currencyFilter
    const matchesType = typeFilter === "all" || list.tipo === typeFilter
    return matchesSearch && matchesStatus && matchesCurrency && matchesType
  })

  // Ordenar listas por fecha de actualización
  const sortedLists = filteredLists.sort((a, b) => 
    new Date(b.ultimaActualizacion).getTime() - new Date(a.ultimaActualizacion).getTime()
  )

  // Paginación
  const totalPages = Math.ceil(sortedLists.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentLists = sortedLists.slice(startIndex, startIndex + itemsPerPage)

  // Estadísticas
  const stats = {
    totalLists: mockPriceLists.length,
    activeLists: mockPriceLists.filter(list => list.estado === 'ACTIVO').length,
    inactiveLists: mockPriceLists.filter(list => list.estado === 'INACTIVO').length,
    totalProducts: mockPriceLists.reduce((acc, list) => acc + list.cantidadProductos, 0)
  }

  const handleSelectList = (listId: string) => {
    setSelectedLists(prev => 
      prev.includes(listId) 
        ? prev.filter(id => id !== listId)
        : [...prev, listId]
    )
  }

  const handleSelectAll = () => {
    setSelectedLists(
      selectedLists.length === currentLists.length 
        ? [] 
        : currentLists.map(list => list.id)
    )
  }

  const formatCurrency = (value: number, currency: string) => {
    const symbols = { USD: '$', UYU: '$U', EUR: '€', BRL: 'R$' }
    return `${symbols[currency as keyof typeof symbols] || '$'} ${value.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVO':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      case 'INACTIVO':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      case 'VENCIDO':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
      case 'PROGRAMADO':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'GENERAL':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      case 'MAYORISTA':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
      case 'MINORISTA':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      case 'PROMOCIONAL':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
      case 'ESPECIAL':
        return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Listas De Precios
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Administra y gestiona las listas de precios para diferentes tipos de clientes
              </p>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg"
              >
                <Upload className="w-4 h-4" />
                Importar
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg"
              >
                <Download className="w-4 h-4" />
                Descargar Formato
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Agregar Lista De Precios
              </motion.button>
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
            { title: "Total Listas", value: stats.totalLists, icon: FileText, color: "from-blue-500 to-cyan-500" },
            { title: "Activas", value: stats.activeLists, icon: TrendingUp, color: "from-green-500 to-emerald-500" },
            { title: "Inactivas", value: stats.inactiveLists, icon: Calendar, color: "from-red-500 to-pink-500" },
            { title: "Total Productos", value: stats.totalProducts, icon: Package, color: "from-purple-500 to-violet-500" }
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
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{stat.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Filtros y búsqueda */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-white/80 to-gray-50/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre o moneda..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/60 dark:bg-slate-700/60 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-3">
              <div className="w-40 relative z-30">
                <StyledSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: "all", label: "Todos los estados" },
                    { value: "ACTIVO", label: "Activo" },
                    { value: "INACTIVO", label: "Inactivo" },
                    { value: "VENCIDO", label: "Vencido" },
                    { value: "PROGRAMADO", label: "Programado" }
                  ]}
                />
              </div>

              <div className="w-40 relative z-20">
                <StyledSelect
                  value={currencyFilter}
                  onChange={setCurrencyFilter}
                  options={[
                    { value: "all", label: "Todas las monedas" },
                    { value: "USD", label: "USD" },
                    { value: "UYU", label: "UYU" },
                    { value: "EUR", label: "EUR" },
                    { value: "BRL", label: "BRL" }
                  ]}
                />
              </div>

              <div className="w-40 relative z-10">
                <StyledSelect
                  value={typeFilter}
                  onChange={setTypeFilter}
                  options={[
                    { value: "all", label: "Todos los tipos" },
                    { value: "GENERAL", label: "General" },
                    { value: "MAYORISTA", label: "Mayorista" },
                    { value: "MINORISTA", label: "Minorista" },
                    { value: "PROMOCIONAL", label: "Promocional" },
                    { value: "ESPECIAL", label: "Especial" }
                  ]}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {itemsPerPage} filas
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Tabla */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-white/80 to-gray-50/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-slate-700/80 dark:to-slate-600/80 backdrop-blur-sm">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedLists.length === currentLists.length && currentLists.length > 0}
                        onChange={handleSelectAll}
                        className="sr-only peer"
                      />
                      <div className="relative w-5 h-5 bg-white/50 dark:bg-slate-600/50 border-2 border-gray-300 dark:border-gray-500 rounded-md peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500 peer-checked:border-purple-500 transition-all duration-200 peer-hover:border-purple-400">
                        <Check className="absolute inset-0 w-3 h-3 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" />
                      </div>
                    </label>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Moneda
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Fecha Inicio
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Fecha Fin
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                {currentLists.map((list, index) => (
                  <motion.tr
                    key={list.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-300 backdrop-blur-sm"
                  >
                    <td className="px-4 py-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedLists.includes(list.id)}
                          onChange={() => handleSelectList(list.id)}
                          className="sr-only peer"
                        />
                        <div className="relative w-5 h-5 bg-white/50 dark:bg-slate-600/50 border-2 border-gray-300 dark:border-gray-500 rounded-md peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500 peer-checked:border-purple-500 transition-all duration-200 peer-hover:border-purple-400 group-hover:border-purple-300">
                          <Check className="absolute inset-0 w-3 h-3 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" />
                        </div>
                      </label>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                          <Link 
                            href={`/admin/listas-precios/${list.id}`}
                            className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-200 hover:underline cursor-pointer"
                          >
                            {list.nombre}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTypeColor(list.tipo)}`}>
                              {list.tipo}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {list.cantidadProductos} productos
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 dark:text-white font-medium">
                        {list.moneda}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Promedio: {formatCurrency(list.valorPromedio, list.moneda)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatDate(list.fechaInicio)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {list.fechaFin === "Invalid Date" ? "Sin fecha" : formatDate(list.fechaFin)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(list.estado)}`}>
                        {list.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
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

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, sortedLists.length)} de {sortedLists.length} resultados
                </div>
                
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </motion.button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <motion.button
                        key={page}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </motion.button>
                    ))}
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  )
}
