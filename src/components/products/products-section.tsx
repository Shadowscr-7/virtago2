"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api, ProductWithDiscounts, ProductDiscount } from "@/api";
import { ProductsHero } from "./products-hero";
import { ProductsFilters } from "./products-filters";
import { ProductsGrid } from "./products-grid";
import { ProductsStats } from "./products-stats";

// Mock data expandido para productos
const mockProducts = [
  {
    id: "1",
    name: "iPhone 15 Pro Max 256GB",
    brand: "Apple",
    supplier: "Tech Distribution SA",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
    price: 24999,
    originalPrice: 27999,
    description:
      "El smartphone más avanzado con chip A17 Pro y cámara profesional",
    category: "Electrónicos",
    subcategory: "Smartphones",
    inStock: true,
    stockQuantity: 150,
    rating: 4.8,
    reviews: 324,
    tags: ["5G", "Pro", "Premium", "iOS"],
    specifications: {
      pantalla: "6.1 pulgadas Super Retina XDR",
      almacenamiento: "256GB",
      ram: "8GB",
      bateria: "Hasta 29 horas de video",
    } as Record<string, string>,
  },
  {
    id: "2",
    name: 'MacBook Pro 16" M3',
    brand: "Apple",
    supplier: "Apple Authorized",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
    price: 45999,
    originalPrice: 49999,
    description: "Laptop profesional con chip M3 para máximo rendimiento",
    category: "Informática",
    subcategory: "Laptops",
    inStock: true,
    stockQuantity: 45,
    rating: 4.9,
    reviews: 187,
    tags: ["M3", "Pro", "macOS", "16 pulgadas"],
    specifications: {
      procesador: "Apple M3",
      ram: "16GB",
      almacenamiento: "512GB SSD",
      pantalla: "16.2 pulgadas",
    } as Record<string, string>,
  },
  {
    id: "3",
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    supplier: "Samsung Electronics",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
    price: 22999,
    description: "Smartphone premium con S Pen y cámara de 200MP",
    category: "Electrónicos",
    subcategory: "Smartphones",
    inStock: true,
    stockQuantity: 89,
    rating: 4.7,
    reviews: 256,
    tags: ["Android", "S Pen", "200MP", "Ultra"],
    specifications: {
      pantalla: "6.8 pulgadas",
      almacenamiento: "256GB",
      ram: "12GB",
      bateria: "5000 mAh",
    } as Record<string, string>,
  },
  {
    id: "4",
    name: "AirPods Pro 2da Gen",
    brand: "Apple",
    supplier: "Tech Distribution SA",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    price: 5999,
    originalPrice: 6499,
    description: "Auriculares inalámbricos con cancelación activa de ruido",
    category: "Electrónicos",
    subcategory: "Audio",
    inStock: true,
    stockQuantity: 234,
    rating: 4.6,
    reviews: 412,
    tags: ["Bluetooth", "ANC", "iOS", "Premium"],
    specifications: {
      conectividad: "Bluetooth 5.3",
      bateria: "30 horas",
      resistencia: "IPX4",
      cancelacion: "Activa",
    } as Record<string, string>,
  },
  {
    id: "5",
    name: "Dell XPS 13 Plus",
    brand: "Dell",
    supplier: "Dell Business",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
    price: 28999,
    description: "Ultrabook premium para profesionales exigentes",
    category: "Informática",
    subcategory: "Laptops",
    inStock: true,
    stockQuantity: 67,
    rating: 4.5,
    reviews: 143,
    tags: ["Intel", "Windows", "Ultrabook", "Business"],
    specifications: {
      procesador: "Intel i7-1360P",
      ram: "16GB",
      almacenamiento: "512GB SSD",
      pantalla: "13.4 pulgadas",
    } as Record<string, string>,
  },
  {
    id: "6",
    name: "LG UltraWide 34WP65C",
    brand: "LG",
    supplier: "LG Electronics",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400",
    price: 8999,
    originalPrice: 9999,
    description: "Monitor ultrawide curvo para máxima productividad",
    category: "Informática",
    subcategory: "Monitores",
    inStock: true,
    stockQuantity: 78,
    rating: 4.4,
    reviews: 89,
    tags: ["Ultrawide", "Curvo", "USB-C", "HDR"],
    specifications: {
      tamano: "34 pulgadas",
      resolucion: "3440 x 1440",
      curvatura: "1000R",
      conectividad: "USB-C, HDMI",
    } as Record<string, string>,
  },
  {
    id: "7",
    name: "Herman Miller Aeron",
    brand: "Herman Miller",
    supplier: "Office Premium",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
    price: 15999,
    originalPrice: 17999,
    description: "Silla ergonómica de oficina premium para ejecutivos",
    category: "Oficina",
    subcategory: "Mobiliario",
    inStock: true,
    stockQuantity: 23,
    rating: 4.9,
    reviews: 76,
    tags: ["Ergonómica", "Premium", "Ejecutiva", "Ajustable"],
    specifications: {
      material: "Malla transpirable",
      peso_max: "150 kg",
      garantia: "12 años",
      ajustes: "8 puntos",
    } as Record<string, string>,
  },
  {
    id: "8",
    name: "Canon EOS R5",
    brand: "Canon",
    supplier: "Canon Professional",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400",
    price: 67999,
    description: "Cámara profesional sin espejo de 45MP con video 8K",
    category: "Fotografía",
    subcategory: "Cámaras",
    inStock: true,
    stockQuantity: 12,
    rating: 4.8,
    reviews: 54,
    tags: ["Profesional", "8K", "45MP", "Sin espejo"],
    specifications: {
      sensor: "45MP CMOS",
      video: "8K RAW",
      estabilizacion: "IBIS 8 pasos",
      conectividad: "WiFi 6, USB-C",
    } as Record<string, string>,
  },
  {
    id: "9",
    name: "Sony WH-1000XM5",
    brand: "Sony",
    supplier: "Sony Audio",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    price: 7999,
    originalPrice: 8499,
    description: "Auriculares over-ear con la mejor cancelación de ruido",
    category: "Electrónicos",
    subcategory: "Audio",
    inStock: true,
    stockQuantity: 156,
    rating: 4.7,
    reviews: 298,
    tags: ["Bluetooth", "ANC", "Hi-Res", "Premium"],
    specifications: {
      bateria: "30 horas",
      cancelacion: "V1 + QN1",
      codecs: "LDAC, Hi-Res",
      peso: "250g",
    } as Record<string, string>,
  },
  {
    id: "10",
    name: 'iPad Pro 12.9" M2',
    brand: "Apple",
    supplier: "Tech Distribution SA",
    image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400",
    price: 21999,
    description: "Tablet profesional con chip M2 y pantalla Liquid Retina XDR",
    category: "Informática",
    subcategory: "Tablets",
    inStock: true,
    stockQuantity: 91,
    rating: 4.6,
    reviews: 167,
    tags: ["M2", "Pro", "iPadOS", "Apple Pencil"],
    specifications: {
      procesador: "Apple M2",
      pantalla: "12.9 pulgadas",
      almacenamiento: "256GB",
      conectividad: "USB-C, 5G",
    } as Record<string, string>,
  },
];

