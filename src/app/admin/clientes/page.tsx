"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { 
  Search, 
  Download, 
  Upload, 
  Mail, 
  Eye, 
  Edit, 
  User, 
  UserCheck, 
  ChevronLeft, 
  ChevronRight,
  AlertTriangle,
  Check
} from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { useAuthStore } from "@/lib/auth-store"
import { StyledSelect } from "@/components/ui/styled-select"

// Datos de ejemplo - después esto vendrá del servidor
const mockClients = [
  {
    id: 1,
    nombre: "Juan Carlos Pérez",
    tipoDocumento: "CI",
    documento: "12345678",
    email: "juan.perez@empresa.com",
    telefono: "+598 99 123 456",
    pedidos: 15,
    estado: true,
    verificado: true,
    fechaRegistro: "2024-01-15"
  },
  {
    id: 2,
    nombre: "María González Rodríguez",
    tipoDocumento: "RUT",
    documento: "210123456789",
    email: "maria.gonzalez@comercial.com",
    telefono: "+598 98 765 432",
    pedidos: 8,
    estado: true,
    verificado: false,
    fechaRegistro: "2024-02-10"
  },
  {
    id: 3,
    nombre: "Carlos Alberto Silva",
    tipoDocumento: "CI",
    documento: "87654321",
    email: "carlos.silva@negocio.com",
    telefono: "+598 97 111 222",
    pedidos: 23,
    estado: false,
    verificado: true,
    fechaRegistro: "2023-12-05"
  },
  {
    id: 4,
    nombre: "Ana Laura Martínez",
    tipoDocumento: "CI",
    documento: "11223344",
    email: "ana.martinez@tienda.com",
    telefono: "+598 96 333 444",
    pedidos: 4,
    estado: true,
    verificado: true,
    fechaRegistro: "2024-03-20"
  },
  {
    id: 5,
    nombre: "Roberto Daniel Fernández",
    tipoDocumento: "RUT",
    documento: "210987654321",
    email: "roberto.fernandez@comercio.com",
    telefono: "+598 95 555 666",
    pedidos: 12,
    estado: true,
    verificado: false,
    fechaRegistro: "2024-01-30"
  }
]

interface Client {
  id: number
  nombre: string
  tipoDocumento: string
  documento: string
  email: string
  telefono: string
  pedidos: number
  estado: boolean
  verificado: boolean
  fechaRegistro: string
}

