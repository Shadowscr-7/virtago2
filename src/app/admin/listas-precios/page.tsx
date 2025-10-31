"use client"

import { useState, useEffect, useCallback } from "react"
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
  DollarSign,
  Calendar,
  ChevronLeft, 
  ChevronRight,
  Check,
  Loader2,
  AlertTriangle
} from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { StyledSelect } from "@/components/ui/styled-select"
import { useTheme } from "@/contexts/theme-context"
import { useAuthStore } from "@/store/auth"
import { api, PriceList } from "@/api"
import { showToast } from "@/store/toast-helpers"

export default function ListasPreciosAdminPage() {
  const router = useRouter()
  const { themeColors } = useTheme()
  const { user } = useAuthStore()
  
  // Estados para datos de la API
  const [priceLists, setPriceLists] = useState<PriceList[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalPriceLists, setTotalPriceLists] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  
  // Estados para UI
  const [selectedLists, setSelectedLists] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currencyFilter, setCurrencyFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  // Estados para modal de confirmación
  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    show: boolean;
    priceListId: string;
    currentStatus: string;
    newStatus: 'active' | 'inactive';
  }>({
    show: false,
    priceListId: "",
    currentStatus: "",
    newStatus: "active"
  })
  
  // Verificar acceso
  const hasAccess = user && (
    user.role === "distributor" || 
    user.role === "admin" || 
    user.userType === "distributor"
  )
  
  // Función para cargar listas de precios desde la API
  const loadPriceLists = useCallback(async () => {
    console.log('[LISTAS_PRECIOS] 🔄 Ejecutando loadPriceLists...');
    
    const distributorCode = user?.distributorInfo?.distributorCode || 'Dist01';
    
    if (!user) {
      console.warn('[LISTAS_PRECIOS] ❌ No hay usuario logueado');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log('[LISTAS_PRECIOS] Cargando listas de precios...', {
        distributorCode: distributorCode,
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery
      });

      const response = await api.admin.priceLists.getAll({
        distributorCode: distributorCode,
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined
      });

      console.log('[LISTAS_PRECIOS] Respuesta de la API:', response);

      if (response.success && response.data) {
        // El API puede devolver directamente un array o un objeto con propiedades
        let priceListsArray: PriceList[] = [];
        let total = 0;
        
        // Si response.data es un array directamente
        if (Array.isArray(response.data)) {
          console.log('[LISTAS_PRECIOS] 📋 API devolvió array directo');
          priceListsArray = response.data;
          total = priceListsArray.length;
        } else {
          // Si viene en un objeto con estructura
          const apiData = response.data as unknown as {
            data?: PriceList[];
            total?: number;
            currentPage?: number;
            rowsPerPage?: number;
          };
          
          console.log('[LISTAS_PRECIOS] 📦 API devolvió objeto estructurado');
          priceListsArray = apiData.data || [];
          total = apiData.total || priceListsArray.length;
        }
        
        setPriceLists(priceListsArray);
        setTotalPriceLists(total);
        setTotalPages(Math.ceil(total / itemsPerPage));
        console.log(`[LISTAS_PRECIOS] ✅ ${priceListsArray.length} listas de precios cargadas de ${total} totales`);
      } else {
        console.error('[LISTAS_PRECIOS] Respuesta no exitosa:', response);
        setPriceLists([]);
        setTotalPriceLists(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('[LISTAS_PRECIOS] Error cargando listas de precios:', error);
      setPriceLists([]);
      setTotalPriceLists(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [user, currentPage, itemsPerPage, searchQuery]);

  // Cargar listas de precios al montar y cuando cambien los parámetros
  useEffect(() => {
    if (hasAccess) {
      loadPriceLists();
    }
  }, [hasAccess, loadPriceLists]);

  // Debounce para el input de búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // Verificar acceso primero
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

  // Los datos ya vienen paginados del servidor, así que usamos directamente priceLists
  const currentLists = priceLists

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
        : currentLists.map(list => list.listPriceId)
    )
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownloadTemplate = () => {
    console.log("[LISTAS_PRECIOS] 📥 Descargando template...");
    showToast({
      title: "Próximamente",
      description: "La exportación de listas de precios estará disponible pronto",
      type: "info"
    });
  };

  const handleImport = () => {
    console.log("[LISTAS_PRECIOS] 📂 Importando...");
    showToast({
      title: "Próximamente",
      description: "La importación de listas de precios estará disponible pronto",
      type: "info"
    });
  };

  // Función para abrir modal de confirmación
  const handleToggleStatus = (priceListId: string, currentStatus: string) => {
    const newStatus = currentStatus.toLowerCase() === 'active' ? 'inactive' : 'active';
    setShowConfirmDialog({
      show: true,
      priceListId,
      currentStatus,
      newStatus
    });
  };

  // Función para confirmar cambio de estado
  const confirmStatusChange = async () => {
    const { priceListId, newStatus } = showConfirmDialog;
    
    try {
      console.log(`[LISTAS_PRECIOS] Cambiando estado de ${priceListId} a ${newStatus}`);
      
      const response = await api.admin.priceLists.updateStatus(priceListId, newStatus);
      
      if (response.success) {
        showToast({
          title: "Estado actualizado",
          description: `La lista de precios ahora está ${newStatus === 'active' ? 'activa' : 'inactiva'}`,
          type: "success"
        });
        
        // Actualizar la lista local
        setPriceLists(prev => 
          prev.map(list => 
            list.listPriceId === priceListId 
              ? { ...list, status: newStatus }
              : list
          )
        );
      } else {
        throw new Error(response.message || 'Error al actualizar estado');
      }
    } catch (error) {
      console.error('[LISTAS_PRECIOS] Error al cambiar estado:', error);
      showToast({
        title: "Error",
        description: "No se pudo actualizar el estado de la lista de precios",
        type: "error"
      });
    } finally {
      setShowConfirmDialog({
        show: false,
        priceListId: "",
        currentStatus: "",
        newStatus: "active"
      });
    }
  };

  // Función para cancelar cambio de estado
  const cancelStatusChange = () => {
    setShowConfirmDialog({
      show: false,
      priceListId: "",
      currentStatus: "",
      newStatus: "active"
    });
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'retail':
      case 'minorista':
        return { backgroundColor: `${themeColors.accent}20`, color: themeColors.accent }
      case 'wholesale':
      case 'mayorista':
        return { backgroundColor: `${themeColors.secondary}20`, color: themeColors.secondary }
      case 'corporate':
      case 'corporativo':
        return { backgroundColor: `${themeColors.primary}30`, color: themeColors.primary }
      case 'all':
      case 'general':
        return { backgroundColor: `${themeColors.primary}20`, color: themeColors.primary }
      default:
        return { backgroundColor: 'rgba(156, 163, 175, 0.2)', color: '#6b7280' }
    }
  }

  const formatCustomerType = (type: string) => {
    const types: Record<string, string> = {
      'retail': 'Minorista',
      'wholesale': 'Mayorista',
      'corporate': 'Corporativo',
      'all': 'General',
    };
    return types[type] || type;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString || dateString === "Invalid Date") return "Sin fecha"
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
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
            <h1 
              className="text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`
              }}
            >
              Gestión de Listas de Precios
            </h1>
            <p style={{ color: themeColors.text.secondary }}>
              Administra y gestiona tus listas de precios
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
              placeholder="Buscar por nombre, moneda o tipo de cliente..."
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

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3 lg:flex-[2]">
            <div className="flex-1 min-w-[180px]">
              <StyledSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: "all", label: "Todos los estados" },
                  { value: "ACTIVO", label: "Activo" },
                  { value: "INACTIVO", label: "Inactivo" },
                  { value: "PROGRAMADO", label: "Programado" }
                ]}
              />
            </div>

            <div className="flex-1 min-w-[180px]">
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
          </div>

          {/* Items por página */}
          <div className="w-full lg:w-48">
            <StyledSelect
              value={itemsPerPage.toString()}
              onChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
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
              onClick={() => router.push('/admin/listas-precios/nueva')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl transition-all backdrop-blur-sm border font-medium text-white"
              style={{
                background: `linear-gradient(45deg, ${themeColors.primary}, ${themeColors.secondary})`,
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
              <span className="hidden sm:inline">Exportar</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleImport}
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

        {/* Tabla de listas de precios */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="backdrop-blur-xl rounded-2xl border shadow-lg overflow-hidden"
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
                  backgroundColor: themeColors.surface + "80",
                  borderColor: themeColors.primary + "20"
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
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>
                    Moneda
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>
                    Fecha Inicio
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>
                    Fecha Fin
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: themeColors.text.secondary }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
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
                          Cargando listas de precios...
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Empty state */}
                {!isLoading && currentLists.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <DollarSign 
                          className="w-12 h-12" 
                          style={{ color: themeColors.text.secondary + "50" }} 
                        />
                        <p style={{ color: themeColors.text.secondary }}>
                          {searchQuery ? 
                            `No se encontraron listas de precios con "${searchQuery}"` : 
                            'No hay listas de precios registradas aún'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Lista de precios */}
                {!isLoading && currentLists.map((list, index) => {
                  const initials = list.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                  
                  return (
                  <motion.tr
                    key={list.listPriceId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-opacity-10 transition-all duration-300 backdrop-blur-sm"
                    style={{
                      background: 'transparent'
                    }}
                    whileHover={{
                      background: `linear-gradient(to right, ${themeColors.primary}10, ${themeColors.secondary}10)`
                    }}
                  >
                    <td className="px-6 py-5">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedLists.includes(list.listPriceId)}
                          onChange={() => handleSelectList(list.listPriceId)}
                          className="sr-only peer"
                        />
                        <div 
                          className="relative w-5 h-5 border-2 rounded-md transition-all duration-200"
                          style={{
                            backgroundColor: selectedLists.includes(list.listPriceId)
                              ? themeColors.primary
                              : themeColors.surface + "50",
                            borderColor: selectedLists.includes(list.listPriceId)
                              ? themeColors.primary
                              : themeColors.primary + "60"
                          }}
                        >
                          <Check 
                            className="absolute inset-0 w-3 h-3 m-auto text-white transition-opacity duration-200" 
                            style={{ 
                              opacity: selectedLists.includes(list.listPriceId) ? 1 : 0 
                            }}
                          />
                        </div>
                      </label>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg"
                          style={{
                            backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`
                          }}
                        >
                          {initials}
                        </div>
                        <div>
                          <Link 
                            href={`/admin/listas-precios/${list.listPriceId}`}
                            className="font-semibold text-sm transition-colors duration-200 hover:underline cursor-pointer"
                            style={{
                              color: themeColors.text.primary
                            }}
                          >
                            <span 
                              className="hover:text-current"
                              style={{
                                '--hover-color': themeColors.primary
                              } as React.CSSProperties}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = themeColors.primary
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = ''
                              }}
                            >
                              {list.name}
                            </span>
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span 
                              className="text-xs px-2 py-1 rounded-full font-medium"
                              style={getTypeColor(list.customer_type)}
                            >
                              {formatCustomerType(list.customer_type)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-medium" style={{ color: themeColors.text.primary }}>
                          {list.currency}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" style={{ color: themeColors.text.secondary }} />
                        <span className="text-sm" style={{ color: themeColors.text.primary }}>
                          {formatDate(list.start_date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" style={{ color: themeColors.text.secondary }} />
                        <span className="text-sm" style={{ color: themeColors.text.primary }}>
                          {formatDate(list.end_date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleToggleStatus(list.listPriceId, list.status)}
                        className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold transition-all backdrop-blur-sm border"
                        style={{
                          backgroundColor: list.status === 'active' 
                            ? themeColors.accent + "20" 
                            : list.status === 'inactive'
                            ? themeColors.primary + "20"
                            : themeColors.secondary + "20",
                          color: themeColors.text.primary,
                          borderColor: list.status === 'active' 
                            ? themeColors.accent + "40" 
                            : list.status === 'inactive'
                            ? themeColors.primary + "40"
                            : themeColors.secondary + "40"
                        }}
                      >
                        {list.status === 'active' ? 'Activo' : list.status === 'inactive' ? 'Inactivo' : 'Borrador'}
                      </motion.button>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1, y: -2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => router.push(`/admin/listas-precios/${list.listPriceId}`)}
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
                          onClick={() => router.push(`/admin/listas-precios/${list.listPriceId}/editar`)}
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
                  {priceLists.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
                </span>{" "}
                a{" "}
                <span 
                  className="font-semibold"
                  style={{ color: themeColors.primary }}
                >
                  {Math.min(currentPage * itemsPerPage, totalPriceLists)}
                </span>{" "}
                de{" "}
                <span 
                  className="font-semibold"
                  style={{ color: themeColors.primary }}
                >
                  {totalPriceLists}
                </span>{" "}
                listas de precios
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
                ¿Estás seguro que deseas {showConfirmDialog.newStatus === 'active' ? 'activar' : 'desactivar'} esta lista de precios?
              </p>

              <div className="flex gap-3 justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={cancelStatusChange}
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
  )
}
