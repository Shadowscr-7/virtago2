"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { ProductHeader } from "@/components/products/admin/product-header";
import { ProductBasicInfo } from "@/components/products/admin/product-basic-info";
import { ProductPricingInfo } from "@/components/products/admin/product-pricing-info";
import { ProductInventoryInfo } from "@/components/products/admin/product-inventory-info";
import { ProductImagesGallery } from "@/components/products/admin/product-images-gallery";
import { ProductSpecifications } from "@/components/products/admin/product-specifications";
import { ProductSalesStats } from "@/components/products/admin/product-sales-stats";
import { UnsavedChangesNotification } from "@/components/products/admin/unsaved-changes-notification";

// Datos de ejemplo - después esto vendrá del servidor
const mockProductData = {
  id: "PRO001",
  name: "iPhone 15 Pro Max 256GB",
  sku: "SKU-31118",
  description:
    "El iPhone más avanzado hasta la fecha con chip A17 Pro, cámara profesional y diseño premium en titanio.",
  shortDescription: "iPhone 15 Pro Max con 256GB de almacenamiento",
  category: "Electrónicos",
  subcategory: "Smartphones",
  brand: "Apple",
  model: "iPhone 15 Pro Max",
  supplier: "Tech Distribution SA",
  supplierCode: "APPLE-IP15PM-256",

  // Precios
  price: 24999,
  costPrice: 18000,
  originalPrice: 27999,
  wholesalePrice: 22000,
  minPrice: 20000,

  // Inventario
  stock: 45,
  minStock: 10,
  maxStock: 100,
  reservedStock: 5,
  availableStock: 40,
  location: "A-1-15",
  supplier_sku: "APL-IP15PM-256-TIT",

  // Estado y configuración
  status: "ACTIVO",
  isActive: true,
  isFeatured: true,
  isVisible: true,
  allowBackorder: false,
  trackStock: true,

  // Información física
  weight: 221, // gramos
  dimensions: {
    length: 159.9,
    width: 76.7,
    height: 8.25,
  },

  // SEO y marketing
  metaTitle: "iPhone 15 Pro Max 256GB - Titanio Natural",
  metaDescription:
    "Descubre el iPhone 15 Pro Max con chip A17 Pro, cámara profesional de 48MP y diseño en titanio. 256GB de almacenamiento.",
  tags: ["iPhone", "Apple", "5G", "Pro", "Premium", "Titanio", "A17 Pro"],

  // Imágenes
  images: [
    {
      id: "1",
      url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
      alt: "iPhone 15 Pro Max - Vista frontal",
      isPrimary: true,
      order: 1,
    },
    {
      id: "2",
      url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
      alt: "iPhone 15 Pro Max - Vista trasera",
      isPrimary: false,
      order: 2,
    },
    {
      id: "3",
      url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
      alt: "iPhone 15 Pro Max - Vista lateral",
      isPrimary: false,
      order: 3,
    },
  ],

  // Especificaciones técnicas
  specifications: {
    Pantalla: "6,7 pulgadas Super Retina XDR",
    Procesador: "Chip A17 Pro",
    Almacenamiento: "256 GB",
    RAM: "8 GB",
    "Cámara principal": "48 MP",
    "Cámara frontal": "12 MP TrueDepth",
    Batería: "Hasta 29 horas de reproducción de video",
    Conectividad: "5G, Wi-Fi 6E, Bluetooth 5.3",
    Resistencia: "IP68",
    Material: "Titanio grado aeroespacial",
    Colores: "Titanio Natural, Titanio Azul, Titanio Blanco, Titanio Negro",
    "Sistema operativo": "iOS 17",
  },

  // Estadísticas de ventas
  salesStats: {
    totalSales: 156,
    totalRevenue: 3899844,
    averageRating: 4.8,
    totalReviews: 89,
    lastSale: "2024-09-12T10:30:00Z",
    bestMonth: "2024-08",
    salesTrend: "up",
    topSellingVariant: "Titanio Natural",
    returnRate: 2.1,
    profitMargin: 27.8,
  },

  // Fechas
  createdAt: "2024-01-15T09:00:00Z",
  updatedAt: "2024-09-12T15:45:00Z",
  lastStockUpdate: "2024-09-10T14:20:00Z",
};

export type ProductData = typeof mockProductData;

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [productData, setProductData] = useState<ProductData>(mockProductData);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] =
    useState<ProductData>(mockProductData);

  // Detectar modo de edición desde URL
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "edit") {
      setIsEditing(true);
    }
  }, [searchParams]);

  // Simular carga de datos del producto
  useEffect(() => {
    // Aquí iría la llamada a la API para obtener los datos del producto
    console.log("Cargando producto:", params.id);
    setOriginalData(mockProductData);
    setProductData(mockProductData);
  }, [params.id]);

  // Detectar cambios en los datos
  useEffect(() => {
    const hasDataChanged =
      JSON.stringify(productData) !== JSON.stringify(originalData);
    setHasChanges(hasDataChanged);
  }, [productData, originalData]);

  const handleEdit = () => {
    setIsEditing(true);
    router.push(`/admin/productos/${params.id}?mode=edit`);
  };

  const handleSave = async () => {
    try {
      // Aquí iría la llamada a la API para guardar los cambios
      console.log("Guardando producto:", productData);

      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setOriginalData(productData);
      setHasChanges(false);
      setIsEditing(false);
      router.push(`/admin/productos/${params.id}`);

      // Mostrar notificación de éxito
      console.log("Producto guardado correctamente");
    } catch (error) {
      console.error("Error al guardar el producto:", error);
    }
  };

  const handleCancel = () => {
    setProductData(originalData);
    setHasChanges(false);
    setIsEditing(false);
    router.push(`/admin/productos/${params.id}`);
  };

  const handleDiscard = () => {
    setProductData(originalData);
    setHasChanges(false);
  };

  const updateProductData = (updates: Partial<ProductData>) => {
    setProductData((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Header */}
          <ProductHeader
            productData={productData}
            isEditing={isEditing}
            hasChanges={hasChanges}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancel}
          />

          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Main Info */}
            <div className="xl:col-span-2 space-y-8">
              <ProductBasicInfo
                productData={productData}
                isEditing={isEditing}
                onChange={updateProductData}
              />

              <ProductPricingInfo
                productData={productData}
                isEditing={isEditing}
                onChange={updateProductData}
              />

              <ProductInventoryInfo
                productData={productData}
                isEditing={isEditing}
                onChange={updateProductData}
              />

              <ProductSpecifications
                productData={productData}
                isEditing={isEditing}
                onChange={updateProductData}
              />
            </div>

            {/* Right Column - Images and Stats */}
            <div className="space-y-8">
              <ProductImagesGallery
                productData={productData}
                isEditing={isEditing}
                onChange={updateProductData}
              />

              <ProductSalesStats productData={productData} />
            </div>
          </div>
        </div>

        {/* Unsaved Changes Notification */}
        {hasChanges && (
          <UnsavedChangesNotification
            onSave={handleSave}
            onDiscard={handleDiscard}
          />
        )}
      </div>
    </AdminLayout>
  );
}
