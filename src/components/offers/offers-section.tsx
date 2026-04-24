"use client";

import { useState, useMemo } from "react";
import { OffersHero } from "./offers-hero";
import { OffersFilters } from "./offers-filters";
import { useTheme } from "@/contexts/theme-context";
import { OffersGrid } from "./offers-grid";

interface OffersFilters {
  search: string;
  category: string[];
  discountRange: string[];
  timeLeft: string[];
  offerType: string[];
}

interface Offer {
  id: string;
  title: string;
  brand: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  stockLeft: number;
  timeLeft: {
    days: number;
    hours: number;
    minutes: number;
  };
  isFlashSale: boolean;
  isFeatured: boolean;
  offerType: string;
  description: string;
  minQuantity: number;
  maxQuantity: number;
  savedAmount: number;
}

// Mock data for offers
const mockOffers: Offer[] = [
  {
    id: "1",
    title: "iPhone 15 Pro Max 256GB - Titanio Natural",
    brand: "Apple",
    originalPrice: 1599,
    discountedPrice: 1199,
    discountPercentage: 25,
    category: "Tecnología",
    image:
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&h=500&fit=crop",
    rating: 4.8,
    reviews: 2847,
    stockLeft: 15,
    timeLeft: { days: 0, hours: 2, minutes: 45 },
    isFlashSale: true,
    isFeatured: true,
    offerType: "Flash Sale",
    description:
      "El iPhone más avanzado con chip A17 Pro y cámara de 48MP. Perfecto para profesionales que buscan la máxima calidad.",
    minQuantity: 1,
    maxQuantity: 5,
    savedAmount: 400,
  },
  {
    id: "2",
    title: "Samsung Galaxy S24 Ultra 512GB",
    brand: "Samsung",
    originalPrice: 1399,
    discountedPrice: 999,
    discountPercentage: 29,
    category: "Tecnología",
    image:
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&h=500&fit=crop",
    rating: 4.7,
    reviews: 1923,
    stockLeft: 8,
    timeLeft: { days: 0, hours: 4, minutes: 12 },
    isFlashSale: true,
    isFeatured: true,
    offerType: "Cyber Monday",
    description:
      "Smartphone con S Pen integrado y cámara de 200MP. Ideal para productividad y fotografía profesional.",
    minQuantity: 1,
    maxQuantity: 3,
    savedAmount: 400,
  },
  {
    id: "3",
    title: 'MacBook Pro 14" M3 Pro 512GB',
    brand: "Apple",
    originalPrice: 2499,
    discountedPrice: 2099,
    discountPercentage: 16,
    category: "Tecnología",
    image:
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&h=500&fit=crop",
    rating: 4.9,
    reviews: 1456,
    stockLeft: 12,
    timeLeft: { days: 1, hours: 8, minutes: 30 },
    isFlashSale: false,
    isFeatured: true,
    offerType: "Oferta del Día",
    description:
      "Laptop profesional con chip M3 Pro. Rendimiento excepcional para desarrollo, diseño y edición de video.",
    minQuantity: 1,
    maxQuantity: 2,
    savedAmount: 400,
  },
  {
    id: "4",
    title: "Sony WH-1000XM5 - Auriculares Noise Cancelling",
    brand: "Sony",
    originalPrice: 399,
    discountedPrice: 279,
    discountPercentage: 30,
    category: "Electrónicos",
    image:
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&h=500&fit=crop",
    rating: 4.6,
    reviews: 3241,
    stockLeft: 45,
    timeLeft: { days: 2, hours: 15, minutes: 45 },
    isFlashSale: false,
    isFeatured: false,
    offerType: "Descuento por Volumen",
    description:
      "Auriculares premium con la mejor cancelación de ruido del mercado. Batería de 30 horas.",
    minQuantity: 2,
    maxQuantity: 10,
    savedAmount: 120,
  },
  {
    id: "5",
    title: "Nike Air Jordan 1 Retro High OG",
    brand: "Nike",
    originalPrice: 170,
    discountedPrice: 119,
    discountPercentage: 30,
    category: "Deportes",
    image:
      "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500&h=500&fit=crop",
    rating: 4.5,
    reviews: 892,
    stockLeft: 25,
    timeLeft: { days: 0, hours: 12, minutes: 22 },
    isFlashSale: true,
    isFeatured: false,
    offerType: "Black Friday",
    description:
      "Zapatillas icónicas en edición retro. Diseño clásico con comodidad moderna.",
    minQuantity: 1,
    maxQuantity: 3,
    savedAmount: 51,
  },
  {
    id: "6",
    title: "L'Oréal Revitalift Laser X3 Set Completo",
    brand: "L'Oréal",
    originalPrice: 89,
    discountedPrice: 59,
    discountPercentage: 34,
    category: "Salud y Belleza",
    image:
      "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=500&h=500&fit=crop",
    rating: 4.3,
    reviews: 567,
    stockLeft: 67,
    timeLeft: { days: 3, hours: 6, minutes: 18 },
    isFlashSale: false,
    isFeatured: false,
    offerType: "Fin de Temporada",
    description:
      "Set anti-edad completo con ácido hialurónico y pro-retinol. Resultados visibles en 4 semanas.",
    minQuantity: 1,
    maxQuantity: 5,
    savedAmount: 30,
  },
  {
    id: "7",
    title: 'BMW Serie 3 Llantas Aleación 18" Set Completo',
    brand: "BMW",
    originalPrice: 1200,
    discountedPrice: 899,
    discountPercentage: 25,
    category: "Automotriz",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop",
    rating: 4.7,
    reviews: 234,
    stockLeft: 6,
    timeLeft: { days: 5, hours: 14, minutes: 55 },
    isFlashSale: false,
    isFeatured: true,
    offerType: "Liquidación",
    description:
      "Set de llantas originales BMW en aleación ligera. Incluye sensores de presión.",
    minQuantity: 1,
    maxQuantity: 2,
    savedAmount: 301,
  },
  {
    id: "8",
    title: "IKEA BEKANT Escritorio Gaming Setup Completo",
    brand: "IKEA",
    originalPrice: 299,
    discountedPrice: 199,
    discountPercentage: 33,
    category: "Hogar y Jardín",
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop",
    rating: 4.4,
    reviews: 1128,
    stockLeft: 18,
    timeLeft: { days: 1, hours: 20, minutes: 8 },
    isFlashSale: false,
    isFeatured: false,
    offerType: "Lanzamiento",
    description:
      "Escritorio ergonómico con gestión de cables y superficie resistente a manchas. Ideal para gaming y trabajo.",
    minQuantity: 1,
    maxQuantity: 3,
    savedAmount: 100,
  },
  {
    id: "9",
    title: "Microsoft Surface Pro 9 i7 512GB + Type Cover",
    brand: "Microsoft",
    originalPrice: 1599,
    discountedPrice: 1299,
    discountPercentage: 19,
    category: "Tecnología",
    image:
      "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=500&h=500&fit=crop",
    rating: 4.6,
    reviews: 789,
    stockLeft: 14,
    timeLeft: { days: 0, hours: 6, minutes: 42 },
    isFlashSale: true,
    isFeatured: true,
    offerType: "Flash Sale",
    description:
      "Tablet 2-en-1 con procesador Intel i7. Incluye teclado Type Cover y Surface Pen.",
    minQuantity: 1,
    maxQuantity: 2,
    savedAmount: 300,
  },
  {
    id: "10",
    title: "Dyson V15 Detect Absolute - Aspiradora Sin Cable",
    brand: "Dyson",
    originalPrice: 749,
    discountedPrice: 549,
    discountPercentage: 27,
    category: "Hogar y Jardín",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop",
    rating: 4.8,
    reviews: 1567,
    stockLeft: 22,
    timeLeft: { days: 4, hours: 11, minutes: 15 },
    isFlashSale: false,
    isFeatured: false,
    offerType: "Descuento por Volumen",
    description:
      "Aspiradora premium con detección láser de polvo y batería de hasta 60 minutos.",
    minQuantity: 1,
    maxQuantity: 3,
    savedAmount: 200,
  },
  {
    id: "11",
    title: "DeWalt Taladro Inalámbrico 20V MAX Kit Completo",
    brand: "DeWalt",
    originalPrice: 199,
    discountedPrice: 149,
    discountPercentage: 25,
    category: "Herramientas",
    image:
      "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=500&h=500&fit=crop",
    rating: 4.7,
    reviews: 2134,
    stockLeft: 35,
    timeLeft: { days: 6, hours: 8, minutes: 30 },
    isFlashSale: false,
    isFeatured: false,
    offerType: "Oferta del Día",
    description:
      "Kit profesional con taladro, baterías, cargador y maletín. Ideal para construcción y bricolaje.",
    minQuantity: 1,
    maxQuantity: 5,
    savedAmount: 50,
  },
  {
    id: "12",
    title: "Nestlé Professional Coffee Pack - 100 Cápsulas",
    brand: "Nestlé",
    originalPrice: 89,
    discountedPrice: 64,
    discountPercentage: 28,
    category: "Alimentación",
    image:
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&h=500&fit=crop",
    rating: 4.4,
    reviews: 456,
    stockLeft: 89,
    timeLeft: { days: 2, hours: 4, minutes: 25 },
    isFlashSale: false,
    isFeatured: false,
    offerType: "Descuento por Volumen",
    description:
      "Pack profesional de café premium. Variedad de intensidades para oficinas y restaurantes.",
    minQuantity: 5,
    maxQuantity: 20,
    savedAmount: 25,
  },
];

