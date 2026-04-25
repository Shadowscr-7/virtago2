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
  X,
} from "lucide-react";
import { ProductFilters } from "./products-section";
import { QuantityModal } from "./quantity-modal";
import { StyledSelect } from "@/components/ui/styled-select";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/components/cart/cart-store";
import { useAuthStore } from "@/store/auth";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/theme-context";

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
  const [sortDrawerOpen, setSortDrawerOpen] = useState(false);
  const itemsPerPage = 12;

  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { themeColors } = useTheme();

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
        className="group rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border overflow-hidden"
        style={{ backgroundColor: themeColors.background, borderColor: themeColors.border }}
      >
        {/* Image */}
        <Link href={`/producto/${product.prodVirtaId || product.id}`} className="block relative aspect-square overflow-hidden cursor-pointer" style={{ backgroundColor: themeColors.surface }}>
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
            <div className="w-full h-full flex flex-col items-center justify-center" style={{ backgroundColor: themeColors.surface }}>
              <Package className="w-10 h-10 sm:w-16 sm:h-16 mb-1 sm:mb-2" style={{ color: themeColors.text.muted }} />
              <span className="text-xs sm:text-sm font-medium" style={{ color: themeColors.text.muted }}>
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

          {/* Quick Add — solo si está autenticado */}
          {isAuthenticated && (
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
          )}
        </Link>

        {/* Content */}
        <div className="p-2 sm:p-4">
          {/* Title */}
          <Link href={`/producto/${product.prodVirtaId || product.id}`}>
            <h3 className="font-semibold text-xs sm:text-sm mb-1 sm:mb-2 line-clamp-2 transition-colors cursor-pointer leading-snug"
              style={{ color: themeColors.text.primary }}>
              {product.name}
            </h3>
          </Link>

          {/* Price */}
          <div className="mb-2 sm:mb-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                  <span className="text-base sm:text-2xl font-bold" style={{ color: themeColors.primary }}>
                    {formatPrice(product.price)}
                  </span>
                </div>

                {isOnSale && product.originalPrice && (
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                    <span className="text-xs sm:text-sm line-through" style={{ color: themeColors.text.muted }}>
                      {formatPrice(product.originalPrice)}
                    </span>
                    {product.pricing?.total_savings && product.pricing.total_savings > 0 && (
                      <span className="text-xs text-green-600 font-medium hidden sm:inline">
                        Ahorras {formatPrice(product.pricing.total_savings)}
                      </span>
                    )}
                  </div>
                )}

                {product.bestAdditionalDiscount && product.bestAdditionalDiscount.potentialSavings > 0 && (
                  <div className="hidden sm:block mt-2 rounded-lg p-2 border border-purple-200"
                    style={{ background: "linear-gradient(to right, #faf5ff, #fdf4ff)" }}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-purple-700">
                        {product.bestAdditionalDiscount.badge}
                      </span>
                    </div>
                    <div className="text-xs text-purple-700 font-medium mt-0.5">
                      +{formatPrice(product.bestAdditionalDiscount.potentialSavings)} extra
                    </div>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="w-full flex items-center gap-1.5 p-1.5 sm:p-3 rounded-lg border transition-colors text-left"
                style={{ borderColor: themeColors.border, backgroundColor: themeColors.surface }}
              >
                <Lock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: themeColors.primary }} />
                <div>
                  <p className="text-xs font-semibold leading-tight" style={{ color: themeColors.primary }}>
                    <span className="hidden sm:inline">Iniciá sesión para ver el precio</span>
                    <span className="sm:hidden">Ver precio</span>
                  </p>
                  <p className="text-xs hidden sm:block" style={{ color: themeColors.text.muted }}>Precios exclusivos B2B</p>
                </div>
              </button>
            )}
          </div>

          {/* Tags — hidden on mobile */}
          <div className="hidden sm:flex flex-wrap gap-1 mb-3">
            {product.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded-full"
                style={{ backgroundColor: themeColors.surface, color: themeColors.text.secondary }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Stock Info — hidden on mobile */}
          <div className="hidden sm:block text-sm" style={{ color: themeColors.text.muted }}>
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

          {/* Sin stock badge mobile only */}
          {!product.inStock && (
            <div className="sm:hidden text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Sin stock
            </div>
          )}
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
        className="group rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border overflow-hidden"
        style={{ backgroundColor: themeColors.background, borderColor: themeColors.border }}
      >
        <div className="flex">
          {/* Image */}
          <Link href={`/producto/${product.prodVirtaId || product.id}`} className="block relative w-48 h-32 flex-shrink-0 overflow-hidden cursor-pointer" style={{ backgroundColor: themeColors.surface }}>
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
              <div className="w-full h-full flex flex-col items-center justify-center" style={{ backgroundColor: themeColors.surface }}>
                <Package className="w-12 h-12 mb-1" style={{ color: themeColors.text.muted }} />
                <span className="text-xs font-medium" style={{ color: themeColors.text.muted }}>
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
                <div className="text-sm mb-1" style={{ color: themeColors.text.muted }}>
                  {product.category}
                </div>

                {/* Title */}
                <Link href={`/producto/${product.prodVirtaId || product.id}`}>
                  <h3 className="font-semibold text-lg mb-2 transition-colors cursor-pointer"
                    style={{ color: themeColors.text.primary }}>
                    {product.name}
                  </h3>
                </Link>

                {/* Description */}
                <p className="text-sm mb-3 line-clamp-2" style={{ color: themeColors.text.secondary }}>
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
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ backgroundColor: themeColors.surface, color: themeColors.text.secondary }}
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
                    <span className="text-2xl font-bold" style={{ color: themeColors.primary }}>
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  {/* Precio Base (tachado) */}
                  {isOnSale && product.originalPrice && (
                    <div className="flex items-center justify-end gap-2 mb-1">
                      <span className="text-sm line-through" style={{ color: themeColors.text.muted }}>
                        {formatPrice(product.originalPrice)}
                      </span>
                      {product.pricing?.total_savings && product.pricing.total_savings > 0 && (
                        <span className="text-xs text-green-600 font-medium">
                          Ahorras {formatPrice(product.pricing.total_savings)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Descuento Adicional */}
                  {product.bestAdditionalDiscount && product.bestAdditionalDiscount.potentialSavings > 0 && (
                    <div className="mt-2 rounded-lg p-2 border border-purple-200"
                      style={{ background: "linear-gradient(to right, #faf5ff, #fdf4ff)" }}>
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs font-bold text-purple-700">
                          {product.bestAdditionalDiscount.badge}
                        </span>
                        <span className="text-xs text-purple-600">
                          {product.bestAdditionalDiscount.description}
                        </span>
                      </div>
                      <div className="text-xs text-purple-700 font-medium mt-1 text-right">
                        Ahorro extra: {formatPrice(product.bestAdditionalDiscount.potentialSavings)}
                      </div>
                    </div>
                  )}

                  {/* Promociones condicionales */}
                  {product.discounts?.conditional && product.discounts.conditional > 0 && (
                    <div className="mt-1 text-xs text-green-700 text-right">
                      🏷️ {product.discounts.conditional} promoción(es) disponible(s)
                    </div>
                  )}
                </div>

                {/* Stock Info */}
                <div className="text-sm mb-4" style={{ color: themeColors.text.muted }}>
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
                      favorites.has(product.id) ? "bg-red-500 text-white" : "hover:bg-red-500 hover:text-white"
                    }`}
                    style={!favorites.has(product.id) ? { backgroundColor: themeColors.surface, color: themeColors.text.secondary } : undefined}
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                  <Link
                    href={`/producto/${product.prodVirtaId || product.id}`}
                    className="p-2 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"
                    style={{ backgroundColor: themeColors.surface, color: themeColors.text.secondary }}
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.inStock}
                    className="text-white px-4 py-2 rounded-lg font-medium disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    style={{ backgroundColor: product.inStock ? themeColors.primary : undefined }}
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
      <div className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 shadow-sm border"
        style={{ backgroundColor: themeColors.background, borderColor: themeColors.border }}>
        {/* Left: count */}
        <span className="text-sm" style={{ color: themeColors.text.secondary }}>
          <span className="font-semibold" style={{ color: themeColors.text.primary }}>{products.length}</span> productos
        </span>

        {/* Right: controls */}
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Sort mobile button */}
          <button
            onClick={() => setSortDrawerOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="max-w-[80px] truncate">
              {sortOptions.find(o => o.value === filters.sortBy)?.label ?? "Ordenar"}
            </span>
          </button>

          {/* Sort desktop */}
          <div className="hidden md:flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-500" />
            <StyledSelect
              value={filters.sortBy}
              onChange={(value) => onFiltersChange({ ...filters, sortBy: value })}
              options={sortOptions.map((option) => ({ value: option.value, label: option.label }))}
              className="min-w-[200px]"
            />
          </div>
        </div>
      </div>

      {/* Mobile Sort Drawer */}
      <AnimatePresence>
        {sortDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setSortDrawerOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 md:hidden rounded-t-2xl shadow-2xl"
            style={{ backgroundColor: themeColors.background }}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-slate-300" />
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: themeColors.border }}>
                <span className="font-semibold text-lg" style={{ color: themeColors.text.primary }}>Ordenar por</span>
                <button onClick={() => setSortDrawerOpen(false)} className="p-2 rounded-lg transition-colors hover:opacity-70">
                  <X className="w-5 h-5" style={{ color: themeColors.text.secondary }} />
                </button>
              </div>
              <div className="p-4 space-y-1">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onFiltersChange({ ...filters, sortBy: option.value });
                      setSortDrawerOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-colors"
                    style={
                      filters.sortBy === option.value
                        ? { backgroundColor: themeColors.surface, color: themeColors.primary, fontWeight: 600 }
                        : { color: themeColors.text.secondary }
                    }
                  >
                    {option.label}
                    {filters.sortBy === option.value && (
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColors.primary }} />
                    )}
                  </button>
                ))}
              </div>
              <div className="h-4" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
                  ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5"
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
