"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Grid3X3, List, Plus, RefreshCw } from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { StyledSelect } from "@/components/ui/styled-select";
import { ImageUploadZone } from "@/components/images/admin/image-upload-zone";
import { ImageGallery } from "@/components/images/admin/image-gallery";
import { AutoAssignModal } from "@/components/images/admin/auto-assign-modal";
import { BulkActionsBar } from "@/components/images/admin/bulk-actions-bar";
import { useTheme } from "@/contexts/theme-context";

// Tipos para imágenes
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

// Datos de ejemplo
const mockImages: ImageData[] = [
  {
    id: "IMG001",
    filename: "iphone-15-pro-max-front.jpg",
    originalName: "iPhone 15 Pro Max Front View.jpg",
    size: 2456789,
    format: "JPEG",
    url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200",
    uploadedAt: "2024-09-12T10:30:00Z",
    assignedTo: {
      productId: "PRO001",
      productName: "iPhone 15 Pro Max 256GB",
      productSku: "SKU-31118",
    },
    status: "ASSIGNED",
    tags: ["smartphone", "apple", "front-view"],
    aiSuggestions: {
      productMatches: [
        {
          productId: "PRO001",
          productName: "iPhone 15 Pro Max 256GB",
          productSku: "SKU-31118",
          confidence: 95,
        },
      ],
    },
  },
  {
    id: "IMG002",
    filename: "macbook-pro-m3-side.jpg",
    originalName: "MacBook Pro M3 Side Angle.jpg",
    size: 3245678,
    format: "JPEG",
    url: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=200",
    uploadedAt: "2024-09-12T09:15:00Z",
    status: "UPLOADED",
    tags: ["laptop", "apple", "macbook"],
    aiSuggestions: {
      productMatches: [
        {
          productId: "PRO002",
          productName: 'MacBook Pro 16" M3',
          productSku: "SKU-39188",
          confidence: 88,
        },
        {
          productId: "PRO008",
          productName: "MacBook Air M2",
          productSku: "SKU-20451",
          confidence: 65,
        },
      ],
    },
  },
  {
    id: "IMG003",
    filename: "samsung-galaxy-s24-ultra.jpg",
    originalName: "Samsung Galaxy S24 Ultra Black.jpg",
    size: 1876543,
    format: "JPEG",
    url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200",
    uploadedAt: "2024-09-12T08:45:00Z",
    status: "PROCESSING",
    tags: ["smartphone", "samsung", "android"],
  },
];

