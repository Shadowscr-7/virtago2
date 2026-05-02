"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Image as ImageIcon,
  Upload,
  X,
  Star,
  ArrowUp,
  ArrowDown,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { ProductData } from "@/app/admin/productos/[id]/page";
import { uploadMultipleImages, type UploadProgress } from "@/services/cloudinary";

interface ProductImagesGalleryProps {
  productData: ProductData;
  isEditing: boolean;
  onChange: (updates: Partial<ProductData>) => void;
}

interface UploadingImage {
  id: string;
  preview: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export function ProductImagesGallery({
  productData,
  isEditing,
  onChange,
}: ProductImagesGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Validar archivos
    const validFiles: File[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} no es una imagen válida`);
        continue;
      }
      if (file.size > maxSize) {
        toast.error(`${file.name} es muy grande (máx. 10MB)`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Crear objetos de upload con preview
    const uploadItems: UploadingImage[] = validFiles.map((file, index) => ({
      id: `uploading-${Date.now()}-${index}`,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: 'uploading' as const,
    }));

    setUploadingImages(uploadItems);
    setIsUploading(true);

    try {
      // Subir a Cloudinary con progreso
      const uploadResults = await uploadMultipleImages(
        validFiles,
        (fileIndex, progress: UploadProgress) => {
          setUploadingImages((prev) => {
            const updated = [...prev];
            if (updated[fileIndex]) {
              updated[fileIndex].progress = progress.percentage;
            }
            return updated;
          });
        }
      );

      // Marcar como completadas
      setUploadingImages((prev) =>
        prev.map((img) => ({ ...img, status: 'completed' as const }))
      );

      // Agregar las nuevas imágenes al producto
      const newImages = uploadResults.map((result, index) => ({
        id: `img-${Date.now()}-${index}`,
        url: result.url,
        blurDataURL: result.blurDataURL,
        alt: validFiles[index].name.replace(/\.[^/.]+$/, ''),
        isPrimary: productData.images.length === 0 && index === 0,
        order: productData.images.length + index + 1,
      }));

      onChange({
        images: [...productData.images, ...newImages],
      });

      toast.success(`${uploadResults.length} imagen(es) subida(s) exitosamente`);

      // Limpiar uploading después de 2 segundos
      setTimeout(() => {
        setUploadingImages([]);
        setIsUploading(false);
      }, 2000);
    } catch (error) {
      console.error('Error subiendo imágenes:', error);
      toast.error('Error al subir las imágenes');

      setUploadingImages((prev) =>
        prev.map((img) => ({
          ...img,
          status: 'error' as const,
          error: 'Error al subir',
        }))
      );

      setTimeout(() => {
        setUploadingImages([]);
        setIsUploading(false);
      }, 3000);
    }
  };

  const removeImage = (imageId: string) => {
    const updatedImages = productData.images.filter(
      (img) => img.id !== imageId,
    );
    onChange({ images: updatedImages });

    if (selectedImageIndex >= updatedImages.length) {
      setSelectedImageIndex(Math.max(0, updatedImages.length - 1));
    }
  };

  const setPrimaryImage = (imageId: string) => {
    const updatedImages = productData.images.map((img) => ({
      ...img,
      isPrimary: img.id === imageId,
    }));
    onChange({ images: updatedImages });
  };

  const moveImage = (imageId: string, direction: "up" | "down") => {
    const currentIndex = productData.images.findIndex(
      (img) => img.id === imageId,
    );
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= productData.images.length) return;

    const updatedImages = [...productData.images];
    const [movedImage] = updatedImages.splice(currentIndex, 1);
    updatedImages.splice(newIndex, 0, movedImage);

    const imagesWithOrder = updatedImages.map((img, index) => ({
      ...img,
      order: index + 1,
    }));

    onChange({ images: imagesWithOrder });
  };

  const primaryImage =
    productData.images.find((img) => img.isPrimary) || productData.images[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-pink-50 rounded-xl">
          <ImageIcon className="w-6 h-6 text-pink-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Galería de Imágenes
          </h2>
          <p className="text-sm text-gray-500">
            Gestión de imágenes del producto
          </p>
        </div>
      </div>

      {/* Imagen principal */}
      <div className="mb-6">
        <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-sm">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <div className="text-center p-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-3xl flex items-center justify-center shadow-sm">
                    <ImageIcon className="w-16 h-16 text-gray-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-xl">📷</span>
                  </div>
                </motion.div>
                <p className="text-lg font-semibold text-gray-700 mb-1">
                  Sin imagen
                </p>
                <p className="text-sm text-gray-500">
                  {isEditing ? 'Sube una imagen para este producto' : 'No hay imagen principal'}
                </p>
              </div>
            </div>
          )}

          {primaryImage && (
            <div className="absolute top-3 left-3">
              <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                Principal
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Miniaturas */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Todas las imágenes ({productData.images.length})
        </h3>

        <div className="grid grid-cols-3 gap-3">
          {productData.images.map((image, index) => (
            <motion.div
              key={image.id}
              whileHover={{ scale: 1.05 }}
              className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                selectedImageIndex === index
                  ? "border-[#C8102E] ring-2 ring-[#C8102E]/20"
                  : "border-gray-200 hover:border-[#C8102E]/40"
              }`}
              onClick={() => setSelectedImageIndex(index)}
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 33vw, (max-width: 1200px) 16vw, 11vw"
              />

