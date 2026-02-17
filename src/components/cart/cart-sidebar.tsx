"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Plus, Minus, Trash2, Package2 } from "lucide-react";
import { useCartStore } from "./cart-store";
import Image from "next/image";
import Link from "next/link";

export function CartSidebar() {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    getTotalItems,
    getTotalPrice,
    getItemsBySupplier,
    getSupplierTotals,
  } = useCartStore();

  const [processingItemId, setProcessingItemId] = useState<string | null>(null);

  const itemsBySupplier = getItemsBySupplier();
  const supplierTotals = getSupplierTotals();
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    setProcessingItemId(itemId);
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    updateQuantity(itemId, newQuantity);
    setProcessingItemId(null);
  };

  const handleRemoveItem = async (itemId: string) => {
    setProcessingItemId(itemId);
    await new Promise((resolve) => setTimeout(resolve, 200));
    removeItem(itemId);
    setProcessingItemId(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Carrito de Compras
                </h2>
                {totalItems > 0 && (
                  <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full font-medium">
                    {totalItems}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="text-6xl mb-4">🛒</div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    Tu carrito está vacío
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Explora nuestros productos y encuentra lo que necesitas
                  </p>
                  <Link
                    href="/productos"
                    onClick={closeCart}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                  >
                    Ver Productos
                  </Link>
                </div>
              ) : (
                <div className="p-6 space-y-8">
                  {/* Items grouped by supplier */}
                  {Object.entries(itemsBySupplier).map(
                    ([supplier, supplierItems]) => (
                      <div key={supplier} className="space-y-4">
                        {/* Supplier Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-3">
                            <Package2 className="w-5 h-5 text-blue-600" />
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                              {supplier}
                            </h3>
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {supplierTotals[supplier]?.items}{" "}
                            {supplierTotals[supplier]?.items === 1
                              ? "artículo"
                              : "artículos"}
                          </div>
                        </div>

                        {/* Supplier Items */}
                        <div className="space-y-4">
                          {supplierItems.map((item) => (
                            <motion.div
                              key={item.id}
                              layout
                              className={`bg-slate-50 dark:bg-slate-800 rounded-xl p-4 ${
                                processingItemId === item.id ? "opacity-50" : ""
                              }`}
                            >
                              <div className="flex gap-4">
                                {/* Product Image */}
                                <div className="relative w-16 h-16 bg-white dark:bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                                  {item.image ? (
                                    <Image
                                      src={item.image}
                                      alt={item.name || 'Producto'}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Package2 className="w-8 h-8 text-slate-400" />
                                    </div>
                                  )}
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 space-y-2">
                                  <div>
                                    <h4 className="font-medium text-slate-900 dark:text-white line-clamp-2 text-sm">
                                      {item.name}
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      {item.brand} • {item.category}
                                    </p>
                                  </div>

                                  {/* Price */}
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900 dark:text-white">
                                      ${item.price.toLocaleString()}
                                    </span>
                                    {item.originalPrice &&
                                      item.originalPrice > item.price && (
                                        <span className="text-xs text-slate-400 line-through">
                                          ${item.originalPrice.toLocaleString()}
                                        </span>
                                      )}
                                  </div>

                                  {/* Quantity Controls */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() =>
                                          handleQuantityChange(
                                            item.id,
                                            item.quantity - 1,
                                          )
                                        }
                                        disabled={
                                          processingItemId === item.id ||
                                          item.quantity <= 1
                                        }
                                        className="w-7 h-7 rounded-md bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className="w-8 text-center text-sm font-medium text-slate-900 dark:text-white">
                                        {item.quantity}
                                      </span>
                                      <button
                                        onClick={() =>
                                          handleQuantityChange(
                                            item.id,
                                            item.quantity + 1,
                                          )
                                        }
                                        disabled={
                                          processingItemId === item.id ||
                                          item.quantity >= item.stockQuantity
                                        }
                                        className="w-7 h-7 rounded-md bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>

                                    <button
                                      onClick={() => handleRemoveItem(item.id)}
                                      disabled={processingItemId === item.id}
                                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>

                                  {/* Stock Warning */}
                                  {item.quantity >= item.stockQuantity && (
                                    <p className="text-xs text-orange-600 dark:text-orange-400">
                                      Stock máximo alcanzado
                                    </p>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Supplier Subtotal */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-blue-800 dark:text-blue-300">
                              Subtotal {supplier}:
                            </span>
                            <span className="font-bold text-blue-900 dark:text-blue-200">
                              $
                              {supplierTotals[supplier]?.total.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>

            {/* Footer - Total and Checkout */}
            {items.length > 0 && (
              <div className="border-t border-slate-200 dark:border-slate-700 p-6 space-y-4">
                {/* Total */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-600 dark:text-slate-400">
                      Total items:
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {totalItems}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-slate-900 dark:text-white">
                      Total:
                    </span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      ${totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Proceder al Checkout
                </Link>

                <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                  Los impuestos y gastos de envío se calcularán en el checkout
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
