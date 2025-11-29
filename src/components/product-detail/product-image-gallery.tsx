"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Package } from "lucide-react";
import Image from "next/image";
import { useTheme } from "@/contexts/theme-context";

interface ProductImage {
  url: string;
  blurDataURL?: string;
  alt?: string;
  isPrimary?: boolean;
}

interface ProductImageGalleryProps {
  images?: string[] | ProductImage[];
  productName: string;
}

export function ProductImageGallery({
  images = [],
  productName,
}: ProductImageGalleryProps) {
  const { themeColors } = useTheme();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  // Normalizar imágenes a formato objeto
  const normalizedImages: ProductImage[] = images.map(img => 
    typeof img === 'string' 
      ? { url: img } 
      : img
  );

  const hasImages = normalizedImages.length > 0;
  const currentImage = normalizedImages[currentImageIndex];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x, y });
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div 
        className="relative aspect-square rounded-2xl overflow-hidden border-2"
        style={{
          backgroundColor: themeColors.surface,
          borderColor: themeColors.primary + "30"
        }}
      >
        {hasImages ? (
          <div
            className="relative w-full h-full cursor-zoom-in"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
          >
            <Image
              src={currentImage.url}
              alt={currentImage.alt || `${productName} - Imagen ${currentImageIndex + 1}`}
              fill
              className={`object-cover transition-transform duration-300 ${
                isZoomed ? "scale-150" : "scale-100"
              }`}
              style={
                isZoomed
                  ? {
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    }
                  : {}
              }
              placeholder={currentImage.blurDataURL ? "blur" : "empty"}
              blurDataURL={currentImage.blurDataURL}
              priority
            />
          </div>
        ) : (
          <div 
            className="w-full h-full flex flex-col items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${themeColors.surface}80, ${themeColors.primary}10)`
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <div 
                className="p-8 rounded-full mb-4"
                style={{
                  backgroundColor: themeColors.primary + "20"
                }}
              >
                <Package 
                  className="w-24 h-24"
                  style={{ color: themeColors.primary }}
                />
              </div>
              <h3 
                className="text-2xl font-bold mb-2"
                style={{ color: themeColors.text.primary }}
              >
                Sin imagen disponible
              </h3>
              <p style={{ color: themeColors.text.secondary }}>
                Imagen del producto próximamente
              </p>
            </motion.div>
          </div>
        )}

        {/* Navigation Arrows */}
        {hasImages && normalizedImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 backdrop-blur-sm p-3 rounded-full shadow-lg transition-all hover:scale-110"
              style={{
                backgroundColor: themeColors.surface + "90",
                color: themeColors.text.primary
              }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 backdrop-blur-sm p-3 rounded-full shadow-lg transition-all hover:scale-110"
              style={{
                backgroundColor: themeColors.surface + "90",
                color: themeColors.text.primary
              }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Zoom Indicator */}
        {hasImages && (
          <div 
            className="absolute top-4 right-4 backdrop-blur-sm p-2 rounded-full"
            style={{
              backgroundColor: themeColors.surface + "90",
              color: themeColors.text.primary
            }}
          >
            {isZoomed ? (
              <ZoomOut className="w-4 h-4" />
            ) : (
              <ZoomIn className="w-4 h-4" />
            )}
          </div>
        )}

        {/* Image Counter */}
        {hasImages && normalizedImages.length > 1 && (
          <div 
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium"
            style={{
              backgroundColor: themeColors.primary,
              color: "white"
            }}
          >
            {currentImageIndex + 1} / {normalizedImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Grid */}
      {hasImages && normalizedImages.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {normalizedImages.map((image, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className="relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300"
              style={{
                borderColor: index === currentImageIndex 
                  ? themeColors.primary 
                  : themeColors.primary + "30",
                boxShadow: index === currentImageIndex 
                  ? `0 0 0 3px ${themeColors.primary}30` 
                  : "none"
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src={image.url}
                alt={image.alt || `${productName} - Miniatura ${index + 1}`}
                fill
                className="object-cover"
                placeholder={image.blurDataURL ? "blur" : "empty"}
                blurDataURL={image.blurDataURL}
              />
            </motion.button>
          ))}
        </div>
      )}

      {/* Image Tips */}
      {hasImages && (
        <div 
          className="text-center text-sm"
          style={{ color: themeColors.text.secondary }}
        >
          <p>
            Pasa el cursor sobre la imagen para hacer zoom{normalizedImages.length > 1 && ' • Click en las miniaturas para cambiar'}
          </p>
        </div>
      )}
    </div>
  );
}
