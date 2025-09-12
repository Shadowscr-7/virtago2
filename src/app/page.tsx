"use client"

import { motion } from "framer-motion"
import { OfferBanner } from "@/components/banners/offer-banner"
import { ProductCard } from "@/components/products/product-card"
import { ArrowRight, Star, TrendingUp, Users, ShieldCheck } from "lucide-react"

// Mock data para productos
const featuredProducts = [
  {
    name: "Smartphone Pro Max 256GB",
    brand: "TechBrand",
    supplier: "TechSupplier SA",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
    price: 899000,
    originalPrice: 999000,
    description: "Último modelo con tecnología avanzada y cámara profesional"
  },
  {
    name: "Laptop Gaming RGB 16GB",
    brand: "GameTech",
    supplier: "Gaming Solutions",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
    price: 1299000,
    description: "Potencia extrema para gaming y trabajo profesional"
  },
  {
    name: "Auriculares Inalámbricos Pro",
    brand: "AudioMax",
    supplier: "Audio Premium",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    price: 199000,
    originalPrice: 249000,
    description: "Cancelación de ruido activa y sonido de alta fidelidad"
  },
  {
    name: "Tablet Profesional 12.9\"",
    brand: "TabletPro",
    supplier: "Digital Devices",
    image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400",
    price: 799000,
    description: "Perfecta para diseño y productividad profesional"
  },
  {
    name: "Smartwatch Serie 8",
    brand: "WearTech",
    supplier: "Wearables Inc",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    price: 349000,
    originalPrice: 399000,
    description: "Monitoreo avanzado de salud y fitness"
  },
  {
    name: "Cámara Mirrorless 4K",
    brand: "PhotoPro",
    supplier: "Camera Experts",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400",
    price: 1199000,
    description: "Calidad profesional para fotografía y video"
  }
]

export default function Home() {
  // Simular estado de autenticación (false por defecto)
  const isAuthenticated = false

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Section con banners */}
        <section className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent mb-4">
              Bienvenido a Virtago
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              La plataforma B2B más avanzada para compras mayoristas. 
              Conectamos marcas, proveedores y distribuidores en un solo lugar.
            </p>
          </motion.div>

          {/* Banners de ofertas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <OfferBanner
                title="Mega Sale B2B"
                subtitle="Ofertas exclusivas"
                description="Descuentos de hasta 40% en productos seleccionados para empresas registradas"
                discount="Hasta 40% OFF"
                variant="primary"
                ctaText="Ver todas las ofertas"
              />
            </div>
            <div className="space-y-4">
              <OfferBanner
                title="Nuevas Marcas"
                description="Descubre productos de proveedores verificados"
                discount="Nuevo"
                variant="secondary"
                ctaText="Explorar"
              />
              <OfferBanner
                title="Envío Gratis"
                description="En compras mayores a $500.000"
                variant="secondary"
                ctaText="Más info"
              />
            </div>
          </div>
        </section>

        {/* Estadísticas */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { icon: Users, label: "Empresas Registradas", value: "10,000+" },
            { icon: Star, label: "Productos Disponibles", value: "50,000+" },
            { icon: TrendingUp, label: "Marcas Aliadas", value: "500+" },
            { icon: ShieldCheck, label: "Proveedores Verificados", value: "1,200+" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
              className="text-center p-6 rounded-xl bg-card border hover:shadow-lg transition-shadow"
            >
              <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.section>

        {/* Mensaje de autenticación si no está logueado */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6 text-center"
          >
            <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-2">
              ¿Eres una empresa? Accede a precios exclusivos B2B
            </h3>
            <p className="text-purple-600 dark:text-purple-400 mb-4">
              Regístrate o inicia sesión para ver precios mayoristas y descuentos especiales
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Iniciar Sesión
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 border border-primary text-primary rounded-lg font-medium hover:bg-primary/10 transition-colors"
              >
                Registrarse
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Productos destacados */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-3xl font-bold text-foreground"
            >
              Productos Destacados
            </motion.h2>
            <motion.a
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              href="#"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors group"
            >
              Ver todos
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </motion.a>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
              >
                <ProductCard
                  {...product}
                  isAuthenticated={isAuthenticated}
                  isFavorite={index % 3 === 0} // Algunos productos como favoritos para demo
                />
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Categorías populares */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="space-y-6"
        >
          <h2 className="text-3xl font-bold text-foreground text-center">
            Categorías Populares
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Electrónicos", count: "15,420", color: "from-blue-500 to-cyan-500" },
              { name: "Informática", count: "8,340", color: "from-purple-500 to-pink-500" },
              { name: "Hogar", count: "12,180", color: "from-green-500 to-emerald-500" },
              { name: "Oficina", count: "6,920", color: "from-orange-500 to-red-500" }
            ].map((category) => (
              <motion.div
                key={category.name}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative p-6 rounded-xl bg-card border hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                <div className="relative z-10">
                  <h3 className="font-semibold text-foreground mb-1">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.count} productos</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  )
}
