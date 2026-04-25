"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Lock, Package } from "lucide-react";
import Image from "next/image";
import { useTheme } from "@/contexts/theme-context";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  id?: string;
  name: string;
  brand: string;
  supplier: string;
  image: string;
  price?: number;
  originalPrice?: number;
  description?: string;
  isAuthenticated?: boolean;
  isFavorite?: boolean;
  className?: string;
  productImages?: Array<{
    url: string;
    blurDataURL?: string;
    alt?: string;
    isPrimary?: boolean;
  }>;
  pricing?: {
    base_price: number;
    final_price: number;
    total_savings: number;
    percentage_saved: string | number;
    has_discount: boolean;
  };
}

const formatPrice = (p: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(p);

export function ProductCard({
  id,
  name,
  brand,
  supplier,
  image,
  price,
  originalPrice,
  description,
  isAuthenticated = false,
  isFavorite = false,
  className,
  productImages,
  pricing,
}: ProductCardProps) {
  const { themeColors } = useTheme();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const primaryImage = productImages
    ? productImages.find((img) => img.isPrimary) || productImages[0]
    : null;
  const displayImageUrl = primaryImage?.url || image || null;

  const handleCardClick = () => {
    if (isAuthenticated) {
      if (id) router.push(`/producto/${id}`);
    } else {
      setShowAuthModal(true);
    }
  };

  const hasDiscount =
    pricing?.has_discount ??
    (originalPrice != null && price != null && originalPrice > price);
  const discountPercent =
    pricing?.percentage_saved ??
    (hasDiscount && originalPrice && price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0);

  return (
    <>
      <motion.div
        className={`group rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border overflow-hidden${className ? ` ${className}` : ""}`}
        style={{ backgroundColor: themeColors.background, borderColor: themeColors.border }}
      >
        <div
          className="relative aspect-square overflow-hidden cursor-pointer"
          onClick={handleCardClick}
        >
          {displayImageUrl ? (
            <Image
              src={displayImageUrl}
              alt={primaryImage?.alt || name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              placeholder={primaryImage?.blurDataURL ? 'blur' : 'empty'}
              blurDataURL={primaryImage?.blurDataURL}
            />
          ) : (
            <div
              className="w-full h-full flex flex-col items-center justify-center"
              style={{ backgroundColor: themeColors.surface }}
            >
              <Package className="w-10 h-10 sm:w-16 sm:h-16 mb-1 sm:mb-2" style={{ color: themeColors.text.muted }} />
              <span className="text-xs sm:text-sm font-medium" style={{ color: themeColors.text.muted }}>
                Sin imagen
              </span>
            </div>
          )}

          {hasDiscount && isAuthenticated && (
            <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{discountPercent}%
            </div>
          )}

          <button
            className="absolute top-3 right-3 z-10 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: isFavorite ? '#ef4444' : 'rgba(255,255,255,0.9)' }}
            onClick={(e) => e.stopPropagation()}
            aria-label="Favorito"
          >
            <Heart
              className="w-4 h-4"
              style={{ color: isFavorite ? '#ffffff' : '#374151' }}
              fill={isFavorite ? '#ffffff' : 'none'}
            />
          </button>

          {isAuthenticated && (
            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button
                className="w-full py-2 rounded-lg text-sm font-semibold text-white transition-all active:scale-95"
                style={{ backgroundColor: themeColors.primary }}
                onClick={(e) => e.stopPropagation()}
              >
                Agregar al carrito
              </button>
            </div>
          )}
        </div>

        <div className="p-2 sm:p-4">
          <h3
            className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2 line-clamp-2 transition-colors cursor-pointer leading-snug"
            style={{ color: themeColors.text.primary }}
            onClick={handleCardClick}
          >
            {name}
          </h3>

          <div className="mb-1 sm:mb-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 flex-wrap">
                {price != null && (
                  <span
                    className="text-base sm:text-2xl font-bold"
                    style={{ color: themeColors.primary }}
                  >
                    {formatPrice(price)}
                  </span>
                )}
                {originalPrice != null &&
                  price != null &&
                  originalPrice > price && (
                    <span
                      className="text-xs sm:text-sm line-through"
                      style={{ color: themeColors.text.muted }}
                    >
                      {formatPrice(originalPrice)}
                    </span>
                  )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full flex items-center gap-1.5 p-1.5 sm:p-3 rounded-lg border transition-colors text-left"
                style={{
                  borderColor: themeColors.border,
                  backgroundColor: themeColors.surface,
                }}
              >
                <Lock
                  className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                  style={{ color: themeColors.primary }}
                />
                <div>
                  <p
                    className="text-xs font-semibold leading-tight"
                    style={{ color: themeColors.primary }}
                  >
                    <span className="hidden sm:inline">Inicia sesion para ver el precio</span>
                    <span className="sm:hidden">Ver precio</span>
                  </p>
                  <p
                    className="text-xs hidden sm:block"
                    style={{ color: themeColors.text.muted }}
                  >
                    Precios exclusivos B2B
                  </p>
                </div>
              </button>
            )}
          </div>

          {brand && (
            <div className="hidden sm:flex flex-wrap gap-1 mt-2">
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  backgroundColor: themeColors.surface,
                  color: themeColors.text.secondary,
                }}
              >
                {brand}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showAuthModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowAuthModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="rounded-2xl shadow-2xl p-6 max-w-sm w-full pointer-events-auto"
                style={{
                  backgroundColor: themeColors.background,
                  border: `1px solid ${themeColors.border}`,
                }}
              >
                <div className="flex justify-center mb-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: themeColors.surface }}
                  >
                    <Lock className="w-8 h-8" style={{ color: themeColors.primary }} />
                  </div>
                </div>

                <h3
                  className="text-lg font-bold text-center mb-2"
                  style={{ color: themeColors.text.primary }}
                >
                  Iniciá sesión para continuar
                </h3>

                <p
                  className="text-sm text-center mb-6"
                  style={{ color: themeColors.text.secondary }}
                >
                  Para ver el detalle del producto y acceder a precios exclusivos B2B necesitás estar registrado.
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setShowAuthModal(false);
                      router.push('/login');
                    }}
                    className="w-full py-3 rounded-xl font-semibold text-white transition-all active:scale-95"
                    style={{
                      background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                    }}
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => setShowAuthModal(false)}
                    className="w-full py-3 rounded-xl font-medium transition-all active:scale-95 border"
                    style={{
                      borderColor: themeColors.border,
                      color: themeColors.text.secondary,
                      backgroundColor: 'transparent',
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