export function OffersSection() {
  const { themeColors } = useTheme();
  const [filters, setFilters] = useState<OffersFilters>({
    search: "",
    category: [],
    discountRange: [],
    timeLeft: [],
    offerType: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  // Filter offers based on current filters
  const filteredOffers = useMemo(() => {
    let filtered = [...mockOffers];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (offer) =>
          offer.title.toLowerCase().includes(searchLower) ||
          offer.brand.toLowerCase().includes(searchLower) ||
          offer.description.toLowerCase().includes(searchLower),
      );
    }

    // Category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter((offer) =>
        filters.category.includes(offer.category),
      );
    }

    // Discount range filter
    if (filters.discountRange.length > 0) {
      filtered = filtered.filter((offer) => {
        const discount = offer.discountPercentage;
        return filters.discountRange.some((range) => {
          if (range === "10% - 20%") return discount >= 10 && discount <= 20;
          if (range === "21% - 30%") return discount >= 21 && discount <= 30;
          if (range === "31% - 40%") return discount >= 31 && discount <= 40;
          if (range === "41% - 50%") return discount >= 41 && discount <= 50;
          if (range === "51% - 60%") return discount >= 51 && discount <= 60;
          if (range === "61% - 70%") return discount >= 61 && discount <= 70;
          if (range === "Más del 70%") return discount > 70;
          return false;
        });
      });
    }

    // Time left filter
    if (filters.timeLeft.length > 0) {
      filtered = filtered.filter((offer) => {
        const totalMinutes =
          offer.timeLeft.days * 24 * 60 +
          offer.timeLeft.hours * 60 +
          offer.timeLeft.minutes;
        return filters.timeLeft.some((timeRange) => {
          if (timeRange === "Menos de 1 hora") return totalMinutes < 60;
          if (timeRange === "1-6 horas")
            return totalMinutes >= 60 && totalMinutes < 360;
          if (timeRange === "6-24 horas")
            return totalMinutes >= 360 && totalMinutes < 1440;
          if (timeRange === "1-3 días")
            return totalMinutes >= 1440 && totalMinutes < 4320;
          if (timeRange === "3-7 días")
            return totalMinutes >= 4320 && totalMinutes < 10080;
          if (timeRange === "Más de 1 semana") return totalMinutes >= 10080;
          return false;
        });
      });
    }

    // Offer type filter
    if (filters.offerType.length > 0) {
      filtered = filtered.filter((offer) =>
        filters.offerType.includes(offer.offerType),
      );
    }

    return filtered;
  }, [filters]);

  const handleFiltersChange = (newFilters: OffersFilters) => {
    setIsLoading(true);
    setFilters(newFilters);

    // Simulate loading delay
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: themeColors.background }}>
      <OffersHero />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <OffersFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">
              {filteredOffers.length === mockOffers.length
                ? `Todas las Ofertas (${filteredOffers.length})`
                : `${filteredOffers.length} ofertas encontradas`}
            </h2>
            {filters.search ||
            filters.category.length > 0 ||
            filters.discountRange.length > 0 ||
            filters.timeLeft.length > 0 ||
            filters.offerType.length > 0 ? (
              <button
                onClick={() =>
                  handleFiltersChange({
                    search: "",
                    category: [],
                    discountRange: [],
                    timeLeft: [],
                    offerType: [],
                  })
                }
                className="font-medium"
                style={{ color: themeColors.primary }}
              >
                Limpiar filtros
              </button>
            ) : null}
          </div>
        </div>

        <OffersGrid offers={filteredOffers} isLoading={isLoading} />

        {filteredOffers.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              No se encontraron ofertas
            </h3>
            <p className="text-slate-600 mb-6">
              Intenta ajustar los filtros para encontrar más ofertas
            </p>
            <button
              onClick={() =>
                handleFiltersChange({
                  search: "",
                  category: [],
                  discountRange: [],
                  timeLeft: [],
                  offerType: [],
                })
              }
              className="text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-300"
              style={{ backgroundColor: themeColors.primary }}
            >
              Ver todas las ofertas
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
