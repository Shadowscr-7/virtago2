"use client"

import { ProductImageGallery } from "./product-image-gallery"
import { ProductInfoPanel } from "./product-info-panel"
import { ProductDetailsTabs } from "./product-details-tabs"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Product {
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
  specifications: Record<string, string>
  features: string[]
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

interface ProductDetailSectionProps {
  product: Product
}

export function ProductDetailSection({ product }: ProductDetailSectionProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Volver a Productos</span>
          </Link>
          
          <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-slate-700 dark:hover:text-slate-300">
              Inicio
            </Link>
            <span>/</span>
            <Link href="/productos" className="hover:text-slate-700 dark:hover:text-slate-300">
              Productos
            </Link>
            <span>/</span>
            <span className="text-slate-700 dark:text-slate-300">{product.category}</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">{product.name}</span>
          </div>
        </motion.div>

        {/* Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ProductImageGallery images={product.images} productName={product.name} />
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ProductInfoPanel product={product} />
          </motion.div>
        </div>

        {/* Product Details */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <ProductDetailsTabs product={product} />
        </motion.div>

        {/* Related Products Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
              Productos Relacionados
            </h2>
            <div className="text-center text-slate-500 dark:text-slate-400">
              <p className="text-lg mb-4">🔄</p>
              <p>Próximamente: productos relacionados y recomendaciones personalizadas</p>
              <div className="mt-6">
                <Link
                  href="/productos"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Ver Todos los Productos
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trust Signals */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                Compra Segura
              </h3>
              <p className="text-green-600 dark:text-green-400 text-sm">
                Tus datos están protegidos con encriptación SSL
              </p>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl text-center">
              <div className="text-4xl mb-3">🚚</div>
              <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                Envío Rápido
              </h3>
              <p className="text-blue-600 dark:text-blue-400 text-sm">
                Entrega en {product.shipping.estimatedDays}
              </p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl text-center">
              <div className="text-4xl mb-3">⭐</div>
              <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">
                Calidad Garantizada
              </h3>
              <p className="text-purple-600 dark:text-purple-400 text-sm">
                {product.warranty}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
