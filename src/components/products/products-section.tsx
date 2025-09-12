"use client";

import { useState, useEffect } from "react";
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
      pantalla: "6.7 pulgadas",
      almacenamiento: "256GB",
      ram: "8GB",
      bateria: "4422 mAh",
    },
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
    },
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
    },
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
    },
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
    },
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
    },
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
    },
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
    },
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
    },
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
    },
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

export function ProductsSection() {
  const [products, setProducts] = useState(mockProducts);
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

  // Aplicar filtros
  useEffect(() => {
    setIsLoading(true);

    setTimeout(() => {
      let filtered = [...mockProducts];

      // Búsqueda por texto
      if (filters.search) {
        filtered = filtered.filter(
          (product) =>
            product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            product.brand
              .toLowerCase()
              .includes(filters.search.toLowerCase()) ||
            product.description
              .toLowerCase()
              .includes(filters.search.toLowerCase()),
        );
      }

      // Filtro por categoría
      if (filters.category !== "all") {
        const categoryName = filterData.categories.find(
          (c) => c.id === filters.category,
        )?.name;
        if (categoryName) {
          filtered = filtered.filter(
            (product) => product.category === categoryName,
          );
        }
      }

      // Filtro por subcategoría
      if (filters.subcategory !== "all") {
        filtered = filtered.filter(
          (product) => product.subcategory === filters.subcategory,
        );
      }

      // Filtro por marca
      if (filters.brand !== "all") {
        const brandName = filterData.brands.find(
          (b) => b.id === filters.brand,
        )?.name;
        if (brandName) {
          filtered = filtered.filter((product) => product.brand === brandName);
        }
      }

      // Filtro por proveedor
      if (filters.supplier !== "all") {
        const supplierName = filterData.suppliers.find(
          (s) => s.id === filters.supplier,
        )?.name;
        if (supplierName) {
          filtered = filtered.filter(
            (product) => product.supplier === supplierName,
          );
        }
      }

      // Filtro por rango de precio
      if (filters.priceRange !== "all") {
        const range = filterData.priceRanges.find(
          (r) => r.id === filters.priceRange,
        );
        if (range) {
          filtered = filtered.filter(
            (product) =>
              product.price >= range.min && product.price <= range.max,
          );
        }
      }

      // Solo productos en stock
      if (filters.inStockOnly) {
        filtered = filtered.filter(
          (product) => product.inStock && product.stockQuantity > 0,
        );
      }

      // Solo productos en oferta
      if (filters.onSaleOnly) {
        filtered = filtered.filter(
          (product) =>
            product.originalPrice && product.originalPrice > product.price,
        );
      }

      // Ordenamiento
      switch (filters.sortBy) {
        case "price-asc":
          filtered.sort((a, b) => a.price - b.price);
          break;
        case "price-desc":
          filtered.sort((a, b) => b.price - a.price);
          break;
        case "name-asc":
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "name-desc":
          filtered.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case "rating":
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case "newest":
          // Simular ordenamiento por fecha (usando ID como proxy)
          filtered.sort((a, b) => parseInt(b.id) - parseInt(a.id));
          break;
        default:
          // Relevancia (orden original con productos en oferta primero)
          filtered.sort((a, b) => {
            const aOnSale =
              a.originalPrice && a.originalPrice > a.price ? 1 : 0;
            const bOnSale =
              b.originalPrice && b.originalPrice > b.price ? 1 : 0;
            return bOnSale - aOnSale;
          });
      }

      setProducts(filtered);
      setIsLoading(false);
    }, 300); // Simular delay de red
  }, [filters]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900">
      {/* Hero Section */}
      <ProductsHero />

      {/* Stats Section */}
      <ProductsStats totalProducts={mockProducts.length} />

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
              products={products}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              isLoading={isLoading}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
