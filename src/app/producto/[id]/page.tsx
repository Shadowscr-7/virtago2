"use client";

import { ProductDetailSection } from "@/components/product-detail/product-detail-section";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, type ProductComplete } from "@/api";
import type { DiscountRule } from "@/lib/price-calculator";

interface AdaptedProduct {
  id: string;
  name: string;
  brand: string;
  supplier: string;
  productImages: Array<{
    url: string;
    blurDataURL?: string;
    alt?: string;
    isPrimary?: boolean;
  }>;
  images: string[];
  price: number;
  originalPrice?: number;
  description: string;
  longDescription: string;
  category: string;
  subcategory: string;
  inStock: boolean;
  stockQuantity: number;
  rating: number;
  reviews: number;
  tags: string[];
  specifications: Record<string, string>;
  features: string[];
  warranty: string;
  shipping: {
    free: boolean;
    estimatedDays: string;
    cost: number;
  };
  supplier_info: {
    name: string;
    rating: number;
    reviews: number;
    response_time: string;
    verified: boolean;
  };
  // 🆕 Información de descuentos
  discounts?: DiscountRule[];
  priceSale?: number;
  discountPercentage?: number;
}

export default function ProductPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<AdaptedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        console.log('[PRODUCT DETAIL] Fetching product with ID:', id);
        
        // 🆕 Usar el endpoint /complete que trae pricing y descuentos calculados
        const response = await api.product.getProductComplete(id);
        
        console.log('[PRODUCT DETAIL] API Response:', response);
        
        if (!response.success || !response.data) {
          console.error('[PRODUCT DETAIL] API returned no data:', response);
          setError(true);
          return;
        }

        // ⚠️ IMPORTANTE: response.data contiene {success: true, data: {...}}
        // El backend wrappea en {success, data}, y http-client también wrappea
        // Entonces necesitamos acceder a response.data.data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const backendResponse = response.data as any;
        
        if (!backendResponse.data) {
          console.error('[PRODUCT DETAIL] Backend response has no data:', backendResponse);
          setError(true);
          return;
        }
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const apiProduct: ProductComplete = backendResponse.data as any;

        // Log para debugging
        console.log('[PRODUCT DETAIL] API Product:', apiProduct);
        console.log('[PRODUCT DETAIL] Product Name:', apiProduct.name);
        console.log('[PRODUCT DETAIL] Pricing:', apiProduct.pricing);
        console.log('[PRODUCT DETAIL] Discounts:', apiProduct.discounts);

        // 🆕 Usar pricing del endpoint /complete - YA VIENE CALCULADO
        const basePrice = apiProduct.pricing.originalPrice || apiProduct.pricing.listPrice || 0;
        const finalPrice = apiProduct.pricing.finalPrice || basePrice;
        const priceSale = apiProduct.pricing.priceSale || 0;
        const originalPrice = finalPrice < basePrice ? basePrice : undefined;
        const totalSavings = apiProduct.discounts?.totalSavings ? parseFloat(apiProduct.discounts.totalSavings) : 0;

        console.log('[PRODUCT DETAIL] Prices:', { basePrice, finalPrice, priceSale, originalPrice, totalSavings });

        // 🆕 Adaptar descuentos disponibles para el calculador
        const discounts: DiscountRule[] = [];
        
        if (apiProduct.discounts?.available) {
          console.log('[PRODUCT DETAIL] Processing discounts:', apiProduct.discounts.available);
          
          for (const discount of apiProduct.discounts.available) {
            discounts.push({
              id: discount.discountId,
              name: discount.name,
              type: discount.type as DiscountRule['type'],
              value: discount.value,
              min_quantity: discount.min_quantity,
              max_quantity: discount.max_quantity,
              min_purchase_amount: discount.min_purchase_amount,
              conditions: discount.conditions,
            });
          }
          
          console.log('[PRODUCT DETAIL] Adapted discounts:', discounts);
        }

        // Adapt API product to component format
        const adaptedProduct: AdaptedProduct = {
          id: apiProduct.prodVirtaId || apiProduct.productId || '',
          name: apiProduct.name || apiProduct.title || "Producto sin nombre",
          brand: apiProduct.brand?.name || apiProduct.brand?.brandId || "Sin marca",
          supplier: apiProduct.distributorCode || "Proveedor",
          productImages: apiProduct.productImages || [],
          images: apiProduct.productImages?.map(img => img.url) || [],
          price: finalPrice, // 🎯 Precio final YA CALCULADO por el backend
          originalPrice: originalPrice,
          description: apiProduct.shortDescription || apiProduct.description || "Sin descripción",
          longDescription: apiProduct.fullDescription || apiProduct.description || "Sin descripción detallada",
          category: apiProduct.category?.name || apiProduct.category?.categoryCode || "General",
          subcategory: apiProduct.category?.name || "General",
          inStock: (apiProduct.stockQuantity || apiProduct.quantity || 0) > 0,
          stockQuantity: apiProduct.stockQuantity || apiProduct.quantity || 0,
          rating: 4.5,
          reviews: apiProduct.likes || 0,
          tags: apiProduct.productTagsList || [],
          specifications: {
            'SKU': apiProduct.sku || 'N/A',
            // ⚠️ No mostrar prodVirtaId ni IDs internos UUID al usuario
            ...(apiProduct.productId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(apiProduct.productId)
              ? { 'Código': apiProduct.productId }
              : {}),
            'Categoría': apiProduct.category?.categoryCode || apiProduct.category?.name || 'N/A',
            'Marca': apiProduct.brand?.name || 'N/A',
            'Stock': `${apiProduct.stockQuantity || 0} unidades`,
          },
          features: apiProduct.fullDescription ? [apiProduct.fullDescription] : [],
          warranty: "Garantía según fabricante",
          shipping: {
            free: true,
            estimatedDays: "3-5 días hábiles",
            cost: 0,
          },
          supplier_info: {
            name: apiProduct.distributorCode || "Proveedor General",
            rating: 4.5,
            reviews: 128,
            response_time: "< 24 horas",
            verified: true,
          },
          // 🆕 Información de descuentos
          discounts: discounts.length > 0 ? discounts : undefined,
          priceSale: priceSale > 0 ? priceSale : undefined,
          discountPercentage: apiProduct.discounts?.totalDiscountPercentage ? parseFloat(apiProduct.discounts.totalDiscountPercentage) : undefined,
        };

        console.log('[PRODUCT DETAIL] Adapted Product:', adaptedProduct);
        setProduct(adaptedProduct);
      } catch (error) {
        console.error("[PRODUCT DETAIL] Error fetching product:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <ProductDetailSection product={product} />
    </div>
  );
}
