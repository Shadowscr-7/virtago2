"use client"

import { motion } from "framer-motion"
import { Heart, ShoppingCart, Eye, Lock } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  name: string
  brand: string
  supplier: string
  image: string
  price?: number
  originalPrice?: number
  description?: string
  isAuthenticated?: boolean
  isFavorite?: boolean
  className?: string
}

export function ProductCard({ 
  name, 
  brand, 
  supplier, 
  image, 
  price, 
  originalPrice, 
  description,
  isAuthenticated = false,
  isFavorite = false,
  className 
}: ProductCardProps) {
  const hasDiscount = originalPrice && price && originalPrice > price
  const discountPercentage = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className={cn(
        "group relative bg-card rounded-xl border shadow-sm hover:shadow-xl transition-all duration-300",
        "overflow-hidden backdrop-blur-sm",
        className
      )}
    >
      {/* Efecto de gradiente en hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-pink-500/0 to-cyan-500/0 group-hover:from-purple-500/5 group-hover:via-pink-500/5 group-hover:to-cyan-500/5 transition-all duration-500" />
      
      {/* Badge de descuento */}
      {hasDiscount && isAuthenticated && (
        <motion.div
          initial={{ scale: 0, rotate: -12 }}
          animate={{ scale: 1, rotate: -12 }}
          className="absolute top-2 left-2 z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full"
        >
          -{discountPercentage}%
        </motion.div>
      )}

      {/* Botón de favoritos */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="absolute top-2 right-2 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background transition-colors"
      >
        <Heart 
          className={cn(
            "h-4 w-4 transition-colors",
            isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"
          )} 
        />
      </motion.button>

      {/* Imagen del producto */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={image || "/placeholder-product.jpg"}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay con acciones */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-black/20 flex items-center justify-center gap-2"
        >
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
          >
            <Eye className="h-4 w-4 text-gray-700" />
          </motion.button>
          
          {isAuthenticated && (
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              whileHover={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="p-2 rounded-full bg-primary hover:bg-primary/90 transition-colors"
            >
              <ShoppingCart className="h-4 w-4 text-primary-foreground" />
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-2">
        {/* Marca y proveedor */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="bg-secondary px-2 py-1 rounded-full">{brand}</span>
          <span>{supplier}</span>
        </div>

        {/* Nombre del producto */}
        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
          {name}
        </h3>

        {/* Descripción */}
        {description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}

        {/* Precio o mensaje de autenticación */}
        <div className="pt-2">
          {isAuthenticated ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {hasDiscount ? (
                  <>
                    <span className="text-lg font-bold text-foreground">
                      ${price?.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      ${originalPrice?.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-bold text-foreground">
                    ${price?.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800"
            >
              <Lock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <div className="text-xs">
                <p className="font-medium text-purple-700 dark:text-purple-300">
                  Inicie sesión para ver precios
                </p>
                <p className="text-purple-600 dark:text-purple-400">
                  Precios exclusivos B2B
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Botón de acción */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={!isAuthenticated}
          className={cn(
            "w-full mt-3 py-2 rounded-lg font-medium text-sm transition-all duration-300",
            isAuthenticated
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {isAuthenticated ? "Agregar al carrito" : "Requiere autenticación"}
        </motion.button>
      </div>
    </motion.div>
  )
}
