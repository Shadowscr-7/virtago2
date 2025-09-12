"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, User, Menu, Settings, LogOut, ShoppingBag, Heart, Shield } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { CartButton } from "@/components/cart/cart-button"
import { useAuthStore } from "@/lib/auth-store"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8"
              >
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500" />
                <div className="absolute inset-0.5 rounded-lg bg-background flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">V</span>
                </div>
              </motion.div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              VIRTAGO
            </span>
          </motion.div>

          {/* Barra de búsqueda */}
          <div className="flex-1 max-w-xl mx-8">
            <motion.div
              animate={{
                scale: isSearchFocused ? 1.02 : 1,
              }}
              className={cn(
                "relative transition-all duration-300",
                isSearchFocused && "drop-shadow-lg"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 rounded-full blur-sm" />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar productos, marcas o proveedores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className={cn(
                    "w-full pl-10 pr-4 py-2 rounded-full border bg-background/50 backdrop-blur",
                    "transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50",
                    isSearchFocused && "bg-background/80 shadow-lg"
                  )}
                />
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    ×
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Acciones de la derecha */}
          <div className="flex items-center space-x-4">
            {/* Carrito */}
            <CartButton />

            {/* Usuario/Auth */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
                  >
                    <div className="text-2xl">{user.avatar}</div>
                    <div className="text-left hidden sm:block">
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      <p className="text-xs text-white/70 capitalize">{user.role}</p>
                    </div>
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-purple-900/50 backdrop-blur-lg border border-purple-500/30 shadow-xl">
                  <DropdownMenuLabel>
                    <div className="flex items-center space-x-2">
                      <div className="text-lg">{user.avatar}</div>
                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-xs text-purple-200">{user.email}</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-purple-500/30" />
                  
                  <DropdownMenuItem asChild>
                    <Link href="/perfil" className="flex items-center text-white hover:bg-purple-500/20 hover:text-purple-100 transition-all duration-200 rounded-md mx-1">
                      <User className="mr-2 h-4 w-4" />
                      <span>Mi Perfil</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  {user.role === 'cliente' ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/mis-pedidos" className="flex items-center text-white hover:bg-purple-500/20 hover:text-purple-100 transition-all duration-200 rounded-md mx-1">
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          <span>Mis Pedidos</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/favoritos" className="flex items-center text-white hover:bg-purple-500/20 hover:text-purple-100 transition-all duration-200 rounded-md mx-1">
                          <Heart className="mr-2 h-4 w-4" />
                          <span>Favoritos</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center text-white hover:bg-purple-500/20 hover:text-purple-100 transition-all duration-200 rounded-md mx-1">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Administración</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/mis-pedidos" className="flex items-center text-white hover:bg-purple-500/20 hover:text-purple-100 transition-all duration-200 rounded-md mx-1">
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          <span>Mis Pedidos</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/favoritos" className="flex items-center text-white hover:bg-purple-500/20 hover:text-purple-100 transition-all duration-200 rounded-md mx-1">
                          <Heart className="mr-2 h-4 w-4" />
                          <span>Favoritos</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuItem asChild>
                    <Link href="/configuracion" className="flex items-center text-white hover:bg-purple-500/20 hover:text-purple-100 transition-all duration-200 rounded-md mx-1">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configuración</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="bg-purple-500/30" />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-300 hover:text-red-200 hover:bg-red-500/20 focus:text-red-200 focus:bg-red-500/20 transition-all duration-200 rounded-md mx-1">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/register">
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer inline-block"
                  >
                    Registro
                  </motion.span>
                </Link>
                <Link href="/login">
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all cursor-pointer inline-block"
                  >
                    Iniciar sesión
                  </motion.span>
                </Link>
              </div>
            )}

            {/* Usuario logueado (oculto por ahora) */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full hover:bg-accent transition-colors hidden"
            >
              <User className="h-5 w-5" />
            </motion.button>

            {/* Menú móvil */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full hover:bg-accent transition-colors md:hidden"
            >
              <Menu className="h-5 w-5" />
            </motion.button>
          </div>
        </div>

        {/* Menú de navegación */}
        <nav className="hidden md:flex items-center space-x-6 pb-2">
          {[
            { name: "Inicio", href: "/" },
            { name: "Productos", href: "/productos" },
            { name: "Marcas", href: "/marcas" },
            { name: "Proveedores", href: "/suppliers" },
            { name: "Ofertas", href: "/ofertas" },
            { name: "Contacto", href: "/contacto" }
          ].map((item) => (
            <Link key={item.name} href={item.href}>
              <motion.span
                whileHover={{ y: -2 }}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group cursor-pointer"
              >
                {item.name}
                <motion.div
                  className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300"
                />
              </motion.span>
            </Link>
          ))}
        </nav>
      </div>
    </motion.header>
  )
}
