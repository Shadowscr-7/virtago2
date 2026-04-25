"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { OfferBanner } from "@/components/banners/offer-banner";
import { ProductCard } from "@/components/products/product-card";
import { useTheme } from "@/contexts/theme-context";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { ChatDemo } from "@/components/chat/ChatDemo";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { ArrowRight, Star, TrendingUp, Users, ShieldCheck, FlaskConical } from "lucide-react";
import { api } from "@/api";

// Datos demo — se muestran solo cuando no hay productos reales en la base de datos
const demoProducts = [
  {
    name: "Smartphone Pro Max 256GB",
    brand: "TechBrand",
    supplier: "TechSupplier SA",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
    price: 899000,
    originalPrice: 999000,
    description: "Último modelo con tecnología avanzada y cámara profesional",
  },
  {
    name: "Laptop Gaming RGB 16GB",
    brand: "GameTech",
    supplier: "Gaming Solutions",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
    price: 1299000,
    description: "Potencia extrema para gaming y trabajo profesional",
  },
  {
    name: "Auriculares Inalámbricos Pro",
    brand: "AudioMax",
    supplier: "Audio Premium",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    price: 199000,
    originalPrice: 249000,
    description: "Cancelación de ruido activa y sonido de alta fidelidad",
  },
  {
    name: 'Tablet Profesional 12.9"',
    brand: "TabletPro",
    supplier: "Digital Devices",
    image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400",
    price: 799000,
    description: "Perfecta para diseño y productividad profesional",
  },
  {
    name: "Smartwatch Serie 8",
    brand: "WearTech",
    supplier: "Wearables Inc",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    price: 349000,
    originalPrice: 399000,
    description: "Monitoreo avanzado de salud y fitness",
  },
  {
    name: "Cámara Mirrorless 4K",
    brand: "PhotoPro",
    supplier: "Camera Experts",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400",
    price: 1199000,
    description: "Calidad profesional para fotografía y video",
  },
];

