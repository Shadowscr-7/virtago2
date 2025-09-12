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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ASSIGNED":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "PROCESSING":
        return <Clock className="w-4 h-4 text-blue-500 animate-pulse" />;
      case "ERROR":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ASSIGNED":
        return "from-green-500/20 to-emerald-500/20 border-green-200 dark:border-green-700";
      case "PROCESSING":
        return "from-blue-500/20 to-cyan-500/20 border-blue-200 dark:border-blue-700";
      case "ERROR":
        return "from-red-500/20 to-pink-500/20 border-red-200 dark:border-red-700";
      default:
        return "from-gray-500/20 to-slate-500/20 border-gray-200 dark:border-gray-700";
    }
  };

  if (images.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-white/80 to-gray-50/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-2xl p-12 shadow-xl text-center"
      >
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
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
      className="bg-gradient-to-r from-white/80 to-gray-50/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-xl overflow-hidden"
    >
      {/* Header con controles */}
      <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={
                  selectedImages.length === images.length && images.length > 0
                }
                onChange={onSelectAll}
                className="sr-only peer"
              />
              <div className="relative w-5 h-5 bg-white/50 dark:bg-slate-600/50 border-2 border-gray-300 dark:border-gray-500 rounded-md peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500 peer-checked:border-purple-500 transition-all duration-200 peer-hover:border-purple-400">
                <Check className="absolute inset-0 w-3 h-3 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" />
              </div>
            </label>
            <span className="text-sm text-gray-600 dark:text-gray-300">
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
                  group relative bg-gradient-to-br ${getStatusColor(image.status)} 
                  backdrop-blur-sm border rounded-2xl p-4 hover:shadow-xl transition-all duration-300 cursor-pointer
                  ${selectedImages.includes(image.id) ? "ring-2 ring-purple-500 shadow-lg" : ""}
                `}
                onClick={() => onImageSelect(image.id)}
              >
                {/* Checkbox */}
                <div className="absolute top-2 left-2 z-10">
                  <div
                    className={`
                    w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center
                    ${
                      selectedImages.includes(image.id)
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 border-purple-500"
                        : "bg-white/80 border-gray-300 group-hover:border-purple-400"
                    }
                  `}
                  >
                    {selectedImages.includes(image.id) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>

                {/* Estado */}
                <div className="absolute top-2 right-2 z-10">
                  {getStatusIcon(image.status)}
                </div>

                {/* Imagen */}
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 mb-3 relative">
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
                    <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-2">
                      <p className="text-xs font-medium text-green-700 dark:text-green-300 truncate">
                        {image.assignedTo.productName}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        {image.assignedTo.productSku}
                      </p>
                    </div>
                  )}

                  {/* Sugerencias de IA */}
                  {image.aiSuggestions &&
                    image.aiSuggestions.productMatches.length > 0 &&
                    !image.assignedTo && (
                      <div className="bg-purple-100 dark:bg-purple-900/20 rounded-lg p-2">
                        <div className="flex items-center gap-1 mb-1">
                          <Sparkles className="w-3 h-3 text-purple-500" />
                          <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                            IA sugiere:
                          </span>
                        </div>
                        <p className="text-xs text-purple-600 dark:text-purple-400 truncate">
                          {image.aiSuggestions.productMatches[0].productName}
                        </p>
                        <p className="text-xs text-purple-500 dark:text-purple-400">
                          {image.aiSuggestions.productMatches[0].confidence}%
                          confianza
                        </p>
                      </div>
                    )}

                  {/* Tags */}
                  {image.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {image.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
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
                  group flex items-center gap-4 p-4 bg-gradient-to-r from-white/60 to-gray-50/60 dark:from-slate-700/60 dark:to-slate-600/60 
                  backdrop-blur-sm border border-white/30 dark:border-gray-600/30 rounded-xl hover:shadow-lg transition-all duration-200 cursor-pointer
                  ${selectedImages.includes(image.id) ? "ring-2 ring-purple-500 bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20" : ""}
                `}
                onClick={() => onImageSelect(image.id)}
              >
                {/* Checkbox */}
                <div
                  className={`
                  w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center flex-shrink-0
                  ${
                    selectedImages.includes(image.id)
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 border-purple-500"
                      : "bg-white/80 border-gray-300 group-hover:border-purple-400"
                  }
                `}
                >
                  {selectedImages.includes(image.id) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>

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
                    {getStatusIcon(image.status)}
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
                        <ExternalLink className="w-3 h-3 text-green-500" />
                        <span className="text-xs font-medium text-green-700 dark:text-green-300">
                          {image.assignedTo.productName}
                        </span>
                      </div>
                      <span className="text-xs text-green-600 dark:text-green-400">
                        ({image.assignedTo.productSku})
                      </span>
                    </div>
                  ) : (
                    image.aiSuggestions &&
                    image.aiSuggestions.productMatches.length > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-purple-500" />
                        <span className="text-xs text-purple-700 dark:text-purple-300">
                          IA sugiere:{" "}
                          {image.aiSuggestions.productMatches[0].productName}
                        </span>
                        <span className="text-xs text-purple-500 dark:text-purple-400">
                          ({image.aiSuggestions.productMatches[0].confidence}%)
                        </span>
                      </div>
                    )
                  )}
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
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
