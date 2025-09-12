"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Image as ImageIcon, Upload, X, Star, ArrowUp, ArrowDown } from "lucide-react"
import type { ProductData } from "@/app/admin/productos/[id]/page"

interface ProductImagesGalleryProps {
  productData: ProductData
  isEditing: boolean
  onChange: (updates: Partial<ProductData>) => void
}

export function ProductImagesGallery({
  productData,
  isEditing,
  onChange
}: ProductImagesGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    // Aquí iría la lógica para subir las imágenes
    console.log("Subiendo imágenes:", files)
    
    // Simular agregado de nuevas imágenes
    const newImages = Array.from(files).map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      alt: file.name,
      isPrimary: false,
      order: productData.images.length + index + 1
    }))

    onChange({
      images: [...productData.images, ...newImages]
    })
  }

  const removeImage = (imageId: string) => {
    const updatedImages = productData.images.filter(img => img.id !== imageId)
    onChange({ images: updatedImages })
    
    // Ajustar el índice seleccionado si es necesario
    if (selectedImageIndex >= updatedImages.length) {
      setSelectedImageIndex(Math.max(0, updatedImages.length - 1))
    }
  }

  const setPrimaryImage = (imageId: string) => {
    const updatedImages = productData.images.map(img => ({
      ...img,
      isPrimary: img.id === imageId
    }))
    onChange({ images: updatedImages })
  }

  const moveImage = (imageId: string, direction: 'up' | 'down') => {
    const currentIndex = productData.images.findIndex(img => img.id === imageId)
    if (currentIndex === -1) return

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= productData.images.length) return

    const updatedImages = [...productData.images]
    const [movedImage] = updatedImages.splice(currentIndex, 1)
    updatedImages.splice(newIndex, 0, movedImage)

    // Actualizar órdenes
    const imagesWithOrder = updatedImages.map((img, index) => ({
      ...img,
      order: index + 1
    }))

    onChange({ images: imagesWithOrder })
  }

  const primaryImage = productData.images.find(img => img.isPrimary) || productData.images[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-white/30 shadow-xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-xl">
          <ImageIcon className="w-6 h-6 text-pink-600 dark:text-pink-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Galería de Imágenes
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestión de imágenes del producto
          </p>
        </div>
      </div>

      {/* Imagen principal */}
      <div className="mb-6">
        <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No hay imagen principal</p>
              </div>
            </div>
          )}
          
          {primaryImage && (
            <div className="absolute top-3 left-3">
              <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                Principal
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Miniaturas */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Todas las imágenes ({productData.images.length})
        </h3>
        
        <div className="grid grid-cols-3 gap-3">
          {productData.images.map((image, index) => (
            <motion.div
              key={image.id}
              whileHover={{ scale: 1.05 }}
              className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                selectedImageIndex === index
                  ? 'border-purple-500 ring-2 ring-purple-500/30'
                  : 'border-white/20 hover:border-purple-300'
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
                      e.stopPropagation()
                      setPrimaryImage(image.id)
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
                      e.stopPropagation()
                      moveImage(image.id, 'up')
                    }}
                    className="p-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
                    title="Mover arriba"
                    disabled={index === 0}
                  >
                    <ArrowUp className="w-3 h-3" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      moveImage(image.id, 'down')
                    }}
                    className="p-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
                    title="Mover abajo"
                    disabled={index === productData.images.length - 1}
                  >
                    <ArrowDown className="w-3 h-3" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage(image.id)
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
          
          {/* Botón para agregar imágenes */}
          {isEditing && (
            <motion.label
              whileHover={{ scale: 1.05 }}
              className="relative aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-purple-400 transition-colors flex items-center justify-center bg-gray-50/50 dark:bg-slate-700/50"
            >
              <div className="text-center">
                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Agregar</span>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="sr-only"
              />
            </motion.label>
          )}
        </div>
      </div>

      {/* Información de la imagen seleccionada */}
      {productData.images[selectedImageIndex] && (
        <div className="p-4 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-slate-700/30 dark:to-slate-600/30 rounded-xl border border-white/20">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            Información de la imagen
          </h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Archivo:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {productData.images[selectedImageIndex].alt}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Orden:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {productData.images[selectedImageIndex].order}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Estado:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                productData.images[selectedImageIndex].isPrimary
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
              }`}>
                {productData.images[selectedImageIndex].isPrimary ? 'Principal' : 'Secundaria'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Instrucciones cuando no hay imágenes */}
      {productData.images.length === 0 && (
        <div className="text-center py-8">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No hay imágenes
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {isEditing 
              ? "Agrega imágenes del producto para mostrar a los clientes"
              : "Este producto no tiene imágenes configuradas"
            }
          </p>
          {isEditing && (
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all cursor-pointer">
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
  )
}
