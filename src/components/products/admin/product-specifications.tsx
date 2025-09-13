"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Plus, X, Edit2 } from "lucide-react";
import type { ProductData } from "@/app/admin/productos/[id]/page";

// Tipo para las especificaciones - flexible para permitir agregar/eliminar dinámicamente
type ProductSpecifications = Record<string, string>;

interface ProductSpecificationsProps {
  productData: ProductData;
  isEditing: boolean;
  onChange: (updates: Partial<ProductData>) => void;
}

export function ProductSpecifications({
  productData,
  isEditing,
  onChange,
}: ProductSpecificationsProps) {
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");
  const [editingSpec, setEditingSpec] = useState<string | null>(null);

  const addSpecification = () => {
    if (!newSpecKey.trim() || !newSpecValue.trim()) return;

    const updatedSpecs: ProductSpecifications = {
      ...productData.specifications,
      [newSpecKey.trim()]: newSpecValue.trim(),
    };

    onChange({ specifications: updatedSpecs as ProductData["specifications"] });
    setNewSpecKey("");
    setNewSpecValue("");
  };

  const removeSpecification = (key: string) => {
    const updatedSpecs: ProductSpecifications = {
      ...productData.specifications,
    };
    delete updatedSpecs[key];
    onChange({ specifications: updatedSpecs as ProductData["specifications"] });
  };

  const updateSpecification = (
    oldKey: string,
    newKey: string,
    newValue: string,
  ) => {
    const updatedSpecs: ProductSpecifications = {
      ...productData.specifications,
    };

    // Si cambió la clave, eliminar la anterior
    if (oldKey !== newKey) {
      delete updatedSpecs[oldKey];
    }

    updatedSpecs[newKey] = newValue;
    onChange({ specifications: updatedSpecs as ProductData["specifications"] });
    setEditingSpec(null);
  };

  const specificationEntries = Object.entries(productData.specifications || {});

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-white/30 shadow-xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl">
          <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Especificaciones Técnicas
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Características y detalles técnicos
          </p>
        </div>
      </div>

      {/* Lista de especificaciones */}
      <div className="space-y-3 mb-6">
        {specificationEntries.length > 0 ? (
          specificationEntries.map(([key, value]) => (
            <SpecificationItem
              key={key}
              specKey={key}
              specValue={value}
              isEditing={isEditing}
              isEditingThis={editingSpec === key}
              onEdit={() => setEditingSpec(key)}
              onSave={(newKey, newValue) =>
                updateSpecification(key, newKey, newValue)
              }
              onCancel={() => setEditingSpec(null)}
              onRemove={() => removeSpecification(key)}
            />
          ))
        ) : (
          <div className="text-center py-8 bg-gray-50/50 dark:bg-slate-700/30 rounded-xl border border-white/20">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay especificaciones
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {isEditing
                ? "Agrega especificaciones técnicas del producto"
                : "Este producto no tiene especificaciones definidas"}
            </p>
          </div>
        )}
      </div>

      {/* Formulario para agregar nueva especificación */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="pt-6 border-t border-gray-200/30 dark:border-gray-700/30"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Agregar Especificación
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Característica
              </label>
              <input
                type="text"
                value={newSpecKey}
                onChange={(e) => setNewSpecKey(e.target.value)}
                className="w-full px-4 py-3 bg-white/60 dark:bg-slate-700/60 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all backdrop-blur-sm"
                placeholder="Ej: Procesador, Pantalla, Memoria..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Valor
              </label>
              <input
                type="text"
                value={newSpecValue}
                onChange={(e) => setNewSpecValue(e.target.value)}
                className="w-full px-4 py-3 bg-white/60 dark:bg-slate-700/60 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all backdrop-blur-sm"
                placeholder="Ej: Intel Core i7, 15.6 pulgadas, 16GB..."
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    addSpecification();
                  }
                }}
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={addSpecification}
            disabled={!newSpecKey.trim() || !newSpecValue.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar especificación</span>
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}

interface SpecificationItemProps {
  specKey: string;
  specValue: string;
  isEditing: boolean;
  isEditingThis: boolean;
  onEdit: () => void;
  onSave: (key: string, value: string) => void;
  onCancel: () => void;
  onRemove: () => void;
}

function SpecificationItem({
  specKey,
  specValue,
  isEditing,
  isEditingThis,
  onEdit,
  onSave,
  onCancel,
  onRemove,
}: SpecificationItemProps) {
  const [editKey, setEditKey] = useState(specKey);
  const [editValue, setEditValue] = useState(specValue);

  const handleSave = () => {
    if (!editKey.trim() || !editValue.trim()) return;
    onSave(editKey.trim(), editValue.trim());
  };

  const handleCancel = () => {
    setEditKey(specKey);
    setEditValue(specValue);
    onCancel();
  };

  if (isEditingThis) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-purple-50/50 dark:bg-purple-900/10 rounded-xl border border-purple-200/30"
      >
        <input
          type="text"
          value={editKey}
          onChange={(e) => setEditKey(e.target.value)}
          className="px-3 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all backdrop-blur-sm"
          placeholder="Característica"
        />

        <div className="flex gap-2">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1 px-3 py-2 bg-white/60 dark:bg-slate-700/60 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all backdrop-blur-sm"
            placeholder="Valor"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSave();
              }
            }}
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all"
          >
            ✓
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCancel}
            className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all"
          >
            ✕
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-slate-700/30 rounded-xl border border-white/20 hover:border-purple-300/50 transition-all"
    >
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {specKey}
          </span>
        </div>
        <div>
          <span className="text-gray-900 dark:text-white">{specValue}</span>
        </div>
      </div>

      {isEditing && (
        <div className="flex items-center gap-2 ml-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onEdit}
            className="p-2 text-blue-600 hover:bg-blue-100/50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
            title="Editar especificación"
          >
            <Edit2 className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onRemove}
            className="p-2 text-red-600 hover:bg-red-100/50 dark:hover:bg-red-900/20 rounded-lg transition-all"
            title="Eliminar especificación"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
