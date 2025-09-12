"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Grid3X3, 
  List, 
  ArrowUpDown, 
  Star, 
  Heart, 
  ShoppingCart, 
  Eye,
  Package,
  AlertCircle
} from "lucide-react"
import { ProductFilters } from "./products-section"
import { QuantityModal } from "./quantity-modal"
import Image from "next/image"

interface Product {
  id: string
  name: string
  brand: string
  supplier: string
  image: string
  price: number
  originalPrice?: number
  description: string
  category: string
  subcategory: string
  inStock: boolean
  stockQuantity: number
  rating?: number
  reviews?: number
  tags: string[]
  specifications: Record<string, string>
}

interface ProductsGridProps {
  products: Product[]
  viewMode: "grid" | "list"
  onViewModeChange: (mode: "grid" | "list") => void
  isLoading: boolean
  filters: ProductFilters
  onFiltersChange: (filters: ProductFilters) => void
}

export function ProductsGrid({ 
  products, 
  viewMode, 
  onViewModeChange, 
  isLoading,
  filters,
  onFiltersChange
}: ProductsGridProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [quantityModalProduct, setQuantityModalProduct] = useState<Product | null>(null)
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false)
  const itemsPerPage = 12

  const sortOptions = [
    { value: "relevance", label: "Relevancia" },
    { value: "price-asc", label: "Precio: Menor a Mayor" },
    { value: "price-desc", label: "Precio: Mayor a Menor" },
    { value: "name-asc", label: "Nombre: A-Z" },
    { value: "name-desc", label: "Nombre: Z-A" },
    { value: "rating", label: "Mejor Valorados" },
    { value: "newest", label: "Más Recientes" }
  ]

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price)
  }

  const calculateDiscount = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100)
  }

  const handleAddToCart = (product: Product) => {
    setQuantityModalProduct(product)
    setIsQuantityModalOpen(true)
  }

  const handleCartConfirm = (product: Product, quantity: number) => {
    // Aquí manejarías la lógica de agregar al carrito
    console.log(`Agregando al carrito: ${quantity} x ${product.name}`)
    // Podrías usar un store como Zustand para manejar el carrito
    setIsQuantityModalOpen(false)
  }

  // Pagination
  const totalPages = Math.ceil(products.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = products.slice(startIndex, endIndex)

  const ProductCard = ({ product }: { product: Product }) => {
    const isOnSale = product.originalPrice && product.originalPrice > product.price
    const discount = isOnSale ? calculateDiscount(product.originalPrice!, product.price) : 0

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="group bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-200/50 dark:border-slate-600/50 overflow-hidden"
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-700">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isOnSale && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                -{discount}%
              </span>
            )}
            {!product.inStock && (
              <span className="bg-slate-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                Sin Stock
              </span>
            )}
            {product.stockQuantity < 10 && product.inStock && (
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                Pocas Unidades
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={() => toggleFavorite(product.id)}
              className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                favorites.has(product.id)
                  ? 'bg-red-500 text-white'
                  : 'bg-white/90 text-slate-600 hover:bg-red-500 hover:text-white'
              }`}
            >
              <Heart className="w-4 h-4" />
            </button>
            <button className="p-2 bg-white/90 text-slate-600 rounded-full backdrop-blur-sm hover:bg-blue-500 hover:text-white transition-colors">
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Add */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button 
              onClick={() => handleAddToCart(product)}
              disabled={!product.inStock}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              {product.inStock ? 'Agregar al Carrito' : 'Sin Stock'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Brand */}
          <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">
            {product.brand}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating!)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-slate-500">
                {product.rating} ({product.reviews} reseñas)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              {formatPrice(product.price)}
            </span>
            {isOnSale && (
              <span className="text-sm text-slate-500 line-through">
                {formatPrice(product.originalPrice!)}
              </span>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {product.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Stock Info */}
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {product.inStock ? (
              <span className="flex items-center gap-1">
                <Package className="w-4 h-4 text-green-500" />
                Stock: {product.stockQuantity} unidades
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-500">
                <AlertCircle className="w-4 h-4" />
                Sin stock
              </span>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  const ProductListItem = ({ product }: { product: Product }) => {
    const isOnSale = product.originalPrice && product.originalPrice > product.price
    const discount = isOnSale ? calculateDiscount(product.originalPrice!, product.price) : 0

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="group bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200/50 dark:border-slate-600/50 overflow-hidden"
      >
        <div className="flex">
          {/* Image */}
          <div className="relative w-48 h-32 flex-shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-700">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {isOnSale && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  -{discount}%
                </span>
              )}
              {!product.inStock && (
                <span className="bg-slate-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  Sin Stock
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            <div className="flex justify-between">
              <div className="flex-1">
                {/* Brand */}
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                  {product.brand} • {product.category}
                </div>

                {/* Title */}
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {product.name}
                </h3>

                {/* Description */}
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>

                {/* Rating & Reviews */}
                {product.rating && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating!)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-slate-500">
                      {product.rating} ({product.reviews} reseñas)
                    </span>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {product.tags.slice(0, 4).map(tag => (
                    <span
                      key={tag}
                      className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right side - Price & Actions */}
              <div className="flex flex-col justify-between items-end ml-4">
                {/* Price */}
                <div className="text-right mb-4">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatPrice(product.price)}
                  </div>
                  {isOnSale && (
                    <div className="text-sm text-slate-500 line-through">
                      {formatPrice(product.originalPrice!)}
                    </div>
                  )}
                </div>

                {/* Stock Info */}
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  {product.inStock ? (
                    <span className="flex items-center gap-1">
                      <Package className="w-4 h-4 text-green-500" />
                      Stock: {product.stockQuantity}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-500">
                      <AlertCircle className="w-4 h-4" />
                      Sin stock
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      favorites.has(product.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-500 hover:text-white'
                    }`}
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-blue-500 hover:text-white transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.inStock}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {product.inStock ? 'Agregar' : 'Sin Stock'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200/50 dark:border-slate-600/50">
        <div className="flex items-center gap-4">
          <div className="text-slate-700 dark:text-slate-300">
            <span className="font-semibold">{products.length}</span> productos encontrados
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list"
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-3">
          <ArrowUpDown className="w-4 h-4 text-slate-500" />
          <select
            value={filters.sortBy}
            onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value })}
            className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="flex items-center gap-3 text-slate-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            Cargando productos...
          </div>
        </div>
      )}

      {/* Products Grid/List */}
      {!isLoading && (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {currentProducts.map(product =>
                viewMode === "grid" ? (
                  <ProductCard key={product.id} product={product} />
                ) : (
                  <ProductListItem key={product.id} product={product} />
                )
              )}
            </motion.div>
          </AnimatePresence>

          {/* Empty State */}
          {products.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No se encontraron productos
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Intenta ajustar los filtros o realizar una nueva búsqueda
              </p>
              <button
                onClick={() => onFiltersChange({
                  search: "",
                  category: "all",
                  subcategory: "all",
                  brand: "all",
                  supplier: "all",
                  priceRange: "all",
                  sortBy: "relevance",
                  inStockOnly: false,
                  onSaleOnly: false
                })}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Limpiar filtros
              </button>
            </motion.div>
          )}

          {/* Pagination */}
          {products.length > itemsPerPage && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {/* Quantity Modal */}
      <QuantityModal
        product={quantityModalProduct}
        isOpen={isQuantityModalOpen}
        onClose={() => setIsQuantityModalOpen(false)}
        onAddToCart={handleCartConfirm}
      />
    </div>
  )
}