export default function Home() {
  // Obtener el estado real de autenticación
  const { isAuthenticated } = useAuthStore();
  const { themeColors } = useTheme();
  const router = useRouter();

  // Estado para productos reales vs demo
  const [featuredProducts, setFeaturedProducts] = useState(demoProducts);
  const [isDemo, setIsDemo] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Intentar cargar productos reales del backend
  useEffect(() => {
    const loadRealProducts = async () => {
      try {
        setIsLoadingProducts(true);
        const response = await api.product.getProductsWithDiscounts({ page: 1, limit: 6 });
        
        // Extraer productos de las posibles estructuras de respuesta
        let products: any[] = [];
        const data = response?.data as any;
        
        if (Array.isArray(data)) {
          products = data;
        } else if (data?.products && Array.isArray(data.products)) {
          products = data.products;
        } else if (data?.data && Array.isArray(data.data)) {
          products = data.data;
        }

        if (products.length > 0) {
          // Adaptar productos reales al formato de ProductCard
          const adapted = products.map((p: any) => ({
            id: p.id || p.prodVirtaId || p.productId,
            name: p.name || p.title || 'Producto',
            brand: p.brandId || p.brand || '',
            supplier: p.distributorCode || '',
            image: p.productImages?.[0]?.url || '/images/placeholder-product.png',
            price: p.pricing?.final_price || p.pricing?.base_price || p.price || 0,
            originalPrice: p.pricing?.has_discount ? p.pricing.base_price : undefined,
            description: p.shortDescription || p.fullDescription || p.description || '',
            productImages: p.productImages,
            pricing: p.pricing,
          }));
          setFeaturedProducts(adapted);
          setIsDemo(false);
          console.log(`🛍️ Home: ${adapted.length} productos reales cargados`);
        } else {
          console.log('🏷️ Home: Sin productos reales, mostrando datos demo');
          setIsDemo(true);
        }
      } catch (error) {
        console.log('🏷️ Home: Error cargando productos, mostrando datos demo');
        setIsDemo(true);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadRealProducts();
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />
      <main className="container mx-auto px-4 py-8 space-y-12 relative z-10">
        {/* Hero Section con banners */}
        <section className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-4 md:mb-8"
          >
            <h1
              className="text-2xl sm:text-4xl md:text-6xl font-bold bg-clip-text text-transparent mb-3 md:mb-4"
              style={{
                backgroundImage: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary}, ${themeColors.accent})`,
              }}
            >
              Bienvenido a Virtago
            </h1>
            <p className="hidden sm:block text-xl text-muted-foreground max-w-2xl mx-auto">
              La plataforma B2B más avanzada para compras mayoristas. Conectamos
              marcas, proveedores y distribuidores en un solo lugar.
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
            <div className="hidden md:block space-y-4">
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
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="hidden md:grid md:grid-cols-4 gap-6"
        >
          {[
            { icon: Users, label: "Empresas Registradas", value: "10,000+" },
            { icon: Star, label: "Productos Disponibles", value: "50,000+" },
            { icon: TrendingUp, label: "Marcas Aliadas", value: "500+" },
            {
              icon: ShieldCheck,
              label: "Proveedores Verificados",
              value: "1,200+",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
              className="text-center p-6 rounded-xl bg-card border hover:shadow-lg transition-shadow"
            >
              <stat.icon
                className="h-8 w-8 mx-auto mb-2"
                style={{ color: themeColors.primary }}
              />
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
            className="border rounded-xl p-6 text-center"
            style={{
              background: `linear-gradient(135deg, ${themeColors.primary}10, ${themeColors.secondary}10)`,
              borderColor: themeColors.primary + "30",
            }}
          >
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: themeColors.primary }}
            >
              ¿Eres una empresa? Accede a precios exclusivos B2B
            </h3>
            <p className="mb-4" style={{ color: themeColors.text.secondary }}>
              Regístrate o inicia sesión para ver precios mayoristas y
              descuentos especiales
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/login')}
                className="px-6 py-2 text-white rounded-lg font-medium transition-all"
                style={{ backgroundColor: themeColors.primary }}
              >
                Iniciar Sesión
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/register')}
                className="px-6 py-2 border rounded-lg font-medium transition-all"
                style={{
                  borderColor: themeColors.primary,
                  color: themeColors.primary,
                }}
              >
                Registrarse
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Productos destacados */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-xl md:text-3xl font-bold text-foreground"
              >
                {isDemo ? 'Productos Demo' : 'Productos Destacados'}
              </motion.h2>
              {isDemo && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  Demo
                </motion.span>
              )}
            </div>
            <motion.a
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              href="/productos"
              className="flex items-center gap-2 transition-colors group"
              style={{ color: themeColors.primary }}
            >
              Ver todos
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </motion.a>
          </div>

          {/* Banner informativo cuando son productos demo */}
          {isDemo && !isLoadingProducts && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-sm"
            >
              <FlaskConical className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                <span className="font-semibold">Estos son productos de demostración.</span>{' '}
                Cuando se carguen productos reales en la base de datos, se mostrarán automáticamente aquí.
              </p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6"
          >
            {featuredProducts.slice(0, isMobile ? 4 : 6).map((product, index) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
              >
                <ProductCard
                  {...product}
                  isAuthenticated={isAuthenticated}
                  isFavorite={isDemo ? index % 3 === 0 : false}
                />
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Chat Demo — solo desktop */}
        <div className="hidden md:block">
          <ChatDemo />
        </div>

        {/* Categorías populares */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-4 md:space-y-6"
        >
          <h2 className="text-xl md:text-3xl font-bold text-foreground text-center">
            Categorías Populares
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                name: "Electrónicos",
                count: "15,420",
                colorIndex: 0,
              },
              {
                name: "Informática",
                count: "8,340",
                colorIndex: 1,
              },
              {
                name: "Hogar",
                count: "12,180",
                colorIndex: 2,
              },
              {
                name: "Oficina",
                count: "6,920",
                colorIndex: 3,
              },
            ].map((category) => {
              // Rotar entre los colores del tema
              const colors = [
                themeColors.primary,
                themeColors.secondary,
                themeColors.accent,
                themeColors.primary,
              ];
              const categoryColor = colors[category.colorIndex];

              return (
                <motion.div
                  key={category.name}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative p-6 rounded-xl bg-card border hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
                  style={{
                    background: `linear-gradient(135deg, ${categoryColor}05, ${categoryColor}10)`,
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
                    style={{
                      background: `linear-gradient(135deg, ${categoryColor}, ${categoryColor}80)`,
                    }}
                  />
                  <div className="relative z-10">
                    <h3 className="font-semibold text-foreground mb-1">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {category.count} productos
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      </main>
    </div>
  );
}
