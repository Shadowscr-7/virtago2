"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Plus, 
  Edit, 
  Eye,
  Package, 
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  AlertTriangle
} from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useAuthStore } from "@/store/auth";
import { useTheme } from "@/contexts/theme-context";
import { StyledSelect } from "@/components/ui/styled-select";
import { api, ApiProductData } from "@/api";
import { showToast } from "@/store/toast-helpers";

export default function ProductsAdminPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { themeColors } = useTheme();
  
  // Estados para datos de la API
  const [products, setProducts] = useState<ApiProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Estados para UI
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  console.log('[PRODUCTOS PAGE] 🔍 Usuario completo:', JSON.stringify(user, null, 2));

  // ✅ Verificar acceso (distributor o admin)
  const hasAccess = user && (
    user.role === "distributor" || 
    user.role === "admin" || 
    user.userType === "distributor"
  );

  console.log('[PRODUCTOS PAGE] hasAccess:', hasAccess);

  // 🔄 Función para cargar productos desde la API
  const loadProducts = useCallback(async () => {
    console.log('[PRODUCTOS] 🔄 Ejecutando loadProducts...');
    console.log('[PRODUCTOS] 🔍 user:', user);
    
    const distributorCode = user?.distributorInfo?.distributorCode || 'Dist01';
    
    if (!user) {
      console.warn('[PRODUCTOS] ❌ No hay usuario logueado');
      setIsLoading(false);
      return;
    }
    
    console.log('[PRODUCTOS] ⚠️ Usando distributorCode:', distributorCode);

    setIsLoading(true);
    try {
      console.log('[PRODUCTOS] Cargando productos...', {
        distributorCode: distributorCode,
        page: currentPage,
        rowsPerPage: itemsPerPage,
        search: searchQuery
      });

      const response = await api.admin.products.getAll({
        distributorCode: distributorCode,
        page: currentPage,
        rowsPerPage: itemsPerPage,
        search: searchQuery || undefined,
        category: categoryFilter || undefined,
        status: statusFilter || undefined
      });

      console.log('[PRODUCTOS] Respuesta de la API:', response);

      if (response.success && response.data) {
        const productsArray: ApiProductData[] = Array.isArray(response.data) 
          ? response.data 
          : (response.data as { data?: ApiProductData[] }).data || [];
        
        const total = (response.data as { total?: number }).total || productsArray.length;
        const pages = (response.data as { totalPages?: number }).totalPages || Math.ceil(total / itemsPerPage);
        
        console.log('[PRODUCTOS] 🔍 Productos extraídos:', productsArray.length);
        
        setProducts(productsArray);
        setTotalProducts(total);
        setTotalPages(pages);
        
        console.log('[PRODUCTOS] ✅', productsArray.length, 'productos cargados de', total, 'totales');
        
        showToast({
          title: "Productos cargados correctamente",
          type: "success"
        });
      } else {
        console.error('[PRODUCTOS] ❌ Error en la respuesta:', response);
        setProducts([]);
        showToast({
          title: "Error al cargar productos",
          description: response.message || "No se pudieron cargar los productos",
          type: "error"
        });
      }
    } catch (error) {
      console.error('[PRODUCTOS] ❌ Error al cargar productos:', error);
      setProducts([]);
      showToast({
        title: "Error al cargar productos",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        type: "error"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, currentPage, itemsPerPage, searchQuery, categoryFilter, statusFilter]);

  // 🔄 Cargar productos al montar y cuando cambien los parámetros
  useEffect(() => {
    if (hasAccess) {
      loadProducts();
    }
  }, [hasAccess, loadProducts]);

  // 🔄 Debounce para el input de búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const getStatusInfo = (status?: string) => {
    switch (status) {
      case "A": return { label: "Activo", color: "#10b981", bgColor: "rgba(16, 185, 129, 0.1)" };
      case "I": return { label: "Inactivo", color: "#ef4444", bgColor: "rgba(239, 68, 68, 0.1)" };
      case "N": return { label: "Nuevo", color: "#3b82f6", bgColor: "rgba(59, 130, 246, 0.1)" };
      default: return { label: "Desconocido", color: "#6b7280", bgColor: "rgba(107, 114, 128, 0.1)" };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-UY", { style: "currency", currency: "UYU" }).format(amount);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Mostrar loading mientras se carga el usuario
  if (!user) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  // Validar acceso después de que el usuario esté cargado
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
              Administra tu catálogo de productos
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
              placeholder="Buscar productos por nombre, SKU, marca..."
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
          <div className="w-full lg:w-48">
            <StyledSelect
              value={categoryFilter}
              onChange={(value) => {
                setCategoryFilter(value);
                setCurrentPage(1);
              }}
              options={[
                { value: "", label: "Todas las categorías" },
                { value: "Electrónicos", label: "Electrónicos" },
                { value: "Computadoras", label: "Computadoras" },
              ]}
            />
          </div>

          <div className="w-full lg:w-48">
            <StyledSelect
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
              options={[
                { value: "", label: "Todos los estados" },
                { value: "A", label: "Activos" },
                { value: "I", label: "Inactivos" },
                { value: "N", label: "Nuevos" },
              ]}
            />
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
        </motion.div>

        {/* Botones de Acción */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/admin/productos/nuevo')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl transition-all backdrop-blur-sm border font-medium text-white"
            style={{
              background: `linear-gradient(45deg, ${themeColors.primary}, ${themeColors.secondary})`,
              borderColor: themeColors.primary + "40"
            }}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Crear Producto</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
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
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div 
                className="animate-spin rounded-full h-12 w-12 border-b-2"
                style={{ borderColor: themeColors.primary }}
              ></div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: themeColors.primary + "20" }}
              >
                <Package 
                  className="w-8 h-8" 
                  style={{ color: themeColors.primary }}
                />
              </div>
              <p 
                className="text-lg font-medium"
                style={{ color: themeColors.text.secondary }}
              >
                No se encontraron productos
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead 
                    className="border-b"
                    style={{
                      backgroundColor: themeColors.surface,
                      borderColor: themeColors.primary + "20"
                    }}
                  >
                    <tr>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: themeColors.text.secondary }}
                      >
                        Producto
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: themeColors.text.secondary }}
                      >
                        SKU
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: themeColors.text.secondary }}
                      >
                        Categoría
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: themeColors.text.secondary }}
                      >
                        Precio
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: themeColors.text.secondary }}
                      >
                        Stock
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: themeColors.text.secondary }}
                      >
                        Estado
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: themeColors.text.secondary }}
                      >
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: themeColors.primary + "10" }}>
                  {products.map((product, index) => {
                    const statusInfo = getStatusInfo(product.status);
                    const productColor = [themeColors.primary, themeColors.secondary, themeColors.accent][index % 3];
                    
                    return (
                      <motion.tr 
                        key={product.prodVirtaId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="transition-colors cursor-pointer"
                        style={{
                          backgroundColor: themeColors.surface + "40",
                        }}
                        whileHover={{
                          backgroundColor: themeColors.primary + "10",
                        }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-lg"
                              style={{
                                background: `linear-gradient(135deg, ${productColor}, ${productColor}dd)`
                              }}
                            >
                              <Package className="w-6 h-6" />
                            </div>
                            <div>
                              <div 
                                className="font-semibold"
                                style={{ color: themeColors.text.primary }}
                              >
                                {product.name}
                              </div>
                              <div 
                                className="text-sm"
                                style={{ color: themeColors.text.secondary }}
                              >
                                {product.brand}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <code 
                            className="text-sm font-mono px-3 py-1.5 rounded-lg"
                            style={{
                              backgroundColor: themeColors.surface,
                              color: themeColors.text.primary,
                              border: `1px solid ${themeColors.primary}30`
                            }}
                          >
                            {product.sku}
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          <span 
                            className="text-sm font-medium"
                            style={{ color: themeColors.text.secondary }}
                          >
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span 
                            className="font-bold text-lg"
                            style={{ color: themeColors.primary }}
                          >
                            {formatCurrency(product.price)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span 
                            className="font-semibold text-lg"
                            style={{ color: themeColors.text.primary }}
                          >
                            {product.stockQuantity}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                            style={{ backgroundColor: statusInfo.bgColor, color: statusInfo.color }}
                          >
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => router.push(`/admin/productos/${product.prodVirtaId}`)}
                              className="p-2 rounded-lg transition-all"
                              style={{
                                backgroundColor: themeColors.primary + "20",
                                color: themeColors.primary
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => router.push(`/admin/productos/${product.prodVirtaId}?mode=edit`)}
                              className="p-2 rounded-lg transition-all"
                              style={{
                                backgroundColor: themeColors.accent + "20",
                                color: themeColors.accent
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
                className="px-6 py-4 border-t flex items-center justify-between"
                style={{
                  backgroundColor: themeColors.surface,
                  borderColor: themeColors.primary + "20"
                }}
              >
                <div 
                  className="text-sm"
                  style={{ color: themeColors.text.secondary }}
                >
                  Mostrando <span className="font-semibold" style={{ color: themeColors.text.primary }}>
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span> a <span className="font-semibold" style={{ color: themeColors.text.primary }}>
                    {Math.min(currentPage * itemsPerPage, totalProducts)}
                  </span> de <span className="font-semibold" style={{ color: themeColors.text.primary }}>
                    {totalProducts}
                  </span> productos
                </div>
                
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: currentPage === 1 ? themeColors.surface : themeColors.primary + "20",
                      color: currentPage === 1 ? themeColors.text.secondary : themeColors.primary,
                      border: `1px solid ${themeColors.primary}30`
                    }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </motion.button>
                  
                  <span 
                    className="px-4 py-2 rounded-lg font-medium"
                    style={{
                      backgroundColor: themeColors.primary + "10",
                      color: themeColors.text.primary
                    }}
                  >
                    Página {currentPage} de {totalPages}
                  </span>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: currentPage === totalPages ? themeColors.surface : themeColors.primary + "20",
                      color: currentPage === totalPages ? themeColors.text.secondary : themeColors.primary,
                      border: `1px solid ${themeColors.primary}30`
                    }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
}
