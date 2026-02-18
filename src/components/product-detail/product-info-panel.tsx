"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  Check,
} from "lucide-react";
import { useCartStore } from "@/components/cart/cart-store";
import { useTheme } from "@/contexts/theme-context";
import { calculatePrice, type DiscountRule } from "@/lib/price-calculator";

interface ProductInfo {
  id: string;
  prodVirtaId?: string;
  sku?: string;
  name: string;
  brand: string;
  supplier: string;
  images: string[];
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
  // 🆕 Información de descuentos
  discounts?: DiscountRule[];
  priceSale?: number;
  discountPercentage?: number;
}

interface ProductInfoPanelProps {
  product: ProductInfo;
}

export function ProductInfoPanel({ product }: ProductInfoPanelProps) {
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAddedToast, setShowAddedToast] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState({
    basePrice: product.price,
    subtotal: product.price,
    finalPrice: product.price,
    discount: 0,
    discountPercentage: 0,
    totalSavings: 0,
  });
  const { themeColors } = useTheme();

  const { addItem } = useCartStore();

  const isOnSale =
    product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = isOnSale
    ? Math.round(
        ((product.originalPrice! - product.price) / product.originalPrice!) *
          100,
      )
    : 0;

  const savings = isOnSale ? product.originalPrice! - product.price : 0;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stockQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      prodVirtaId: product.prodVirtaId || product.id,
      sku: product.sku || "",
      name: product.name,
      brand: product.brand,
      supplier: product.supplier_info.name,
      supplierId: product.supplier_info.name.toLowerCase().replace(/\s+/g, "-"),
      image: product.images[0] || "",
      price: product.price,
      originalPrice: product.originalPrice,
      quantity: quantity,
      inStock: product.inStock,
      stockQuantity: product.stockQuantity,
      category: product.category,
    });
    
    // Mostrar confirmación
    setShowAddedToast(true);
    setTimeout(() => setShowAddedToast(false), 3000);
    
    // Reset quantity after adding
    setQuantity(1);
  };

  const totalPrice = product.price * quantity;

  return (
    <div className="space-y-8">
      {/* Product Header */}
      <div className="space-y-4">
        {/* Brand and Tags */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-lg" style={{ color: themeColors.primary }}>
              {product.brand}
            </span>
            {product.supplier_info.verified && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs" style={{ background: `${themeColors.accent}20`, color: themeColors.accent }}>
                <Shield className="w-3 h-3" />
                Verificado
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-2 rounded-full transition-colors"
              style={{
                background: isFavorite ? themeColors.accent : `${themeColors.surface}90`,
                color: isFavorite ? '#fff' : themeColors.text.secondary
              }}
            >
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full transition-colors" style={{ background: `${themeColors.surface}90`, color: themeColors.text.secondary }}>
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Product Name */}
        <h1 className="text-3xl font-bold leading-tight" style={{ color: themeColors.text.primary }}>
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
                    className="w-5 h-5"
                    style={{
                      color: i < Math.floor(product.rating!) ? themeColors.accent : `${themeColors.text.secondary}40`,
                      fill: i < Math.floor(product.rating!) ? themeColors.accent : 'transparent'
                    }}
                  />
                ))}
              </div>
              <span className="font-semibold" style={{ color: themeColors.text.primary }}>
                {product.rating}
              </span>
              <span style={{ color: themeColors.text.secondary }}>
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
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ background: `${themeColors.primary}20`, color: themeColors.primary }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="p-6 rounded-2xl" style={{ background: `linear-gradient(135deg, ${themeColors.primary}10, ${themeColors.secondary}10)`, border: `1px solid ${themeColors.primary}30` }}>
        <div className="space-y-3">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold" style={{ color: themeColors.text.primary }}>
              ${(product.price || 0).toLocaleString()}
            </span>
            {isOnSale && (
              <>
                <span className="text-xl line-through" style={{ color: themeColors.text.secondary }}>
                  ${(product.originalPrice || 0).toLocaleString()}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-bold" style={{ background: themeColors.accent, color: '#fff' }}>
                  -{discountPercentage}%
                </span>
              </>
            )}
          </div>
          {isOnSale && (
            <p className="font-semibold" style={{ color: themeColors.accent }}>
              ¡Ahorras ${(savings || 0).toLocaleString()}!
            </p>
          )}
          <p className="text-sm" style={{ color: themeColors.text.secondary }}>
            Precio por unidad • Impuestos incluidos
          </p>
        </div>
      </div>

      {/* Stock Status */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-medium" style={{ color: themeColors.text.primary }}>
            Disponibilidad:
          </span>
          <div className="flex items-center gap-2">
            {product.inStock ? (
              <>
                <Check className="w-4 h-4" style={{ color: themeColors.accent }} />
                <span className="font-semibold" style={{ color: themeColors.accent }}>
                  En stock ({product.stockQuantity} disponibles)
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" style={{ color: themeColors.accent }} />
                <span className="font-semibold" style={{ color: themeColors.accent }}>
                  Sin stock
                </span>
              </>
            )}
          </div>
        </div>

        {product.inStock && product.stockQuantity < 10 && (
          <div className="p-3 rounded-lg" style={{ background: `${themeColors.accent}20`, border: `1px solid ${themeColors.accent}40` }}>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" style={{ color: themeColors.accent }} />
              <span className="text-sm font-medium" style={{ color: themeColors.accent }}>
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
            <span className="font-medium" style={{ color: themeColors.text.primary }}>
              Cantidad:
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className="w-10 h-10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors hover:scale-105"
                style={{ background: `${themeColors.surface}90`, color: themeColors.text.primary }}
                aria-label="Disminuir cantidad"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min="1"
                max={product.stockQuantity}
                value={quantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  handleQuantityChange(value);
                }}
                className="w-16 text-center font-semibold text-lg border-2 rounded-lg py-1 focus:outline-none focus:ring-2 transition-all"
                style={{ 
                  color: themeColors.text.primary,
                  borderColor: `${themeColors.primary}40`,
                  background: `${themeColors.surface}20`
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = themeColors.primary;
                  e.target.style.background = `${themeColors.primary}05`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = `${themeColors.primary}40`;
                  e.target.style.background = `${themeColors.surface}20`;
                }}
              />
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= product.stockQuantity}
                className="w-10 h-10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors hover:scale-105"
                style={{ background: `${themeColors.surface}90`, color: themeColors.text.primary }}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Total Price */}
          <div className="p-4 rounded-xl" style={{ background: `${themeColors.surface}50` }}>
            <div className="flex items-center justify-between">
              <span className="font-medium" style={{ color: themeColors.text.secondary }}>
                Total ({quantity} {quantity === 1 ? "unidad" : "unidades"}):
              </span>
              <span className="text-2xl font-bold" style={{ color: themeColors.primary }}>
                ${(totalPrice || 0).toLocaleString()}
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
          className="w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300"
          style={{
            background: product.inStock ? themeColors.primary : `${themeColors.surface}80`,
            color: product.inStock ? '#fff' : themeColors.text.secondary,
            boxShadow: product.inStock ? `0 10px 25px ${themeColors.primary}25` : 'none',
            cursor: product.inStock ? 'pointer' : 'not-allowed'
          }}
        >
          <ShoppingCart className="w-5 h-5" />
          {product.inStock ? "Agregar al Carrito" : "Sin Stock"}
        </motion.button>

        <button className="w-full py-3 px-6 rounded-xl font-semibold transition-colors" style={{ border: `2px solid ${themeColors.primary}`, color: themeColors.primary, background: 'transparent' }}>
          Comprar Ahora
        </button>
      </div>

      {/* Features */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg" style={{ color: themeColors.text.primary }}>
          Incluye:
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: `${themeColors.accent}15` }}>
            <Truck className="w-5 h-5" style={{ color: themeColors.accent }} />
            <div>
              <p className="font-medium" style={{ color: themeColors.text.primary }}>
                {product.shipping.free
                  ? "Envío Gratis"
                  : `Envío $${product.shipping.cost}`}
              </p>
              <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                Entrega estimada: {product.shipping.estimatedDays}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: `${themeColors.primary}15` }}>
            <Shield className="w-5 h-5" style={{ color: themeColors.primary }} />
            <div>
              <p className="font-medium" style={{ color: themeColors.text.primary }}>
                Garantía
              </p>
              <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                {product.warranty}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: `${themeColors.secondary}15` }}>
            <RotateCcw className="w-5 h-5" style={{ color: themeColors.secondary }} />
            <div>
              <p className="font-medium" style={{ color: themeColors.text.primary }}>
                Devoluciones
              </p>
              <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                30 días para devoluciones
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: `${themeColors.accent}15` }}>
            <CreditCard className="w-5 h-5" style={{ color: themeColors.accent }} />
            <div>
              <p className="font-medium" style={{ color: themeColors.text.primary }}>
                Pago Seguro
              </p>
              <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                Múltiples métodos de pago
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Supplier Info */}
      <div className="p-6 rounded-xl" style={{ background: `${themeColors.surface}50` }}>
        <h3 className="font-semibold text-lg mb-4" style={{ color: themeColors.text.primary }}>
          Información del Proveedor
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span style={{ color: themeColors.text.secondary }}>
              Proveedor:
            </span>
            <div className="flex items-center gap-2">
              <span className="font-medium" style={{ color: themeColors.text.primary }}>
                {product.supplier_info.name}
              </span>
              {product.supplier_info.verified && (
                <Shield className="w-4 h-4" style={{ color: themeColors.accent }} />
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: themeColors.text.secondary }}>
              Calificación:
            </span>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" style={{ color: themeColors.accent, fill: themeColors.accent }} />
              <span className="font-medium" style={{ color: themeColors.text.primary }}>
                {product.supplier_info.rating}
              </span>
              <span className="text-sm" style={{ color: themeColors.text.secondary }}>
                ({product.supplier_info.reviews.toLocaleString()})
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: themeColors.text.secondary }}>
              Tiempo de respuesta:
            </span>
            <span className="font-medium" style={{ color: themeColors.text.primary }}>
              {product.supplier_info.response_time}
            </span>
          </div>
        </div>
      </div>
      
      {/* Toast de confirmación */}
      {showAddedToast && (
        <div 
          className="fixed bottom-8 right-8 z-50 animate-slide-in"
          style={{
            background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.accent})`,
            boxShadow: `0 10px 40px ${themeColors.primary}40`
          }}
        >
          <div className="px-6 py-4 rounded-xl text-white flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">
              ✓ {quantity} {quantity === 1 ? 'producto agregado' : 'productos agregados'} al carrito
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
