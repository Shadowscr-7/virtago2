"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Star, 
  Heart, 
  Share2, 
  ShoppingCart, 
  Minus, 
  Plus, 
  Shield, 
  Truck, 
  RotateCcw,
  CreditCard,
  AlertCircle,
  Check
} from "lucide-react"
import { useCartStore } from "@/components/cart/cart-store"

interface ProductInfo {
  id: string
  name: string
  brand: string
  supplier: string
  images: string[]
  price: number
  originalPrice?: number
  description: string
  longDescription: string
  category: string
  subcategory: string
  inStock: boolean
  stockQuantity: number
  rating?: number
  reviews?: number
  tags: string[]
  warranty: string
  shipping: {
    free: boolean
    estimatedDays: string
    cost: number
  }
  supplier_info: {
    name: string
    rating: number
    reviews: number
    response_time: string
    verified: boolean
  }
}

interface ProductInfoPanelProps {
  product: ProductInfo
}

export function ProductInfoPanel({ product }: ProductInfoPanelProps) {
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  
  const { addItem } = useCartStore()

  const isOnSale = product.originalPrice && product.originalPrice > product.price
  const discountPercentage = isOnSale 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0
  
  const savings = isOnSale ? product.originalPrice! - product.price : 0

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stockQuantity) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      supplier: product.supplier_info.name,
      supplierId: product.supplier_info.name.toLowerCase().replace(/\s+/g, '-'),
      image: product.images[0] || '',
      price: product.price,
      originalPrice: product.originalPrice,
      quantity: quantity,
      inStock: product.inStock,
      stockQuantity: product.stockQuantity,
      category: product.category
    })
    // Reset quantity after adding
    setQuantity(1)
  }

  const totalPrice = product.price * quantity

  return (
    <div className="space-y-8">
      {/* Product Header */}
      <div className="space-y-4">
        {/* Brand and Tags */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-blue-600 dark:text-blue-400 font-semibold text-lg">
              {product.brand}
            </span>
            {product.supplier_info.verified && (
              <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full text-xs">
                <Shield className="w-3 h-3" />
                Verificado
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-full transition-colors ${
                isFavorite 
                  ? 'bg-red-500 text-white' 
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900'
              }`}
            >
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Product Name */}
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">
          {product.name}
        </h1>

        {/* Rating and Reviews */}
        {product.rating && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating!)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold text-slate-900 dark:text-white">
                {product.rating}
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                ({product.reviews?.toLocaleString()} reseñas)
              </span>
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
        <div className="space-y-3">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-slate-900 dark:text-white">
              ${product.price.toLocaleString()}
            </span>
            {isOnSale && (
              <>
                <span className="text-xl text-slate-400 line-through">
                  ${product.originalPrice!.toLocaleString()}
                </span>
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  -{discountPercentage}%
                </span>
              </>
            )}
          </div>
          {isOnSale && (
            <p className="text-green-600 dark:text-green-400 font-semibold">
              ¡Ahorras ${savings.toLocaleString()}!
            </p>
          )}
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Precio por unidad • Impuestos incluidos
          </p>
        </div>
      </div>

      {/* Stock Status */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-medium text-slate-900 dark:text-white">Disponibilidad:</span>
          <div className="flex items-center gap-2">
            {product.inStock ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-green-600 dark:text-green-400 font-semibold">
                  En stock ({product.stockQuantity} disponibles)
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-red-600 dark:text-red-400 font-semibold">
                  Sin stock
                </span>
              </>
            )}
          </div>
        </div>

        {product.inStock && product.stockQuantity < 10 && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <span className="text-orange-700 dark:text-orange-300 text-sm font-medium">
                ¡Pocas unidades disponibles! Solo quedan {product.stockQuantity}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quantity Selector */}
      {product.inStock && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-900 dark:text-white">Cantidad:</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              >
                <Minus className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>
              <span className="w-16 text-center font-semibold text-lg text-slate-900 dark:text-white">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= product.stockQuantity}
                className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>
            </div>
          </div>

          {/* Total Price */}
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Total ({quantity} {quantity === 1 ? 'unidad' : 'unidades'}):
              </span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${totalPrice.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <motion.button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          whileHover={{ scale: product.inStock ? 1.02 : 1 }}
          whileTap={{ scale: product.inStock ? 0.98 : 1 }}
          className={`w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
            product.inStock
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25'
              : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          {product.inStock ? 'Agregar al Carrito' : 'Sin Stock'}
        </motion.button>

        <button className="w-full py-3 px-6 rounded-xl font-semibold border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
          Comprar Ahora
        </button>
      </div>

      {/* Features */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
          Incluye:
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Truck className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800 dark:text-green-300">
                {product.shipping.free ? 'Envío Gratis' : `Envío $${product.shipping.cost}`}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                Entrega estimada: {product.shipping.estimatedDays}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Shield className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-300">
                Garantía
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {product.warranty}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <RotateCcw className="w-5 h-5 text-purple-600" />
            <div>
              <p className="font-medium text-purple-800 dark:text-purple-300">
                Devoluciones
              </p>
              <p className="text-sm text-purple-600 dark:text-purple-400">
                30 días para devoluciones
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <CreditCard className="w-5 h-5 text-orange-600" />
            <div>
              <p className="font-medium text-orange-800 dark:text-orange-300">
                Pago Seguro
              </p>
              <p className="text-sm text-orange-600 dark:text-orange-400">
                Múltiples métodos de pago
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Supplier Info */}
      <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl">
        <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-4">
          Información del Proveedor
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">Proveedor:</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-900 dark:text-white">
                {product.supplier_info.name}
              </span>
              {product.supplier_info.verified && (
                <Shield className="w-4 h-4 text-green-500" />
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">Calificación:</span>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="font-medium text-slate-900 dark:text-white">
                {product.supplier_info.rating}
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-sm">
                ({product.supplier_info.reviews.toLocaleString()})
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">Tiempo de respuesta:</span>
            <span className="font-medium text-slate-900 dark:text-white">
              {product.supplier_info.response_time}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
