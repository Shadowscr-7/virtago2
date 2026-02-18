"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Grid3X3,
  List,
  ArrowUpDown,
  Star,
  Heart,
  ShoppingCart,
  Eye,
  Package,
  AlertCircle,
} from "lucide-react";
import { ProductFilters } from "./products-section";
import { QuantityModal } from "./quantity-modal";
import { StyledSelect } from "@/components/ui/styled-select";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/components/cart/cart-store";

interface Product {
  id: string;
  prodVirtaId?: string;
  sku?: string;
  name: string;
  brand: string;
  supplier: string;
  image: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  subcategory: string;
  inStock: boolean;
  stockQuantity: number;
  rating?: number;
  reviews?: number;
  tags: string[];
  specifications: Record<string, string>;
  pricing?: {
    base_price: number;
    final_price: number;
    total_savings: number;
    percentage_saved: string | number;
    has_discount: boolean;
  };
  discounts?: {
    total_applicable: number;
    auto_applicable?: number;
    conditional?: number;
    direct_discounts?: Array<{
      name: string;
      discount_type?: string;
      discount_value?: number;
      _canAutoApply?: boolean;
      _blockReasons?: string[];
    }>;
  };
  bestAdditionalDiscount?: {
    type: string;
    description: string;
    potentialSavings: number;
    badge: string;
  } | null;
  productImages?: Array<{
    url: string;
    blurDataURL?: string;
    alt?: string;
    isPrimary?: boolean;
  }>;
}

interface ProductsGridProps {
  products: Product[];
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  isLoading: boolean;
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
}

