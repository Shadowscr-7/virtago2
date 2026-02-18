/**
 * Modal de Upload de Imágenes con Cloudinary
 * Permite subir múltiples imágenes con previsualización
 * y envío automático al backend para análisis
 */

"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { toast } from "sonner";
import { AIProgressBar } from "./ai-progress-bar";
import { ImageMatchResults } from "./image-match-results";

// Configuración de Cloudinary desde variables de entorno
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dyy8hc876";
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "virtago";

interface UploadedImage {
  file: File;
  preview: string;
  cloudinaryUrl?: string;
  publicId?: string;
  status: "pending" | "uploading" | "uploaded" | "analyzing" | "completed" | "error";
  progress: number;
  error?: string;
  analysisResult?: Record<string, unknown>;
  isApproved?: boolean; // ✅ Para marcar si el usuario aprobó el match
}

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (images: UploadedImage[]) => void;
}

export function ImageUploadModal({
  isOpen,
  onClose,
  onComplete,
}: ImageUploadModalProps) {
  const { themeColors } = useTheme();
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false); // ✅ Estado para asignación
  const [useAI, setUseAI] = useState(true); // 🎯 Switch para modo AI o modo simple

  // Validar archivo de imagen
  const validateImageFile = (file: File): { valid: boolean; error?: string } => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: "Formato no válido. Solo JPG, PNG o WEBP",
      };
    }

    if (file.size > maxSize) {
      return { valid: false, error: "Archivo muy grande (máx. 10MB)" };
    }

    return { valid: true };
  };

  // Manejar selección de archivos
  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const newImages: UploadedImage[] = [];

      Array.from(files).forEach((file) => {
        const validation = validateImageFile(file);

        if (!validation.valid) {
          toast.error(`${file.name}: ${validation.error}`);
          return;
        }

        // Crear preview
        const preview = URL.createObjectURL(file);

        newImages.push({
          file,
          preview,
          status: "pending",
          progress: 0,
        });
      });

      setImages((prev) => [...prev, ...newImages]);
      toast.success(`${newImages.length} imagen(es) agregada(s)`);
    },
    []
  );

  // Drag & Drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  // Eliminar imagen
  const removeImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // Subir una imagen a Cloudinary
  const uploadToCloudinary = async (
    image: UploadedImage,
    index: number
  ): Promise<{ url: string; publicId: string }> => {
    const formData = new FormData();
    formData.append("file", image.file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Progreso de subida
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setImages((prev) => {
            const newImages = [...prev];
            newImages[index] = { ...newImages[index], progress };
            return newImages;
          });
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve({
            url: response.secure_url,
            publicId: response.public_id,
          });
        } else {
          reject(new Error("Error al subir imagen"));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Error de red"));
      });

      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
      );
      xhr.send(formData);
    });
  };

  // Procesar todas las imágenes
  const handleUploadAll = async () => {
    if (images.length === 0) {
      toast.error("No hay imágenes para subir");
      return;
    }

    setIsProcessing(true);

    try {
      // Fase 1: Subir todas las imágenes a Cloudinary
      const uploadedImages: Array<{ imageUrl: string; metadata: { filename: string; size: number; format: string }; index: number }> = [];

      for (let i = 0; i < images.length; i++) {
        const image = images[i];

        if (image.status === "completed") continue;

        try {
          // Actualizar estado a "uploading"
          setImages((prev) => {
            const newImages = [...prev];
            newImages[i] = { ...newImages[i], status: "uploading" };
            return newImages;
          });

          // Subir a Cloudinary
          const { url, publicId } = await uploadToCloudinary(image, i);

          setImages((prev) => {
            const newImages = [...prev];
            newImages[i] = {
              ...newImages[i],
              cloudinaryUrl: url,
              publicId,
              status: "uploaded",
              progress: 100,
            };
            return newImages;
          });

          uploadedImages.push({
            imageUrl: url,
            metadata: {
              filename: image.file.name,
              size: image.file.size,
              format: image.file.type,
            },
            index: i,
          });
        } catch (error) {
          console.error("Error subiendo imagen:", error);

          setImages((prev) => {
            const newImages = [...prev];
            newImages[i] = {
              ...newImages[i],
              status: "error",
              error: error instanceof Error ? error.message : "Error al subir",
            };
            return newImages;
          });

          toast.error(`Error subiendo ${image.file.name}`);
        }
      }

      if (uploadedImages.length === 0) {
        toast.error("No se pudieron subir las imágenes");
        setIsProcessing(false);
        return;
      }

      // Fase 2: Procesar cada imagen individualmente para tener progreso granular
      const token = localStorage.getItem('auth_token') || localStorage.getItem('jwt_token');
      
      for (const uploadedImg of uploadedImages) {
        const { imageUrl, metadata, index } = uploadedImg;

        try {
          // Actualizar a "analyzing"
          setImages((prev) => {
            const newImages = [...prev];
            newImages[index] = { ...newImages[index], status: "analyzing" };
            return newImages;
          });

          // Llamar al API para esta imagen específica
          const response = await fetch("/api/product-images", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token && { "Authorization": `Bearer ${token}` }),
            },
            body: JSON.stringify({
              images: [{ imageUrl, metadata }], // Solo esta imagen
              useAI, // 🎯 Pasar el modo seleccionado
            }),
          });

          if (!response.ok) {
            throw new Error("Error al analizar imagen");
          }

          const analysisResponse = await response.json();

          // 🎯 Si useAI es false, marcar como completado sin análisis
          if (!useAI) {
            setImages((prev) => {
              const newImages = [...prev];
              newImages[index] = {
                ...newImages[index],
                status: "completed",
                analysisResult: undefined, // Sin resultado de análisis
              };
              return newImages;
            });

            toast.success(`${metadata.filename} subida exitosamente`);
            continue; // Pasar a la siguiente imagen
          }

          // Actualizar con resultado (solo si useAI es true)
          if (analysisResponse.success && analysisResponse.results && analysisResponse.results.length > 0) {
            const result = analysisResponse.results[0];
            
            // Log para debugging
            console.log('📊 Resultado del análisis:', {
              imageUrl: result.imageUrl,
              matchScore: result.matchScore,
              visionData: result.visionData,
              hasMatch: !!result.matchedProduct,
              matchedProduct: result.matchedProduct,
              allMatches: result.allMatches
            });
            
            setImages((prev) => {
              const newImages = [...prev];
              newImages[index] = {
                ...newImages[index],
                status: "completed",
                analysisResult: result,
              };
              return newImages;
            });

            toast.success(`${metadata.filename} procesada exitosamente`);
          } else {
            throw new Error(analysisResponse.errors?.[0]?.message || "No se pudo analizar");
          }
        } catch (error) {
          console.error(`Error analizando ${metadata.filename}:`, error);

          setImages((prev) => {
            const newImages = [...prev];
            newImages[index] = {
              ...newImages[index],
              status: "error",
              error: error instanceof Error ? error.message : "Error al analizar",
            };
            return newImages;
          });

          toast.error(`Error analizando ${metadata.filename}`);
        }
      }

      const completedImages = images.filter((img) => img.status === "completed");
      if (completedImages.length > 0) {
        const successMessage = useAI
          ? `${completedImages.length} imagen(es) procesada(s) exitosamente`
          : `${completedImages.length} imagen(es) subida(s) exitosamente`;
        
        toast.success(successMessage);
        
        if (onComplete) {
          onComplete(completedImages);
        }

        // 🎯 Si es modo "Solo Subir", cerrar automáticamente el modal
        if (!useAI) {
          // Esperar un momento para que el usuario vea el mensaje
          setTimeout(() => {
            // Limpiar previews antes de cerrar
            images.forEach((img) => URL.revokeObjectURL(img.preview));
            setImages([]);
            onClose();
          }, 1500);
        }
      }
    } catch (error) {
      console.error("Error procesando batch:", error);
      toast.error("Error procesando las imágenes");
    } finally {
      setIsProcessing(false);
    }
  };

  // Cerrar modal
  const handleClose = () => {
    if (isProcessing) {
      toast.error("Espera a que termine el procesamiento");
      return;
    }

    // Limpiar previews
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
    onClose();
  };

  // ✅ Aprobar/rechazar un match individual
  const toggleApproval = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      newImages[index] = {
        ...newImages[index],
        isApproved: !newImages[index].isApproved,
      };
      return newImages;
    });
  };

  // ✅ Seleccionar un producto de las coincidencias parciales
  const handleSelectProduct = (imageIndex: number, productId: string) => {
    setImages((prev) => {
      const newImages = [...prev];
      const img = newImages[imageIndex];
      if (!img.analysisResult) return newImages;

      const result = img.analysisResult as Record<string, unknown>;
      const allMatches = (result.allMatches || []) as Array<{
        product: Record<string, unknown>;
        score: number;
        matchReasons?: string[];
      }>;

      // Encontrar el producto seleccionado en allMatches
      const selectedMatch = allMatches.find(
        (m) => (m.product.id || m.product.prodVirtaId) === productId
      );

      if (selectedMatch) {
        newImages[imageIndex] = {
          ...img,
          analysisResult: {
            ...result,
            matchedProduct: selectedMatch.product,
            matchScore: selectedMatch.score,
          },
          isApproved: true, // Auto-aprobar al seleccionar
        };
        toast.success(`Producto seleccionado: ${selectedMatch.product.nombre || 'Sin nombre'}`);
      }

      return newImages;
    });
  };

  // ✅ Asignar imágenes aprobadas a productos
  const handleAssignImages = async () => {
    const approvedImages = images.filter((img) => img.isApproved && img.analysisResult);

    if (approvedImages.length === 0) {
      toast.error("Debes aprobar al menos una imagen");
      return;
    }

    setIsAssigning(true);

    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('jwt_token');
      let successCount = 0;
      let errorCount = 0;

      for (const img of approvedImages) {
        const result = img.analysisResult as {
          imageUrl: string;
          matchedProduct?: { prodVirtaId: string };
          visionData?: { productName?: string; brand?: string; confidence?: number };
        };

        if (!result.matchedProduct?.prodVirtaId) {
          console.warn('Imagen sin prodVirtaId:', result);
          errorCount++;
          continue;
        }

        try {
          const response = await fetch("/api/product-images/assign", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token && { "Authorization": `Bearer ${token}` }),
            },
            body: JSON.stringify({
              imageUrl: result.imageUrl,
              prodVirtaId: result.matchedProduct.prodVirtaId,
              visionData: result.visionData || {},
              metadata: {
                filename: img.file.name,
                size: img.file.size,
                format: img.file.type,
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
          console.error(`Error asignando ${img.file.name}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} imagen(es) asignada(s) exitosamente`);
      }
      
      if (errorCount > 0) {
        toast.error(`${errorCount} imagen(es) con error al asignar`);
      }

      if (successCount === approvedImages.length) {
        // Cerrar modal si todas fueron exitosas
        handleClose();
      }
    } catch (error) {
      console.error("Error en asignación:", error);
      toast.error("Error al asignar imágenes");
    } finally {
      setIsAssigning(false);
    }
  };

  // Renderizar icono de estado
  const renderStatusIcon = (status: UploadedImage["status"]) => {
    switch (status) {
      case "uploading":
      case "analyzing":
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  // Texto de estado
  const getStatusText = (status: UploadedImage["status"]) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "uploading":
        return "Subiendo...";
      case "uploaded":
        return "Subida";
      case "analyzing":
        return useAI ? "Analizando..." : "Guardando...";
      case "completed":
        return "Completada";
      case "error":
        return "Error";
      default:
        return "";
    }
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
          className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl"
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
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Cargar Imágenes
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Sube múltiples imágenes para análisis automático
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              disabled={isProcessing}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Switch de Modo AI */}
          <div className="px-6 py-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  {useAI ? "Subir y Auto-asignar" : "Solo Subir"}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {useAI
                    ? "Las imágenes se subirán, analizarán con IA y se auto-asignarán a productos"
                    : "Las imágenes solo se subirán a Cloudinary sin analizar ni asignar"}
                </p>
              </div>
              <button
                onClick={() => setUseAI(!useAI)}
                disabled={isProcessing || isAssigning}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 disabled:opacity-50 ${
                  useAI ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                    useAI ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Drop Zone */}
            {images.length === 0 && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                  isDragging
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <input
                  type="file"
                  id="image-upload"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />

                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center gap-4"
                >
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center"
                    style={{
                      background: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
                    }}
                  >
                    <ImageIcon className="w-12 h-12 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      Arrastra imágenes aquí o haz clic para seleccionar
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      JPG, PNG o WEBP (máx. 10MB por archivo)
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      Puedes seleccionar múltiples archivos
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="space-y-4">
                {/* Add more button */}
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {images.length} imagen(es) seleccionada(s)
                  </p>
                  <input
                    type="file"
                    id="add-more-images"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                  />
                  <label
                    htmlFor="add-more-images"
                    className="px-4 py-2 text-sm font-medium text-white rounded-lg cursor-pointer transition-all"
                    style={{
                      background: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
                    }}
                  >
                    + Agregar más
                  </label>
                </div>

                {/* Image Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative group rounded-xl overflow-hidden bg-white/5 border border-white/10"
                    >
                      {/* Image Preview */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.preview}
                        alt={image.file.name}
                        className="w-full h-48 object-cover"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 flex flex-col justify-between">
                        {/* Status and Delete */}
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            {renderStatusIcon(image.status)}
                          </div>
                          {image.status === "pending" && (
                            <button
                              onClick={() => removeImage(index)}
                              className="p-1 rounded-lg bg-red-500/80 hover:bg-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                            </button>
                          )}
                        </div>

                        {/* Info */}
                        <div>
                          <p className="text-xs text-white font-medium truncate">
                            {image.file.name}
                          </p>
                          <p className="text-xs text-gray-300">
                            {(image.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <p className="text-xs text-gray-300">
                            {getStatusText(image.status)}
                          </p>

                          {/* Progress Bar */}
                          {(image.status === "uploading" ||
                            image.status === "analyzing") && (
                            <div className="mt-2 w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full bg-white transition-all duration-300"
                                style={{ width: `${image.progress}%` }}
                              />
                            </div>
                          )}

                          {/* Error Message */}
                          {image.error && (
                            <p className="text-xs text-red-300 mt-1">
                              {image.error}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* AI Progress Bar - Mostrar durante procesamiento SOLO si useAI es true */}
                {isProcessing && useAI && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <AIProgressBar
                      currentStep={images.filter(
                        (img) =>
                          img.status === "completed" ||
                          img.status === "error"
                      ).length}
                      totalSteps={images.filter(
                        (img) => img.status !== "pending"
                      ).length} // Solo contar las que se están procesando
                      currentImageName={
                        images.find(
                          (img) => img.status === "analyzing"
                        )?.file.name
                      }
                      stage={
                        images.some((img) => img.status === "analyzing")
                          ? "analyzing"
                          : images.every((img) => 
                              img.status === "completed" || 
                              img.status === "error" ||
                              img.status === "pending"
                            )
                          ? "completed"
                          : "matching"
                      }
                    />
                  </motion.div>
                )}

                {/* Resultados del Matching - Mostrar imágenes completadas SOLO si useAI es true */}
                {useAI && images.some((img) => img.status === "completed" && img.analysisResult) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 space-y-4"
                  >
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Resultados del Análisis
                    </h3>
                    
                    {images
                      .filter((img) => img.status === "completed" && img.analysisResult)
                      .map((img, idx) => {
                        // Encontrar el índice real en el array de images
                        const realIndex = images.findIndex(
                          (i) => i.status === "completed" && i.analysisResult === img.analysisResult
                        );
                        
                        return (
                          <ImageMatchResults
                            key={idx}
                            result={img.analysisResult as unknown as {
                              imageUrl: string;
                              matchScore: number;
                              matchedProduct: {
                                id: string;
                                nombre: string;
                                codigo?: string;
                                precio?: number;
                                categoria?: string;
                                imagen?: string;
                              } | null;
                              visionData: {
                                description?: string;
                                detectedFeatures?: string[];
                                suggestedCategory?: string;
                                detectedBrand?: string;
                              };
                              allMatches?: Array<{
                                product: {
                                  id: string;
                                  nombre: string;
                                  codigo?: string;
                                  precio?: number;
                                  categoria?: string;
                                  imagen?: string;
                                };
                                score: number;
                                matchReasons?: string[];
                              }>;
                              processingTime: number;
                            }}
                            isApproved={img.isApproved}
                            onToggleApproval={() => toggleApproval(realIndex)}
                            onSelectProduct={(productId) => handleSelectProduct(realIndex, productId)}
                          />
                        );
                      })}
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {images.length > 0 && (
            <div className="p-6 border-t border-white/10 flex justify-between items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {images.filter((img) => img.status === "completed").length} /{" "}
                {images.length} completadas
                {images.some((img) => img.isApproved) && (
                  <span className="ml-3 text-green-500 font-medium">
                    • {images.filter((img) => img.isApproved).length} aprobadas
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  disabled={isProcessing || isAssigning}
                  className="px-6 py-2 rounded-lg font-medium transition-all bg-white/10 hover:bg-white/20 disabled:opacity-50"
                >
                  {isProcessing || isAssigning 
                    ? "Procesando..." 
                    : (!useAI && images.every((img) => img.status === "completed" || img.status === "error"))
                    ? "Cerrar"
                    : "Cancelar"}
                </button>
                
                {/* Mostrar botón de análisis si hay imágenes pendientes */}
                {images.some((img) => img.status === "pending") && (
                  <button
                    onClick={handleUploadAll}
                    disabled={isProcessing || isAssigning}
                    className="px-6 py-2 text-white rounded-lg font-medium transition-all shadow-lg disabled:opacity-50"
                    style={{
                      background: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
                    }}
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Procesando...
                      </span>
                    ) : useAI ? (
                      "Subir y Auto-asignar"
                    ) : (
                      "Solo Subir"
                    )}
                  </button>
                )}

                {/* Mostrar botón de asignar si hay imágenes aprobadas Y si useAI es true */}
                {useAI && images.some((img) => img.isApproved) && (
                  <button
                    onClick={handleAssignImages}
                    disabled={isProcessing || isAssigning}
                    className="px-6 py-2 text-white rounded-lg font-medium transition-all shadow-lg disabled:opacity-50 bg-green-600 hover:bg-green-700"
                  >
                    {isAssigning ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Asignando...
                      </span>
                    ) : (
                      `Asignar ${images.filter((img) => img.isApproved).length} Imagen(es)`
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
