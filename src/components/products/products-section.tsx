"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { api, ProductWithDiscounts, ProductDiscount, Category, Brand } from "@/api";
import { ProductsHero } from "./products-hero";
import { ProductsFilters } from "./products-filters";
import { ProductsGrid } from "./products-grid";
import { ProductsStats } from "./products-stats";

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

// Tipo local para ProductsGrid
interface GridProduct {
  id: string;
  prodVirtaId?: string;
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
  pricing?: {
    base_price: number;
    final_price: number;
    total_savings: number;
    percentage_saved: string | number;
    has_discount: boolean;
  };
  discounts?: {
    total_applicable: number;
    auto_applicable?: number;
    conditional?: number;
    direct_discounts?: Array<{
      name: string;
      discount_type?: string;
      discount_value?: number;
      _canAutoApply?: boolean;
      _blockReasons?: string[];
    }>;
  };
  bestAdditionalDiscount?: {
    type: string;
    description: string;
    potentialSavings: number;
    badge: string;
  } | null;
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

  // Estado para categorías y marcas reales del backend
  const [apiCategories, setApiCategories] = useState<Category[]>([]);
  const [apiBrands, setApiBrands] = useState<Brand[]>([]);

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

  // Extraer el ID real de una categoría (el backend puede usar distintos campos)
  const getCategoryId = useCallback((c: Category): string => {
    return c.id || c.categoryId || c.categoryCode || c._id || '';
  }, []);

  // Extraer el ID real de una marca (el backend puede usar distintos campos)
  const getBrandId = useCallback((b: Brand): string => {
    return b.id || b.brandId || b._id || '';
  }, []);

  // Construir filterData desde los datos del backend (productCount viene de /categories y /brands)
  // Se deduplican por ID para evitar keys duplicados en React y problemas de selección
  const filterData = useMemo(() => {
    // Deduplicar categorías por ID real
    const seenCatIds = new Set<string>();
    const uniqueCategories = apiCategories
      .map((c, idx) => {
        const realId = getCategoryId(c);
        return {
          id: realId || `cat-${idx}`,
          name: c.name,
          count: c.productCount || 0,
        };
      })
      .filter(c => {
        if (seenCatIds.has(c.id)) return false;
        seenCatIds.add(c.id);
        return true;
      });

    // Deduplicar marcas por ID real
    const seenBrandIds = new Set<string>();
    const uniqueBrands = apiBrands
      .map((b, idx) => {
        const realId = getBrandId(b);
        return {
          id: realId || `brand-${idx}`,
          name: b.name,
          count: b.productCount || 0,
        };
      })
      .filter(b => {
        if (seenBrandIds.has(b.id)) return false;
        seenBrandIds.add(b.id);
        return true;
      });

    return {
      categories: [
        { id: "all", name: "Todas las categorías", count: totalProducts },
        ...uniqueCategories,
      ],
      subcategories: {} as Record<string, string[]>,
      brands: [
        { id: "all", name: "Todas las marcas", count: totalProducts },
        ...uniqueBrands,
      ],
      suppliers: [] as Array<{ id: string; name: string }>,
      priceRanges: [
        { id: "all", name: "Todos los precios", min: 0, max: Infinity },
        { id: "under-100", name: "Menos de $100", min: 0, max: 100 },
        { id: "100-500", name: "$100 - $500", min: 100, max: 500 },
        { id: "500-1000", name: "$500 - $1,000", min: 500, max: 1000 },
        { id: "1000-5000", name: "$1,000 - $5,000", min: 1000, max: 5000 },
        { id: "over-5000", name: "Más de $5,000", min: 5000, max: Infinity },
      ],
    };
  }, [apiCategories, apiBrands, totalProducts]);

  // Cargar categorías y marcas reales del backend
  useEffect(() => {
    const loadFiltersData = async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          api.product.getCategories(),
          api.product.getBrands(),
        ]);

