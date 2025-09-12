"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Package } from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { ProductBasicInfo } from "@/components/products/admin/product-basic-info";
import { ProductPricingInfo } from "@/components/products/admin/product-pricing-info";
import { ProductInventoryInfo } from "@/components/products/admin/product-inventory-info";
import { ProductImagesGallery } from "@/components/products/admin/product-images-gallery";
import { ProductSpecifications } from "@/components/products/admin/product-specifications";
import type { ProductData } from "@/app/admin/productos/[id]/page";

// Datos iniciales para un nuevo producto
const initialProductData: ProductData = {
  id: "",
  name: "",
  sku: "",
  description: "",
  shortDescription: "",
  category: "Electrónicos",
  subcategory: "",
  brand: "",
  model: "",
  supplier: "",
  supplierCode: "",

  // Precios
  price: 0,
  costPrice: 0,
  originalPrice: 0,
  wholesalePrice: 0,
  minPrice: 0,

  // Inventario
  stock: 0,
  minStock: 0,
  maxStock: 100,
  reservedStock: 0,
  availableStock: 0,
  location: "",
  supplier_sku: "",

  // Estado y configuración
  status: "BORRADOR",
  isActive: false,
  isFeatured: false,
  isVisible: false,
  allowBackorder: false,
  trackStock: true,

  // Información física
  weight: 0,
  dimensions: {
    length: 0,
    width: 0,
    height: 0,
  },

  // SEO y marketing
  metaTitle: "",
  metaDescription: "",
  tags: [],

  // Imágenes
  images: [],

  // Especificaciones técnicas
  specifications: {} as any,

  // Estadísticas de ventas (vacías para producto nuevo)
  salesStats: {
    totalSales: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalReviews: 0,
    lastSale: "",
    bestMonth: "",
    salesTrend: "up",
    topSellingVariant: "",
    returnRate: 0,
    profitMargin: 0,
  },

  // Fechas
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastStockUpdate: new Date().toISOString(),
};

export default function NewProductPage() {
  const router = useRouter();
  const [productData, setProductData] =
    useState<ProductData>(initialProductData);
  const [isSaving, setIsSaving] = useState(false);

  const updateProductData = (updates: Partial<ProductData>) => {
    setProductData((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Validaciones básicas
      if (!productData.name.trim()) {
        alert("El nombre del producto es obligatorio");
        return;
      }

      if (!productData.sku.trim()) {
        alert("El SKU es obligatorio");
        return;
      }

      if (productData.price <= 0) {
        alert("El precio debe ser mayor a 0");
        return;
      }

      if (productData.costPrice <= 0) {
        alert("El precio de costo debe ser mayor a 0");
        return;
      }

      // Generar ID único para el nuevo producto
      const newId = `PRO${Date.now().toString().slice(-6)}`;
      const newProductData = {
        ...productData,
        id: newId,
        status: "ACTIVO", // Cambiar de borrador a activo al guardar
        isActive: true,
        isVisible: true,
      };

      // Aquí iría la llamada a la API para crear el producto
      console.log("Creando nuevo producto:", newProductData);

      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redirigir al producto creado
      router.push(`/admin/productos/${newId}`);
    } catch (error) {
      console.error("Error al crear el producto:", error);
      alert("Error al crear el producto. Por favor, inténtalo de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/productos");
  };

  // Verificar si hay datos suficientes para guardar
  const canSave =
    productData.name.trim() &&
    productData.sku.trim() &&
    productData.price > 0 &&
    productData.costPrice > 0;

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-white/30 shadow-xl p-6"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left side - Product info */}
              <div className="flex items-start gap-6">
                {/* Back button */}
                <motion.button
                  whileHover={{ scale: 1.05, x: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancel}
                  className="p-3 bg-white/60 dark:bg-slate-700/60 rounded-xl border border-white/30 hover:bg-white/80 dark:hover:bg-slate-600/80 transition-all backdrop-blur-sm"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </motion.button>

                {/* Product icon and info */}
                <div className="flex items-start gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white shadow-lg"
                  >
                    <Package className="w-10 h-10" />
                  </motion.div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Nuevo Producto
                      </h1>
                      <span className="px-3 py-1 rounded-lg text-sm font-medium border backdrop-blur-sm bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30">
                        BORRADOR
                      </span>
                    </div>

                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Completa la información básica para crear el producto
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Actions */}
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-gray-500/20 to-slate-500/20 hover:from-gray-500/30 hover:to-slate-500/30 text-gray-700 dark:text-gray-300 rounded-xl transition-all backdrop-blur-sm border border-gray-500/20"
                >
                  <span className="font-medium">Cancelar</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={!canSave || isSaving}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all backdrop-blur-sm border font-medium ${
                    canSave && !isSaving
                      ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 text-green-700 dark:text-green-300 border-green-500/20"
                      : "bg-gray-100/50 dark:bg-slate-700/50 text-gray-400 dark:text-gray-500 border-gray-300/30 cursor-not-allowed"
                  }`}
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "Guardando..." : "Crear producto"}</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Main Info */}
            <div className="xl:col-span-2 space-y-8">
              <ProductBasicInfo
                productData={productData}
                isEditing={true}
                onChange={updateProductData}
              />

              <ProductPricingInfo
                productData={productData}
                isEditing={true}
                onChange={updateProductData}
              />

              <ProductInventoryInfo
                productData={productData}
                isEditing={true}
                onChange={updateProductData}
              />

              <ProductSpecifications
                productData={productData}
                isEditing={true}
                onChange={updateProductData}
              />
            </div>

            {/* Right Column - Images */}
            <div className="space-y-8">
              <ProductImagesGallery
                productData={productData}
                isEditing={true}
                onChange={updateProductData}
              />

              {/* Ayuda y consejos */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-2xl border border-blue-200/30 p-6"
              >
                <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-4">
                  💡 Consejos para crear un buen producto
                </h3>
                <ul className="space-y-2 text-sm text-blue-600/80 dark:text-blue-400/80">
                  <li>• Usa un nombre descriptivo y claro</li>
                  <li>• El SKU debe ser único en tu catálogo</li>
                  <li>• Agrega múltiples imágenes de alta calidad</li>
                  <li>• Completa las especificaciones técnicas</li>
                  <li>• Define correctamente el stock mínimo</li>
                  <li>• Revisa que los precios sean competitivos</li>
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