export default function ImagenesAdminPage() {
  const { themeColors } = useTheme();
  const [images] = useState<ImageData[]>(mockImages);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formatFilter, setFormatFilter] = useState("all");
  const [sortBy, setSortBy] = useState("uploadedAt");
  const [isAutoAssignModalOpen, setIsAutoAssignModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Filtrar imágenes
  const filteredImages = images.filter((image) => {
    const matchesSearch =
      image.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      ) ||
      (image.assignedTo?.productName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ??
        false);

    const matchesStatus =
      statusFilter === "all" || image.status === statusFilter;
    const matchesFormat =
      formatFilter === "all" || image.format === formatFilter;

    return matchesSearch && matchesStatus && matchesFormat;
  });

  // Estadísticas
  const stats = {
    total: images.length,
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

  const handleBulkUpload = async () => {
    setIsUploading(true);
    // Aquí iría la lógica de carga masiva
    setTimeout(() => {
      setIsUploading(false);
      // Simular nuevas imágenes cargadas
    }, 3000);
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
                className="px-4 py-2 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg"
                style={{
                  backgroundImage: `linear-gradient(to right, ${themeColors.accent}, ${themeColors.secondary})`
                }}
              >
                <Plus className="w-4 h-4" />
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

        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-2xl p-6 shadow-xl"
          style={{
            background: `linear-gradient(135deg, ${themeColors.surface}80, ${themeColors.surface}40)`
          }}
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-4 py-2 text-white rounded-lg transition-all duration-200 shadow-lg"
                style={{
                  backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`
                }}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Subir Imágenes
              </motion.button>

              <div className="relative">
                <select
                  value={viewMode}
                  onChange={(e) =>
                    setViewMode(e.target.value as "grid" | "list")
                  }
                  className="appearance-none bg-white/70 dark:bg-slate-700/70 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:border-transparent backdrop-blur-sm"
                  style={{
                    '--tw-ring-color': themeColors.primary + '50'
                  } as React.CSSProperties}
                >
                  <option value="grid">Vista Cuadrícula</option>
                  <option value="list">Vista Lista</option>
                </select>
                <svg
                  className="w-4 h-4 absolute right-2 top-3 pointer-events-none text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar imágenes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/70 dark:bg-slate-700/70 backdrop-blur-sm text-sm focus:ring-2 focus:border-transparent"
                  style={{
                    '--tw-ring-color': themeColors.primary + '50'
                  } as React.CSSProperties}
                />
                <svg
                  className="w-4 h-4 absolute left-3 top-3 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white/70 dark:bg-slate-700/70 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:border-transparent backdrop-blur-sm"
                  style={{
                    '--tw-ring-color': themeColors.primary + '50'
                  } as React.CSSProperties}
                >
                  <option value="all">Todas</option>
                  <option value="assigned">Asignadas</option>
                  <option value="unassigned">Sin Asignar</option>
                </select>
                <svg
                  className="w-4 h-4 absolute right-2 top-3 pointer-events-none text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Controles y Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-2xl p-6 shadow-xl"
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
              <div className="w-full sm:w-48 relative z-1">
                <StyledSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: "all", label: "Todos los estados" },
                    { value: "UPLOADED", label: "Sin asignar" },
                    { value: "ASSIGNED", label: "Asignadas" },
                    { value: "PROCESSING", label: "Procesando" },
                    { value: "ERROR", label: "Con errores" },
                  ]}
                />
              </div>

              <div className="w-full sm:w-40 relative z-1">
                <StyledSelect
                  value={formatFilter}
                  onChange={setFormatFilter}
                  options={[
                    { value: "all", label: "Todos los formatos" },
                    { value: "JPEG", label: "JPEG" },
                    { value: "PNG", label: "PNG" },
                    { value: "WEBP", label: "WEBP" },
                    { value: "SVG", label: "SVG" },
                  ]}
                />
              </div>

              <div className="w-full sm:w-44 relative z-1">
                <StyledSelect
                  value={sortBy}
                  onChange={setSortBy}
                  options={[
                    { value: "uploadedAt", label: "Fecha de carga" },
                    { value: "filename", label: "Nombre" },
                    { value: "size", label: "Tamaño" },
                    { value: "status", label: "Estado" },
                  ]}
                />
              </div>

              {/* Toggle de vista */}
              <div className="flex bg-white/50 dark:bg-slate-700/50 rounded-lg p-1 border border-white/30">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "grid"
                      ? "text-white shadow-lg"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                  style={{
                    ...(viewMode === "grid" && {
                      backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`
                    })
                  }}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "list"
                      ? "text-white shadow-lg"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                  style={{
                    ...(viewMode === "list" && {
                      backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`
                    })
                  }}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Zona de carga */}
        <ImageUploadZone
          onUpload={handleBulkUpload}
          isUploading={isUploading}
        />

        {/* Barra de acciones masivas */}
        {selectedImages.length > 0 && (
          <BulkActionsBar
            selectedCount={selectedImages.length}
            onAssignToProducts={() => setIsAutoAssignModalOpen(true)}
            onDelete={() => {}}
            onDownload={() => {}}
            onClearSelection={() => setSelectedImages([])}
          />
        )}

        {/* Galería de imágenes */}
        <ImageGallery
          images={filteredImages}
          selectedImages={selectedImages}
          viewMode={viewMode}
          onImageSelect={handleImageSelect}
          onSelectAll={handleSelectAll}
        />

        {/* Modal de auto-asignación */}
        <AutoAssignModal
          isOpen={isAutoAssignModalOpen}
          onClose={() => setIsAutoAssignModalOpen(false)}
          images={images.filter(
            (img) =>
              selectedImages.includes(img.id) || selectedImages.length === 0,
          )}
        />
      </div>
    </AdminLayout>
  );
}