export default function ClientsPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClients, setSelectedClients] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    show: boolean
    clientId: number
    currentState: boolean
  }>({ show: false, clientId: 0, currentState: false })

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

  // Filtrar clientes basado en la búsqueda
  const filteredClients = mockClients.filter(client =>
    client.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.documento.includes(searchQuery) ||
    client.telefono.includes(searchQuery)
  )

  // Paginación
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentClients = filteredClients.slice(startIndex, endIndex)

  const handleSelectClient = (clientId: number) => {
    setSelectedClients(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    )
  }

  const handleSelectAll = () => {
    if (selectedClients.length === currentClients.length) {
      setSelectedClients([])
    } else {
      setSelectedClients(currentClients.map(client => client.id))
    }
  }

  const handleToggleStatus = (clientId: number, currentState: boolean) => {
    setShowConfirmDialog({
      show: true,
      clientId,
      currentState
    })
  }

  const confirmStatusChange = () => {
    // Aquí iría la lógica para cambiar el estado del cliente
    console.log(`Cambiando estado del cliente ${showConfirmDialog.clientId}`)
    setShowConfirmDialog({ show: false, clientId: 0, currentState: false })
  }

  const handleDownloadTemplate = () => {
    console.log("Descargando plantilla Excel...")
  }

  const handleImportClients = () => {
    console.log("Abriendo selector de archivo...")
  }

  const handleSendInvitations = () => {
    if (selectedClients.length > 0) {
      console.log(`Enviando invitaciones a ${selectedClients.length} clientes seleccionados`)
    } else {
      console.log("Enviando invitaciones a todos los clientes")
    }
  }

  const handleViewClient = (clientId: number) => {
    router.push(`/admin/clientes/${clientId}`)
  }

  const handleEditClient = (clientId: number) => {
    router.push(`/admin/clientes/${clientId}?mode=edit`)
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
              Gestión de Clientes
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Administra y gestiona tu base de clientes
            </p>
          </div>
        </motion.div>

        {/* Filtros y Acciones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col lg:flex-row gap-4 p-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg"
        >
          {/* Búsqueda - Más ancha */}
          <div className="flex-1 lg:flex-[3] relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, email, documento o teléfono..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/60 dark:bg-slate-700/60 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all placeholder-gray-400 backdrop-blur-sm"
            />
          </div>

          {/* Items por página - Más corto */}
          <div className="w-full lg:w-48">
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

          {/* Acciones */}
          <div className="flex gap-3">
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
              onClick={handleImportClients}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 text-blue-700 dark:text-blue-300 rounded-xl transition-all backdrop-blur-sm border border-blue-500/20"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Importar</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendInvitations}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-700 dark:text-purple-300 rounded-xl transition-all backdrop-blur-sm border border-purple-500/20"
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">
                Invitar {selectedClients.length > 0 ? `(${selectedClients.length})` : 'Todos'}
              </span>
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
                  <th className="px-6 py-5 text-left">
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedClients.length === currentClients.length && currentClients.length > 0}
                          onChange={handleSelectAll}
                          className="sr-only peer"
                        />
                        <div className="relative w-5 h-5 bg-white/50 dark:bg-slate-600/50 border-2 border-gray-300 dark:border-gray-500 rounded-md peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500 peer-checked:border-purple-500 transition-all duration-200 peer-hover:border-purple-400">
                          <Check className="absolute inset-0 w-3 h-3 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" />
                        </div>
                      </label>
                    </div>
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Pedidos
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Verificado
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/30 dark:divide-gray-700/30">
                {currentClients.map((client, index) => (
                  <motion.tr
                    key={client.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-300 backdrop-blur-sm"
                  >
                    <td className="px-6 py-5">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedClients.includes(client.id)}
                          onChange={() => handleSelectClient(client.id)}
                          className="sr-only peer"
                        />
                        <div className="relative w-5 h-5 bg-white/50 dark:bg-slate-600/50 border-2 border-gray-300 dark:border-gray-500 rounded-md peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500 peer-checked:border-purple-500 transition-all duration-200 peer-hover:border-purple-400 group-hover:border-purple-300">
                          <Check className="absolute inset-0 w-3 h-3 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" />
                        </div>
                      </label>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <motion.div 
                          whileHover={{ scale: 1.1 }}
                          className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg"
                        >
                          {client.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </motion.div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white text-sm">
                            {client.nombre}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100/50 dark:bg-slate-700/50 px-2 py-1 rounded-full inline-block mt-1">
                            Desde {new Date(client.fechaRegistro).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white bg-blue-100/50 dark:bg-blue-900/20 px-2 py-1 rounded-md inline-block">
                          {client.tipoDocumento}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 font-mono">
                          {client.documento}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-2">
                        <div className="text-sm text-gray-900 dark:text-white font-medium">
                          {client.email}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {client.telefono}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {client.pedidos}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100/50 dark:bg-slate-700/50 px-2 py-1 rounded-full">
                          órdenes
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleToggleStatus(client.id, client.estado)}
                        className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold transition-all backdrop-blur-sm border ${
                          client.estado
                            ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 dark:text-green-300 border-green-500/30 hover:from-green-500/30 hover:to-emerald-500/30'
                            : 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-700 dark:text-red-300 border-red-500/30 hover:from-red-500/30 hover:to-rose-500/30'
                        }`}
                      >
                        {client.estado ? 'Activo' : 'Inactivo'}
                      </motion.button>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="relative"
                        >
                          {client.verificado ? (
                            <div className="relative p-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
                              <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                                <Check className="w-2.5 h-2.5 text-white" />
                              </div>
                            </div>
                          ) : (
                            <div className="p-2 bg-gray-100/50 dark:bg-slate-700/50 rounded-xl border border-gray-300/30">
                              <User className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </motion.div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1, y: -2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleViewClient(client.id)}
                          className="p-3 text-blue-600 hover:text-blue-700 bg-blue-50/50 hover:bg-blue-100/70 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-xl transition-all backdrop-blur-sm border border-blue-200/30"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1, y: -2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEditClient(client.id)}
                          className="p-3 text-purple-600 hover:text-purple-700 bg-purple-50/50 hover:bg-purple-100/70 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 rounded-xl transition-all backdrop-blur-sm border border-purple-200/30"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="px-6 py-5 border-t border-gray-200/30 dark:border-gray-700/30 bg-gray-50/30 dark:bg-slate-700/30 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-300 bg-white/50 dark:bg-slate-600/50 px-3 py-2 rounded-lg backdrop-blur-sm">
                Mostrando <span className="font-semibold text-purple-600">{startIndex + 1}</span> a <span className="font-semibold text-purple-600">{Math.min(endIndex, filteredClients.length)}</span> de <span className="font-semibold text-purple-600">{filteredClients.length}</span> clientes
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
                    Confirmar Cambio de Estado
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Esta acción afectará el acceso del cliente
                  </p>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                ¿Estás seguro que deseas {showConfirmDialog.currentState ? 'desactivar' : 'activar'} este cliente?
              </p>
              
              <div className="flex gap-3 justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowConfirmDialog({ show: false, clientId: 0, currentState: false })}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmStatusChange}
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
