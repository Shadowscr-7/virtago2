"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/admin-layout";
import { ProductHeader } from "@/components/products/admin/product-header";
import { ProductBasicInfo } from "@/components/products/admin/product-basic-info";
import { ProductPricingInfo } from "@/components/products/admin/product-pricing-info";
import { ProductInventoryInfo } from "@/components/products/admin/product-inventory-info";
import { ProductImagesGallery } from "@/components/products/admin/product-images-gallery";
import { ProductSpecifications } from "@/components/products/admin/product-specifications";
import { ProductSalesStats } from "@/components/products/admin/product-sales-stats";
import { UnsavedChangesNotification } from "@/components/products/admin/unsaved-changes-notification";
import { api } from "@/api";
import { motion } from "framer-motion";

const PRIMARY = "#C8102E";

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

  // Unidad de venta
  baseUnit: 'unidad',
  packagingUnit: 'caja',
  unitsPerPackage: 1,
  purchaseMode: 'by_unit' as 'by_unit' | 'by_package' | 'both',
  minOrderQuantity: 1,

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
      blurDataURL: "",
      alt: "iPhone 15 Pro Max - Vista frontal",
      isPrimary: true,
      order: 1,
    },
    {
      id: "2",
      url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
      blurDataURL: "",
      alt: "iPhone 15 Pro Max - Vista trasera",
      isPrimary: false,
      order: 2,
    },
    {
      id: "3",
      url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
      blurDataURL: "",
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
  } as Record<string, string>,

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
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detectar modo de edición desde URL
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "edit") {
      setIsEditing(true);
    }
  }, [searchParams]);

  // Cargar datos del producto desde la API
  useEffect(() => {
    const loadProduct = async () => {
      if (!params.id) return;

      setIsLoading(true);
      setError(null);

      try {
        console.log(`[PRODUCT DETAIL] Cargando producto: ${params.id}`);

        const response = await api.admin.products.getById(params.id as string);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let apiProduct: any;

        if (response.data && typeof response.data === 'object') {
          if ('data' in response.data && response.data.data) {
            apiProduct = response.data.data;
          } else {
            apiProduct = response.data;
          }
        } else {
          throw new Error('Formato de respuesta inesperado');
        }

        const transformedData: ProductData = {
          id: apiProduct.prodVirtaId || apiProduct.productId || params.id as string,
          name: apiProduct.name || apiProduct.title || 'Sin nombre',
          sku: apiProduct.sku || apiProduct.skuWithoutPrefix || 'N/A',
          description: apiProduct.fullDescription || apiProduct.shortDescription || '',
          shortDescription: apiProduct.shortDescription || '',
          category: apiProduct.categoryId || apiProduct.categoryCode || 'Sin categoría',
          subcategory: apiProduct.subCategoryId || apiProduct.gama || '',
          brand: apiProduct.brandId || apiProduct.brand || 'Sin marca',
          model: apiProduct.manufacturerPartNumber || '',
          supplier: apiProduct.supplierCode || apiProduct.vendor || '',
          supplierCode: apiProduct.supplierMasterDataId || '',

          price: apiProduct.price || 0,
          costPrice: apiProduct.price ? apiProduct.price * 0.7 : 0,
          originalPrice: apiProduct.originalPrice && apiProduct.originalPrice !== apiProduct.price
            ? apiProduct.originalPrice
            : undefined,
          wholesalePrice: apiProduct.priceSale || (apiProduct.price ? apiProduct.price * 0.9 : 0),
          minPrice: apiProduct.price ? apiProduct.price * 0.8 : 0,

          stock: apiProduct.stockQuantity || apiProduct.quantity || 0,
          minStock: 10,
          maxStock: 100,
          reservedStock: 0,
          availableStock: apiProduct.stockQuantity || apiProduct.quantity || 0,
          location: apiProduct.storeCode || '',
          supplier_sku: apiProduct.sku || '',

          status: apiProduct.status === 'active' ? 'ACTIVO' : 'INACTIVO',
          isActive: apiProduct.status === 'active',
          isFeatured: apiProduct.isTopSelling || false,
          isVisible: apiProduct.published || false,
          allowBackorder: false,
          trackStock: apiProduct.trackInventory || false,

          baseUnit: apiProduct.baseUnit || 'unidad',
          packagingUnit: apiProduct.packagingUnit || 'caja',
          unitsPerPackage: apiProduct.unitsPerPackage || 1,
          purchaseMode: (apiProduct.purchaseMode as 'by_unit' | 'by_package' | 'both') || 'by_unit',
          minOrderQuantity: apiProduct.minOrderQuantity || 1,

          weight: apiProduct.weight || apiProduct.inputWeight || 0,
          dimensions: {
            length: apiProduct.pieceLength || 0,
            width: apiProduct.pieceWidth || 0,
            height: apiProduct.pieceHeight || 0,
          },

          metaTitle: apiProduct.metaTitle || apiProduct.title || apiProduct.name || '',
          metaDescription: apiProduct.metaDescription || apiProduct.shortDescription || '',
          tags: apiProduct.productTags || apiProduct.productTagsList || [],

          images: (apiProduct.productImages || []).map((img: { url: string; blurDataURL?: string; alt?: string; isPrimary?: boolean } | string, index: number) => {
            if (typeof img === 'string') {
              return {
                id: `img-${index}`,
                url: img,
                blurDataURL: '',
                alt: `${apiProduct.name} - Imagen ${index + 1}`,
                isPrimary: index === 0,
                order: index + 1,
              };
            }
            return {
              id: `img-${index}`,
              url: img.url,
              blurDataURL: img.blurDataURL || '',
              alt: img.alt || `${apiProduct.name} - Imagen ${index + 1}`,
              isPrimary: img.isPrimary !== undefined ? img.isPrimary : index === 0,
              order: index + 1,
            };
          }),

          specifications: buildSpecifications(apiProduct),

          salesStats: {
            totalSales: apiProduct.likes || 0,
            totalRevenue: 0,
            averageRating: 0,
            totalReviews: 0,
            lastSale: '',
            bestMonth: '',
            salesTrend: 'stable' as const,
            topSellingVariant: '',
            returnRate: 0,
            profitMargin: 0,
          },

          createdAt: apiProduct.createdAt || new Date().toISOString(),
          updatedAt: apiProduct.updatedAt || new Date().toISOString(),
          lastStockUpdate: apiProduct.updatedAt || new Date().toISOString(),
        };

        setProductData(transformedData);
        setOriginalData(transformedData);
        setIsLoading(false);

      } catch (err) {
        console.error('[PRODUCT DETAIL] Error cargando producto:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar el producto');
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [params.id]);

  // Helper para detectar si un valor parece un UUID
  const isUUID = (value: string): boolean => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buildSpecifications = (product: any): Record<string, string> => {
    const specs: Record<string, string> = {};

    if (product.sku) specs['SKU'] = product.sku;
    if (product.productId && !isUUID(product.productId)) specs['Código de producto'] = product.productId;
    if (product.brandId || product.brand) specs['Marca'] = product.brandId || product.brand;
    if (product.manufacturerCode) specs['Fabricante'] = product.manufacturerCode;
    if (product.categoryId || product.categoryCode) specs['Categoría'] = product.categoryId || product.categoryCode;
    if (product.gama) specs['Gama'] = product.gama;
    if (product.erpGama) specs['ERP Gama'] = product.erpGama;
    if (product.productTypeCode) specs['Tipo de producto'] = product.productTypeCode;
    if (product.uoM) specs['Unidad de medida'] = product.uoM;
    if (product.weight || product.inputWeight) specs['Peso'] = `${product.weight || product.inputWeight} kg`;
    if (product.gtin) specs['GTIN'] = product.gtin;
    if (product.tax) specs['Impuesto'] = `${product.tax}%`;
    if (product.taxCategoryId) specs['Categoría de impuesto'] = product.taxCategoryId;
    if (product.distributorCode) specs['Código distribuidor'] = product.distributorCode;
    if (product.supplierCode) specs['Código proveedor'] = product.supplierCode;
    if (product.manufacturerPartNumber) specs['Número de parte'] = product.manufacturerPartNumber;
    if (product.packSize) specs['Tamaño de paquete'] = String(product.packSize);
    if (product.piecesPerCase) specs['Piezas por caja'] = String(product.piecesPerCase);
    if (product.pieceLength) specs['Largo'] = `${product.pieceLength} cm`;
    if (product.pieceWidth) specs['Ancho'] = `${product.pieceWidth} cm`;
    if (product.pieceHeight) specs['Alto'] = `${product.pieceHeight} cm`;
    if (product.pieceGrossWeight) specs['Peso bruto'] = `${product.pieceGrossWeight} kg`;
    if (product.pieceNetWeight) specs['Peso neto'] = `${product.pieceNetWeight} kg`;
    if (product.energyKcal) specs['Energía (kcal)'] = `${product.energyKcal} kcal`;
    if (product.energykJ) specs['Energía (kJ)'] = `${product.energykJ} kJ`;
    if (product.proteinsG) specs['Proteínas'] = `${product.proteinsG} g`;
    if (product.carbsG) specs['Carbohidratos'] = `${product.carbsG} g`;
    if (product.sugarsG) specs['Azúcares'] = `${product.sugarsG} g`;
    if (product.fatG) specs['Grasas'] = `${product.fatG} g`;
    if (product.saturatedFatG) specs['Grasas saturadas'] = `${product.saturatedFatG} g`;
    if (product.saltG) specs['Sal'] = `${product.saltG} g`;
    if (product.colors && product.colors.length > 0) specs['Colores'] = product.colors.join(', ');
    if (product.sizes && product.sizes.length > 0) specs['Tallas'] = product.sizes.join(', ');
    if (product.availableStartDateTimeUtc) specs['Disponible desde'] = new Date(product.availableStartDateTimeUtc).toLocaleDateString();
    if (product.availableEndDateTimeUtc) specs['Disponible hasta'] = new Date(product.availableEndDateTimeUtc).toLocaleDateString();
    if (product.markAsNew) {
      specs['Marcado como nuevo'] = 'Sí';
      if (product.markAsNewStartDateTimeUtc) specs['Nuevo desde'] = new Date(product.markAsNewStartDateTimeUtc).toLocaleDateString();
      if (product.markAsNewEndDateTimeUtc) specs['Nuevo hasta'] = new Date(product.markAsNewEndDateTimeUtc).toLocaleDateString();
    }
    if (product.isTopSelling) {
      specs['Top Selling'] = 'Sí';
      if (product.topSellingStartDateTimeUtc) specs['Top desde'] = new Date(product.topSellingStartDateTimeUtc).toLocaleDateString();
      if (product.topSellingEndDateTimeUtc) specs['Top hasta'] = new Date(product.topSellingEndDateTimeUtc).toLocaleDateString();
    }
    if (product.availableInLoyaltyMarket) specs['Disponible en mercado de lealtad'] = 'Sí';
    if (product.availableInPromoPack) specs['Disponible en paquete promo'] = 'Sí';
    if (product.priceInPoints) specs['Precio en puntos'] = String(product.priceInPoints);

    return specs;
  };

  // Detectar cambios en los datos
  useEffect(() => {
    const hasDataChanged = JSON.stringify(productData) !== JSON.stringify(originalData);
    setHasChanges(hasDataChanged);
  }, [productData, originalData]);

  const handleEdit = () => {
    setIsEditing(true);
    router.push(`/admin/productos/${params.id}?mode=edit`);
  };

  const handleSave = async () => {
    if (!productData) return;

    try {
      const productImages = productData.images.map((img) => ({
        url: img.url,
        blurDataURL: img.blurDataURL || '',
        alt: img.alt,
        isPrimary: img.isPrimary,
      }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatePayload: any = {
        name: productData.name,
        sku: productData.sku,
        price: productData.price,
        stockQuantity: productData.stock,
        brand: productData.brand,
        category: productData.category,
        description: productData.description,
        status: productData.isActive ? 'active' : 'inactive',
        ...(productImages.length > 0 && { productImages }),
        baseUnit: productData.baseUnit,
        packagingUnit: productData.packagingUnit,
        unitsPerPackage: productData.unitsPerPackage,
        purchaseMode: productData.purchaseMode,
        minOrderQuantity: productData.minOrderQuantity,
      };

      const response = await api.admin.products.update(params.id as string, updatePayload);
      console.log('[PRODUCT DETAIL] Producto actualizado:', response.data);

      setOriginalData(productData);
      setHasChanges(false);
      setIsEditing(false);
      router.push(`/admin/productos/${params.id}`);

      toast.success('Producto guardado correctamente', {
        description: 'Los cambios se han guardado exitosamente',
      });
    } catch (error) {
      console.error("[PRODUCT DETAIL] Error al guardar el producto:", error);
      toast.error('Error al guardar el producto', {
        description: 'No se pudieron guardar los cambios. Intenta nuevamente.',
      });
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
    setProductData((prev) => prev ? { ...prev, ...updates } : prev);
  };

  // Pantalla de carga
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 border-4 border-t-transparent rounded-full mx-auto mb-4"
              style={{ borderColor: '#e5e7eb', borderTopColor: PRIMARY }}
            />
            <p className="text-lg text-gray-600">Cargando producto...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Pantalla de error
  if (error || !productData) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Error al cargar el producto
            </h2>
            <p className="text-gray-600 mb-6">
              {error || 'No se pudo cargar la información del producto'}
            </p>
            <button
              onClick={() => router.push('/admin/productos')}
              className="px-6 py-3 text-white rounded-lg transition-colors hover:opacity-90"
              style={{ backgroundColor: PRIMARY }}
            >
              Volver a la lista
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8 space-y-8">
          <ProductHeader
            productData={productData}
            isEditing={isEditing}
            hasChanges={hasChanges}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancel}
          />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
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
