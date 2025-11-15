"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Check,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  Tag,
  Calendar,
  FileText,
  Sparkles,
  AlertCircle,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

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

interface ImageGalleryProps {
  images: ImageData[];
  selectedImages: string[];
  viewMode: "grid" | "list";
  onImageSelect: (imageId: string) => void;
  onSelectAll: () => void;
}

export function ImageGallery({
  images,
  selectedImages,
  viewMode,
  onImageSelect,
  onSelectAll,
}: ImageGalleryProps) {
  const { themeColors } = useTheme();
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ASSIGNED":
        return `${themeColors.primary}20`;
      case "PROCESSING":
        return `${themeColors.secondary}20`;
      case "ERROR":
        return "rgba(239, 68, 68, 0.2)";
      default:
        return "rgba(156, 163, 175, 0.2)";
    }
  };

  if (images.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-white/20 dark:border-gray-700/30 rounded-2xl p-12 shadow-xl text-center"
        style={{
          background: `linear-gradient(135deg, ${themeColors.surface}80, ${themeColors.surface}40)`
        }}
      >
        <div 
          className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
          style={{
            backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`
          }}
        >
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No hay imágenes
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Comienza cargando algunas imágenes para administrar tu catálogo de
          productos
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-xl overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${themeColors.surface}80, ${themeColors.surface}40)`
      }}
    >
      {/* Header con controles */}
      <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={
                  selectedImages.length === images.length && images.length > 0
                }
                onChange={onSelectAll}
                className="sr-only peer"
              />
              <motion.div 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  relative w-7 h-7 rounded-full shadow-md transition-all duration-300 flex items-center justify-center
                  ${selectedImages.length === images.length && images.length > 0 
                    ? 'shadow-xl' 
                    : 'bg-white/90 dark:bg-gray-800/90 border border-white/50 group-hover:bg-white dark:group-hover:bg-gray-700'
                  }
                `}
                style={{
                  ...(selectedImages.length === images.length && images.length > 0 && {
                    background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                    boxShadow: `0 0 15px ${themeColors.primary}50`
                  })
                }}
              >
                {selectedImages.length === images.length && images.length > 0 ? (
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                ) : (
                  <div className="w-3 h-3 rounded-full border-2 border-gray-400 dark:border-gray-500 group-hover:border-gray-600 dark:group-hover:border-gray-300 transition-colors" />
                )}
              </motion.div>
            </label>
            <span 
              className="text-sm font-medium"
              style={{ color: themeColors.text.secondary }}
            >
              {selectedImages.length > 0
                ? `${selectedImages.length} de ${images.length} seleccionadas`
                : `${images.length} imagen${images.length !== 1 ? "es" : ""}`}
            </span>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  group relative border rounded-2xl p-4 hover:shadow-xl transition-all duration-300 cursor-pointer z-0
                  ${selectedImages.includes(image.id) ? "ring-2 shadow-lg" : ""}
                `}
                style={{
                  background: `linear-gradient(135deg, ${getStatusColor(image.status)}, ${getStatusColor(image.status)}40)`,
                  ...(selectedImages.includes(image.id) && {
                    ringColor: themeColors.primary
                  })
                }}
                onClick={() => onImageSelect(image.id)}
              >
                {/* Checkbox - Diseño mejorado */}
                <motion.div 
                  className="absolute top-2 left-2 z-10"
                  initial={{ scale: 0.8 }}
                  animate={{ 
                    scale: selectedImages.includes(image.id) ? 1 : 0.8,
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <div
                    className={`
                    w-7 h-7 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center backdrop-blur-md
                    ${
                      selectedImages.includes(image.id)
                        ? "scale-110 shadow-2xl"
                        : "bg-white/90 dark:bg-gray-800/90 border border-white/50 group-hover:bg-white dark:group-hover:bg-gray-700"
                    }
                  `}
                    style={{
                      ...(selectedImages.includes(image.id) && {
                        background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                        boxShadow: `0 0 20px ${themeColors.primary}60`
                      })
                    }}
                  >
                    {selectedImages.includes(image.id) ? (
                      <Check className="w-4 h-4 text-white animate-in zoom-in duration-200" strokeWidth={3} />
                    ) : (
                      <div className="w-3 h-3 rounded-full border-2 border-gray-400 dark:border-gray-500 group-hover:border-gray-600 dark:group-hover:border-gray-300 transition-colors" />
                    )}
                  </div>
                </motion.div>

                {/* Estado - Diseño mejorado */}
                <motion.div 
                  className="absolute top-2 right-2 z-10"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {image.status === "ASSIGNED" ? (
                    <div 
                      className="px-2.5 py-1.5 rounded-full shadow-lg backdrop-blur-md flex items-center gap-1.5"
                      style={{
                        background: `linear-gradient(135deg, ${themeColors.primary}F0, ${themeColors.secondary}F0)`,
                        boxShadow: `0 4px 12px ${themeColors.primary}40`
                      }}
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                      <span className="text-[10px] font-bold text-white uppercase tracking-wide">
                        Asignada
                      </span>
                    </div>
                  ) : image.status === "PROCESSING" ? (
                    <div 
                      className="px-2.5 py-1.5 rounded-full shadow-lg backdrop-blur-md flex items-center gap-1.5 bg-gradient-to-r from-amber-400/90 to-orange-500/90"
                    >
                      <Clock className="w-3.5 h-3.5 text-white animate-pulse" strokeWidth={2.5} />
                      <span className="text-[10px] font-bold text-white uppercase tracking-wide">
                        Procesando
                      </span>
                    </div>
                  ) : image.status === "ERROR" ? (
                    <div className="px-2.5 py-1.5 rounded-full shadow-lg backdrop-blur-md flex items-center gap-1.5 bg-gradient-to-r from-red-500/90 to-red-600/90">
                      <AlertCircle className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                      <span className="text-[10px] font-bold text-white uppercase tracking-wide">
                        Error
                      </span>
                    </div>
                  ) : (
                    <div className="px-2.5 py-1.5 rounded-full shadow-lg backdrop-blur-md flex items-center gap-1.5 bg-gray-500/90 dark:bg-gray-600/90">
                      <FileText className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                      <span className="text-[10px] font-bold text-white uppercase tracking-wide">
                        Disponible
                      </span>
                    </div>
                  )}
                </motion.div>

                {/* Imagen */}
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 mb-3 relative z-0">
                  <Image
                    src={image.thumbnailUrl}
                    alt={image.originalName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Overlay de acciones */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <button className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors">
                        <Eye className="w-4 h-4 text-gray-700" />
                      </button>
                      <button className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors">
                        <Edit className="w-4 h-4 text-gray-700" />
                      </button>
                      <button className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Información */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                    {image.originalName}
                  </h4>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{image.format}</span>
                    <span>{formatFileSize(image.size)}</span>
                  </div>

                  {/* Producto asignado */}
                  {image.assignedTo && (
                    <div 
                      className="rounded-lg p-2"
                      style={{
                        backgroundColor: `${themeColors.primary}20`,
                        color: themeColors.primary
                      }}
                    >
                      <p className="text-xs font-medium truncate">
                        {image.assignedTo.productName}
                      </p>
                      <p className="text-xs opacity-80">
                        {image.assignedTo.productSku}
                      </p>
                    </div>
                  )}

                  {/* Sugerencias de IA */}
                  {image.aiSuggestions &&
                    image.aiSuggestions.productMatches.length > 0 &&
                    !image.assignedTo && (
                      <div 
                        className="rounded-lg p-2"
                        style={{
                          backgroundColor: `${themeColors.accent}20`,
                          color: themeColors.accent
                        }}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <Sparkles 
                            className="w-3 h-3" 
                            style={{ color: themeColors.accent }}
                          />
                          <span className="text-xs font-medium">
                            IA sugiere:
                          </span>
                        </div>
                        <p className="text-xs truncate">
                          {image.aiSuggestions.productMatches[0].productName}
                        </p>
                        <p className="text-xs opacity-80">
                          {image.aiSuggestions.productMatches[0].confidence}%
                          confianza
                        </p>
                      </div>
                    )}

                  {/* Tags */}
                  {image.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {image.tags.slice(0, 2).map((tag, tagIdx) => (
                        <span
                          key={`${tag}-${tagIdx}`}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 rounded-full"
                        >
                          <Tag className="w-2 h-2" />
                          {tag}
                        </span>
                      ))}
                      {image.tags.length > 2 && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          +{image.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className={`
                  group flex items-center gap-4 p-4 border border-white/30 dark:border-gray-600/30 rounded-xl hover:shadow-lg transition-all duration-200 cursor-pointer
                  ${selectedImages.includes(image.id) ? "ring-2" : ""}
                `}
                style={{
                  background: `linear-gradient(135deg, ${themeColors.surface}60, ${themeColors.surface}40)`,
                  ...(selectedImages.includes(image.id) && {
                    ringColor: themeColors.primary,
                    background: `linear-gradient(135deg, ${themeColors.primary}10, ${themeColors.secondary}10)`
                  })
                }}
                onClick={() => onImageSelect(image.id)}
              >
                {/* Checkbox - Diseño mejorado en lista */}
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ 
                    scale: selectedImages.includes(image.id) ? 1 : 0.8,
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="flex-shrink-0"
                >
                  <div
                    className={`
                    w-7 h-7 rounded-full shadow-md transition-all duration-300 flex items-center justify-center
                    ${
                      selectedImages.includes(image.id)
                        ? "scale-110 shadow-xl"
                        : "bg-white/90 dark:bg-gray-800/90 border border-white/50 group-hover:bg-white dark:group-hover:bg-gray-700"
                    }
                  `}
                    style={{
                      ...(selectedImages.includes(image.id) && {
                        background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                        boxShadow: `0 0 15px ${themeColors.primary}50`
                      })
                    }}
                  >
                    {selectedImages.includes(image.id) ? (
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    ) : (
                      <div className="w-3 h-3 rounded-full border-2 border-gray-400 dark:border-gray-500 group-hover:border-gray-600 dark:group-hover:border-gray-300 transition-colors" />
                    )}
                  </div>
                </motion.div>

                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0 relative">
                  <Image
                    src={image.thumbnailUrl}
                    alt={image.originalName}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Información principal */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {image.originalName}
                    </h4>
                    
                    {/* Badge de estado mejorado */}
                    {image.status === "ASSIGNED" ? (
                      <div 
                        className="px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm"
                        style={{
                          background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                        }}
                      >
                        <CheckCircle className="w-3 h-3 text-white" strokeWidth={2.5} />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wide">
                          Asignada
                        </span>
                      </div>
                    ) : image.status === "PROCESSING" ? (
                      <div className="px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm bg-gradient-to-r from-amber-400 to-orange-500">
                        <Clock className="w-3 h-3 text-white animate-pulse" strokeWidth={2.5} />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wide">
                          Procesando
                        </span>
                      </div>
                    ) : image.status === "ERROR" ? (
                      <div className="px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm bg-gradient-to-r from-red-500 to-red-600">
                        <AlertCircle className="w-3 h-3 text-white" strokeWidth={2.5} />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wide">
                          Error
                        </span>
                      </div>
                    ) : (
                      <div className="px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm bg-gray-500 dark:bg-gray-600">
                        <FileText className="w-3 h-3 text-white" strokeWidth={2.5} />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wide">
                          Disponible
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      {image.format} • {formatFileSize(image.size)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(image.uploadedAt)}</span>
                    </div>
                  </div>

                  {/* Producto asignado o sugerencia */}
                  {image.assignedTo ? (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <ExternalLink 
                          className="w-3 h-3" 
                          style={{ color: themeColors.primary }}
                        />
                        <span 
                          className="text-xs font-medium"
                          style={{ color: themeColors.primary }}
                        >
                          {image.assignedTo.productName}
                        </span>
                      </div>
                      <span 
                        className="text-xs"
                        style={{ color: themeColors.primary, opacity: 0.8 }}
                      >
                        ({image.assignedTo.productSku})
                      </span>
                    </div>
                  ) : (
                    image.aiSuggestions &&
                    image.aiSuggestions.productMatches.length > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <Sparkles 
                          className="w-3 h-3" 
                          style={{ color: themeColors.accent }}
                        />
                        <span 
                          className="text-xs"
                          style={{ color: themeColors.accent }}
                        >
                          IA sugiere:{" "}
                          {image.aiSuggestions.productMatches[0].productName}
                        </span>
                        <span 
                          className="text-xs"
                          style={{ color: themeColors.accent, opacity: 0.8 }}
                        >
                          ({image.aiSuggestions.productMatches[0].confidence}%)
                        </span>
                      </div>
                    )
                  )}
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
