"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
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
  Check,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useAuthStore } from "@/lib/auth-store";
import { useTheme } from "@/contexts/theme-context";
import { StyledSelect } from "@/components/ui/styled-select";

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
    fechaRegistro: "2024-01-15",
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
    fechaRegistro: "2024-02-10",
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
    fechaRegistro: "2023-12-05",
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
    fechaRegistro: "2024-03-20",
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
    fechaRegistro: "2024-01-30",
  },
];

interface Client {
  id: number;
  nombre: string;
  tipoDocumento: string;
  documento: string;
  email: string;
  telefono: string;
  pedidos: number;
  estado: boolean;
  verificado: boolean;
  fechaRegistro: string;
}

export default function ClientsPage() {
  const { user } = useAuthStore();
  const { themeColors } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClients, setSelectedClients] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    show: boolean;
    clientId: number;
    currentState: boolean;
  }>({ show: false, clientId: 0, currentState: false });

  // Función para obtener colores del tema
  const getClientColor = (index: number) => {
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

  // Filtrar clientes basado en la búsqueda
  const filteredClients = mockClients.filter(
    (client) =>
      client.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.documento.includes(searchQuery) ||
      client.telefono.includes(searchQuery),
  );

  // Paginación
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClients = filteredClients.slice(startIndex, endIndex);

  const handleSelectClient = (clientId: number) => {
    setSelectedClients((prev) =>
      prev.includes(clientId)
        ? prev.filter((id) => id !== clientId)
        : [...prev, clientId],
    );
  };

  const handleSelectAll = () => {
    if (selectedClients.length === currentClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(currentClients.map((client) => client.id));
    }
  };

  const handleToggleStatus = (clientId: number, currentState: boolean) => {
    setShowConfirmDialog({
      show: true,
      clientId,
      currentState,
    });
  };

  const confirmStatusChange = () => {
    // Aquí iría la lógica para cambiar el estado del cliente
    console.log(`Cambiando estado del cliente ${showConfirmDialog.clientId}`);
    setShowConfirmDialog({ show: false, clientId: 0, currentState: false });
  };

  const handleDownloadTemplate = () => {
    console.log("Descargando plantilla Excel...");
  };

  const handleImportClients = () => {
    console.log("Abriendo selector de archivo...");
  };

  const handleSendInvitations = () => {
    if (selectedClients.length > 0) {
      console.log(
        `Enviando invitaciones a ${selectedClients.length} clientes seleccionados`,
      );
    } else {
      console.log("Enviando invitaciones a todos los clientes");
    }
  };

  const handleViewClient = (clientId: number) => {
    router.push(`/admin/clientes/${clientId}`);
  };

  const handleEditClient = (clientId: number) => {
    router.push(`/admin/clientes/${clientId}?mode=edit`);
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
              Gestión de Clientes
            </h1>
            <p style={{ color: themeColors.text.secondary }}>
              Administra y gestiona tu base de clientes
            </p>
          </div>
        </motion.div>

        {/* Filtros y Acciones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col lg:flex-row gap-4 p-6 backdrop-blur-xl rounded-2xl border shadow-lg"
          style={{
            backgroundColor: themeColors.surface + "70",
            borderColor: themeColors.primary + "30"
          }}
        >
          {/* Búsqueda - Más ancha */}
          <div className="flex-1 lg:flex-[3] relative">
            <Search 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" 
              style={{ color: themeColors.text.secondary }}
            />
            <input
              type="text"
              placeholder="Buscar por nombre, email, documento o teléfono..."
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

          {/* Items por página - Más corto */}
          <div className="w-full lg:w-48">
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

          {/* Acciones */}
          <div className="flex gap-3">
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
              onClick={handleImportClients}
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

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendInvitations}
              className="flex items-center gap-2 px-5 py-3 rounded-xl transition-all backdrop-blur-sm border font-medium"
              style={{
                backgroundColor: themeColors.primary + "20",
                color: themeColors.text.primary,
                borderColor: themeColors.primary + "40"
              }}
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">
                Invitar{" "}
                {selectedClients.length > 0
                  ? `(${selectedClients.length})`
                  : "Todos"}
              </span>
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
                  <th className="px-6 py-5 text-left">
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={
                            selectedClients.length === currentClients.length &&
                            currentClients.length > 0
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
                    className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: themeColors.text.primary }}
                  >
                    Cliente
                  </th>
                  <th 
                    className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: themeColors.text.primary }}
                  >
                    Documento
                  </th>
                  <th 
                    className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: themeColors.text.primary }}
                  >
                    Contacto
                  </th>
                  <th 
                    className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: themeColors.text.primary }}
                  >
                    Pedidos
                  </th>
                  <th 
                    className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: themeColors.text.primary }}
                  >
                    Estado
                  </th>
                  <th 
                    className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: themeColors.text.primary }}
                  >
                    Verificado
                  </th>
                  <th 
                    className="px-6 py-5 text-left text-xs font-semibold uppercase tracking-wider"
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
                {currentClients.map((client, index) => {
                  const clientColor = getClientColor(index);
                  return (
                    <motion.tr
                      key={client.id}
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
                      <td className="px-6 py-5">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedClients.includes(client.id)}
                            onChange={() => handleSelectClient(client.id)}
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
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg"
                            style={{
                              background: `linear-gradient(45deg, ${clientColor}, ${clientColor}90)`
                            }}
                          >
                            {client.nombre
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)}
                          </motion.div>
                          <div>
                            <div 
                              className="font-semibold text-sm"
                              style={{ color: themeColors.text.primary }}
                            >
                              {client.nombre}
                            </div>
                            <div 
                              className="text-xs px-2 py-1 rounded-full inline-block mt-1"
                              style={{
                                backgroundColor: themeColors.primary + "20",
                                color: themeColors.text.secondary
                              }}
                            >
                              Desde{" "}
                              {new Date(
                                client.fechaRegistro,
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <div 
                            className="text-sm font-medium px-2 py-1 rounded-md inline-block"
                            style={{
                              backgroundColor: themeColors.secondary + "20",
                              color: themeColors.text.primary
                            }}
                          >
                            {client.tipoDocumento}
                          </div>
                          <div 
                            className="text-sm font-mono"
                            style={{ color: themeColors.text.secondary }}
                          >
                            {client.documento}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-2">
                          <div 
                            className="text-sm font-medium"
                            style={{ color: themeColors.text.primary }}
                          >
                            {client.email}
                          </div>
                          <div 
                            className="text-sm"
                            style={{ color: themeColors.text.secondary }}
                          >
                            {client.telefono}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div 
                            className="text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
                            style={{
                              backgroundImage: `linear-gradient(to right, ${clientColor}, ${clientColor}90)`
                            }}
                          >
                            {client.pedidos}
                          </div>
                          <div 
                            className="text-xs px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: themeColors.surface + "50",
                              color: themeColors.text.secondary
                            }}
                          >
                            órdenes
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            handleToggleStatus(client.id, client.estado)
                          }
                          className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold transition-all backdrop-blur-sm border"
                          style={{
                            backgroundColor: client.estado 
                              ? themeColors.accent + "20" 
                              : themeColors.primary + "20",
                            color: client.estado 
                              ? themeColors.text.primary 
                              : themeColors.text.primary,
                            borderColor: client.estado 
                              ? themeColors.accent + "40" 
                              : themeColors.primary + "40"
                          }}
                        >
                          {client.estado ? "Activo" : "Inactivo"}
                        </motion.button>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="relative"
                          >
                            {client.verificado ? (
                              <div 
                                className="relative p-2 rounded-xl border"
                                style={{
                                  backgroundColor: themeColors.accent + "20",
                                  borderColor: themeColors.accent + "40"
                                }}
                              >
                                <UserCheck 
                                  className="w-6 h-6"
                                  style={{ color: themeColors.accent }}
                                />
                                <div 
                                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center shadow-lg"
                                  style={{
                                    background: `linear-gradient(45deg, ${themeColors.accent}, ${themeColors.accent}90)`
                                  }}
                                >
                                  <Check className="w-2.5 h-2.5 text-white" />
                                </div>
                              </div>
                            ) : (
                              <div 
                                className="p-2 rounded-xl border"
                                style={{
                                  backgroundColor: themeColors.surface + "50",
                                  borderColor: themeColors.primary + "30"
                                }}
                              >
                                <User 
                                  className="w-6 h-6"
                                  style={{ color: themeColors.text.secondary }}
                                />
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
                            onClick={() => handleEditClient(client.id)}
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
            className="px-6 py-5 border-t backdrop-blur-sm"
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
                  {Math.min(endIndex, filteredClients.length)}
                </span>{" "}
                de{" "}
                <span 
                  className="font-semibold"
                  style={{ color: themeColors.primary }}
                >
                  {filteredClients.length}
                </span>{" "}
                clientes
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
                    Confirmar Cambio de Estado
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: themeColors.text.secondary }}
                  >
                    Esta acción afectará el acceso del cliente
                  </p>
                </div>
              </div>

              <p 
                className="mb-6"
                style={{ color: themeColors.text.secondary }}
              >
                ¿Estás seguro que deseas{" "}
                {showConfirmDialog.currentState ? "desactivar" : "activar"} este
                cliente?
              </p>

              <div className="flex gap-3 justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    setShowConfirmDialog({
                      show: false,
                      clientId: 0,
                      currentState: false,
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
                  onClick={confirmStatusChange}
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
