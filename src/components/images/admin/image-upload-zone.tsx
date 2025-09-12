"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Upload,
  Image as ImageIcon,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileImage,
  Sparkles,
} from "lucide-react";

interface ImageUploadZoneProps {
  onUpload: (files: FileList) => void;
  isUploading: boolean;
  maxFiles?: number;
  maxSizePerFile?: number; // en bytes
  acceptedFormats?: string[];
}

interface FilePreview {
  file: File;
  preview: string;
  id: string;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

export function ImageUploadZone({
  onUpload,
  isUploading,
  maxFiles = 50,
  maxSizePerFile = 10 * 1024 * 1024, // 10MB por defecto
  acceptedFormats = ["image/jpeg", "image/png", "image/webp", "image/gif"],
}: ImageUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const [showPreviews, setShowPreviews] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!acceptedFormats.includes(file.type)) {
        return `Formato no soportado. Use: ${acceptedFormats.map((f) => f.split("/")[1].toUpperCase()).join(", ")}`;
      }
      if (file.size > maxSizePerFile) {
        return `Archivo muy grande. Máximo ${Math.round(maxSizePerFile / 1024 / 1024)}MB`;
      }
      return null;
    },
    [acceptedFormats, maxSizePerFile],
  );

  const processFiles = useCallback(
    (files: FileList) => {
      const newPreviews: FilePreview[] = [];

      Array.from(files)
        .slice(0, maxFiles)
        .forEach((file) => {
          const error = validateFile(file);
          const preview: FilePreview = {
            file,
            preview: URL.createObjectURL(file),
            id: Math.random().toString(36).substr(2, 9),
            status: error ? "error" : "pending",
            error: error || undefined,
          };
          newPreviews.push(preview);
        });

      setFilePreviews(newPreviews);
      setShowPreviews(true);
    },
    [maxFiles, validateFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        processFiles(files);
      }
    },
    [processFiles],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        processFiles(files);
      }
    },
    [processFiles],
  );

  const removeFile = (id: string) => {
    setFilePreviews((prev) => {
      const newPreviews = prev.filter((p) => p.id !== id);
      if (newPreviews.length === 0) {
        setShowPreviews(false);
      }
      return newPreviews;
    });
  };

  const startUpload = () => {
    const validFiles = filePreviews.filter((p) => p.status === "pending");
    if (validFiles.length > 0) {
      const fileList = new DataTransfer();
      validFiles.forEach((preview) => fileList.items.add(preview.file));
      onUpload(fileList.files);

      // Simular progreso de carga
      setFilePreviews((prev) =>
        prev.map((p) =>
          p.status === "pending" ? { ...p, status: "uploading" } : p,
        ),
      );
    }
  };

  const clearAll = () => {
    filePreviews.forEach((preview) => URL.revokeObjectURL(preview.preview));
    setFilePreviews([]);
    setShowPreviews(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const validFilesCount = filePreviews.filter(
    (p) => p.status === "pending",
  ).length;
  const totalSize = filePreviews.reduce((acc, p) => acc + p.file.size, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-6"
    >
      {/* Zona de carga principal */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 cursor-pointer
          ${
            isDragOver
              ? "border-purple-500 bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 scale-[1.02]"
              : "border-gray-300 dark:border-gray-600 bg-gradient-to-br from-white/60 to-gray-50/60 dark:from-slate-800/60 dark:to-slate-700/60 hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-50/60 hover:to-pink-50/60 dark:hover:from-purple-900/10 dark:hover:to-pink-900/10"
          }
          backdrop-blur-sm
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        {/* Efecto de brillo animado */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedFormats.join(",")}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="relative z-10 text-center space-y-4">
          <motion.div
            animate={
              isDragOver ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }
            }
            className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl"
          >
            <Upload className="w-8 h-8 text-white" />
          </motion.div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {isDragOver
                ? "¡Suelta las imágenes aquí!"
                : "Arrastra imágenes o haz clic para seleccionar"}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Formatos soportados:{" "}
              {acceptedFormats
                .map((f) => f.split("/")[1].toUpperCase())
                .join(", ")}{" "}
              • Máximo {maxFiles} archivos •
              {Math.round(maxSizePerFile / 1024 / 1024)}MB por archivo
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>IA Auto-detección</span>
            </div>
            <div className="flex items-center gap-1">
              <FileImage className="w-4 h-4 text-blue-500" />
              <span>Optimización automática</span>
            </div>
          </div>
        </div>
      </div>

      {/* Panel de vista previa */}
      <AnimatePresence>
        {showPreviews && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-white/80 to-gray-50/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-2xl p-6 shadow-xl"
          >
            {/* Header del panel */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {filePreviews.length} archivo
                    {filePreviews.length !== 1 ? "s" : ""} seleccionado
                    {filePreviews.length !== 1 ? "s" : ""}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {validFilesCount} válido{validFilesCount !== 1 ? "s" : ""} •{" "}
                    {formatFileSize(totalSize)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {validFilesCount > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startUpload}
                    disabled={isUploading}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {isUploading ? "Subiendo..." : "Subir"}
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearAll}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Grid de previsualizaciones */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filePreviews.map((preview, index) => (
                <motion.div
                  key={preview.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group"
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
                    <Image
                      src={preview.preview}
                      alt={preview.file.name}
                      fill
                      className="object-cover"
                    />

                    {/* Overlay de estado */}
                    <div
                      className={`absolute inset-0 flex items-center justify-center ${
                        preview.status === "error"
                          ? "bg-red-500/80"
                          : preview.status === "uploading"
                            ? "bg-blue-500/80"
                            : preview.status === "success"
                              ? "bg-green-500/80"
                              : "bg-black/0 group-hover:bg-black/20"
                      } transition-all duration-200`}
                    >
                      {preview.status === "error" && (
                        <AlertCircle className="w-6 h-6 text-white" />
                      )}
                      {preview.status === "uploading" && (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      )}
                      {preview.status === "success" && (
                        <CheckCircle className="w-6 h-6 text-white" />
                      )}
                      {preview.status === "pending" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(preview.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Info del archivo */}
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {preview.file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(preview.file.size)}
                    </p>
                    {preview.error && (
                      <p className="text-xs text-red-500 dark:text-red-400">
                        {preview.error}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
