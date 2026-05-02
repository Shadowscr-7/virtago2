"use client";

import { motion } from "framer-motion";
import {
  Package,
  MapPin,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { StyledSwitch } from "@/components/ui/styled-switch";
import type { ProductData } from "@/app/admin/productos/[id]/page";

interface ProductInventoryInfoProps {
  productData: ProductData;
  isEditing: boolean;
  onChange: (updates: Partial<ProductData>) => void;
}

const PRIMARY = "#1E3A61";

export function ProductInventoryInfo({
  productData,
  isEditing,
  onChange,
}: ProductInventoryInfoProps) {
  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) {
      return { status: "SIN_STOCK", label: "Sin Stock", color: "red", icon: <Minus className="w-4 h-4" /> };
    } else if (stock <= minStock) {
      return { status: "BAJO_STOCK", label: "Bajo Stock", color: "yellow", icon: <TrendingDown className="w-4 h-4" /> };
    } else {
      return { status: "EN_STOCK", label: "En Stock", color: "green", icon: <TrendingUp className="w-4 h-4" /> };
    }
  };

  const stockStatus = getStockStatus(productData.stock, productData.minStock);

  const getStockPercentage = () => {
    if (productData.maxStock === 0) return 0;
    return (productData.stock / productData.maxStock) * 100;
  };

  const inputClass =
    "w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition-all text-gray-800 placeholder-gray-400";
  const readonlyClass = "px-4 py-3 bg-gray-50 rounded-xl border border-gray-100";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl" style={{ backgroundColor: PRIMARY + "15" }}>
          <Package className="w-6 h-6" style={{ color: PRIMARY }} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestión de Inventario</h2>
          <p className="text-sm text-gray-500">Control de stock y ubicación</p>
        </div>
      </div>

      {/* Estado actual del stock */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                stockStatus.color === "green"
                  ? "bg-green-100 text-green-600"
                  : stockStatus.color === "yellow"
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-red-100 text-red-600"
              }`}
            >
              {stockStatus.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Estado del Stock</h3>
              <span
                className={`text-sm font-medium ${
                  stockStatus.color === "green"
                    ? "text-green-600"
                    : stockStatus.color === "yellow"
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {stockStatus.label}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{productData.stock}</div>
            <div className="text-sm text-gray-500">unidades disponibles</div>
          </div>
        </div>

        {/* Barra de progreso del stock */}
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                stockStatus.color === "green"
                  ? "bg-green-500"
                  : stockStatus.color === "yellow"
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${Math.min(getStockPercentage(), 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0</span>
            <span>Min: {productData.minStock}</span>
            <span>Máx: {productData.maxStock}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock actual */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Package className="w-4 h-4 inline mr-2" />
            Stock actual *
          </label>
          {isEditing ? (
            <input
              type="number"
              value={productData.stock}
              onChange={(e) => onChange({ stock: Number(e.target.value) })}
              className={inputClass}
              placeholder="0"
              min="0"
              step="1"
            />
          ) : (
            <div className={readonlyClass}>
              <span className="text-2xl font-bold text-gray-900">{productData.stock}</span>
              <span className="text-sm text-gray-500 ml-2">unidades</span>
            </div>
          )}
        </div>

        {/* Stock mínimo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            Stock mínimo *
          </label>
          {isEditing ? (
            <input
              type="number"
              value={productData.minStock}
              onChange={(e) => onChange({ minStock: Number(e.target.value) })}
              className={inputClass}
              placeholder="0"
              min="0"
              step="1"
            />
          ) : (
            <div className={readonlyClass}>
              <span className="text-lg font-semibold text-gray-900">{productData.minStock}</span>
              <span className="text-sm text-gray-500 ml-2">unidades</span>
            </div>
          )}
        </div>

        {/* Stock máximo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Stock máximo</label>
          {isEditing ? (
            <input
              type="number"
              value={productData.maxStock}
              onChange={(e) => onChange({ maxStock: Number(e.target.value) })}
              className={inputClass}
              placeholder="0"
              min="0"
              step="1"
            />
          ) : (
            <div className={readonlyClass}>
              <span className="text-lg font-semibold text-gray-900">{productData.maxStock}</span>
              <span className="text-sm text-gray-500 ml-2">unidades</span>
            </div>
          )}
        </div>

        {/* Stock reservado */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Stock reservado</label>
          {isEditing ? (
            <input
              type="number"
              value={productData.reservedStock || 0}
              onChange={(e) => onChange({ reservedStock: Number(e.target.value) })}
              className={inputClass}
              placeholder="0"
              min="0"
              step="1"
            />
          ) : (
            <div className={readonlyClass}>
              <span className="text-lg font-semibold text-gray-900">{productData.reservedStock || 0}</span>
              <span className="text-sm text-gray-500 ml-2">unidades</span>
            </div>
          )}
        </div>

        {/* Ubicación */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-2" />
            Ubicación en almacén
          </label>
          {isEditing ? (
            <input
              type="text"
              value={productData.location || ""}
              onChange={(e) => onChange({ location: e.target.value })}
              className={inputClass}
              placeholder="Ej: A-1-15, Pasillo A, Estante 1, Nivel 15"
            />
          ) : (
            <div className={readonlyClass}>
              <span className="text-gray-900">{productData.location || "No especificada"}</span>
            </div>
          )}
        </div>

        {/* SKU del proveedor */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">SKU del proveedor</label>
          {isEditing ? (
            <input
              type="text"
              value={productData.supplier_sku || ""}
              onChange={(e) => onChange({ supplier_sku: e.target.value })}
              className={inputClass}
              placeholder="SKU del proveedor"
            />
          ) : (
            <div className={readonlyClass}>
              <span className="text-gray-900 font-mono">{productData.supplier_sku || "No especificado"}</span>
            </div>
          )}
        </div>
      </div>

      {/* Configuraciones de inventario */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuraciones de Inventario</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div>
              <div className="font-medium text-gray-900">Seguimiento de stock</div>
              <div className="text-sm text-gray-500">Controlar automáticamente el inventario</div>
            </div>
            <StyledSwitch
              checked={productData.trackStock}
              onChange={(checked) => onChange({ trackStock: checked })}
              disabled={!isEditing}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
            <div>
              <div className="font-medium text-gray-900">Permitir pedidos sin stock</div>
              <div className="text-sm text-gray-500">Backorder cuando no hay stock</div>
            </div>
            <StyledSwitch
              checked={productData.allowBackorder}
              onChange={(checked) => onChange({ allowBackorder: checked })}
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>

      {/* Stock disponible calculado */}
      <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-green-700">Stock disponible para venta</div>
            <div className="text-sm text-green-600/70">Stock total - Stock reservado</div>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {Math.max(0, productData.stock - (productData.reservedStock || 0))}
          </div>
        </div>
      </div>

      {/* Unidad de Venta */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Package className="w-5 h-5" style={{ color: PRIMARY }} />
          Unidad de Venta
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Configura como se puede comprar este producto (por unidad suelta o por empaque)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de la unidad base</label>
            {isEditing ? (
              <input type="text" value={productData.baseUnit || ""} onChange={(e) => onChange({ baseUnit: e.target.value })} placeholder="Ej: sobre, unidad, pieza" className={inputClass} />
            ) : (
              <div className={readonlyClass}>
                <span className="text-gray-900">{productData.baseUnit || "unidad"}</span>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del empaque</label>
            {isEditing ? (
              <input type="text" value={productData.packagingUnit || ""} onChange={(e) => onChange({ packagingUnit: e.target.value })} placeholder="Ej: caja, pack, rollo" className={inputClass} />
            ) : (
              <div className={readonlyClass}>
                <span className="text-gray-900">{productData.packagingUnit || "caja"}</span>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Unidades por empaque</label>
            {isEditing ? (
              <input type="number" min="1" step="1" value={productData.unitsPerPackage || 1} onChange={(e) => onChange({ unitsPerPackage: Math.max(1, Number(e.target.value)) })} className={inputClass} />
            ) : (
              <div className={readonlyClass}>
                <span className="text-2xl font-bold text-gray-900">{productData.unitsPerPackage || 1}</span>
                <span className="text-sm text-gray-500 ml-2">{productData.baseUnit || "unidades"} por {productData.packagingUnit || "empaque"}</span>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Modo de compra permitido</label>
            {isEditing ? (
              <select value={productData.purchaseMode || "by_unit"} onChange={(e) => onChange({ purchaseMode: e.target.value as "by_unit" | "by_package" | "both" })} className={inputClass}>
                <option value="by_unit">Solo por unidad suelta</option>
                <option value="by_package">Solo por empaque completo</option>
                <option value="both">Por unidad o por empaque</option>
              </select>
            ) : (
              <div className={readonlyClass}>
                <span className="text-gray-900">
                  {productData.purchaseMode === "by_package" ? "Solo por empaque completo" : productData.purchaseMode === "both" ? "Por unidad o por empaque" : "Solo por unidad suelta"}
                </span>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Cantidad mínima de pedido</label>
            {isEditing ? (
              <input type="number" min="1" step="1" value={productData.minOrderQuantity || 1} onChange={(e) => onChange({ minOrderQuantity: Math.max(1, Number(e.target.value)) })} className={inputClass} />
            ) : (
              <div className={readonlyClass}>
                <span className="text-2xl font-bold text-gray-900">{productData.minOrderQuantity || 1}</span>
                <span className="text-sm text-gray-500 ml-2">{productData.baseUnit || "unidades"} mínimo</span>
              </div>
            )}
          </div>
        </div>
        {!isEditing && productData.unitsPerPackage > 1 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-700">
              <strong>Configuración activa</strong>
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
