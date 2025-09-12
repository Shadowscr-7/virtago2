"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard,
  Zap,
  Users,
  Package,
  Images,
  FileText,
  DollarSign,
  Percent,
  ShoppingCart,
  Ticket,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

const menuItems = [
  {
    id: "dashboard",
    label: "Inicio",
    icon: LayoutDashboard,
    href: "/admin",
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "quick-setup",
    label: "Configuración Rápida",
    icon: Zap,
    href: "/admin/configuracion-rapida",
    color: "from-purple-500 to-pink-500"
  },
  {
    id: "customers",
    label: "Clientes",
    icon: Users,
    href: "/admin/clientes",
    color: "from-green-500 to-emerald-500"
  },
  {
    id: "products",
    label: "Productos",
    icon: Package,
    href: "/admin/productos",
    color: "from-orange-500 to-red-500"
  },
  {
    id: "images",
    label: "Imágenes",
    icon: Images,
    href: "/admin/imagenes",
    color: "from-indigo-500 to-purple-500"
  },
  {
    id: "price-lists",
    label: "Lista de Precios",
    icon: FileText,
    href: "/admin/lista-precios",
    color: "from-yellow-500 to-orange-500"
  },
  {
    id: "prices",
    label: "Precios",
    icon: DollarSign,
    href: "/admin/precios",
    color: "from-emerald-500 to-teal-500"
  },
  {
    id: "discounts",
    label: "Descuentos",
    icon: Percent,
    href: "/admin/descuentos",
    color: "from-red-500 to-pink-500"
  },
  {
    id: "orders",
    label: "Órdenes",
    icon: ShoppingCart,
    href: "/admin/ordenes",
    color: "from-blue-500 to-indigo-500"
  },
  {
    id: "coupons",
    label: "Cupones",
    icon: Ticket,
    href: "/admin/cupones",
    color: "from-pink-500 to-rose-500"
  }
]

interface AdminSidebarProps {
  className?: string
}

export function AdminSidebar({ className = "" }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin"
    }
    return pathname.startsWith(href)
  }

  return (
    <motion.aside
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        relative h-screen bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900 
        border-r border-white/10 backdrop-blur-xl
        ${isCollapsed ? 'w-16' : 'w-64'} 
        transition-all duration-300 ease-in-out
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!isCollapsed && (
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            Panel Admin
          </motion.h2>
        )}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-300" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-300" />
          )}
        </motion.button>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-1">
        {menuItems.map((item, index) => {
          const IconComponent = item.icon
          const active = isActive(item.href)
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.02, x: isCollapsed ? 0 : 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    relative group flex items-center gap-3 p-3 rounded-xl transition-all duration-300
                    ${isCollapsed ? 'justify-center' : ''}
                    ${active 
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-${item.color.split(' ')[1]}/25` 
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  {/* Marcador activo */}
                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}

                  {/* Efecto de brillo al hacer hover */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Icono */}
                  <div className={`
                    relative z-10 p-2 rounded-lg transition-all duration-300
                    ${active 
                      ? 'bg-white/20' 
                      : 'bg-white/5 group-hover:bg-white/10'
                    }
                  `}>
                    <IconComponent className="w-5 h-5" />
                  </div>

                  {/* Texto */}
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="relative z-10 font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}

                  {/* Tooltip para modo colapsado */}
                  {isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      whileHover={{ opacity: 1, x: 0 }}
                      className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg shadow-lg border border-white/10 z-50 whitespace-nowrap pointer-events-none group-hover:pointer-events-auto"
                    >
                      {item.label}
                      <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45 border-l border-b border-white/10" />
                    </motion.div>
                  )}
                </motion.div>
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 px-2">
        {!isCollapsed ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mx-2 p-3 bg-white/5 rounded-lg border border-white/10"
          >
            <div className="text-xs text-gray-400 text-center">
              <div className="font-medium text-gray-300">Panel Admin</div>
              <div>VIRTAGO v2.0</div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg border border-white/10 flex items-center justify-center">
              <div className="w-2 h-2 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full" />
            </div>
          </motion.div>
        )}
      </div>
    </motion.aside>
  )
}
