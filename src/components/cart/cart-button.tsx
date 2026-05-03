"use client";

import { useCartStore } from "./cart-store";
import { ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function CartButton() {
  const { getTotalItems, openCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const solidRed = "#C8102E";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Usar 0 en servidor para evitar hydration mismatch (el store se rehidrata en cliente)
  const totalItems = mounted ? getTotalItems() : 0;

  return (
    <motion.button
      onClick={openCart}
      className="relative p-3 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl group"
      style={{ backgroundColor: solidRed }}
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
          className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-lg"
          style={{ backgroundColor: solidRed }}
        >
          {totalItems > 99 ? "99+" : totalItems}
        </motion.span>
      )}
    </motion.button>
  );
}
