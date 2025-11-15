/**
 * Modal para asignar manualmente imágenes a productos
 * Permite seleccionar un producto del distribuidor y asignar múltiples imágenes
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Package, Loader2, CheckCircle, Image as ImageIcon } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { toast } from "sonner";
import { api, ApiProductData } from "@/api";
import { useAuthStore } from "@/store/auth";

interface ManualAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedImages: Array<{
    url: string;
    filename: string;
  }>;
  onAssignComplete?: () => void;
}

export function ManualAssignModal({
  isOpen,
  onClose,
  selectedImages,
  onAssignComplete,
}: ManualAssignModalProps) {
  const { themeColors } = useTheme();
  const { user } = useAuthStore();
  const [products, setProducts] = useState<ApiProductData[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ApiProductData | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  // Cargar productos del distribuidor
  useEffect(() => {
    if (isOpen && user) {
      loadProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user]);

  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const distributorCode = user?.distributorInfo?.distributorCode || "Dist01";

      const response = await api.admin.products.getAll({
        distributorCode,
        page: 1,
        rowsPerPage: 1000, // Cargar todos los productos
        search: searchQuery || undefined,
      });

      if (response.success && response.data) {
        const productsArray: ApiProductData[] = Array.isArray(response.data)
          ? response.data
          : (response.data as { data?: ApiProductData[] }).data || [];

        setProducts(productsArray);
      } else {
        toast.error("No se pudieron cargar los productos");
      }
    } catch (error) {
      console.error("Error cargando productos:", error);
      toast.error("Error al cargar los productos");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Filtrar productos según búsqueda
  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase();
    return (
      product.name?.toLowerCase().includes(query) ||
      product.sku?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query)
    );
  });

  // Asignar imágenes al producto seleccionado
  const handleAssign = async () => {
    if (!selectedProduct) {
      toast.error("Debes seleccionar un producto");
      return;
    }

    setIsAssigning(true);

    try {
      const token = localStorage.getItem("auth_token") || localStorage.getItem("jwt_token");
      let successCount = 0;
      let errorCount = 0;

      for (const image of selectedImages) {
        try {
          const response = await fetch("/api/product-images/assign", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify({
              imageUrl: image.url,
              prodVirtaId: selectedProduct.prodVirtaId,
              metadata: {
                filename: image.filename,
                manualAssignment: true,
              },
            }),
          });

          if (!response.ok) {
            throw new Error(`Error ${response.status}`);
          }

          const data = await response.json();

          if (data.success) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error(`Error asignando ${image.filename}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} imagen(es) asignada(s) exitosamente`);
      }

      if (errorCount > 0) {
        toast.error(`${errorCount} imagen(es) con error al asignar`);
      }

      if (successCount === selectedImages.length) {
        // Cerrar modal si todas fueron exitosas
        if (onAssignComplete) {
          onAssignComplete();
        }
        handleClose();
      }
    } catch (error) {
      console.error("Error en asignación:", error);
      toast.error("Error al asignar imágenes");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleClose = () => {
    if (isAssigning) {
      toast.error("Espera a que termine la asignación");
      return;
    }
    setSelectedProduct(null);
    setSearchQuery("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${themeColors.surface}f0, ${themeColors.surface}e0)`,
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-6 border-b border-white/10"
            style={{
              background: `linear-gradient(to right, ${themeColors.primary}20, ${themeColors.secondary}20)`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg"
                style={{
                  background: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
                }}
              >
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Asignar Imágenes
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {selectedImages.length} imagen(es) seleccionada(s)
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              disabled={isAssigning}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Imágenes seleccionadas */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Imágenes a asignar:
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                  >
                    <ImageIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
                      {img.filename}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Búsqueda de producto */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Seleccionar Producto
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, código o categoría..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Lista de productos */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {isLoadingProducts ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No se encontraron productos
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <motion.button
                    key={product.prodVirtaId}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedProduct(product)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      selectedProduct?.prodVirtaId === product.prodVirtaId
                        ? "border-green-500 bg-green-500/10"
                        : "border-white/10 hover:border-white/30 bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {product.name}
                          </h4>
                          {selectedProduct?.prodVirtaId === product.prodVirtaId && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                        <div className="flex gap-3 text-xs text-gray-600 dark:text-gray-400">
                          <span>SKU: {product.sku}</span>
                          {product.category && <span>• {product.category}</span>}
                          {product.price && (
                            <span>• ${product.price.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 flex justify-between items-center gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {selectedProduct ? (
                <span className="text-green-500 font-medium">
                  ✓ Producto seleccionado: {selectedProduct.name}
                </span>
              ) : (
                "Selecciona un producto para continuar"
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={isAssigning}
                className="px-6 py-2 rounded-lg font-medium transition-all bg-white/10 hover:bg-white/20 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedProduct || isAssigning}
                className="px-6 py-2 text-white rounded-lg font-medium transition-all shadow-lg disabled:opacity-50 bg-green-600 hover:bg-green-700"
              >
                {isAssigning ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Asignando...
                  </span>
                ) : (
                  `Asignar ${selectedImages.length} Imagen(es)`
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
