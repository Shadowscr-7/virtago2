"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Search,
  User,
  Menu,
  X,
  Settings,
  LogOut,
  ShoppingBag,
  Heart,
  Shield,
  Home,
  Package,
  Tag,
  Building,
  Award,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { useTheme } from "@/contexts/theme-context";
import { CartButton } from "@/components/cart/cart-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  isAdminMode?: boolean;
}

const navLinks = [
  { name: "Inicio", href: "/", icon: Home },
  { name: "Productos", href: "/productos", icon: Package },
  { name: "Marcas", href: "/marcas", icon: Award },
  { name: "Proveedores", href: "/suppliers", icon: Building },
  { name: "Ofertas", href: "/ofertas", icon: Tag },
  { name: "Contacto", href: "/contacto", icon: Phone },
];

export function Navbar({ isAdminMode = false }: NavbarProps = {}) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { themeColors } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push("/");
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-2 flex-shrink-0">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: themeColors.primary }}
              >
                <Image
                  src="/images/logo.png"
                  alt="Virtago"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold" style={{ color: themeColors.primary }}>
                VIRTAGO
              </span>
            </motion.div>
          </Link>

          {/* Barra de búsqueda — solo desktop */}
          {!isAdminMode && (
            <div className="hidden md:flex flex-1 max-w-xl mx-4">
              <motion.div
                animate={{ scale: isSearchFocused ? 1.02 : 1 }}
                className={cn("relative transition-all duration-300 w-full", isSearchFocused && "drop-shadow-lg")}
              >
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
                      "w-full pl-10 pr-4 py-2 rounded-full border bg-white",
                      "transition-all duration-300 focus:outline-none focus:ring-2",
                      isSearchFocused && "shadow-lg",
                    )}
                    style={{
                      borderColor: themeColors.border,
                      ...(isSearchFocused && {
                        borderColor: themeColors.primary,
                        boxShadow: `0 0 0 2px ${themeColors.primary}`,
                      }),
                    }}
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
          )}

          {/* Acciones derecha */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Búsqueda mobile */}
            {!isAdminMode && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => { setIsMobileSearchOpen(!isMobileSearchOpen); setIsMobileMenuOpen(false); }}
                className="md:hidden p-2 rounded-full hover:bg-accent transition-colors"
              >
                <Search className="h-5 w-5" />
              </motion.button>
            )}

            {/* Carrito */}
            {!isAdminMode && <CartButton />}

            {/* Usuario/Auth */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 p-2 rounded-xl border transition-all"
                    style={{
                      backgroundColor: themeColors.surface + "20",
                      borderColor: themeColors.primary + "30",
                    }}
                  >
                    <User className="w-5 h-5" />
                    <div className="text-left hidden sm:block">
                      <p className="text-sm font-medium text-foreground leading-none">
                        {user.firstName}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize mt-0.5">
                        {user.role || user.userType}
                      </p>
                    </div>
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 border shadow-xl"
                  style={{
                    backgroundColor: themeColors.surface + "CC",
                    borderColor: themeColors.primary + "30",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <DropdownMenuLabel>
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <div>
                        <p className="font-medium text-foreground">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator style={{ backgroundColor: themeColors.primary + "30" }} />
                  <DropdownMenuItem asChild>
                    <Link href="/perfil" className="flex items-center text-foreground hover:text-foreground transition-all duration-200 rounded-md mx-1 hover:bg-accent/20">
                      <User className="mr-2 h-4 w-4" /><span>Mi Perfil</span>
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "user" && user.userType === "client" ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/mis-pedidos" className="flex items-center text-foreground hover:text-foreground transition-all duration-200 rounded-md mx-1 hover:bg-accent/20">
                          <ShoppingBag className="mr-2 h-4 w-4" /><span>Mis Pedidos</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/favoritos" className="flex items-center text-foreground hover:text-foreground transition-all duration-200 rounded-md mx-1 hover:bg-accent/20">
                          <Heart className="mr-2 h-4 w-4" /><span>Favoritos</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center text-foreground hover:text-foreground transition-all duration-200 rounded-md mx-1 hover:bg-accent/20">
                          <Shield className="mr-2 h-4 w-4" /><span>Administración</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/mis-pedidos" className="flex items-center text-foreground hover:text-foreground transition-all duration-200 rounded-md mx-1 hover:bg-accent/20">
                          <ShoppingBag className="mr-2 h-4 w-4" /><span>Mis Pedidos</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/favoritos" className="flex items-center text-foreground hover:text-foreground transition-all duration-200 rounded-md mx-1 hover:bg-accent/20">
                          <Heart className="mr-2 h-4 w-4" /><span>Favoritos</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/configuracion" className="flex items-center text-foreground hover:text-foreground transition-all duration-200 rounded-md mx-1 hover:bg-accent/20">
                      <Settings className="mr-2 h-4 w-4" /><span>Configuración</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator style={{ backgroundColor: themeColors.primary + "30" }} />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20 focus:text-red-300 focus:bg-red-500/20 transition-all duration-200 rounded-md mx-1"
                  >
                    <LogOut className="mr-2 h-4 w-4" /><span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/register">
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer inline-block"
                  >
                    Registro
                  </motion.span>
                </Link>
                <Link href="/login">
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-2 text-sm font-medium text-white rounded-lg transition-all cursor-pointer inline-block"
                    style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
                  >
                    Iniciar sesión
                  </motion.span>
                </Link>
              </div>
            )}

            {/* Hamburger — solo mobile */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { setIsMobileMenuOpen(!isMobileMenuOpen); setIsMobileSearchOpen(false); }}
              className="md:hidden p-2 rounded-full hover:bg-accent transition-colors"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isMobileMenuOpen ? (
                  <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Barra de búsqueda mobile expandible */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden pb-3 overflow-hidden"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar productos, marcas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border bg-white focus:outline-none focus:ring-2"
                  style={{ borderColor: themeColors.border, boxShadow: `0 0 0 2px ${themeColors.primary}` }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">×</button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Menú de navegación desktop */}
        <nav className="hidden md:flex items-center space-x-6 pb-2">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <motion.span
                  whileHover={{ y: -2 }}
                  className="text-sm font-medium transition-colors relative group cursor-pointer"
                  style={{ color: isActive ? themeColors.primary : undefined }}
                >
                  {item.name}
                  <motion.div
                    className="absolute -bottom-1 left-0 h-0.5 transition-all duration-300"
                    style={{
                      background: `linear-gradient(90deg, ${themeColors.primary}, ${themeColors.secondary})`,
                      width: isActive ? "100%" : "0%",
                    }}
                    whileHover={{ width: "100%" }}
                  />
                </motion.span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile menu drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden border-t bg-background overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 space-y-1">
              {/* Nav links */}
              {navLinks.map((item, index) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                      style={{
                        backgroundColor: isActive ? `${themeColors.primary}12` : "transparent",
                        color: isActive ? themeColors.primary : undefined,
                      }}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" style={{ color: isActive ? themeColors.primary : themeColors.text.secondary }} />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </motion.div>
                );
              })}

              {/* Divider */}
              <div className="h-px my-2" style={{ backgroundColor: themeColors.border }} />

              {/* Auth links (if not authenticated) */}
              {!isAuthenticated && (
                <div className="flex gap-3 px-4 pt-2 pb-1">
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex-1">
                    <span
                      className="block text-center py-2.5 rounded-xl font-medium text-sm border transition-all"
                      style={{ borderColor: themeColors.primary, color: themeColors.primary }}
                    >
                      Registrarse
                    </span>
                  </Link>
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex-1">
                    <span
                      className="block text-center py-2.5 rounded-xl font-medium text-sm text-white transition-all"
                      style={{ background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` }}
                    >
                      Iniciar sesión
                    </span>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