// Datos para filtros
export const filterData = {
  categories: [
    { id: "all", name: "Todas las categorías", count: mockProducts.length },
    {
      id: "electronics",
      name: "Electrónicos",
      count: mockProducts.filter((p) => p.category === "Electrónicos").length,
    },
    {
      id: "computing",
      name: "Informática",
      count: mockProducts.filter((p) => p.category === "Informática").length,
    },
    {
      id: "office",
      name: "Oficina",
      count: mockProducts.filter((p) => p.category === "Oficina").length,
    },
    {
      id: "photography",
      name: "Fotografía",
      count: mockProducts.filter((p) => p.category === "Fotografía").length,
    },
  ],
  subcategories: {
    electronics: ["Smartphones", "Audio", "Accesorios"],
    computing: ["Laptops", "Monitores", "Tablets", "Periféricos"],
    office: ["Mobiliario", "Impresoras", "Suministros"],
    photography: ["Cámaras", "Lentes", "Accesorios"],
  },
  brands: [
    { id: "all", name: "Todas las marcas", count: mockProducts.length },
    {
      id: "apple",
      name: "Apple",
      count: mockProducts.filter((p) => p.brand === "Apple").length,
    },
    {
      id: "samsung",
      name: "Samsung",
      count: mockProducts.filter((p) => p.brand === "Samsung").length,
    },
    {
      id: "dell",
      name: "Dell",
      count: mockProducts.filter((p) => p.brand === "Dell").length,
    },
    {
      id: "lg",
      name: "LG",
      count: mockProducts.filter((p) => p.brand === "LG").length,
    },
    {
      id: "canon",
      name: "Canon",
      count: mockProducts.filter((p) => p.brand === "Canon").length,
    },
    {
      id: "sony",
      name: "Sony",
      count: mockProducts.filter((p) => p.brand === "Sony").length,
    },
    {
      id: "herman-miller",
      name: "Herman Miller",
      count: mockProducts.filter((p) => p.brand === "Herman Miller").length,
    },
  ],
  suppliers: [
    { id: "all", name: "Todos los proveedores" },
    { id: "tech-distribution", name: "Tech Distribution SA" },
    { id: "apple-authorized", name: "Apple Authorized" },
    { id: "samsung-electronics", name: "Samsung Electronics" },
    { id: "dell-business", name: "Dell Business" },
    { id: "lg-electronics", name: "LG Electronics" },
    { id: "office-premium", name: "Office Premium" },
    { id: "canon-professional", name: "Canon Professional" },
    { id: "sony-audio", name: "Sony Audio" },
  ],
  priceRanges: [
    { id: "all", name: "Todos los precios", min: 0, max: Infinity },
    { id: "under-5k", name: "Menos de $5,000", min: 0, max: 5000 },
    { id: "5k-15k", name: "$5,000 - $15,000", min: 5000, max: 15000 },
    { id: "15k-30k", name: "$15,000 - $30,000", min: 15000, max: 30000 },
    { id: "30k-50k", name: "$30,000 - $50,000", min: 30000, max: 50000 },
    { id: "over-50k", name: "Más de $50,000", min: 50000, max: Infinity },
  ],
};

