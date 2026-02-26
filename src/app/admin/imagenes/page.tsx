"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, RefreshCw, Upload, Loader2, ChevronLeft, ChevronRight, Grid3x3, List } from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { StyledSelect } from "@/components/ui/styled-select";
import { ImageGallery } from "@/components/images/admin/image-gallery";
import { AutoAssignModal } from "@/components/images/admin/auto-assign-modal";
import { ManualAssignModal } from "@/components/images/admin/manual-assign-modal";
import { BulkActionsBar } from "@/components/images/admin/bulk-actions-bar";
import { ImageUploadModal } from "@/components/images/admin/image-upload-modal";
import { useTheme } from "@/contexts/theme-context";
import { toast } from "sonner";

// Tipos para imágenes del backend
interface ProductData {
  id: string;
  prodVirtaId: string;
  productId: string;
  name: string;
  brandId: string;
  categoryId: string;
  price: number;
  productSlug: string;
  productImages: string[];
}

interface AIAnalysis {
  detectedProduct?: string;
  detectedBrand?: string;
  detectedCategory?: string;
  detectedSubcategory?: string;
  keywords?: string[];
  confidence?: number;
  matchScore?: number;
  matchedWith?: string;
  assignedManually?: boolean;
}

interface ImageMetadata {
  filename: string;
  size: number;
  format: string;
}

interface BackendImageData {
  imageId: string;
  url: string;
  isCover: boolean;
  altText?: string;
  prodVirtaId?: string;
  productId?: string;
  aiAnalysis?: AIAnalysis;
  metadata?: ImageMetadata;
  createdAt: string;
  updatedAt: string;
  product?: ProductData;
}

// Tipo adaptado para el componente
interface ImageData {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  format: string;
  url: string;
  thumbnailUrl: string;
  uploadedAt: string;
  assignedTo?: {
    productId: string;
    productName: string;
    productSku: string;
  };
  status: "UPLOADED" | "ASSIGNED" | "PROCESSING" | "ERROR";
  tags: string[];
  aiSuggestions?: {
    productMatches: Array<{
      productId: string;
      productName: string;
      productSku: string;
      confidence: number;
    }>;
  };
}