export function ProductsGrid({
  products,
  viewMode,
  onViewModeChange,
  isLoading,
  filters,
  onFiltersChange,
}: ProductsGridProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [quantityModalProduct, setQuantityModalProduct] =
    useState<Product | null>(null);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const itemsPerPage = 12;

  const { addItem } = useCartStore();

  const sortOptions = [
    { value: "relevance", label: "Relevancia" },
    { value: "price-asc", label: "Precio: Menor a Mayor" },
    { value: "price-desc", label: "Precio: Mayor a Menor" },
    { value: "name-asc", label: "Nombre: A-Z" },
    { value: "name-desc", label: "Nombre: Z-A" },
    { value: "rating", label: "Mejor Valorados" },
    { value: "newest", label: "Más Recientes" },
  ];

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculateDiscount = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  const handleAddToCart = (product: Product) => {
    setQuantityModalProduct(product);
    setIsQuantityModalOpen(true);
  };

  const handleCartConfirm = (product: Product, quantity: number) => {
    addItem({
      productId: product.id,
      prodVirtaId: product.prodVirtaId || product.id,
      sku: product.sku || product.specifications?.SKU || "",
      name: product.name,
      brand: product.brand,
      supplier: product.supplier,
      supplierId: product.supplier.toLowerCase().replace(/\s+/g, "-"),
      image: product.image,
      price: product.price,
      originalPrice: product.originalPrice,
      quantity: quantity,
      inStock: product.inStock,
      stockQuantity: product.stockQuantity,
      category: product.category,
      specifications: product.specifications,
    });
    setIsQuantityModalOpen(false);
  };

  // Pagination
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  const ProductCard = ({ product }: { product: Product }) => {
    const discountPercent = Math.round(Number(product.pricing?.percentage_saved || 0));
    const isOnSale = product.pricing?.has_discount && discountPercent > 0;
    const discount = discountPercent;

    // Obtener la imagen principal o usar fallback
    const primaryImage = product.productImages?.find(img => img.isPrimary) || product.productImages?.[0];
    const hasImage = !!primaryImage;

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
        <Link href={`/producto/${product.prodVirtaId || product.id}`} className="block relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-700 cursor-pointer">
          {hasImage ? (
            <Image
              src={primaryImage!.url}
              alt={primaryImage!.alt || product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              placeholder={primaryImage!.blurDataURL ? "blur" : "empty"}
              blurDataURL={primaryImage!.blurDataURL}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
              <Package className="w-16 h-16 text-slate-400 dark:text-slate-500 mb-2" />
              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Sin imagen
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isOnSale && discount > 0 && (
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
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(product.id); }}
              className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                favorites.has(product.id)
                  ? "bg-red-500 text-white"
                  : "bg-white/90 text-slate-600 hover:bg-red-500 hover:text-white"
              }`}
            >
              <Heart className="w-4 h-4" />
            </button>
            <Link
              href={`/producto/${product.prodVirtaId || product.id}`}
              className="p-2 bg-white/90 text-slate-600 rounded-full backdrop-blur-sm hover:bg-blue-500 hover:text-white transition-colors"
            >
              <Eye className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick Add */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(product); }}
              disabled={!product.inStock}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              {product.inStock ? "Agregar al Carrito" : "Sin Stock"}
            </button>
          </div>
        </Link>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <Link href={`/producto/${product.prodVirtaId || product.id}`}>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating!)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-slate-300"
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
          <div className="mb-3">
            {/* Precio Final (destacado) */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatPrice(product.price)}
              </span>
            </div>

            {/* Precio Base (tachado) + Ahorro */}
            {isOnSale && product.originalPrice && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 dark:text-slate-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
                {product.pricing?.total_savings && product.pricing.total_savings > 0 && (
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Ahorras {formatPrice(product.pricing.total_savings)}
                  </span>
                )}
              </div>
            )}

            {/* Descuento Adicional Disponible */}
            {product.bestAdditionalDiscount && product.bestAdditionalDiscount.potentialSavings > 0 && (
              <div className="mt-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                    {product.bestAdditionalDiscount.badge}
                  </span>
                  <span className="text-xs text-purple-600 dark:text-purple-400">
                    {product.bestAdditionalDiscount.description}
                  </span>
                </div>
                <div className="text-xs text-purple-700 dark:text-purple-300 font-medium mt-1">
                  Ahorro extra: {formatPrice(product.bestAdditionalDiscount.potentialSavings)}
                </div>
              </div>
            )}

            {/* Promociones condicionales disponibles */}
            {product.discounts?.conditional && product.discounts.conditional > 0 && (
              <div className="mt-2 flex items-center gap-1 text-xs text-green-700 dark:text-green-400">
                <span>🏷️</span>
                <span className="font-medium">
                  {product.discounts.conditional} promoción(es) disponible(s)
                </span>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {product.tags.slice(0, 3).map((tag) => (
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
    );
  };

  const ProductListItem = ({ product }: { product: Product }) => {
    const discountPercent = Math.round(Number(product.pricing?.percentage_saved || 0));
    const isOnSale = product.pricing?.has_discount && discountPercent > 0;
    const discount = discountPercent;

    // Obtener la imagen principal o usar fallback
    const primaryImage = product.productImages?.find(img => img.isPrimary) || product.productImages?.[0];
    const hasImage = !!primaryImage;

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
          <Link href={`/producto/${product.prodVirtaId || product.id}`} className="block relative w-48 h-32 flex-shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-700 cursor-pointer">
            {hasImage ? (
              <Image
                src={primaryImage!.url}
                alt={primaryImage!.alt || product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                placeholder={primaryImage!.blurDataURL ? "blur" : "empty"}
                blurDataURL={primaryImage!.blurDataURL}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
                <Package className="w-12 h-12 text-slate-400 dark:text-slate-500 mb-1" />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Sin imagen
                </span>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {isOnSale && discount > 0 && (
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
          </Link>

          {/* Content */}
          <div className="flex-1 p-4">
            <div className="flex justify-between">
              <div className="flex-1">
                {/* Category */}
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                  {product.category}
                </div>

                {/* Title */}
                <Link href={`/producto/${product.prodVirtaId || product.id}`}>
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer">
                    {product.name}
                  </h3>
                </Link>

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
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-slate-300"
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
                  {product.tags.slice(0, 4).map((tag) => (
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
              <div className="flex flex-col justify-between items-end ml-4 min-w-[250px]">
                {/* Price */}
                <div className="text-right mb-4 w-full">
                  {/* Precio Final */}
                  <div className="flex items-center justify-end gap-2 mb-1">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  {/* Precio Base (tachado) */}
                  {isOnSale && product.originalPrice && (
                    <div className="flex items-center justify-end gap-2 mb-1">
                      <span className="text-sm text-slate-500 dark:text-slate-400 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                      {product.pricing?.total_savings && product.pricing.total_savings > 0 && (
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                          Ahorras {formatPrice(product.pricing.total_savings)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Descuento Adicional */}
                  {product.bestAdditionalDiscount && product.bestAdditionalDiscount.potentialSavings > 0 && (
                    <div className="mt-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-2">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                          {product.bestAdditionalDiscount.badge}
                        </span>
                        <span className="text-xs text-purple-600 dark:text-purple-400">
                          {product.bestAdditionalDiscount.description}
                        </span>
                      </div>
                      <div className="text-xs text-purple-700 dark:text-purple-300 font-medium mt-1 text-right">
                        Ahorro extra: {formatPrice(product.bestAdditionalDiscount.potentialSavings)}
                      </div>
                    </div>
                  )}

                  {/* Promociones condicionales */}
                  {product.discounts?.conditional && product.discounts.conditional > 0 && (
                    <div className="mt-1 text-xs text-green-700 dark:text-green-400 text-right">
                      🏷️ {product.discounts.conditional} promoción(es) disponible(s)
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
                        ? "bg-red-500 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-500 hover:text-white"
                    }`}
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                  <Link
                    href={`/producto/${product.prodVirtaId || product.id}`}
                    className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.inStock}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {product.inStock ? "Agregar" : "Sin Stock"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200/50 dark:border-slate-600/50">
        <div className="flex items-center gap-4">
          <div className="text-slate-700 dark:text-slate-300">
            <span className="font-semibold">{products.length}</span> productos
            encontrados
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600"
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-3">
          <ArrowUpDown className="w-4 h-4 text-slate-500" />
          <StyledSelect
            value={filters.sortBy}
            onChange={(value) => onFiltersChange({ ...filters, sortBy: value })}
            options={sortOptions.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
            className="min-w-[200px]"
          />
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
              {currentProducts.map((product) =>
                viewMode === "grid" ? (
                  <ProductCard key={product.id} product={product} />
                ) : (
                  <ProductListItem key={product.id} product={product} />
                ),
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
                onClick={() =>
                  onFiltersChange({
                    search: "",
                    category: "all",
                    subcategory: "all",
                    brand: "all",
                    supplier: "all",
                    priceRange: "all",
                    sortBy: "relevance",
                    inStockOnly: false,
                    onSaleOnly: false,
                  })
                }
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
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
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
  );
}