              {image.isPrimary && (
                <div className="absolute top-1 left-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                </div>
              )}

              {isEditing && (
                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPrimaryImage(image.id);
                    }}
                    className="p-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                    title="Establecer como principal"
                  >
                    <Star className="w-3 h-3" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      moveImage(image.id, "up");
                    }}
                    className="p-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                    title="Mover arriba"
                    disabled={index === 0}
                  >
                    <ArrowUp className="w-3 h-3" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      moveImage(image.id, "down");
                    }}
                    className="p-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                    title="Mover abajo"
                    disabled={index === productData.images.length - 1}
                  >
                    <ArrowDown className="w-3 h-3" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(image.id);
                    }}
                    className="p-1 bg-red-500 hover:bg-red-600 text-white rounded"
                    title="Eliminar imagen"
                  >
                    <X className="w-3 h-3" />
                  </motion.button>
                </div>
              )}
            </motion.div>
          ))}

          {/* Imágenes subiendo */}
          {uploadingImages.map((uploadImg) => (
            <motion.div
              key={uploadImg.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-square rounded-xl overflow-hidden border-2 border-[#C8102E]/40"
            >
              <Image
                src={uploadImg.preview}
                alt="Subiendo..."
                fill
                className="object-cover opacity-50"
                sizes="(max-width: 768px) 33vw, 11vw"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                {uploadImg.status === 'uploading' && (
                  <div className="text-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin mx-auto mb-2" />
                    <span className="text-xs text-white font-medium">
                      {uploadImg.progress}%
                    </span>
                  </div>
                )}
                {uploadImg.status === 'completed' && (
                  <CheckCircle className="w-8 h-8 text-green-400" />
                )}
                {uploadImg.status === 'error' && (
                  <div className="text-center">
                    <X className="w-6 h-6 text-red-400 mx-auto" />
                    <span className="text-xs text-red-300">{uploadImg.error}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Botón para agregar imágenes */}
          {isEditing && (
            <motion.label
              whileHover={{ scale: 1.05 }}
              className={`relative aspect-square border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#C8102E]/50 transition-colors flex items-center justify-center bg-gray-50 ${
                isUploading ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <div className="text-center">
                {isUploading ? (
                  <Loader2 className="w-6 h-6 text-gray-400 mx-auto mb-1 animate-spin" />
                ) : (
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                )}
                <span className="text-xs text-gray-500">
                  {isUploading ? 'Subiendo...' : 'Agregar'}
                </span>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="sr-only"
                disabled={isUploading}
              />
            </motion.label>
          )}
        </div>
      </div>

      {/* Información de la imagen seleccionada */}
      {productData.images[selectedImageIndex] && (
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">
            Información de la imagen
          </h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500">Archivo:</span>
              <span className="ml-2 text-gray-900">
                {productData.images[selectedImageIndex].alt}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Orden:</span>
              <span className="ml-2 text-gray-900">
                {productData.images[selectedImageIndex].order}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Estado:</span>
              <span
                className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                  productData.images[selectedImageIndex].isPrimary
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {productData.images[selectedImageIndex].isPrimary
                  ? "Principal"
                  : "Secundaria"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Instrucciones cuando no hay imágenes */}
      {productData.images.length === 0 && (
        <div className="text-center py-8">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay imágenes
          </h3>
          <p className="text-gray-500 mb-4">
            {isEditing
              ? "Agrega imágenes del producto para mostrar a los clientes"
              : "Este producto no tiene imágenes configuradas"}
          </p>
          {isEditing && (
            <label className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-xl transition-all cursor-pointer" style={{ backgroundColor: "#C8102E" }}>
              <Upload className="w-4 h-4" />
              <span>Subir imágenes</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="sr-only"
              />
            </label>
          )}
        </div>
      )}
    </motion.div>
  );
}
