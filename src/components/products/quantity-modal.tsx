"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingCart, Sparkles } from "lucide-react";
import Image from "next/image";
import { useTheme } from "@/contexts/theme-context";

interface Product {
  id: string;
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
}

interface QuantityModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export function QuantityModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: QuantityModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const { themeColors } = useTheme();

  if (!product) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) =>
      Math.max(1, Math.min(prev + delta, product.stockQuantity)),
    );
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setQuantity(1);
    setNotes("");
    onClose();
  };

  const subtotal = product.price * quantity;

  // Calcular descuentos por volumen (simulado)
  const getVolumeDiscount = (qty: number) => {
    if (qty >= 100) return 0.15; // 15% descuento
    if (qty >= 50) return 0.1; // 10% descuento
    if (qty >= 20) return 0.05; // 5% descuento
    return 0;
  };

  const volumeDiscount = getVolumeDiscount(quantity);
  const discountAmount = subtotal * volumeDiscount;
  const finalTotal = subtotal - discountAmount;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop con blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
              className="pointer-events-auto w-full max-w-lg"
            >
              <div 
                className="rounded-2xl shadow-2xl overflow-hidden"
                style={{ 
                  background: themeColors.surface,
                  border: `1px solid ${themeColors.primary}20`
                }}
              >
                {/* Header con gradiente */}
                <div 
                  className="relative p-6 overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${themeColors.primary}15, ${themeColors.secondary}15)`
                  }}
                >
                  {/* Decoración de fondo */}
                  <div className="absolute top-0 right-0 w-64 h-64 opacity-10" style={{ background: `radial-gradient(circle, ${themeColors.accent} 0%, transparent 70%)` }} />
                  
                  <div className="relative flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div
                        initial={{ rotate: -10, scale: 0.8 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ delay: 0.1, type: "spring" }}
                        className="p-3 rounded-xl"
                        style={{ background: `${themeColors.primary}20` }}
                      >
                        <ShoppingCart className="w-6 h-6" style={{ color: themeColors.primary }} />
                      </motion.div>
                      <div>
                        <h2 className="text-xl font-bold" style={{ color: themeColors.text.primary }}>
                          Agregar al Carrito
                        </h2>
                        <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                          Selecciona la cantidad deseada
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={onClose}
                      className="p-2 rounded-lg transition-colors"
                      style={{ 
                        background: `${themeColors.surface}80`,
                        color: themeColors.text.secondary 
                      }}
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                {/* Product Info Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mx-6 -mt-4 mb-6 p-4 rounded-xl shadow-lg"
                  style={{ 
                    background: themeColors.background,
                    border: `1px solid ${themeColors.primary}10`
                  }}
                >
                  <div className="flex gap-4">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0" style={{ background: `${themeColors.primary}10` }}>
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base mb-1 truncate" style={{ color: themeColors.text.primary }}>
                        {product.name}
                      </h3>
                      <p className="text-sm mb-2" style={{ color: themeColors.text.secondary }}>
                        {product.brand}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold" style={{ color: themeColors.primary }}>
                          ${product.price.toLocaleString()}
                        </span>
                        <span className="text-sm" style={{ color: themeColors.text.secondary }}>c/u</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Content */}
                <div className="px-6 pb-6 space-y-5">
                  {/* Quantity Selection */}
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <label className="block text-sm font-semibold mb-3" style={{ color: themeColors.text.primary }}>
                      Cantidad
                    </label>
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="p-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                          background: `${themeColors.primary}15`,
                          color: themeColors.primary,
                          border: `2px solid ${themeColors.primary}30`
                        }}
                      >
                        <Minus className="w-5 h-5" />
                      </motion.button>

                      <motion.input
                        whileFocus={{ scale: 1.02 }}
                        type="number"
                        min="1"
                        max={product.stockQuantity}
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.max(
                              1,
                              Math.min(
                                Number(e.target.value) || 1,
                                product.stockQuantity,
                              ),
                            ),
                          )
                        }
                        className="flex-1 text-center text-lg font-bold py-3 rounded-xl focus:outline-none focus:ring-2 transition-all"
                        style={{
                          background: themeColors.background,
                          color: themeColors.text.primary,
                          border: `2px solid ${themeColors.primary}30`,
                          boxShadow: `0 0 0 0px ${themeColors.primary}20`
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = themeColors.primary;
                          e.target.style.boxShadow = `0 0 0 4px ${themeColors.primary}20`;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = `${themeColors.primary}30`;
                          e.target.style.boxShadow = `0 0 0 0px ${themeColors.primary}20`;
                        }}
                      />

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.stockQuantity}
                        className="p-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                          background: `${themeColors.primary}15`,
                          color: themeColors.primary,
                          border: `2px solid ${themeColors.primary}30`
                        }}
                      >
                        <Plus className="w-5 h-5" />
                      </motion.button>

                      <div className="text-sm whitespace-nowrap" style={{ color: themeColors.text.secondary }}>
                        de <span className="font-semibold">{product.stockQuantity}</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Quick Quantity Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-semibold mb-3" style={{ color: themeColors.text.primary }}>
                      Cantidades rápidas:
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[10, 25, 50, 100].map((qty, index) => (
                        <motion.button
                          key={qty}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.25 + index * 0.05 }}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            setQuantity(Math.min(qty, product.stockQuantity))
                          }
                          disabled={qty > product.stockQuantity}
                          className="py-2.5 px-3 text-sm font-medium rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          style={{
                            background: quantity === qty ? themeColors.primary : `${themeColors.primary}10`,
                            color: quantity === qty ? '#fff' : themeColors.primary,
                            border: `2px solid ${quantity === qty ? themeColors.primary : `${themeColors.primary}20`}`,
                          }}
                        >
                          {qty}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Volume Discount Badge */}
                  <AnimatePresence>
                    {volumeDiscount > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ type: "spring", bounce: 0.3 }}
                        className="rounded-xl p-4"
                        style={{
                          background: `linear-gradient(135deg, ${themeColors.accent}15, ${themeColors.accent}10)`,
                          border: `2px solid ${themeColors.accent}30`
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                          >
                            <Sparkles className="w-5 h-5" style={{ color: themeColors.accent }} />
                          </motion.div>
                          <span className="font-bold" style={{ color: themeColors.accent }}>
                            ¡Descuento por volumen! {(volumeDiscount * 100).toFixed(0)}% OFF
                          </span>
                        </div>
                        <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                          Ahorras <span className="font-semibold">${discountAmount.toLocaleString()}</span> en esta compra
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Notes */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-semibold mb-3" style={{ color: themeColors.text.primary }}>
                      Notas adicionales (opcional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Especificaciones especiales, fecha de entrega, etc."
                      rows={3}
                      className="w-full p-3 rounded-xl resize-none focus:outline-none focus:ring-2 transition-all"
                      style={{
                        background: themeColors.background,
                        color: themeColors.text.primary,
                        border: `2px solid ${themeColors.primary}20`,
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = themeColors.primary;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = `${themeColors.primary}20`;
                      }}
                    />
                  </motion.div>
                </div>

                {/* Price Summary */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="px-6 py-4 space-y-2"
                  style={{ 
                    background: `linear-gradient(to bottom, ${themeColors.background}00, ${themeColors.background}50)`,
                    borderTop: `1px solid ${themeColors.primary}10`
                  }}
                >
                  <div className="flex justify-between text-sm">
                    <span style={{ color: themeColors.text.secondary }}>
                      Subtotal ({quantity} {quantity === 1 ? 'unidad' : 'unidades'}):
                    </span>
                    <span className="font-semibold" style={{ color: themeColors.text.primary }}>
                      ${subtotal.toLocaleString()}
                    </span>
                  </div>

                  {volumeDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span style={{ color: themeColors.accent }}>
                        Descuento ({(volumeDiscount * 100).toFixed(0)}%):
                      </span>
                      <span className="font-semibold" style={{ color: themeColors.accent }}>
                        -${discountAmount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-lg font-bold pt-2" style={{ borderTop: `1px solid ${themeColors.primary}10` }}>
                    <span style={{ color: themeColors.text.primary }}>Total:</span>
                    <motion.span
                      key={finalTotal}
                      initial={{ scale: 1.2, color: themeColors.accent }}
                      animate={{ scale: 1, color: themeColors.primary }}
                      style={{ color: themeColors.primary }}
                    >
                      ${finalTotal.toLocaleString()}
                    </motion.span>
                  </div>
                </motion.div>

                {/* Actions */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="p-6 pt-0 flex gap-3"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="flex-1 py-3.5 px-4 rounded-xl font-semibold transition-all"
                    style={{
                      background: `${themeColors.surface}`,
                      color: themeColors.text.secondary,
                      border: `2px solid ${themeColors.primary}20`
                    }}
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: `0 10px 30px ${themeColors.primary}40` }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    disabled={!product.inStock || quantity === 0}
                    className="flex-1 py-3.5 px-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{
                      background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                      color: '#fff',
                      boxShadow: `0 4px 12px ${themeColors.primary}40`
                    }}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Agregar al Carrito
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
