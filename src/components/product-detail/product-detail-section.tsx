"use client";

import { ProductImageGallery } from "./product-image-gallery";
import { ProductInfoPanel } from "./product-info-panel";
import { ProductDetailsTabs } from "./product-details-tabs";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/contexts/theme-context";

interface Product {
  id: string;
  name: string;
  brand: string;
  supplier: string;
  images: string[];
  productImages?: Array<{
    url: string;
    blurDataURL?: string;
    alt?: string;
    isPrimary?: boolean;
  }>;
  price: number;
  originalPrice?: number;
  description: string;
  longDescription: string;
  category: string;
  subcategory: string;
  inStock: boolean;
  stockQuantity: number;
  rating?: number;
  reviews?: number;
  tags: string[];
  specifications: Record<string, string>;
  features: string[];
  warranty: string;
  shipping: {
    free: boolean;
    estimatedDays: string;
    cost: number;
  };
  supplier_info: {
    name: string;
    rating: number;
    reviews: number;
    response_time: string;
    verified: boolean;
  };
}

interface ProductDetailSectionProps {
  product: Product;
}

export function ProductDetailSection({ product }: ProductDetailSectionProps) {
  const { themeColors } = useTheme();
  
  return (
    <div className="min-h-screen py-8" style={{ background: `${themeColors.surface}30` }}>
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 transition-colors font-medium"
            style={{ color: themeColors.primary }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Productos</span>
          </Link>

          <div className="flex items-center gap-2 mt-2 text-sm" style={{ color: themeColors.text.secondary }}>
            <Link
              href="/"
              className="hover:opacity-80"
            >
              Inicio
            </Link>
            <span>/</span>
            <Link
              href="/productos"
              className="hover:opacity-80"
            >
              Productos
            </Link>
            <span>/</span>
            <span style={{ color: themeColors.text.primary }}>
              {product.category}
            </span>
            <span>/</span>
            <span className="font-medium" style={{ color: themeColors.text.primary }}>
              {product.name}
            </span>
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
            <ProductImageGallery
              images={product.productImages || product.images}
              productName={product.name}
            />
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
          <div className="rounded-2xl shadow-lg p-8" style={{ background: themeColors.surface, border: `1px solid ${themeColors.primary}20` }}>
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: themeColors.text.primary }}>
              Productos Relacionados
            </h2>
            <div className="text-center" style={{ color: themeColors.text.secondary }}>
              <p className="text-lg mb-4">🔄</p>
              <p>
                Próximamente: productos relacionados y recomendaciones
                personalizadas
              </p>
              <div className="mt-6">
                <Link
                  href="/productos"
                  className="inline-flex items-center gap-2 font-semibold py-3 px-6 rounded-xl transition-colors"
                  style={{ background: themeColors.primary, color: '#fff' }}
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
            <div className="p-6 rounded-xl text-center" style={{ background: `${themeColors.accent}15` }}>
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="font-semibold mb-2" style={{ color: themeColors.text.primary }}>
                Compra Segura
              </h3>
              <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                Tus datos están protegidos con encriptación SSL
              </p>
            </div>

            <div className="p-6 rounded-xl text-center" style={{ background: `${themeColors.primary}15` }}>
              <div className="text-4xl mb-3">🚚</div>
              <h3 className="font-semibold mb-2" style={{ color: themeColors.text.primary }}>
                Envío Rápido
              </h3>
              <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                Entrega en {product.shipping.estimatedDays}
              </p>
            </div>

            <div className="p-6 rounded-xl text-center" style={{ background: `${themeColors.secondary}15` }}>
              <div className="text-4xl mb-3">⭐</div>
              <h3 className="font-semibold mb-2" style={{ color: themeColors.text.primary }}>
                Calidad Garantizada
              </h3>
              <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                {product.warranty}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
