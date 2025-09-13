"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
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
  TrendingDown,
  ChevronLeft, 
  ChevronRight,
  Check,
  FileText
} from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { StyledSelect } from "@/components/ui/styled-select"
import { useTheme } from "@/contexts/theme-context"

// Tipos para listas de precios
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
  descripcion?: string
  tipo: 'GENERAL' | 'MAYORISTA' | 'MINORISTA' | 'PROMOCIONAL' | 'ESPECIAL'
  descuentoGeneral?: number
  montoMinimo?: number
}

// Datos de ejemplo basados en la imagen
const mockPriceLists: PriceList[] = [
  {
    id: "PL001",
    nombre: "Lista Invierno 2025",
    moneda: "UYU",
    fechaInicio: "2025-08-09",
    fechaFin: "2025-12-30",
    estado: "INACTIVO",
    cantidadProductos: 156,
    valorPromedio: 45230,
    ultimaActualizacion: "2025-09-12T10:30:00Z",
    creadoPor: "Admin",
    tipo: "GENERAL"
  },
  {
    id: "PL002",
    nombre: "Lista Precios 3",
    moneda: "USD",
    fechaInicio: "2025-08-09",
    fechaFin: "2025-12-30",
    estado: "ACTIVO",
    cantidadProductos: 89,
    valorPromedio: 1250,
    ultimaActualizacion: "2025-09-11T15:45:00Z",
    creadoPor: "Admin",
    tipo: "MAYORISTA"
  },
  {
    id: "PL003",
    nombre: "Lista Precios 7",
    moneda: "USD",
    fechaInicio: "2025-08-09",
    fechaFin: "2025-12-30",
    estado: "ACTIVO",
    cantidadProductos: 234,
    valorPromedio: 890,
    ultimaActualizacion: "2025-09-10T09:20:00Z",
    creadoPor: "Admin",
    tipo: "MINORISTA"
  },
  {
    id: "PL004",
    nombre: "Lista Precios 2",
    moneda: "UYU",
    fechaInicio: "2025-08-09",
    fechaFin: "2025-12-30",
    estado: "ACTIVO",
    cantidadProductos: 67,
    valorPromedio: 38750,
    ultimaActualizacion: "2025-09-09T14:15:00Z",
    creadoPor: "Admin",
    tipo: "PROMOCIONAL"
  },
  {
    id: "PL005",
    nombre: "Lista Precios 6",
    moneda: "UYU",
    fechaInicio: "2025-08-09",
    fechaFin: "2025-12-30",
    estado: "ACTIVO",
    cantidadProductos: 145,
    valorPromedio: 52100,
    ultimaActualizacion: "2025-09-08T11:30:00Z",
    creadoPor: "Admin",
    tipo: "ESPECIAL"
  },
  {
    id: "PL006",
    nombre: "Lista Precios 5",
    moneda: "USD",
    fechaInicio: "2025-08-09",
    fechaFin: "2025-12-30",
    estado: "INACTIVO",
    cantidadProductos: 78,
    valorPromedio: 670,
    ultimaActualizacion: "2025-09-07T16:45:00Z",
    creadoPor: "Admin",
    tipo: "GENERAL"
  },
  {
    id: "PL007",
    nombre: "Lista Precios 1",
    moneda: "USD",
    fechaInicio: "2025-08-09",
    fechaFin: "2025-12-30",
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
    fechaFin: "2025-12-30",
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
    fechaFin: "2025-12-30",
    estado: "ACTIVO",
    cantidadProductos: 134,
    valorPromedio: 47300,
    ultimaActualizacion: "2025-09-04T12:00:00Z",
    creadoPor: "Admin",
    tipo: "GENERAL"
  },
  {
    id: "PL010",
    nombre: "Lista Precios 10",
    moneda: "UYU",
    fechaInicio: "2025-08-09",
    fechaFin: "2025-12-30",
    estado: "ACTIVO",
    cantidadProductos: 167,
    valorPromedio: 49850,
    ultimaActualizacion: "2025-09-03T14:30:00Z",
    creadoPor: "Admin",
    tipo: "ESPECIAL"
  }
]

