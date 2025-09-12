"use client"

import { useCartStore } from "./cart-store"
import { ShoppingCart } from "lucide-react"
import { motion } from "framer-motion"

export function CartButton() {
  const { getTotalItems, openCart } = useCartStore()
  const totalItems = getTotalItems()

  return (
    <motion.button
      onClick={openCart}
      className="relative p-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={{
          rotate: totalItems > 0 ? [0, -10, 10, -10, 0] : 0,
        }}
        transition={{ duration: 0.5 }}
      >
        <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </motion.div>
      
      {totalItems > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg"
        >
          {totalItems > 99 ? '99+' : totalItems}
        </motion.span>
      )}
    </motion.button>
  )
}
