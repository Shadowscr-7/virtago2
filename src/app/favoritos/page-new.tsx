"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  ShoppingCart,
  Search,
  Filter,
  Eye,
  Star,
  Package,
  Tag,
  ArrowRight,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useCartStore } from "@/components/cart/cart-store";
import { toast } from "sonner";
import Link from "next/link";

export default function FavoritesPage() {
  const { user, favorites, removeFromFavorites } = useAuthStore();
  const { addItem } = useCartStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("dateAdded");

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Acceso Denegado
          </h1>
          <p className="text-muted-foreground mb-6">
            Debes iniciar sesión para ver tus favoritos
          </p>
          <Link
            href="/login"
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Iniciar Sesión
          </Link>
        </motion.div>
      </div>
    );
  }

  const filteredFavorites = favorites
    .filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price":
          return a.price - b.price;
        case "brand":
          return a.brand.localeCompare(b.brand);
        case "dateAdded":
        default:
          return (
            new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
          );
      }
    });

  const handleAddToCart = (item: (typeof favorites)[0]) => {
    addItem({
      productId: item.productId,
      name: item.name,
      brand: item.brand,
      supplier: item.supplier,
      supplierId: "supplier-1", // Default supplier ID
      image: item.image,
      price: item.price,
      quantity: 1,
      inStock: true,
      stockQuantity: 100,
      category: "general",
    });
    toast.success(`${item.name} añadido al carrito`);
  };

  const handleRemoveFromFavorites = (productId: string, itemName: string) => {
    removeFromFavorites(productId);
    toast.success(`${itemName} eliminado de favoritos`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4"
            >
              Mis Favoritos
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-600 dark:text-slate-400 text-lg"
            >
              Productos que has guardado para más tarde
            </motion.p>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {[
              {
                label: "Productos Favoritos",
                value: favorites.length,
                color: "from-purple-500 to-pink-500",
                icon: Heart,
              },
              {
                label: "Valor Total",
                value: `$${favorites.reduce((sum, item) => sum + item.price, 0).toLocaleString()}`,
                color: "from-blue-500 to-cyan-500",
                icon: Tag,
              },
              {
                label: "Marcas Diferentes",
                value: new Set(favorites.map((item) => item.brand)).size,
                color: "from-green-500 to-emerald-500",
                icon: Star,
              },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6 relative overflow-hidden"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-5`}
                  />
                  <div className="relative">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mb-4`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                      {stat.value}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      {stat.label}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar en favoritos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white/50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Filter className="w-4 h-4 text-slate-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white/50 dark:bg-slate-700/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                >
                  <option value="dateAdded">Fecha añadido</option>
                  <option value="name">Nombre</option>
                  <option value="price">Precio</option>
                  <option value="brand">Marca</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Favorites Grid */}
          <div className="space-y-6">
            {filteredFavorites.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20"
              >
                <Heart className="w-20 h-20 text-slate-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  {favorites.length === 0
                    ? "No tienes favoritos aún"
                    : "No se encontraron productos"}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                  {favorites.length === 0
                    ? "Explora nuestro catálogo y guarda los productos que más te gusten"
                    : "Prueba a ajustar los filtros de búsqueda"}
                </p>
                {favorites.length === 0 && (
                  <Link
                    href="/productos"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all text-lg font-medium"
                  >
                    <Package className="w-5 h-5" />
                    Explorar Productos
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                )}
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFavorites.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-3xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300"
                  >
                    {/* Product Image */}
                    <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Package className="w-16 h-16 text-slate-400" />
                      </div>

                      {/* Heart Button */}
                      <button
                        onClick={() =>
                          handleRemoveFromFavorites(item.productId, item.name)
                        }
                        className="absolute top-4 right-4 w-10 h-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-white dark:hover:bg-slate-800 transition-all"
                      >
                        <Heart className="w-5 h-5 fill-current" />
                      </button>
                    </div>

                    {/* Product Info */}
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
                          <span className="font-medium">{item.brand}</span>
                          <span>•</span>
                          <span>{item.supplier}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Añadido el{" "}
                          {new Date(item.dateAdded).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="mb-6">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">
                          ${item.price.toLocaleString()}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-xl transition-all font-medium"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Añadir al Carrito
                        </button>

                        <Link
                          href={`/productos/${item.productId}`}
                          className="w-12 h-12 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl flex items-center justify-center transition-colors"
                        >
                          <Eye className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
