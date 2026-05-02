"use client";

import { motion } from "framer-motion";
import { Package, FileText, Tag, Building } from "lucide-react";
import { StyledSelect } from "@/components/ui/styled-select";
import type { ProductData } from "@/app/admin/productos/[id]/page";

interface ProductBasicInfoProps {
  productData: ProductData;
  isEditing: boolean;
  onChange: (updates: Partial<ProductData>) => void;
}

const PRIMARY = "#1E3A61";

export function ProductBasicInfo({
  productData,
  isEditing,
  onChange,
}: ProductBasicInfoProps) {
  const categoryOptions = [
    { value: "Electrónicos", label: "Electrónicos" },
    { value: "Informática", label: "Informática" },
    { value: "Oficina", label: "Oficina" },
    { value: "Fotografía", label: "Fotografía" },
    { value: "Hogar", label: "Hogar" },
    { value: "Deportes", label: "Deportes" },
  ];

  const subcategoryOptions = {
    Electrónicos: [
      { value: "Smartphones", label: "Smartphones" },
      { value: "Audio", label: "Audio" },
      { value: "Accesorios", label: "Accesorios" },
      { value: "Wearables", label: "Wearables" },
    ],
    Informática: [
      { value: "Laptops", label: "Laptops" },
      { value: "Monitores", label: "Monitores" },
      { value: "Tablets", label: "Tablets" },
      { value: "Periféricos", label: "Periféricos" },
    ],
    Oficina: [
      { value: "Mobiliario", label: "Mobiliario" },
      { value: "Impresoras", label: "Impresoras" },
      { value: "Suministros", label: "Suministros" },
    ],
    Fotografía: [
      { value: "Cámaras", label: "Cámaras" },
      { value: "Lentes", label: "Lentes" },
      { value: "Accesorios", label: "Accesorios" },
    ],
  };

  const statusOptions = [
    { value: "ACTIVO", label: "Activo" },
    { value: "INACTIVO", label: "Inactivo" },
    { value: "BORRADOR", label: "Borrador" },
    { value: "DESCONTINUADO", label: "Descontinuado" },
  ];

  const getCurrentSubcategories = () => {
    return (
      subcategoryOptions[
        productData.category as keyof typeof subcategoryOptions
      ] || []
    );
  };

  const inputClass =
    "w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition-all text-gray-800 placeholder-gray-400";
  const inputFocusStyle = { "--tw-ring-color": PRIMARY + "40" } as React.CSSProperties;
  const readonlyClass =
    "px-4 py-3 bg-gray-50 rounded-xl border border-gray-100";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className="p-3 rounded-xl"
          style={{ backgroundColor: PRIMARY + "15" }}
        >
          <Package className="w-6 h-6" style={{ color: PRIMARY }} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Información Básica</h2>
          <p className="text-sm text-gray-500">Datos principales del producto</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nombre del producto */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Package className="w-4 h-4 inline mr-2" />
            Nombre del producto *
          </label>
          {isEditing ? (
            <input
              type="text"
              value={productData.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className={inputClass}
              style={inputFocusStyle}
              placeholder="Ingresa el nombre del producto"
            />
          ) : (
            <div className={readonlyClass}>
              <span className="text-gray-900 font-medium">{productData.name}</span>
            </div>
          )}
        </div>

        {/* SKU */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Tag className="w-4 h-4 inline mr-2" />
            SKU *
          </label>
          {isEditing ? (
            <input
              type="text"
              value={productData.sku}
              onChange={(e) => onChange({ sku: e.target.value })}
              className={inputClass}
              style={inputFocusStyle}
              placeholder="SKU-XXXXX"
            />
          ) : (
            <div className={readonlyClass}>
              <span className="text-gray-900 font-mono">{productData.sku}</span>
            </div>
          )}
        </div>

        {/* Marca */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Building className="w-4 h-4 inline mr-2" />
            Marca *
          </label>
          {isEditing ? (
            <input
              type="text"
              value={productData.brand}
              onChange={(e) => onChange({ brand: e.target.value })}
              className={inputClass}
              style={inputFocusStyle}
              placeholder="Nombre de la marca"
            />
          ) : (
            <div className={readonlyClass}>
              <span className="text-gray-900 font-medium">{productData.brand}</span>
            </div>
          )}
        </div>

        {/* Modelo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Modelo</label>
          {isEditing ? (
            <input
              type="text"
              value={productData.model}
              onChange={(e) => onChange({ model: e.target.value })}
              className={inputClass}
              style={inputFocusStyle}
              placeholder="Modelo específico"
            />
          ) : (
            <div className={readonlyClass}>
              <span className="text-gray-900">{productData.model}</span>
            </div>
          )}
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría *</label>
          {isEditing ? (
            <StyledSelect
              value={productData.category}
              onChange={(value) => onChange({ category: value, subcategory: "" })}
              options={categoryOptions}
            />
          ) : (
            <div className={readonlyClass}>
              <span className="text-gray-900">{productData.category}</span>
            </div>
          )}
        </div>

        {/* Subcategoría */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Subcategoría</label>
          {isEditing ? (
            <StyledSelect
              value={productData.subcategory}
              onChange={(value) => onChange({ subcategory: value })}
              options={getCurrentSubcategories()}
              disabled={!productData.category}
            />
          ) : (
            <div className={readonlyClass}>
              <span className="text-gray-900">{productData.subcategory || "No especificada"}</span>
            </div>
          )}
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Estado *</label>
          {isEditing ? (
            <StyledSelect
              value={productData.status}
              onChange={(value) => onChange({ status: value })}
              options={statusOptions}
            />
          ) : (
            <div className={readonlyClass}>
              <span
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  productData.status === "ACTIVO"
                    ? "bg-green-100 text-green-800"
                    : productData.status === "INACTIVO"
                      ? "bg-gray-100 text-gray-700"
                      : productData.status === "BORRADOR"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                }`}
              >
                {productData.status}
              </span>
            </div>
          )}
        </div>

        {/* Descripción corta */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Descripción corta
          </label>
          {isEditing ? (
            <input
              type="text"
              value={productData.shortDescription}
              onChange={(e) => onChange({ shortDescription: e.target.value })}
              className={inputClass}
              style={inputFocusStyle}
              placeholder="Descripción breve para listados"
            />
          ) : (
            <div className={readonlyClass}>
              <span className="text-gray-900">{productData.shortDescription}</span>
            </div>
          )}
        </div>

        {/* Descripción detallada */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Descripción detallada
          </label>
          {isEditing ? (
            <textarea
              rows={4}
              value={productData.description}
              onChange={(e) => onChange({ description: e.target.value })}
              className={`${inputClass} resize-none`}
              style={inputFocusStyle}
              placeholder="Descripción completa del producto, características principales, beneficios..."
            />
          ) : (
            <div className={`${readonlyClass} min-h-[120px]`}>
              <p className="text-gray-900 leading-relaxed">{productData.description}</p>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Etiquetas</label>
          {isEditing ? (
            <input
              type="text"
              value={productData.tags.join(", ")}
              onChange={(e) =>
                onChange({
                  tags: e.target.value.split(", ").filter((tag) => tag.trim()),
                })
              }
              className={inputClass}
              style={inputFocusStyle}
              placeholder="iPhone, Apple, 5G, Pro (separadas por comas)"
            />
          ) : (
            <div className={readonlyClass}>
              <div className="flex flex-wrap gap-2">
                {productData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: PRIMARY }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
