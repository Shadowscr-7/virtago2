"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingCart, Package } from "lucide-react";
import Image from "next/image";

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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Agregar al Carrito
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Selecciona la cantidad deseada
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-600">
                <div className="flex gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                      {product.brand}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-slate-900 dark:text-white">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-sm text-slate-500">c/u</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quantity Selection */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Cantidad
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <input
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
                      className="w-20 text-center py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />

                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stockQuantity}
                      className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      de {product.stockQuantity} disponibles
                    </div>
                  </div>
                </div>

                {/* Quick Quantity Buttons */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Cantidades rápidas:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[10, 25, 50, 100].map((qty) => (
                      <button
                        key={qty}
                        onClick={() =>
                          setQuantity(Math.min(qty, product.stockQuantity))
                        }
                        disabled={qty > product.stockQuantity}
                        className="py-2 px-3 text-sm border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {qty}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Volume Discount Info */}
                {volumeDiscount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-600/30 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <Package className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        ¡Descuento por volumen!{" "}
                        {(volumeDiscount * 100).toFixed(0)}% OFF
                      </span>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Ahorras {formatPrice(discountAmount)} en esta compra
                    </p>
                  </motion.div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Notas adicionales (opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Especificaciones especiales, fecha de entrega, etc."
                    rows={3}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              {/* Price Summary */}
              <div className="p-6 bg-slate-50 dark:bg-slate-700/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    Subtotal ({quantity} unidades):
                  </span>
                  <span className="text-slate-900 dark:text-white">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                {volumeDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 dark:text-green-400">
                      Descuento por volumen ({(volumeDiscount * 100).toFixed(0)}
                      %):
                    </span>
                    <span className="text-green-600 dark:text-green-400">
                      -{formatPrice(discountAmount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-lg font-semibold border-t border-slate-200 dark:border-slate-600 pt-2">
                  <span className="text-slate-900 dark:text-white">Total:</span>
                  <span className="text-slate-900 dark:text-white">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock || quantity === 0}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Agregar al Carrito
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