export default function ImagenesAdminPage() {
  const { themeColors } = useTheme();
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 🎯 Por defecto: todos
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAutoAssignModalOpen, setIsAutoAssignModalOpen] = useState(false);
  const [isManualAssignModalOpen, setIsManualAssignModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalImages, setTotalImages] = useState(0);

  // Función para cargar imágenes del backend
  const loadImages = async (page = 1) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('jwt_token');
      
      if (!token) {
        toast.error("No autenticado");
        return;
      }

      const url = new URL('/api/product-images/my-distributor', window.location.origin);
      url.searchParams.set('page', page.toString());
      url.searchParams.set('limit', '20');
      
      // 🎯 Filtro de asignación de imágenes a productos
      url.searchParams.set('assignmentFilter', statusFilter); // 'all', 'assigned', 'unassigned'
      
      if (searchQuery) {
        url.searchParams.set('search', searchQuery);
      }

      console.log('🔍 URL completa:', url.toString());
      console.log('🔍 statusFilter:', statusFilter);

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar imágenes');
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Transformar datos del backend al formato del componente
        const transformedImages: ImageData[] = result.data.map((img: BackendImageData) => {
          const filename = img.metadata?.filename || img.url.split('/').pop() || img.imageId;
          const format = (img.metadata?.format || filename).split('.').pop()?.replace('image/', '').toUpperCase() || 'JPEG';
          
          return {
            id: img.imageId,
            filename,
            originalName: img.altText || filename,
            size: img.metadata?.size || 0,
            format,
            url: img.url,
            thumbnailUrl: img.url, // Cloudinary puede generar thumbnails con transformaciones
            uploadedAt: img.createdAt,
            assignedTo: img.product ? {
              productId: img.product.prodVirtaId,
              productName: img.product.name, // ← Correcto según backend
              productSku: img.product.prodVirtaId,
            } : undefined,
            status: img.product ? "ASSIGNED" : "UPLOADED",
            tags: Array.from(new Set([ // ← Eliminar duplicados con Set
              img.aiAnalysis?.detectedBrand,
              img.product?.brandId, // ← Correcto según backend
              img.aiAnalysis?.detectedCategory,
            ].filter(Boolean))),
            aiSuggestions: img.aiAnalysis ? {
              productMatches: [{
                productId: img.prodVirtaId || '',
                productName: img.aiAnalysis.detectedProduct || '', // ← Correcto según backend
                productSku: img.prodVirtaId || '',
                confidence: (img.aiAnalysis.confidence || 0) * 100,
              }]
            } : undefined,
          };
        });

        setImages(transformedImages);
        setTotalImages(result.pagination?.total || transformedImages.length);
        setTotalPages(result.pagination?.totalPages || 1);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error cargando imágenes:', error);
      toast.error('Error al cargar las imágenes');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar imágenes al montar y cuando cambien los filtros
  useEffect(() => {
    loadImages(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // Filtrar imágenes (ahora solo filtra localmente lo que ya se cargó)
  const filteredImages = images.filter((image) => {
    const matchesSearch =
      searchQuery === "" ||
      image.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      ) ||
      (image.assignedTo?.productName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ??
        false);

    return matchesSearch;
  });

  // Estadísticas
  const stats = {
    total: totalImages || images.length,
    assigned: images.filter((img) => img.status === "ASSIGNED").length,
    unassigned: images.filter((img) => img.status === "UPLOADED").length,
    processing: images.filter((img) => img.status === "PROCESSING").length,
    errors: images.filter((img) => img.status === "ERROR").length,
    totalSize: images.reduce((acc, img) => acc + img.size, 0),
  };

  const handleImageSelect = (imageId: string) => {
    setSelectedImages((prev) =>
      prev.includes(imageId)
        ? prev.filter((id) => id !== imageId)
        : [...prev, imageId],
    );
  };

  const handleSelectAll = () => {
    setSelectedImages(
      selectedImages.length === filteredImages.length
        ? []
        : filteredImages.map((img) => img.id),
    );
  };

  // Eliminar imágenes seleccionadas
  const handleDeleteImages = async () => {
    if (selectedImages.length === 0) return;

    if (!confirm(`¿Estás seguro de eliminar ${selectedImages.length} imagen(es)?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('jwt_token');
      
      const response = await fetch('/api/product-images/batch-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          imageIds: selectedImages,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al eliminar imágenes');
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success(`${data.deleted || selectedImages.length} imagen(es) eliminadas`);
        setSelectedImages([]);
        loadImages(currentPage);
      }
    } catch (error) {
      console.error('Error eliminando imágenes:', error);
      toast.error('Error al eliminar las imágenes');
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 
                className="text-3xl font-bold bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`
                }}
              >
                Gestión de Imágenes
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Administra y asigna imágenes a tus productos de forma
                inteligente
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsAutoAssignModalOpen(true)}
                className="px-4 py-2 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg"
                style={{
                  backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`
                }}
              >
                <RefreshCw className="w-4 h-4" />
                Auto-Asignar
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg"
                style={{
                  backgroundImage: `linear-gradient(to right, ${themeColors.accent}, ${themeColors.secondary})`
                }}
              >
                <Upload className="w-4 h-4" />
                Cargar Imágenes
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Estadísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-2xl p-6 shadow-xl"
          style={{
            background: `linear-gradient(135deg, ${themeColors.surface}80, ${themeColors.surface}40)`
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div 
                className="text-2xl font-bold"
                style={{ color: themeColors.text.primary }}
              >
                {stats.total}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Total Imágenes
              </div>
            </div>
            <div className="text-center">
              <div 
                className="text-2xl font-bold"
                style={{ color: themeColors.primary }}
              >
                {stats.assigned}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Asignadas
              </div>
            </div>
            <div className="text-center">
              <div 
                className="text-2xl font-bold"
                style={{ color: themeColors.secondary }}
              >
                {stats.unassigned}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Sin Asignar
              </div>
            </div>
            <div className="text-center">
              <div 
                className="text-2xl font-bold"
                style={{ color: themeColors.accent }}
              >
                {Math.round(stats.totalSize / 1024 / 1024)} MB
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Tamaño Total
              </div>
            </div>
          </div>
        </motion.div>

        {/* Controles y Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-2xl p-6 shadow-xl relative z-50"
          style={{
            background: `linear-gradient(135deg, ${themeColors.surface}80, ${themeColors.surface}40)`
          }}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, producto asignado o etiquetas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/60 dark:bg-slate-700/60 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all placeholder-gray-400 backdrop-blur-sm"
                style={{
                  '--tw-ring-color': themeColors.primary + '50',
                  borderColor: themeColors.primary + '30'
                } as React.CSSProperties}
              />
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Botones de vista */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode("grid")}
                  className={`p-3 rounded-xl transition-all backdrop-blur-sm border ${
                    viewMode === "grid" ? "shadow-lg" : ""
                  }`}
                  style={{
                    backgroundColor: viewMode === "grid" 
                      ? `${themeColors.primary}20`
                      : themeColors.surface + "60",
                    borderColor: viewMode === "grid"
                      ? themeColors.primary + "60"
                      : themeColors.primary + "30",
                    color: viewMode === "grid" 
                      ? themeColors.primary
                      : themeColors.text.secondary
                  }}
                  title="Vista de cuadrícula"
                >
                  <Grid3x3 className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode("list")}
                  className={`p-3 rounded-xl transition-all backdrop-blur-sm border ${
                    viewMode === "list" ? "shadow-lg" : ""
                  }`}
                  style={{
                    backgroundColor: viewMode === "list" 
                      ? `${themeColors.primary}20`
                      : themeColors.surface + "60",
                    borderColor: viewMode === "list"
                      ? themeColors.primary + "60"
                      : themeColors.primary + "30",
                    color: viewMode === "list" 
                      ? themeColors.primary
                      : themeColors.text.secondary
                  }}
                  title="Vista de lista"
                >
                  <List className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="w-full sm:w-48 relative z-[100]">
                <StyledSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: "all", label: "Todos" },
                    { value: "unassigned", label: "Imágenes sin producto" },
                    { value: "assigned", label: "Imágenes con producto" },
                  ]}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Barra de acciones masivas */}
        {selectedImages.length > 0 && (
          <BulkActionsBar
            selectedCount={selectedImages.length}
            allAssigned={selectedImages.every(id => {
              const img = images.find(i => i.id === id);
              return img?.status === 'ASSIGNED';
            })}
            onAutoAssign={() => setIsAutoAssignModalOpen(true)}
            onManualAssign={() => setIsManualAssignModalOpen(true)}
            onDelete={handleDeleteImages}
            onDownload={() => toast.info("Función no implementada")}
            onClearSelection={() => setSelectedImages([])}
          />
        )}

        {/* Estado de carga */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Loader2 className="w-12 h-12 animate-spin" style={{ color: themeColors.primary }} />
            <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando imágenes...</p>
          </motion.div>
        ) : filteredImages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Upload className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-xl font-semibold text-gray-600 dark:text-gray-300">
              No hay imágenes
            </p>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Comienza subiendo imágenes de tus productos
            </p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="mt-6 px-6 py-3 text-white rounded-xl font-medium shadow-lg"
              style={{
                backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`
              }}
            >
              Cargar Imágenes
            </button>
          </motion.div>
        ) : (
          <>
            {/* Galería de imágenes */}
            <ImageGallery
              images={filteredImages}
              selectedImages={selectedImages}
              viewMode={viewMode}
              onImageSelect={handleImageSelect}
              onSelectAll={handleSelectAll}
            />

            {/* Paginación */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-6 py-5 border-t backdrop-blur-sm mt-6 rounded-b-2xl"
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
                      {filteredImages.length > 0 ? (currentPage - 1) * 20 + 1 : 0}
                    </span>{" "}
                    a{" "}
                    <span 
                      className="font-semibold"
                      style={{ color: themeColors.primary }}
                    >
                      {Math.min(currentPage * 20, totalImages)}
                    </span>{" "}
                    de{" "}
                    <span 
                      className="font-semibold"
                      style={{ color: themeColors.primary }}
                    >
                      {totalImages}
                    </span>{" "}
                    imágenes
                  </div>

                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05, x: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => loadImages(currentPage - 1)}
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
                            onClick={() => loadImages(pageNum)}
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
                      onClick={() => loadImages(currentPage + 1)}
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
              </motion.div>
            )}
          </>
        )}

        {/* Modal de carga de imágenes */}
        <ImageUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onComplete={(uploadedImages) => {
            console.log('Imágenes procesadas:', uploadedImages);
            setIsUploadModalOpen(false);
            // Recargar la lista de imágenes
            loadImages(currentPage);
            toast.success(`${uploadedImages.length} imagen(es) cargadas exitosamente`);
          }}
        />

        {/* Modal de auto-asignación */}
        <AutoAssignModal
          isOpen={isAutoAssignModalOpen}
          onClose={() => setIsAutoAssignModalOpen(false)}
          images={images.filter(
            (img) =>
              selectedImages.includes(img.id) || selectedImages.length === 0,
          )}
          onComplete={() => {
            setSelectedImages([]);
            loadImages(currentPage);
          }}
        />

        {/* Modal de asignación manual */}
        <ManualAssignModal
          isOpen={isManualAssignModalOpen}
          onClose={() => setIsManualAssignModalOpen(false)}
          selectedImages={images
            .filter((img) => selectedImages.includes(img.id))
            .map((img) => ({
              url: img.url,
              filename: img.filename,
            }))}
          onAssignComplete={() => {
            setSelectedImages([]);
            setIsManualAssignModalOpen(false);
            loadImages(currentPage);
          }}
        />
      </div>
    </AdminLayout>
  );
}
