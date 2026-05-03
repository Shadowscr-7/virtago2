"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  X,
  DollarSign,
  Package,
  Check,
  Search,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useTheme } from "@/contexts/theme-context";
import { StyledSelect } from "@/components/ui/styled-select";

interface NewPriceForm {
  productCode: string;
  productName: string;
  minQuantity: number;
  price: number;
  currency: 'USD' | 'UYU' | 'EUR' | 'BRL';
  endDate: string;
  includeIVA: boolean;
  status: 'ACTIVO' | 'INACTIVO' | 'VENCIDO' | 'PROGRAMADO';
  category: string;
  supplier: string;
  costPrice: number;
  description: string;
  tags: string[];
}

const mockProducts = [
  { code: "IP15PM256", name: "iPhone 15 Pro Max 256GB", category: "Electrónicos" },
  { code: "MBP16M3", name: "MacBook Pro 16\" M3", category: "Informática" },
  { code: "SGS24U", name: "Samsung Galaxy S24 Ultra", category: "Electrónicos" },
  { code: "AIRPRO2", name: "AirPods Pro 2da Gen", category: "Electrónicos" },
  { code: "HPPAV15", name: "HP Pavilion 15\"", category: "Informática" },
];

export default function NewPricePage() {
  const router = useRouter();
  const { themeColors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [searchProduct, setSearchProduct] = useState("");
  const [showProductList, setShowProductList] = useState(false);
  const [formData, setFormData] = useState<NewPriceForm>({
    productCode: "",
    productName: "",
    minQuantity: 1,
    price: 0,
    currency: "USD",
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    includeIVA: false,
    status: "ACTIVO",
    category: "",
    supplier: "",
    costPrice: 0,
    description: "",
    tags: [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof NewPriceForm, string>>>({});

  const filteredProducts = mockProducts.filter(product =>
    product.code.toLowerCase().includes(searchProduct.toLowerCase()) ||
    product.name.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof NewPriceForm, string>> = {};
    if (!formData.productCode.trim()) newErrors.productCode = "El código del producto es requerido";
    if (!formData.productName.trim()) newErrors.productName = "El nombre del producto es requerido";
    if (formData.minQuantity <= 0) newErrors.minQuantity = "La cantidad mínima debe ser mayor a 0";
    if (formData.price <= 0) newErrors.price = "El precio debe ser mayor a 0";
    if (formData.costPrice < 0) newErrors.costPrice = "El precio de costo no puede ser negativo";
    if (formData.costPrice > 0 && formData.costPrice >= formData.price) newErrors.costPrice = "El precio de costo debe ser menor al precio de venta";
    if (!formData.endDate) newErrors.endDate = "La fecha de fin es requerida";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      router.push("/admin/precios");
    } catch (error) {
      console.error("Error creating price:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductSelect = (product: typeof mockProducts[0]) => {
    setFormData({ ...formData, productCode: product.code, productName: product.name, category: product.category });
    setSearchProduct("");
    setShowProductList(false);
  };

  const calculateMargin = () => {
    if (formData.costPrice > 0 && formData.price > formData.costPrice) {
      return ((formData.price - formData.costPrice) / formData.costPrice * 100).toFixed(1);
    }
    return null;
  };

  const margin = calculateMargin();
  const inputClass = "w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all text-gray-900 placeholder-gray-400";

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
              className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Agregar Nuevo Precio</h1>
              <p className="text-gray-500 text-sm">Completa la información para crear un nuevo precio</p>
            </div>
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all"
            >
              <X className="w-4 h-4" />
              Cancelar
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isLoading ? "Guardando..." : "Crear Precio"}
            </motion.button>
          </div>
        </motion.div>

        {/* Vista previa de margen */}
        {margin && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-50">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Margen de ganancia calculado</p>
                  <p className="text-lg font-bold text-green-700">{margin}%</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Ganancia por unidad</p>
                <p className="text-lg font-bold" style={{ color: themeColors.primary }}>
                  ${(formData.price - formData.costPrice).toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Información del producto */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                <Package className="w-5 h-5" style={{ color: themeColors.primary }} />
                Información del Producto
              </h3>

              <div className="space-y-4">
                {/* Búsqueda de producto */}
                <div className="relative">
                  <label className="block text-sm font-medium mb-2 text-gray-500">Buscar Producto</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por código o nombre..."
                      value={searchProduct}
                      onChange={(e) => { setSearchProduct(e.target.value); setShowProductList(e.target.value.length > 0); }}
                      onFocus={() => setShowProductList(searchProduct.length > 0)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all text-gray-900 placeholder-gray-400"
                    />
                  </div>

                  {showProductList && filteredProducts.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-10 w-full mt-1 bg-white rounded-lg border border-gray-200 shadow-lg max-h-60 overflow-y-auto"
                    >
                      {filteredProducts.map((product) => (
                        <button
                          key={product.code}
                          type="button"
                          onClick={() => handleProductSelect(product)}
                          className="w-full p-3 text-left transition-colors hover:bg-red-50 first:rounded-t-lg last:rounded-b-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm text-gray-900">{product.code}</p>
                              <p className="text-xs text-gray-500">{product.name}</p>
                            </div>
                            <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-700">{product.category}</span>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-500">Código del Producto *</label>
                    <input
                      type="text"
                      value={formData.productCode}
                      onChange={(e) => setFormData({...formData, productCode: e.target.value})}
                      className={inputClass}
                      style={{ borderColor: errors.productCode ? "#ef4444" : undefined }}
                    />
                    {errors.productCode && <p className="text-red-500 text-xs mt-1">{errors.productCode}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-500">Categoría</label>
                    <StyledSelect
                      value={formData.category}
                      onChange={(value) => setFormData({...formData, category: value})}
                      options={[
                        { value: "", label: "Seleccionar categoría" },
                        { value: "Electrónicos", label: "Electrónicos" },
                        { value: "Informática", label: "Informática" },
                        { value: "Accesorios", label: "Accesorios" },
                      ]}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-500">Nombre del Producto *</label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => setFormData({...formData, productName: e.target.value})}
                    className={inputClass}
                    style={{ borderColor: errors.productName ? "#ef4444" : undefined }}
                  />
                  {errors.productName && <p className="text-red-500 text-xs mt-1">{errors.productName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-500">Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className={inputClass + " resize-none"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-500">Proveedor</label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Información de precios */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                <DollarSign className="w-5 h-5" style={{ color: themeColors.primary }} />
                Información de Precios
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-500">Precio de Venta *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                      className={inputClass}
                      style={{ borderColor: errors.price ? "#ef4444" : undefined }}
                    />
                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-500">Moneda</label>
                    <StyledSelect
                      value={formData.currency}
                      onChange={(value: string) => setFormData({...formData, currency: value as 'USD' | 'UYU' | 'EUR' | 'BRL'})}
                      options={[
                        { value: "USD", label: "USD" },
                        { value: "UYU", label: "UYU" },
                        { value: "EUR", label: "EUR" },
                        { value: "BRL", label: "BRL" },
                      ]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-500">Precio de Costo</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.costPrice}
                      onChange={(e) => setFormData({...formData, costPrice: Number(e.target.value)})}
                      className={inputClass}
                      style={{ borderColor: errors.costPrice ? "#ef4444" : undefined }}
                    />
                    {errors.costPrice && <p className="text-red-500 text-xs mt-1">{errors.costPrice}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-500">Cantidad Mínima *</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.minQuantity}
                      onChange={(e) => setFormData({...formData, minQuantity: Number(e.target.value)})}
                      className={inputClass}
                      style={{ borderColor: errors.minQuantity ? "#ef4444" : undefined }}
                    />
                    {errors.minQuantity && <p className="text-red-500 text-xs mt-1">{errors.minQuantity}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-500">Fecha de Fin *</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className={inputClass}
                      style={{ borderColor: errors.endDate ? "#ef4444" : undefined }}
                    />
                    {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-500">Estado</label>
                    <StyledSelect
                      value={formData.status}
                      onChange={(value: string) => setFormData({...formData, status: value as 'ACTIVO' | 'INACTIVO' | 'VENCIDO' | 'PROGRAMADO'})}
                      options={[
                        { value: "ACTIVO", label: "Activo" },
                        { value: "INACTIVO", label: "Inactivo" },
                        { value: "PROGRAMADO", label: "Programado" },
                      ]}
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.includeIVA}
                      onChange={(e) => setFormData({...formData, includeIVA: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div
                      className="relative w-5 h-5 bg-white border-2 border-gray-300 rounded-md transition-all duration-200"
                      style={{
                        borderColor: formData.includeIVA ? themeColors.primary : undefined,
                        backgroundColor: formData.includeIVA ? themeColors.primary : undefined,
                      }}
                    >
                      <Check className="absolute inset-0 w-3 h-3 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Incluir IVA en el precio</span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        </form>
      </div>
    </AdminLayout>
  );
}
