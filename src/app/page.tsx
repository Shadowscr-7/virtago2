"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ProductCard } from "@/components/products/product-card";
import { useTheme } from "@/contexts/theme-context";
import { ChatDemo } from "@/components/chat/ChatDemo";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { api } from "@/api";
import { SmartCartBanner } from "@/components/smart-cart/SmartCartBanner";


export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const { themeColors } = useTheme();
  const router = useRouter();

  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const loadRealProducts = async () => {
      try {
        const response = await api.product.getProductsWithDiscounts({ page: 1, limit: 6 });

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
          const adapted = products.map((p: any) => ({
            id: p.id || p.prodVirtaId || p.productId,
            name: p.name || p.title || "Producto",
            brand: p.brandId || p.brand || "",
            supplier: p.distributorCode || "",
            image: p.productImages?.[0]?.url || "",
            price: p.pricing?.final_price || p.pricing?.base_price || p.price || 0,
            originalPrice: p.pricing?.has_discount ? p.pricing.base_price : undefined,
            description: p.shortDescription || p.fullDescription || p.description || "",
            productImages: p.productImages,
            pricing: p.pricing,
          }));
          setFeaturedProducts(adapted);
        }
      } catch {
        // sin productos — la sección no se muestra
      }
    };

    loadRealProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Smart Cart Banner — solo visible para clientes con plan GOLD/PLATINUM */}
        {isAuthenticated && (
          <div className="mb-2">
            <SmartCartBanner />
          </div>
        )}

        {/* Hero Section */}
        <section className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-4 md:mb-8"
          >
            <h1
              className="text-2xl sm:text-4xl md:text-6xl font-bold mb-3 md:mb-4"
              style={{ color: themeColors.primary }}
            >
              Estás en Virtago
            </h1>
            <p className="hidden sm:block text-xl text-muted-foreground max-w-2xl mx-auto">
              Conectamos de manera simple todo tu ecosistema Comercial.
            </p>
          </motion.div>

          {/* Banner full-width */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="w-full overflow-hidden rounded-2xl"
            style={{ aspectRatio: "1440 / 400" }}
          >
            <Image
              src="/images/banner.jpg"
              alt="Banner principal Virtago"
              width={1440}
              height={400}
              className="w-full h-full object-cover rounded-2xl"
              priority
            />
          </motion.div>

          {/* Texto con flechas debajo del banner */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-center gap-4 py-6"
          >
            <motion.span
              animate={{ x: [-4, 0, -4] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="text-2xl font-light select-none"
              style={{ color: themeColors.primary }}
            >
              ←
            </motion.span>
            <span
              className="text-base sm:text-lg font-medium tracking-wide"
              style={{
                color: themeColors.primary,
                fontFamily: "var(--font-manrope), sans-serif",
              }}
            >
              deslizá para hacer tu pedido
            </span>
            <motion.span
              animate={{ x: [4, 0, 4] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="text-2xl font-light select-none"
              style={{ color: themeColors.primary }}
            >
              →
            </motion.span>
          </motion.div>
        </section>

        {/* CTA "Empezar gratis" — solo visible si no está autenticado */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/register")}
              className="px-10 py-4 rounded-2xl font-bold text-lg tracking-wide shadow-lg transition-all"
              style={{
                backgroundColor: "#F5C518",
                color: "#1A1A1A",
                boxShadow: "0 6px 24px rgba(245,197,24,0.45)",
              }}
            >
              Empezar gratis
            </motion.button>
          </motion.div>
        )}

        {/* Productos destacados — solo si hay productos reales */}
        {featuredProducts.length > 0 && (
          <section className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-between">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-xl md:text-3xl font-bold text-foreground"
              >
                Productos Destacados
              </motion.h2>
              <motion.a
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                href="/productos"
                className="flex items-center gap-2 transition-colors group text-sm"
                style={{ color: themeColors.primary }}
              >
                Ver todos
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </motion.a>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6"
            >
              {featuredProducts.slice(0, isMobile ? 4 : 6).map((product, index) => (
                <motion.div
                  key={product.id || product.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                >
                  <ProductCard
                    {...product}
                    isAuthenticated={isAuthenticated}
                  />
                </motion.div>
              ))}
            </motion.div>
          </section>
        )}

        {/* Chat Demo — solo desktop */}
        <div className="hidden md:block">
          <ChatDemo />
        </div>

      </main>
    </div>
  );
}
