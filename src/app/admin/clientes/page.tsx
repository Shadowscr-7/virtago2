"use client";

import { useState, useEffect, useCallback } from "react";
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
  Loader2,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useAuthStore } from "@/store/auth"; // ✅ Usar el store correcto
import { useTheme } from "@/contexts/theme-context";
import { StyledSelect } from "@/components/ui/styled-select";
import { api, ClientData } from "@/api";
import { showToast } from "@/store/toast-helpers";
import { ClientImportModal } from "@/components/admin/clients/ClientImportModal";

// Datos de ejemplo eliminados - ahora usa API real
// Using ClientData interface from API instead of local Client interface

export default function ClientesPage() {
  const { user } = useAuthStore();
  const { themeColors } = useTheme();
  const router = useRouter();
  
  // Estados para datos de la API
  const [clients, setClients] = useState<ClientData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalClients, setTotalClients] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Estados para UI
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState(""); // Para el input con debounce
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Mostrar 10 por página por defecto
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    show: boolean;
    clientId: string;
    currentState: boolean;
  }>({ show: false, clientId: "", currentState: false });
  
  const [showInviteDialog, setShowInviteDialog] = useState<{
    show: boolean;
    clientId: string;
    email: string;
    firstName: string;
    lastName: string;
  }>({ show: false, clientId: "", email: "", firstName: "", lastName: "" });
  
  const [isSendingInvitation, setIsSendingInvitation] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showBulkInviteDialog, setShowBulkInviteDialog] = useState(false);
  const [isSendingBulkInvitations, setIsSendingBulkInvitations] = useState(false);

  // Función para obtener colores del tema
  const getClientColor = (index: number) => {
    const colors = [themeColors.primary, themeColors.secondary, themeColors.accent];
    return colors[index % colors.length];
  };

  // 🐛 DEBUG: Ver estructura completa del usuario
  console.log('[CLIENTES] 🔍 Usuario completo:', JSON.stringify(user, null, 2));
  console.log('[CLIENTES] 🔍 distributorInfo:', user?.distributorInfo);
  console.log('[CLIENTES] 🔍 distributorCode:', user?.distributorInfo?.distributorCode);

  // ✅ Verificar acceso (distributor o admin)
  const hasAccess = user && (
    user.role === "distributor" || 
    user.role === "admin" || 
    user.userType === "distributor"
  );

  // 🔄 Función para cargar clientes desde la API
  const loadClients = useCallback(async () => {
    console.log('[CLIENTES] 🔄 Ejecutando loadClients...');
    console.log('[CLIENTES] 🔍 user:', user);
    console.log('[CLIENTES] 🔍 user?.distributorInfo:', user?.distributorInfo);
    console.log('[CLIENTES] 🔍 distributorCode:', user?.distributorInfo?.distributorCode);
    
    if (!user) {
      console.warn('[CLIENTES] ❌ No hay usuario logueado');
      setIsLoading(false);
      return;
    }

    const distributorCode = user?.distributorInfo?.distributorCode;
    
    if (!distributorCode) {
      console.error('[CLIENTES] ❌ distributorCode es vacío/null/undefined. distributorInfo:', JSON.stringify(user?.distributorInfo));
      setIsLoading(false);
      return;
    }
    
    console.log('[CLIENTES] ✅ Usando distributorCode:', distributorCode);

    setIsLoading(true);
    try {
      console.log('[CLIENTES] Cargando clientes...', {
        distributorCode: distributorCode,
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery
      });

      const response = await api.admin.clients.getAll({
        distributorCode: distributorCode,
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined
      });

      console.log('[CLIENTES] Respuesta de la API:', response);

      if (response.success && response.data) {
        // El backend devuelve: { success, message, data: [...], pagination: {...} }
        // Pero viene envuelto en ApiResponse, así que tenemos que extraer correctamente
        
        console.log('[CLIENTES] 🔍 Estructura de response:', {
          hasData: !!response.data,
          dataType: typeof response.data,
          isArray: Array.isArray(response.data),
          dataKeys: response.data ? Object.keys(response.data) : []
        });
        
        // Extraer los datos correctamente
        let clientsArray: ClientData[] = [];
        let paginationInfo: { totalItems: number; totalPages: number } = { totalItems: 0, totalPages: 1 };
        
        // El response.data puede ser el objeto completo de la respuesta del backend
        const backendResponse = response.data as unknown as {
          data?: ClientData[];
          clients?: ClientData[];
          pagination?: {
            totalItems?: number;
            totalPages?: number;
          };
          total?: number;
          pages?: number;
        };
        
        // Intentar diferentes estructuras posibles
        if (Array.isArray(response.data)) {
          clientsArray = response.data;
        } else if (backendResponse.data && Array.isArray(backendResponse.data)) {
          clientsArray = backendResponse.data;
          if (backendResponse.pagination) {
            paginationInfo = {
              totalItems: backendResponse.pagination.totalItems || clientsArray.length,
              totalPages: backendResponse.pagination.totalPages || 1
            };
          }
        } else if (backendResponse.clients && Array.isArray(backendResponse.clients)) {
          clientsArray = backendResponse.clients;
          paginationInfo = {
            totalItems: backendResponse.total || backendResponse.clients.length,
            totalPages: backendResponse.pages || 1
          };
        }
        
        console.log('[CLIENTES] 🔍 Clientes extraídos:', clientsArray.length);
        
        // Mapear clientId a _id para compatibilidad con el frontend
        const mappedClients: ClientData[] = clientsArray.map(client => {
          const clientRecord = client as unknown as Record<string, unknown>;
          const originalClientId = clientRecord.clientId as string;
          return {
            ...client,
            _id: originalClientId || client._id,
            clientId: originalClientId // Preservar el clientId original para usarlo en detalle
          };
        });
        
        setClients(mappedClients);
        setTotalClients(paginationInfo.totalItems || mappedClients.length);
        setTotalPages(paginationInfo.totalPages || 1);
        console.log(`[CLIENTES] ✅ ${mappedClients.length} clientes cargados de ${paginationInfo.totalItems} totales`);
      } else {
        console.error('[CLIENTES] Respuesta no exitosa:', response);
        setClients([]);
        setTotalClients(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('[CLIENTES] Error cargando clientes:', error);
      setClients([]);
      setTotalClients(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [user, currentPage, itemsPerPage, searchQuery]);

  // 🔄 Cargar clientes al montar y cuando cambien los parámetros
  useEffect(() => {
    if (hasAccess) {
      loadClients();
    }
  }, [hasAccess, loadClients]);

  // 🔄 Debounce para el input de búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1); // Resetear a página 1 al buscar
    }, 500); // 500ms de debounce

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  if (!hasAccess) {
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

  // ✅ Los clientes ya vienen filtrados del servidor
  const currentClients = clients;

  const handleSelectClient = (clientId: string) => {
    console.log('[CLIENTES] 📌 Click en checkbox:', clientId);
    console.log('[CLIENTES] 📌 Seleccionados antes:', selectedClients);
    setSelectedClients((prev) => {
      const newSelection = prev.includes(clientId)
        ? prev.filter((id) => id !== clientId)
        : [...prev, clientId];
      console.log('[CLIENTES] 📌 Seleccionados después:', newSelection);
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    console.log('[CLIENTES] 📌 Click en seleccionar todos');
    console.log('[CLIENTES] 📌 Clientes actuales:', currentClients.length);
    console.log('[CLIENTES] 📌 Seleccionados:', selectedClients.length);
    
    if (selectedClients.length === currentClients.length && currentClients.length > 0) {
      console.log('[CLIENTES] 📌 Deseleccionando todos');
      setSelectedClients([]);
    } else {
      const allIds = currentClients.map((client) => client._id);
      console.log('[CLIENTES] 📌 Seleccionando todos:', allIds);
      setSelectedClients(allIds);
    }
  };

  const handleToggleStatus = (clientId: string, currentState: "A" | "N" | "I") => {
    setShowConfirmDialog({
      show: true,
      clientId,
      currentState: currentState === 'A', // Convert to boolean for dialog
    });
  };

  const handleInviteUser = (client: ClientData) => {
    // Solo mostrar el diálogo si el cliente NO tiene usuario
    if (client.hasUser) {
      console.log('[CLIENTES] ℹ️ Cliente ya tiene usuario:', client._id);
      return;
    }

    setShowInviteDialog({
      show: true,
      clientId: client._id,
      email: client.email || "",
      firstName: client.firstName || "",
      lastName: client.lastName || "",
    });
  };

  const confirmInvitation = async () => {
    const { email, firstName, lastName } = showInviteDialog;
    
    if (!email || !firstName || !lastName) {
      showToast({
        title: "Datos incompletos",
        description: "Faltan datos del cliente para enviar la invitación",
        type: "error"
      });
      return;
    }

    console.log(`[CLIENTES] 📧 Enviando invitación a ${email}`);
    setIsSendingInvitation(true);
    
    try {
      const response = await api.admin.clients.sendInvitation({
        email,
        firstName,
        lastName,
        distributorCode: user?.distributorInfo?.distributorCode || "", // ⚠️ No debe estar vacío
      });
      
      // Extraer datos de la respuesta (puede venir envuelto en .data)
      const responseData = (response.data as any)?.action ? response.data : (response.data as any)?.data || response.data;
      const action = (responseData as any)?.action;
      
      if (response.success) {
        console.log(`[CLIENTES] ✅ Respuesta de invitación:`, responseData);
        
        // Mostrar mensaje diferente según la acción del backend
        switch (action) {
          case 'invitation_sent':
            showToast({
              title: "Invitación enviada",
              description: `Se ha enviado el email de invitación a ${email} correctamente`,
              type: "success"
            });
            break;
          case 'already_invited':
            showToast({
              title: "Invitación ya existente",
              description: `Ya existe una invitación pendiente para ${email} con este distribuidor`,
              type: "warning"
            });
            break;
          case 'code_added':
            showToast({
              title: "Código agregado",
              description: `${email} ya tiene cuenta. Se le agregó el código de distribuidor`,
              type: "success"
            });
            break;
          default:
            showToast({
              title: "Invitación procesada",
              description: (responseData as any)?.message || `Invitación procesada para ${email}`,
              type: "success"
            });
        }
        
        // Cerrar el diálogo
        setShowInviteDialog({ show: false, clientId: "", email: "", firstName: "", lastName: "" });
        
        // Recargar lista de clientes para reflejar cambios
        loadClients();
      } else {
        console.error('[CLIENTES] ❌ Error en la respuesta:', response);
        showToast({
          title: "Error al enviar invitación",
          description: response.message || "No se pudo enviar la invitación",
          type: "error"
        });
      }
    } catch (error) {
      console.error('[CLIENTES] ❌ Error al enviar invitación:', error);
      showToast({
        title: "Error al enviar invitación",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        type: "error"
      });
    } finally {
      setIsSendingInvitation(false);
    }
  };

  const confirmStatusChange = async () => {
    const clientId = showConfirmDialog.clientId;
    const currentStatus = showConfirmDialog.currentState; // true = "A" (Activo), false = otros
    
    // Determinar el nuevo estado (toggle entre Activo e Inactivo)
    const newStatus: "A" | "I" = currentStatus ? "I" : "A";
    
    console.log(`[CLIENTES] 🔄 Cambiando estado del cliente ${clientId} a ${newStatus}`);
    
    try {
      const response = await api.admin.clients.updateStatus(clientId, newStatus);
      
      if (response.success) {
        console.log(`[CLIENTES] ✅ Estado actualizado correctamente`);
        
        // Actualizar el estado local del cliente en la lista
        setClients(prevClients =>
          prevClients.map(client =>
            client._id === clientId
              ? { ...client, status: newStatus }
              : client
          )
        );
        
        showToast({
          title: "Estado actualizado",
          description: `Cliente ${newStatus === "A" ? "activado" : "desactivado"} correctamente`,
          type: "success"
        });
      } else {
        console.error('[CLIENTES] ❌ Error en la respuesta:', response);
        showToast({
          title: "Error al cambiar estado",
          description: response.message || "No se pudo cambiar el estado del cliente",
          type: "error"
        });
      }
    } catch (error) {
      console.error('[CLIENTES] ❌ Error al cambiar estado:', error);
      showToast({
        title: "Error al cambiar estado",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        type: "error"
      });
    } finally {
      // Cerrar el diálogo
      setShowConfirmDialog({ show: false, clientId: "", currentState: false });
    }
  };

  const handleDownloadTemplate = async () => {
    console.log("[CLIENTES] 📥 Descargando Excel de clientes...");
    
    try {
      const blob = await api.admin.clients.export();
      
      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `clientes_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showToast({
        title: "Exportación exitosa",
        description: "El archivo Excel se ha descargado correctamente",
        type: "success"
      });
      
      console.log("[CLIENTES] ✅ Excel descargado correctamente");
    } catch (error) {
      console.error("[CLIENTES] ❌ Error al descargar Excel:", error);
      showToast({
        title: "Error al exportar",
        description: error instanceof Error ? error.message : "No se pudo descargar el archivo",
        type: "error"
      });
    }
  };

  const handleImportClients = () => {
    console.log("[CLIENTES] 📂 Abriendo modal de importación...");
    setShowImportModal(true);
  };

  const handleSendInvitations = () => {
    console.log("[CLIENTES] 📧 Abriendo diálogo de invitaciones masivas...");
    setShowBulkInviteDialog(true);
  };

  const confirmBulkInvitations = async () => {
    const clientsToInvite = selectedClients.length > 0 
      ? clients.filter(c => selectedClients.includes(c._id))
      : clients;

    const clientsWithoutUser = clientsToInvite.filter(c => !c.hasUser);

    if (clientsWithoutUser.length === 0) {
      showToast({
        title: "Sin clientes para invitar",
        description: "Todos los clientes seleccionados ya tienen usuario",
        type: "info"
      });
      setShowBulkInviteDialog(false);
      return;
    }

    console.log(`[CLIENTES] 📧 Enviando ${clientsWithoutUser.length} invitaciones...`);
    setIsSendingBulkInvitations(true);

    let sentCount = 0;
    let alreadyInvitedCount = 0;
    let codeAddedCount = 0;
    let errorCount = 0;

    try {
      // Enviar invitaciones una por una
      for (const client of clientsWithoutUser) {
        try {
          const response = await api.admin.clients.sendInvitation({
            email: client.email,
            firstName: client.firstName,
            lastName: client.lastName,
            distributorCode: user?.distributorInfo?.distributorCode || "",
          });

          if (response.success) {
            const responseData = (response.data as any)?.action ? response.data : (response.data as any)?.data || response.data;
            const action = (responseData as any)?.action;
            
            switch (action) {
              case 'invitation_sent':
                sentCount++;
                console.log(`[CLIENTES] ✅ Invitación enviada a ${client.email}`);
                break;
              case 'already_invited':
                alreadyInvitedCount++;
                console.log(`[CLIENTES] ⚠️ Ya invitado: ${client.email}`);
                break;
              case 'code_added':
                codeAddedCount++;
                console.log(`[CLIENTES] ✅ Código agregado a ${client.email}`);
                break;
              default:
                sentCount++;
                console.log(`[CLIENTES] ✅ Procesado: ${client.email}`);
            }
          } else {
            errorCount++;
            console.error(`[CLIENTES] ❌ Error al enviar a ${client.email}:`, response.message);
          }
        } catch (error) {
          errorCount++;
          console.error(`[CLIENTES] ❌ Error al enviar a ${client.email}:`, error);
        }
      }

      // Construir resumen detallado
      const totalSuccess = sentCount + codeAddedCount;
      const parts: string[] = [];
      if (sentCount > 0) parts.push(`${sentCount} invitación(es) enviada(s)`);
      if (codeAddedCount > 0) parts.push(`${codeAddedCount} código(s) agregado(s)`);
      if (alreadyInvitedCount > 0) parts.push(`${alreadyInvitedCount} ya invitado(s)`);
      if (errorCount > 0) parts.push(`${errorCount} fallida(s)`);
      const summary = parts.join(', ');

      if (errorCount === 0 && alreadyInvitedCount === 0) {
        showToast({
          title: "Invitaciones enviadas",
          description: summary,
          type: "success"
        });
      } else if (totalSuccess > 0) {
        showToast({
          title: "Invitaciones procesadas",
          description: summary,
          type: "warning"
        });
      } else if (alreadyInvitedCount > 0 && errorCount === 0) {
        showToast({
          title: "Ya invitados",
          description: `Todos los clientes seleccionados ya tienen invitación pendiente`,
          type: "info"
        });
      } else {
        showToast({
          title: "Error al enviar invitaciones",
          description: "No se pudo enviar ninguna invitación",
          type: "error"
        });
      }

      // Limpiar selección y recargar lista
      setSelectedClients([]);
      loadClients();
    } catch (error) {
      console.error("[CLIENTES] ❌ Error general:", error);
      showToast({
        title: "Error al enviar invitaciones",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        type: "error"
      });
    } finally {
      setIsSendingBulkInvitations(false);
      setShowBulkInviteDialog(false);
    }
  };

  const handleViewClient = (clientId: string) => {
    router.push(`/admin/clientes/${clientId}`);
  };

  const handleEditClient = (clientId: string) => {
    router.push(`/admin/clientes/${clientId}?mode=edit`);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          className="flex flex-col lg:flex-row gap-4 p-6 rounded-2xl border shadow-lg"
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
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
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
              onChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1); // Reset a página 1 al cambiar tamaño
              }}
              options={[
                { value: "10", label: "10 filas" },
                { value: "20", label: "20 filas" },
                { value: "50", label: "50 filas" },
                { value: "100", label: "100 filas" },
              ]}
            />
          </div>

          {/* Acciones */}
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/admin/clientes/nuevo')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl transition-all backdrop-blur-sm border font-medium text-white"
              style={{
                background: `linear-gradient(45deg, ${themeColors.primary}, ${themeColors.secondary})`,
                borderColor: themeColors.primary + "40"
              }}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Crear Cliente</span>
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
              <span className="hidden sm:inline">Exportar Excel</span>
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
          className="rounded-2xl border overflow-hidden shadow-xl"
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
                          className="relative w-5 h-5 border-2 rounded-md transition-all duration-200 peer-checked:bg-purple-600 peer-checked:border-purple-600"
                          style={{
                            backgroundColor: (selectedClients.length === currentClients.length && currentClients.length > 0) 
                              ? themeColors.primary 
                              : themeColors.surface + "50",
                            borderColor: (selectedClients.length === currentClients.length && currentClients.length > 0)
                              ? themeColors.primary
                              : themeColors.primary + "60"
                          }}
                        >
                          <Check className="absolute inset-0 w-3 h-3 m-auto text-white transition-opacity duration-200" 
                            style={{ 
                              opacity: (selectedClients.length === currentClients.length && currentClients.length > 0) ? 1 : 0 
                            }} 
                          />
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
                {/* Loading state */}
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <Loader2 
                          className="w-8 h-8 animate-spin" 
                          style={{ color: themeColors.primary }} 
                        />
                        <p style={{ color: themeColors.text.secondary }}>
                          Cargando clientes...
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Empty state */}
                {!isLoading && currentClients.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <User 
                          className="w-12 h-12" 
                          style={{ color: themeColors.text.secondary + "50" }} 
                        />
                        <p style={{ color: themeColors.text.secondary }}>
                          {searchQuery ? 
                            `No se encontraron clientes con "${searchQuery}"` : 
                            'No hay clientes registrados aún'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Clientes list */}
                {!isLoading && currentClients.map((client, index) => {
                  const clientColor = getClientColor(index);
                  const fullName = `${client.firstName} ${client.lastName}`.trim();
                  const initials = `${client.firstName?.[0] || ''}${client.lastName?.[0] || ''}`.toUpperCase();
                  const createdDate = client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'N/A';
                  
                  return (
                    <motion.tr
                      key={client._id}
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
                            checked={selectedClients.includes(client._id)}
                            onChange={() => handleSelectClient(client._id)}
                            className="sr-only peer"
                          />
                          <div 
                            className="relative w-5 h-5 border-2 rounded-md transition-all duration-200 peer-checked:bg-purple-600 peer-checked:border-purple-600"
                            style={{
                              backgroundColor: selectedClients.includes(client._id)
                                ? themeColors.primary
                                : themeColors.surface + "50",
                              borderColor: selectedClients.includes(client._id)
                                ? themeColors.primary
                                : themeColors.primary + "60"
                            }}
                          >
                            <Check 
                              className="absolute inset-0 w-3 h-3 m-auto text-white transition-opacity duration-200" 
                              style={{ 
                                opacity: selectedClients.includes(client._id) ? 1 : 0 
                              }}
                            />
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
                            {initials}
                          </motion.div>
                          <div>
                            <div 
                              className="font-semibold text-sm"
                              style={{ color: themeColors.text.primary }}
                            >
                              {fullName}
                            </div>
                            <div 
                              className="text-xs px-2 py-1 rounded-full inline-block mt-1"
                              style={{
                                backgroundColor: themeColors.primary + "20",
                                color: themeColors.text.secondary
                              }}
                            >
                              Desde {createdDate}
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
                            {client.documentType || 'CI'}
                          </div>
                          <div 
                            className="text-sm font-mono"
                            style={{ color: themeColors.text.secondary }}
                          >
                            {client.document || 'N/A'}
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
                            {client.phone || client.phoneOptional || 'N/A'}
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
                            0
                          </div>
                          <span 
                            className="text-xs font-medium"
                            style={{ color: themeColors.text.secondary }}
                          >
                            órdenes
                          </span>
                        </div>
                      </td>
                      {/* Estado */}
                      <td className="px-6 py-5">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            handleToggleStatus(client._id, client.status || 'N')
                          }
                          className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold transition-all backdrop-blur-sm border"
                          style={{
                            backgroundColor: client.status === 'A' 
                              ? themeColors.accent + "20" 
                              : client.status === 'I'
                              ? themeColors.primary + "20"
                              : themeColors.secondary + "20",
                            color: themeColors.text.primary,
                            borderColor: client.status === 'A' 
                              ? themeColors.accent + "40" 
                              : client.status === 'I'
                              ? themeColors.primary + "40"
                              : themeColors.secondary + "40"
                          }}
                        >
                          {client.status === 'A' ? "Activo" : client.status === 'I' ? "Inactivo" : "Nuevo"}
                        </motion.button>
                      </td>
                      {/* Verificado / Usuario */}
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center">
                          <motion.div
                            whileHover={{ scale: client.isVerified || client.hasUser ? 1.05 : 1.1 }}
                            className="relative"
                          >
                            {client.isVerified ? (
                              // Cliente verificado
                              <div 
                                className="relative p-2 rounded-xl border"
                                style={{
                                  backgroundColor: themeColors.accent + "20",
                                  borderColor: themeColors.accent + "40"
                                }}
                                title="Cliente verificado"
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
                            ) : client.hasUser ? (
                              // Cliente tiene usuario (no clickeable)
                              <div 
                                className="relative p-2 rounded-xl border"
                                style={{
                                  backgroundColor: "#10b981" + "20",
                                  borderColor: "#10b981" + "40"
                                }}
                                title="Cliente ya tiene usuario en la plataforma"
                              >
                                <User 
                                  className="w-6 h-6"
                                  style={{ color: "#10b981" }}
                                />
                                <div 
                                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center shadow-lg"
                                  style={{
                                    backgroundColor: "#10b981"
                                  }}
                                >
                                  <Check className="w-2.5 h-2.5 text-white" />
                                </div>
                              </div>
                            ) : (
                              // Cliente sin usuario (clickeable para enviar invitación)
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleInviteUser(client)}
                                className="p-2 rounded-xl border transition-all"
                                style={{
                                  backgroundColor: themeColors.primary + "20",
                                  borderColor: themeColors.primary + "40",
                                  cursor: "pointer"
                                }}
                                title="Enviar invitación a la plataforma"
                              >
                                <User 
                                  className="w-6 h-6"
                                  style={{ color: themeColors.primary }}
                                />
                              </motion.button>
                            )}
                          </motion.div>
                        </div>
                      </td>
                      {/* Acciones */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleViewClient(client.clientId || client._id)}
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
                            onClick={() => handleEditClient(client.clientId || client._id)}
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
                  {clients.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
                </span>{" "}
                a{" "}
                <span 
                  className="font-semibold"
                  style={{ color: themeColors.primary }}
                >
                  {Math.min(currentPage * itemsPerPage, totalClients)}
                </span>{" "}
                de{" "}
                <span 
                  className="font-semibold"
                  style={{ color: themeColors.primary }}
                >
                  {totalClients}
                </span>{" "}
                clientes
              </div>

              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05, x: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
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
                        onClick={() => handlePageChange(pageNum)}
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
                    handlePageChange(Math.min(totalPages, currentPage + 1))
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

        {/* Modal de Confirmación - Cambio de Estado */}
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
                      clientId: "",
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

        {/* Modal de Confirmación - Invitación a la Plataforma */}
        {showInviteDialog.show && (
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
                    backgroundColor: themeColors.primary + "20"
                  }}
                >
                  <Mail 
                    className="w-6 h-6"
                    style={{ color: themeColors.primary }}
                  />
                </div>
                <div>
                  <h3 
                    className="text-lg font-semibold"
                    style={{ color: themeColors.text.primary }}
                  >
                    Enviar Invitación
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: themeColors.text.secondary }}
                  >
                    El cliente recibirá un email de invitación
                  </p>
                </div>
              </div>

              <div 
                className="mb-6 space-y-2 p-4 rounded-lg"
                style={{
                  backgroundColor: themeColors.surface + "30",
                }}
              >
                <p 
                  className="text-sm"
                  style={{ color: themeColors.text.secondary }}
                >
                  <span className="font-semibold" style={{ color: themeColors.text.primary }}>Cliente:</span>{" "}
                  {showInviteDialog.firstName} {showInviteDialog.lastName}
                </p>
                <p 
                  className="text-sm"
                  style={{ color: themeColors.text.secondary }}
                >
                  <span className="font-semibold" style={{ color: themeColors.text.primary }}>Email:</span>{" "}
                  {showInviteDialog.email}
                </p>
              </div>

              <p 
                className="mb-6 text-sm"
                style={{ color: themeColors.text.secondary }}
              >
                ¿Estás seguro que deseas enviar una invitación a la plataforma a este cliente?
              </p>

              <div className="flex gap-3 justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    setShowInviteDialog({
                      show: false,
                      clientId: "",
                      email: "",
                      firstName: "",
                      lastName: "",
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
                  onClick={confirmInvitation}
                  disabled={isSendingInvitation}
                  className="px-4 py-2 text-white rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: `linear-gradient(45deg, ${themeColors.primary}, ${themeColors.secondary})`
                  }}
                >
                  {isSendingInvitation ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Enviar Invitación
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Diálogo de Confirmación - Invitaciones Masivas */}
        {showBulkInviteDialog && (
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
                    backgroundColor: themeColors.primary + "20"
                  }}
                >
                  <Mail 
                    className="w-6 h-6"
                    style={{ color: themeColors.primary }}
                  />
                </div>
                <div>
                  <h3 
                    className="text-lg font-semibold"
                    style={{ color: themeColors.text.primary }}
                  >
                    Enviar Invitaciones
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: themeColors.text.secondary }}
                  >
                    {selectedClients.length > 0 
                      ? `${selectedClients.length} cliente(s) seleccionado(s)`
                      : "Todos los clientes"}
                  </p>
                </div>
              </div>

              <div 
                className="mb-6 p-4 rounded-lg"
                style={{
                  backgroundColor: themeColors.surface + "30",
                }}
              >
                <p 
                  className="text-sm mb-2"
                  style={{ color: themeColors.text.secondary }}
                >
                  {selectedClients.length > 0 ? (
                    <>
                      Se enviará una invitación por email a los <span className="font-semibold" style={{ color: themeColors.text.primary }}>{selectedClients.length} clientes seleccionados</span> que no tengan usuario aún.
                    </>
                  ) : (
                    <>
                      Se enviará una invitación por email a <span className="font-semibold" style={{ color: themeColors.text.primary }}>todos los clientes</span> que no tengan usuario aún.
                    </>
                  )}
                </p>
                <p 
                  className="text-xs mt-2"
                  style={{ color: themeColors.text.secondary }}
                >
                  ℹ️ Solo se enviarán invitaciones a clientes sin usuario registrado
                </p>
              </div>

              <p 
                className="mb-6 text-sm"
                style={{ color: themeColors.text.secondary }}
              >
                ¿Estás seguro que deseas enviar estas invitaciones?
              </p>

              <div className="flex gap-3 justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowBulkInviteDialog(false)}
                  disabled={isSendingBulkInvitations}
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
                  onClick={confirmBulkInvitations}
                  disabled={isSendingBulkInvitations}
                  className="px-4 py-2 text-white rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: `linear-gradient(45deg, ${themeColors.primary}, ${themeColors.secondary})`
                  }}
                >
                  {isSendingBulkInvitations ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Enviar Invitaciones
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Modal de Importación */}
        <ClientImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            // Recargar la lista de clientes después de importar
            loadClients();
          }}
        />
      </div>
    </AdminLayout>
  );
}