        if (categoriesRes.success && categoriesRes.data) {
          const cats = Array.isArray(categoriesRes.data)
            ? categoriesRes.data
            : (categoriesRes.data as any)?.data || [];
          console.log("📂 Categorías cargadas:", cats.length, "- Primera:", JSON.stringify(cats[0]));
          setApiCategories(cats);
        }

        if (brandsRes.success && brandsRes.data) {
          const brands = Array.isArray(brandsRes.data)
            ? brandsRes.data
            : (brandsRes.data as any)?.data || [];
          console.log("🏷️ Marcas cargadas:", brands.length, "- Primera:", JSON.stringify(brands[0]));
          setApiBrands(brands);
        }
      } catch (error) {
        console.error("❌ Error cargando filtros:", error);
      }
    };

    loadFiltersData();
  }, []);

  // Adaptar ProductWithDiscounts al formato esperado por ProductsGrid
  const adaptProducts = useCallback((products: ProductWithDiscounts[]): GridProduct[] => {
    return products.map((p) => {
      // Obtener la imagen principal
      const primaryImage = p.productImages?.find(img => img.isPrimary) || p.productImages?.[0];

      // Extraer brand name (puede ser string o objeto)
      const brandName = typeof p.brandId === 'object' && p.brandId !== null
        ? (p.brandId as any).name || 'Sin marca'
        : (p.brandId || 'Sin marca');

      // Extraer category name (puede ser string o objeto)
      const categoryName = typeof p.categoryCode === 'object' && p.categoryCode !== null
        ? (p.categoryCode as any).name || 'General'
        : (p.categoryCode || 'General');

      // Calcular el mejor descuento adicional
      const bestAdditionalDiscount = getBestAdditionalDiscount(p);

      return {
        id: p.id || p.prodVirtaId,
        prodVirtaId: p.prodVirtaId,
        name: p.name || p.title || 'Producto sin nombre',
        brand: brandName,
        supplier: p.distributorCode || "Proveedor",
        image: primaryImage?.url || "",
        price: p.pricing?.final_price ?? p.pricing?.base_price ?? 0,
        originalPrice: p.pricing?.has_discount ? p.pricing.base_price : undefined,
        description: p.shortDescription || p.fullDescription || "",
        category: categoryName,
        subcategory: categoryName,
        inStock: (p.stockQuantity ?? 0) > 0,
        stockQuantity: p.stockQuantity ?? 0,
        rating: 4.5,
        reviews: 0,
        tags: [],
        specifications: {},
        pricing: p.pricing ? {
          base_price: p.pricing.base_price,
          final_price: p.pricing.final_price,
          total_savings: p.pricing.total_savings,
          percentage_saved: p.pricing.percentage_saved,
          has_discount: p.pricing.has_discount,
        } : undefined,
        discounts: p.discounts ? {
          total_applicable: p.discounts.total_applicable || 0,
          auto_applicable: p.discounts.auto_applicable || 0,
          conditional: p.discounts.conditional || 0,
          direct_discounts: p.discounts.direct_discounts || [],
        } : undefined,
        bestAdditionalDiscount,
        productImages: p.productImages || [],
      };
    });
  }, []);

  // Analizar descuentos disponibles y retornar el mejor adicional (no auto-aplicado)
  const getBestAdditionalDiscount = (product: ProductWithDiscounts): {
    type: string;
    description: string;
    potentialSavings: number;
    badge: string;
  } | null => {
    if (!product.discounts) return null;

    const allDiscounts: ProductDiscount[] = [
      ...(product.discounts.direct_discounts || []),
      ...(product.discounts.promotional_discounts || []),
      ...(product.discounts.min_purchase_discounts || []),
      ...(product.discounts.tiered_volume_discounts || []),
      ...(product.discounts.loyalty_discounts || []),
    ];

    if (allDiscounts.length === 0) return null;

    // Filtrar solo descuentos que NO se auto-aplican (son condicionales)
    const conditionalDiscounts = allDiscounts.filter(d => !d._canAutoApply);

    if (conditionalDiscounts.length === 0) return null;

    // Encontrar el descuento con mayor ahorro potencial
    let bestDiscount: ProductDiscount | undefined;
    let maxSavings = 0;

    conditionalDiscounts.forEach((discount) => {
      const potentialSavings = discount.potential_savings || 0;
      if (potentialSavings > maxSavings) {
        maxSavings = potentialSavings;
        bestDiscount = discount;
      }
    });

    if (!bestDiscount) return null;

    const discountType = bestDiscount.type || bestDiscount.discount_type || '';
    let description = "";
    let badge = "";

    switch (discountType) {
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
      type: discountType,
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
          sortBy?: string;
          sortOrder?: string;
          category_id?: string;
          brand_id?: string;
          search?: string;
        } = {
          page: currentPage,
          limit: PRODUCTS_PER_PAGE,
        };

        // Aplicar filtros al backend
        if (filters.search) params.search = filters.search;
        if (filters.category !== "all") params.category_id = filters.category;
        if (filters.brand !== "all") params.brand_id = filters.brand;

        // Mapear sortBy a los valores que acepta el backend
        switch (filters.sortBy) {
          case "price-asc":
            params.sortBy = "price";
            params.sortOrder = "asc";
            break;
          case "price-desc":
            params.sortBy = "price";
            params.sortOrder = "desc";
            break;
          case "name-asc":
            params.sortBy = "name";
            params.sortOrder = "asc";
            break;
          case "name-desc":
            params.sortBy = "name";
            params.sortOrder = "desc";
            break;
          case "newest":
            params.sortBy = "createdAt";
            params.sortOrder = "desc";
            break;
          default:
            // "relevance" - dejar que el backend decida el orden por defecto
            break;
        }

        const response = await api.product.getProductsWithDiscounts(params);

        console.log("📦 Respuesta completa de la API:", response);

        if (response.success && response.data) {
          let productsArray: ProductWithDiscounts[] = [];
          let totalCount = 0;

          const data = response.data as ProductWithDiscounts[] | { data?: ProductWithDiscounts[]; products?: ProductWithDiscounts[]; total?: number; pagination?: { totalPages?: number; total?: number } };

          if (Array.isArray(data)) {
            productsArray = data;
            totalCount = data.length;
          } else if (data.data && Array.isArray(data.data)) {
            productsArray = data.data;
            totalCount = data.total || (data.pagination?.total) || data.data.length;
          } else if (data.products && Array.isArray(data.products)) {
            productsArray = data.products;
            totalCount = data.total || data.products.length;
          }

          console.log("✅ Productos cargados:", productsArray.length, "de", totalCount);
          if (productsArray.length > 0) {
            console.log("📊 Primer producto:", productsArray[0]?.name, "- pricing:", productsArray[0]?.pricing);
          }
          
          setApiProducts(productsArray);
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
  }, [currentPage, filters.search, filters.category, filters.brand, filters.sortBy]);

  // Aplicar filtros locales y ordenamiento (único punto que establece displayProducts)
  useEffect(() => {
    if (apiProducts.length === 0) {
      setDisplayProducts([]);
      setIsLoading(false);
      return;
    }

    let filtered = [...apiProducts];

    // Solo productos en oferta (filtro local)
    if (filters.onSaleOnly) {
      filtered = filtered.filter(
        (product) => product.pricing?.has_discount,
      );
    }

    // Filtro de rango de precio (local)
    if (filters.priceRange !== "all") {
      const range = filterData.priceRanges.find(r => r.id === filters.priceRange);
      if (range) {
        filtered = filtered.filter(p => {
          const price = p.pricing?.final_price ?? 0;
          return price >= range.min && price <= range.max;
        });
      }
    }

    // Ordenamiento por relevancia: productos con descuento primero
    if (filters.sortBy === "relevance") {
      filtered.sort((a, b) => {
        const aOnSale = a.pricing?.has_discount ? 1 : 0;
        const bOnSale = b.pricing?.has_discount ? 1 : 0;
        return bOnSale - aOnSale;
      });
    }

    setDisplayProducts(adaptProducts(filtered));
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiProducts, filters.onSaleOnly, filters.sortBy, filters.priceRange]);

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