export default function ListasPreciosAdminPage() {
  const router = useRouter()
  const { themeColors } = useTheme()
  const [priceLists] = useState<PriceList[]>(mockPriceLists)
  const [selectedLists, setSelectedLists] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currencyFilter, setCurrencyFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Filtrar listas de precios
  const filteredLists = priceLists.filter(list => {
    const matchesSearch = list.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         list.tipo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         list.creadoPor.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || list.estado === statusFilter
    const matchesCurrency = currencyFilter === "all" || list.moneda === currencyFilter
    const matchesType = typeFilter === "all" || list.tipo === typeFilter
    
    return matchesSearch && matchesStatus && matchesCurrency && matchesType
  })

  // Ordenar listas por fecha de actualización (más reciente primero)
  const sortedLists = [...filteredLists].sort((a, b) => {
    const aValue = new Date(a.ultimaActualizacion).getTime()
    const bValue = new Date(b.ultimaActualizacion).getTime()
    return bValue - aValue
  })

  // Paginación
  const totalPages = Math.ceil(sortedLists.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentLists = sortedLists.slice(startIndex, startIndex + itemsPerPage)

  // Handlers
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVO':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      case 'INACTIVO':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      case 'VENCIDO':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300'
      case 'PROGRAMADO':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'GENERAL':
        return { backgroundColor: `${themeColors.primary}20`, color: themeColors.primary }
      case 'MAYORISTA':
        return { backgroundColor: `${themeColors.secondary}20`, color: themeColors.secondary }
      case 'MINORISTA':
        return { backgroundColor: `${themeColors.accent}20`, color: themeColors.accent }
      case 'PROMOCIONAL':
        return { backgroundColor: `${themeColors.primary}30`, color: themeColors.primary }
      case 'ESPECIAL':
        return { backgroundColor: `${themeColors.secondary}30`, color: themeColors.secondary }
      default:
        return { backgroundColor: 'rgba(156, 163, 175, 0.2)', color: '#6b7280' }
    }
  }

  const formatCurrency = (value: number, currency: string) => {
    const symbols = { USD: '$', UYU: '$U', EUR: '€', BRL: 'R$' }
    return `${symbols[currency as keyof typeof symbols] || '$'} ${value.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    if (dateString === "Invalid Date") return "Sin fecha"
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Estadísticas
  const stats = {
    total: priceLists.length,
    activas: priceLists.filter(list => list.estado === 'ACTIVO').length,
    inactivas: priceLists.filter(list => list.estado === 'INACTIVO').length,
    totalProductos: priceLists.reduce((acc, list) => acc + list.cantidadProductos, 0)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-3xl p-6 shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${themeColors.surface}95, ${themeColors.surface}90)`
          }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 
                className="text-3xl font-bold"
                style={{
                  backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Listas De Precios
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Administra y gestiona las listas de precios para diferentes tipos de clientes
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg"
                style={{
                  backgroundImage: `linear-gradient(to right, ${themeColors.secondary}, ${themeColors.accent})`
                }}
              >
                <Upload className="w-4 h-4" />
                Importar
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Descargar Formato
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/admin/listas-precios/nueva')}
                className="px-4 py-2 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg"
                style={{
                  backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`
                }}
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
            { title: "Total Listas", value: stats.total, icon: FileText, colorKey: "primary" as const },
            { title: "Activas", value: stats.activas, icon: TrendingUp, colorKey: "secondary" as const },
            { title: "Inactivas", value: stats.inactivas, icon: TrendingDown, colorKey: "accent" as const },
            { title: "Total Productos", value: stats.totalProductos, icon: DollarSign, colorKey: "primary" as const }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-2xl p-6 shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${themeColors.surface}70, ${themeColors.surface}60)`
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${themeColors[stat.colorKey]}, ${themeColors.secondary})`
                  }}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p 
                    className="text-2xl font-bold"
                    style={{ color: themeColors[stat.colorKey] }}
                  >
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
          className="backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-2xl p-6 shadow-xl"
          style={{
            background: `linear-gradient(135deg, ${themeColors.surface}80, ${themeColors.surface}70)`
          }}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" 
                style={{ color: themeColors.primary }}
              />
              <input
                type="text"
                placeholder="Buscar por nombre o moneda..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/60 dark:bg-slate-700/60 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all placeholder-gray-400 backdrop-blur-sm"
                style={{
                  '--tw-ring-color': `${themeColors.primary}50`
                } as React.CSSProperties}
              />
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="w-full sm:w-48 relative z-1">
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

              <div className="w-full sm:w-40 relative z-1">
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

              <div className="w-full sm:w-44 relative z-10">
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

              <div className="w-full sm:w-32 relative z-1">
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
          </div>
        </motion.div>

        {/* Tabla de listas de precios */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${themeColors.surface}80, ${themeColors.surface}70)`
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead 
                className="backdrop-blur-sm"
                style={{
                  background: `linear-gradient(135deg, ${themeColors.primary}20, ${themeColors.secondary}15)`
                }}
              >
                <tr>
                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedLists.length === currentLists.length && currentLists.length > 0}
                          onChange={handleSelectAll}
                          className="sr-only peer"
                        />
                        <div 
                          className="relative w-5 h-5 bg-white/50 dark:bg-slate-600/50 border-2 border-gray-300 dark:border-gray-500 rounded-md transition-all duration-200 peer-hover:border-purple-400"
                          style={{
                            borderColor: selectedLists.length === currentLists.length && currentLists.length > 0 ? themeColors.primary : undefined,
                            background: selectedLists.length === currentLists.length && currentLists.length > 0 ? `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})` : undefined
                          }}
                        >
                          <Check className="absolute inset-0 w-3 h-3 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" />
                        </div>
                      </label>
                    </div>
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
                    className="group transition-all duration-300 backdrop-blur-sm"
                    style={{
                      ':hover': {
                        background: `linear-gradient(to right, ${themeColors.primary}10, ${themeColors.secondary}10)`
                      }
                    }}
                  >
                    <td className="px-4 py-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedLists.includes(list.id)}
                          onChange={() => handleSelectList(list.id)}
                          className="sr-only peer"
                        />
                        <div 
                          className="relative w-5 h-5 bg-white/50 dark:bg-slate-600/50 border-2 border-gray-300 dark:border-gray-500 rounded-md transition-all duration-200 peer-hover:border-purple-400 group-hover:border-purple-300"
                          style={{
                            borderColor: selectedLists.includes(list.id) ? themeColors.primary : undefined,
                            background: selectedLists.includes(list.id) ? `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})` : undefined
                          }}
                        >
                          <Check className="absolute inset-0 w-3 h-3 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" />
                        </div>
                      </label>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg"
                          style={{
                            backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`
                          }}
                        >
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                          <Link 
                            href={`/admin/listas-precios/${list.id}`}
                            className="font-semibold text-gray-900 dark:text-white text-sm transition-colors duration-200 hover:underline cursor-pointer"
                            style={{
                              color: undefined
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = themeColors.primary
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = ''
                            }}
                          >
                            {list.nombre}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span 
                              className="text-xs px-2 py-1 rounded-full font-medium"
                              style={getTypeColor(list.tipo)}
                            >
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
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">
                          {list.moneda}
                        </span>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Promedio: {formatCurrency(list.valorPromedio, list.moneda)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {formatDate(list.fechaInicio)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {formatDate(list.fechaFin)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(list.estado)}`}>
                        {list.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => router.push(`/admin/listas-precios/${list.id}`)}
                          className="p-2 text-gray-400 transition-colors duration-200"
                          style={{
                            ':hover': {
                              color: themeColors.secondary
                            }
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = themeColors.secondary
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = ''
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => router.push(`/admin/listas-precios/${list.id}/editar`)}
                          className="p-2 text-gray-400 transition-colors duration-200"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = themeColors.primary
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = ''
                          }}
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
                        className="w-8 h-8 rounded-lg text-sm font-medium transition-all"
                        style={{
                          ...(currentPage === page && {
                            backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
                            color: 'white',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }),
                          ...((currentPage !== page) && {
                            color: 'rgb(107, 114, 128)'
                          })
                        }}
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