export interface ProductFilters {
  search: string;
  category: string;
  subcategory: string;
  brand: string;
  supplier: string;
  priceRange: string;
  sortBy: string;
  inStockOnly: boolean;
  onSaleOnly: boolean;
}

// Tipo local para ProductsGrid (temporalmente, hasta tener todos los campos del backend)
interface GridProduct {
  id: string;
  prodVirtaId?: string; // Identificador principal del backend
  name: string;
  brand: string;
  supplier: string;
  image: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  subcategory: string;
  inStock: boolean;
  stockQuantity: number;
  rating?: number;
  reviews?: number;
  tags: string[];
  specifications: Record<string, string>;
  // Campos adicionales para mostrar descuentos
  pricing?: {
    base_price: number;
    final_price: number;
    total_savings: number;
    percentage_saved: number;
    has_discount: boolean;
  };
  discounts?: {
    total_applicable: number;
  };
  bestAdditionalDiscount?: {
    type: string;
    description: string;
    potentialSavings: number;
    badge: string;
  } | null;
  // Imágenes del producto
  productImages?: Array<{
    url: string;
    blurDataURL?: string;
    alt?: string;
    isPrimary?: boolean;
  }>;
}

export function ProductsSection() {
  // Estado para productos de la API
  const [apiProducts, setApiProducts] = useState<ProductWithDiscounts[]>([]);
  const [displayProducts, setDisplayProducts] = useState<GridProduct[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const PRODUCTS_PER_PAGE = 20;

  // Estado para filtros UI
  const [filters, setFilters] = useState<ProductFilters>({
    search: "",
    category: "all",
    subcategory: "all",
    brand: "all",
    supplier: "all",
    priceRange: "all",
    sortBy: "relevance",
    inStockOnly: false,
    onSaleOnly: false,
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState(false);

  // Adaptar ProductWithDiscounts al formato esperado por ProductsGrid
  const adaptProducts = (products: ProductWithDiscounts[]): GridProduct[] => {
    return products.map((p) => {
      // Calcular el mejor descuento adicional disponible
      const bestAdditionalDiscount = getBestAdditionalDiscount(p);

      // Obtener la imagen principal
      const primaryImage = p.productImages?.find(img => img.isPrimary) || p.productImages?.[0];

      return {
        id: p.id,
        prodVirtaId: p.prodVirtaId, // Identificador principal del backend
        name: p.name || p.title,
        brand: p.brandId || "Sin marca",
        supplier: p.distributorCode || "Proveedor",
        image: primaryImage?.url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
        price: p.pricing.final_price, // Precio con descuento aplicado
        originalPrice: p.pricing.has_discount ? p.pricing.base_price : undefined,
        description: p.shortDescription || p.fullDescription || "",
        category: p.categoryCode || "General",
        subcategory: p.categoryCode || "General",
        inStock: p.stockQuantity > 0,
        stockQuantity: p.stockQuantity,
        rating: 4.5, // Placeholder
        reviews: 0, // Placeholder
        tags: [],
        specifications: {},
        // Campos adicionales para descuentos
        pricing: p.pricing,
        discounts: p.discounts,
        bestAdditionalDiscount,
        // Agregar las imágenes del producto
        productImages: p.productImages || [],
      };
    });
  };

  // Analizar todos los descuentos disponibles y retornar el mejor
  const getBestAdditionalDiscount = (product: ProductWithDiscounts): {
    type: string;
    description: string;
    potentialSavings: number;
    badge: string;
  } | null => {
    const allDiscounts: ProductDiscount[] = [
      ...(product.discounts.direct_discounts || []),
      ...(product.discounts.promotional_discounts || []),
      ...(product.discounts.min_purchase_discounts || []),
      ...(product.discounts.tiered_volume_discounts || []),
      ...(product.discounts.loyalty_discounts || []),
    ];

    if (allDiscounts.length === 0) return null;

    // Encontrar el descuento con mayor ahorro potencial
    let bestDiscount: ProductDiscount | undefined;
    let maxSavings = 0;

    allDiscounts.forEach((discount) => {
      const potentialSavings = discount.potential_savings || 0;
      if (potentialSavings > maxSavings) {
        maxSavings = potentialSavings;
        bestDiscount = discount;
      }
    });

    if (!bestDiscount) return null;

    // Generar descripción y badge según el tipo de descuento
    let description = "";
    let badge = "";

    switch (bestDiscount.type) {
      case "bogo":
      case "buy_x_get_y":
        description = bestDiscount.name || "Oferta especial";
        badge = "🎁 PROMO";
        break;
      
      case "bundle":
        description = bestDiscount.name || "Compra en pack";
        badge = "📦 PACK";
        break;
      
      case "tiered_volume":
      case "volume":
        const minQty = bestDiscount.min_quantity || 2;
        description = `Comprando ${minQty}+ unidades`;
        badge = `🔢 x${minQty}`;
        break;
      
      case "min_purchase":
        const minAmount = bestDiscount.min_purchase_amount || 0;
        description = `Comprando por $${minAmount.toLocaleString()}+`;
        badge = "💰 MIN";
        break;
      
      case "loyalty":
        description = bestDiscount.name || "Descuento por fidelidad";
        badge = "⭐ LOYALTY";
        break;
      
      default:
        description = bestDiscount.name || "Descuento adicional";
        badge = "🏷️ OFERTA";
    }

    return {
      type: bestDiscount.type,
      description,
      potentialSavings: maxSavings,
      badge,
    };
  };

  // Cargar productos desde la API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoadingProducts(true);
        console.log("🛍️ Cargando productos página:", currentPage);

        const params: {
          page: number;
          limit: number;
          category?: string;
          brand?: string;
          search?: string;
          minPrice?: number;
          maxPrice?: number;
          inStock?: boolean;
        } = {
          page: currentPage,
          limit: PRODUCTS_PER_PAGE,
        };

        // Aplicar filtros a la API si están activos
        if (filters.search) params.search = filters.search;
        if (filters.category !== "all") params.category = filters.category;
        if (filters.brand !== "all") params.brand = filters.brand;
        if (filters.inStockOnly) params.inStock = true;

        // Filtro de precio
        if (filters.priceRange !== "all") {
          const range = filterData.priceRanges.find(
            (r) => r.id === filters.priceRange,
          );
          if (range) {
            if (range.min > 0) params.minPrice = range.min;
            if (range.max < Infinity) params.maxPrice = range.max;
          }
        }

        const response = await api.product.getProductsWithDiscounts(params);

        console.log("📦 Respuesta completa de la API:", response);

        if (response.success && response.data) {
          // La respuesta tiene estructura: { data: { data: Array(20) } }
          // Necesitamos acceder a response.data.data
          let productsArray: ProductWithDiscounts[] = [];
          let totalCount = 0;

          // Type assertion para manejar múltiples estructuras posibles
          const data = response.data as ProductWithDiscounts[] | { data?: ProductWithDiscounts[]; products?: ProductWithDiscounts[]; total?: number };

          if (Array.isArray(data)) {
            // Caso 1: response.data es directamente un array
            productsArray = data;
            totalCount = data.length;
          } else if (data.data && Array.isArray(data.data)) {
            // Caso 2: response.data.data contiene el array (caso actual del backend)
            productsArray = data.data;
            totalCount = data.data.length;
          } else if (data.products && Array.isArray(data.products)) {
            // Caso 3: response.data.products contiene el array
            productsArray = data.products;
            totalCount = data.total || data.products.length;
          }

          console.log("✅ Productos cargados:", productsArray.length);
          console.log("📊 Primer producto:", productsArray[0]);
          
          setApiProducts(productsArray);
          setDisplayProducts(adaptProducts(productsArray));
          setTotalProducts(totalCount);
        } else {
          console.error("❌ Error al cargar productos:", response.message);
          toast.error("Error al cargar productos", {
            description: response.message || "Intente nuevamente",
          });
          setApiProducts([]);
          setDisplayProducts([]);
          setTotalProducts(0);
        }
      } catch (error) {
        console.error("❌ Error en loadProducts:", error);
        toast.error("Error al cargar productos", {
          description: "No se pudo conectar con el servidor",
        });
        setApiProducts([]);
        setDisplayProducts([]);
        setTotalProducts(0);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters.search, filters.category, filters.brand, filters.priceRange, filters.inStockOnly]);

  // Aplicar filtros locales (los que no se envían a la API)
  useEffect(() => {
    if (apiProducts.length === 0) {
      setDisplayProducts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      let filtered = [...apiProducts];

      // Solo productos en oferta (local)
      if (filters.onSaleOnly) {
        filtered = filtered.filter(
          (product) => product.pricing.has_discount,
        );
      }

      // Ordenamiento
      switch (filters.sortBy) {
        case "price-asc":
          filtered.sort((a, b) => a.pricing.final_price - b.pricing.final_price);
          break;
        case "price-desc":
          filtered.sort((a, b) => b.pricing.final_price - a.pricing.final_price);
          break;
        case "name-asc":
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "name-desc":
          filtered.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case "newest":
          // Ordenar por fecha de creación
          filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        default:
          // Relevancia (productos con descuento primero)
          filtered.sort((a, b) => {
            const aOnSale = a.pricing.has_discount ? 1 : 0;
            const bOnSale = b.pricing.has_discount ? 1 : 0;
            return bOnSale - aOnSale;
          });
      }

      setDisplayProducts(adaptProducts(filtered));
      setIsLoading(false);
    }, 100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiProducts.length, filters.onSaleOnly, filters.sortBy]);

  // Manejar cambio de página
  const handlePageChange = (newPage: number) => {
    const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7; // Máximo de números visibles

    if (totalPages <= maxVisible) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar con ellipsis
      if (currentPage <= 3) {
        // Inicio
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Final
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        // Medio
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900">
      {/* Hero Section */}
      <ProductsHero />

      {/* Stats Section */}
      <ProductsStats totalProducts={totalProducts} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar con filtros */}
          <div className="lg:w-80 flex-shrink-0">
            <ProductsFilters
              filters={filters}
              onFiltersChange={setFilters}
              filterData={filterData}
            />
          </div>

          {/* Grid de productos */}
          <div className="flex-1">
            <ProductsGrid
              products={displayProducts}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              isLoading={isLoading || isLoadingProducts}
              filters={filters}
              onFiltersChange={setFilters}
            />

            {/* Paginación Elegante */}
            {!isLoadingProducts && totalProducts > 0 && totalPages > 1 && (
              <div className="mt-12 flex flex-col items-center gap-4">
                {/* Información de productos */}
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Mostrando <span className="font-semibold text-slate-900 dark:text-white">{((currentPage - 1) * PRODUCTS_PER_PAGE) + 1}</span> - <span className="font-semibold text-slate-900 dark:text-white">{Math.min(currentPage * PRODUCTS_PER_PAGE, totalProducts)}</span> de <span className="font-semibold text-slate-900 dark:text-white">{totalProducts}</span> productos
                </div>

                {/* Controles de paginación */}
                <div className="flex items-center gap-2">
                  {/* Botón Anterior */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="group relative px-4 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 dark:disabled:hover:border-slate-700 disabled:hover:bg-white dark:disabled:hover:bg-slate-800 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Anterior</span>
                    </div>
                  </button>

                  {/* Números de página */}
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => {
                      if (page === "...") {
                        return (
                          <span
                            key={`ellipsis-${index}`}
                            className="px-3 py-2 text-slate-400 dark:text-slate-600"
                          >
                            ...
                          </span>
                        );
                      }

                      const pageNum = page as number;
                      const isActive = pageNum === currentPage;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`
                            min-w-[40px] h-10 px-3 rounded-lg font-medium text-sm transition-all duration-200
                            ${isActive 
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20 scale-105" 
                              : "bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                            }
                          `}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Botón Siguiente */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="group relative px-4 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 dark:disabled:hover:border-slate-700 disabled:hover:bg-white dark:disabled:hover:bg-slate-800 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Siguiente</span>
                      <svg className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
