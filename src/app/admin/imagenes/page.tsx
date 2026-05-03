"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  RefreshCw,
  Upload,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  List,
  Image as ImageIcon,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { StyledSelect } from "@/components/ui/styled-select";
import { ImageGallery } from "@/components/images/admin/image-gallery";
import { AutoAssignModal } from "@/components/images/admin/auto-assign-modal";
import { ManualAssignModal } from "@/components/images/admin/manual-assign-modal";
import { BulkActionsBar } from "@/components/images/admin/bulk-actions-bar";
import { ImageUploadModal } from "@/components/images/admin/image-upload-modal";
import { useTheme } from "@/contexts/theme-context";
import { toast } from "sonner";

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
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAutoAssignModalOpen, setIsAutoAssignModalOpen] = useState(false);
  const [isManualAssignModalOpen, setIsManualAssignModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalImages, setTotalImages] = useState(0);

  const loadImages = async (page = 1) => {
    setIsLoading(true);
    try {
      const token =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("jwt_token");

      if (!token) {
        toast.error("No autenticado");
        return;
      }

      const url = new URL(
        "/api/product-images/my-distributor",
        window.location.origin
      );
      url.searchParams.set("page", page.toString());
      url.searchParams.set("limit", "20");
      url.searchParams.set("assignmentFilter", statusFilter);

      if (searchQuery) {
        url.searchParams.set("search", searchQuery);
      }

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Error al cargar imágenes");

      const result = await response.json();

      if (result.success && result.data) {
        const transformedImages: ImageData[] = result.data.map(
          (img: BackendImageData) => {
            const filename =
              img.metadata?.filename ||
              img.url.split("/").pop() ||
              img.imageId;
            const format = (img.metadata?.format || filename)
              .split(".")
              .pop()
              ?.replace("image/", "")
              .toUpperCase() || "JPEG";

            return {
              id: img.imageId,
              filename,
              originalName: img.altText || filename,
              size: img.metadata?.size || 0,
              format,
              url: img.url,
              thumbnailUrl: img.url,
              uploadedAt: img.createdAt,
              assignedTo: img.product
                ? {
                    productId: img.product.prodVirtaId,
                    productName: img.product.name,
                    productSku: img.product.prodVirtaId,
                  }
                : undefined,
              status: img.product ? "ASSIGNED" : "UPLOADED",
              tags: Array.from(
                new Set(
                  [
                    img.aiAnalysis?.detectedBrand,
                    img.product?.brandId,
                    img.aiAnalysis?.detectedCategory,
                  ].filter(Boolean)
                )
              ),
              aiSuggestions: img.aiAnalysis
                ? {
                    productMatches: [
                      {
                        productId: img.prodVirtaId || "",
                        productName: img.aiAnalysis.detectedProduct || "",
                        productSku: img.prodVirtaId || "",
                        confidence: (img.aiAnalysis.confidence || 0) * 100,
                      },
                    ],
                  }
                : undefined,
            };
          }
        );

        setImages(transformedImages);
        setTotalImages(result.pagination?.total || transformedImages.length);
        setTotalPages(result.pagination?.totalPages || 1);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Error cargando imágenes:", error);
      toast.error("Error al cargar las imágenes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadImages(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const filteredImages = images.filter((image) => {
    if (searchQuery === "") return true;
    return (
      image.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      (image.assignedTo?.productName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ?? false)
    );
  });

  const stats = {
    total: totalImages || images.length,
    assigned: images.filter((img) => img.status === "ASSIGNED").length,
    unassigned: images.filter((img) => img.status === "UPLOADED").length,
    totalSize: images.reduce((acc, img) => acc + img.size, 0),
  };

  const handleImageSelect = (imageId: string) => {
    setSelectedImages((prev) =>
      prev.includes(imageId)
        ? prev.filter((id) => id !== imageId)
        : [...prev, imageId]
    );
  };

  const handleSelectAll = () => {
    setSelectedImages(
      selectedImages.length === filteredImages.length
        ? []
        : filteredImages.map((img) => img.id)
    );
  };

  const handleDeleteImages = async () => {
    if (selectedImages.length === 0) return;
    if (!confirm(`¿Estás seguro de eliminar ${selectedImages.length} imagen(es)?`)) return;

    try {
      const token =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("jwt_token");

      const response = await fetch("/api/product-images/batch-delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ imageIds: selectedImages }),
      });

      if (!response.ok) throw new Error("Error al eliminar imágenes");

      const data = await response.json();
      if (data.success) {
        toast.success(`${data.deleted || selectedImages.length} imagen(es) eliminadas`);
        setSelectedImages([]);
        loadImages(currentPage);
      }
    } catch (error) {
      console.error("Error eliminando imágenes:", error);
      toast.error("Error al eliminar las imágenes");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: themeColors.text.primary }}
            >
              Gestión de Imágenes
            </h1>
            <p className="text-sm mt-1" style={{ color: themeColors.text.secondary }}>
              Administra y asigna imágenes a tus productos de forma inteligente
            </p>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAutoAssignModalOpen(true)}
              className="px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 bg-white border border-gray-200"
              style={{ color: themeColors.text.primary }}
            >
              <RefreshCw className="w-4 h-4" />
              Auto-Asignar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 rounded-xl font-medium text-white transition-all duration-200 flex items-center gap-2 bg-red-700 hover:bg-red-800"
            >
              <Upload className="w-4 h-4" />
              Cargar Imágenes
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Total Imágenes", value: stats.total, color: themeColors.text.primary },
            { label: "Asignadas", value: stats.assigned, color: "#10b981" },
            { label: "Sin Asignar", value: stats.unassigned, color: "#f59e0b" },
            {
              label: "Tamaño Total",
              value: `${Math.round(stats.totalSize / 1024 / 1024)} MB`,
              color: themeColors.text.primary,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl border p-4 text-center"
              style={{ borderColor: themeColors.border }}
            >
              <div
                className="text-2xl font-bold mb-1"
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
              <div
                className="text-xs uppercase tracking-wide"
                style={{ color: themeColors.text.muted }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border p-5 relative z-50"
          style={{ borderColor: themeColors.border }}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: themeColors.text.secondary }}
              />
              <input
                type="text"
                placeholder="Buscar por nombre, producto asignado o etiquetas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-700"
                style={{ color: themeColors.text.primary }}
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className="p-2.5 rounded-xl border transition-all"
                  style={{
                    backgroundColor:
                      viewMode === "grid"
                        ? `${themeColors.primary}15`
                        : "transparent",
                    borderColor:
                      viewMode === "grid"
                        ? themeColors.primary
                        : themeColors.border,
                    color:
                      viewMode === "grid"
                        ? themeColors.primary
                        : themeColors.text.secondary,
                  }}
                  title="Vista cuadrícula"
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className="p-2.5 rounded-xl border transition-all"
                  style={{
                    backgroundColor:
                      viewMode === "list"
                        ? `${themeColors.primary}15`
                        : "transparent",
                    borderColor:
                      viewMode === "list"
                        ? themeColors.primary
                        : themeColors.border,
                    color:
                      viewMode === "list"
                        ? themeColors.primary
                        : themeColors.text.secondary,
                  }}
                  title="Vista lista"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <div className="w-52 relative z-[100]">
                <StyledSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: "all", label: "Todos" },
                    { value: "unassigned", label: "Sin producto" },
                    { value: "assigned", label: "Con producto" },
                  ]}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bulk actions bar */}
        {selectedImages.length > 0 && (
          <BulkActionsBar
            selectedCount={selectedImages.length}
            allAssigned={selectedImages.every((id) => {
              const img = images.find((i) => i.id === id);
              return img?.status === "ASSIGNED";
            })}
            onAutoAssign={() => setIsAutoAssignModalOpen(true)}
            onManualAssign={() => setIsManualAssignModalOpen(true)}
            onDelete={handleDeleteImages}
            onDownload={() => toast.info("Función no implementada")}
            onClearSelection={() => setSelectedImages([])}
          />
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2
              className="w-10 h-10 animate-spin"
              style={{ color: themeColors.primary }}
            />
            <p className="mt-3 text-sm" style={{ color: themeColors.text.secondary }}>
              Cargando imágenes...
            </p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <ImageIcon
              className="w-14 h-14 mb-3"
              style={{ color: themeColors.border }}
            />
            <p
              className="text-lg font-semibold mb-1"
              style={{ color: themeColors.text.primary }}
            >
              No hay imágenes
            </p>
            <p className="text-sm mb-6" style={{ color: themeColors.text.secondary }}>
              Comenzá subiendo imágenes de tus productos
            </p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-6 py-2.5 rounded-xl font-medium text-white bg-red-700 hover:bg-red-800 transition-all"
            >
              Cargar Imágenes
            </button>
          </div>
        ) : (
          <>
            <ImageGallery
              images={filteredImages}
              selectedImages={selectedImages}
              viewMode={viewMode}
              onImageSelect={handleImageSelect}
              onSelectAll={handleSelectAll}
            />

            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border p-4"
                style={{ borderColor: themeColors.border }}
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                    Mostrando{" "}
                    <span className="font-semibold" style={{ color: themeColors.text.primary }}>
                      {filteredImages.length > 0
                        ? (currentPage - 1) * 20 + 1
                        : 0}
                    </span>{" "}
                    a{" "}
                    <span className="font-semibold" style={{ color: themeColors.text.primary }}>
                      {Math.min(currentPage * 20, totalImages)}
                    </span>{" "}
                    de{" "}
                    <span className="font-semibold" style={{ color: themeColors.text.primary }}>
                      {totalImages}
                    </span>{" "}
                    imágenes
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadImages(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl border transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                      style={{
                        borderColor: themeColors.border,
                        color: themeColors.text.primary,
                      }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1">
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const pageNum = i + 1;
                        const isActive = currentPage === pageNum;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => loadImages(pageNum)}
                            className="w-9 h-9 rounded-lg text-sm font-medium transition-all border"
                            style={{
                              backgroundColor: isActive
                                ? themeColors.primary
                                : "transparent",
                              borderColor: isActive
                                ? themeColors.primary
                                : themeColors.border,
                              color: isActive
                                ? "white"
                                : themeColors.text.primary,
                            }}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => loadImages(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-xl border transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                      style={{
                        borderColor: themeColors.border,
                        color: themeColors.text.primary,
                      }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}

        <ImageUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onComplete={(uploadedImages) => {
            setIsUploadModalOpen(false);
            loadImages(currentPage);
            toast.success(
              `${uploadedImages.length} imagen(es) cargadas exitosamente`
            );
          }}
        />

        <AutoAssignModal
          isOpen={isAutoAssignModalOpen}
          onClose={() => setIsAutoAssignModalOpen(false)}
          images={images.filter(
            (img) =>
              selectedImages.includes(img.id) || selectedImages.length === 0
          )}
          onComplete={() => {
            setSelectedImages([]);
            loadImages(currentPage);
          }}
        />

        <ManualAssignModal
          isOpen={isManualAssignModalOpen}
          onClose={() => setIsManualAssignModalOpen(false)}
          selectedImages={images
            .filter((img) => selectedImages.includes(img.id))
            .map((img) => ({ url: img.url, filename: img.filename }))}
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
