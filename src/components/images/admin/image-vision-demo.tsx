/**
 * Componente de Prueba para el Sistema de Análisis de Imágenes con IA
 * Demuestra todas las funcionalidades del sistema de visión
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Image as ImageIcon, Sparkles, Search } from "lucide-react";
import { useImageVision, validateImageFile } from "@/hooks/useImageVision";
import { useTheme } from "@/contexts/theme-context";

export function ImageVisionDemo() {
  const { themeColors } = useTheme();
  const {
    isAnalyzing,
    analysis,
    analyzeImage,
    findMatchingProducts,
    reset,
  } = useImageVision({
    showToasts: true,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Productos de ejemplo para matching
  const mockProducts = [
    {
      sku: "SKU-001",
      name: "iPhone 15 Pro Max 256GB",
      brand: "Apple",
      category: "Smartphones",
    },
    {
      sku: "SKU-002",
      name: "Samsung Galaxy S24 Ultra",
      brand: "Samsung",
      category: "Smartphones",
    },
    {
      sku: "SKU-003",
      name: "MacBook Pro 16 M3",
      brand: "Apple",
      category: "Laptops",
    },
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar archivo
    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setSelectedFile(file);

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Reset análisis previo
    reset();
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    await analyzeImage(selectedFile, {
      existingProducts: mockProducts,
      categories: ["Smartphones", "Laptops", "Electrónica"],
    });
  };

  const handleFindMatches = async () => {
    if (!selectedFile) return;

    await findMatchingProducts(selectedFile, mockProducts, 60);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1
          className="text-4xl font-bold mb-2 bg-clip-text text-transparent"
          style={{
            backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
          }}
        >
          🤖 Análisis de Imágenes con IA
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Sube una imagen de producto y la IA extraerá toda la información
          automáticamente
        </p>
      </motion.div>

      {/* Upload Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="backdrop-blur-sm border-2 border-dashed rounded-2xl p-8 text-center"
        style={{
          background: `linear-gradient(135deg, ${themeColors.surface}40, ${themeColors.surface}20)`,
          borderColor: themeColors.primary + "40",
        }}
      >
        <input
          type="file"
          id="image-upload"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {!previewUrl ? (
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center gap-4"
          >
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
              }}
            >
              <Upload className="w-12 h-12 text-white" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                Haz clic para subir una imagen
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                JPG, PNG o WEBP (máx. 10MB)
              </p>
            </div>
          </label>
        ) : (
          <div className="space-y-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-96 mx-auto rounded-lg shadow-lg"
            />
            <div className="flex gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="px-6 py-3 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg disabled:opacity-50"
                style={{
                  backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
                }}
              >
                <Sparkles className="w-5 h-5" />
                {isAnalyzing ? "Analizando..." : "Analizar Imagen"}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFindMatches}
                disabled={isAnalyzing}
                className="px-6 py-3 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg disabled:opacity-50"
                style={{
                  backgroundImage: `linear-gradient(to right, ${themeColors.accent}, ${themeColors.secondary})`,
                }}
              >
                <Search className="w-5 h-5" />
                Buscar Coincidencias
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  reset();
                }}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium transition-all duration-200"
              >
                Cambiar Imagen
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Results */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-2xl p-6 shadow-xl space-y-6"
          style={{
            background: `linear-gradient(135deg, ${themeColors.surface}80, ${themeColors.surface}40)`,
          }}
        >
          <h2
            className="text-2xl font-bold bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
            }}
          >
            Resultados del Análisis
          </h2>

          {/* Información del Producto */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" style={{ color: themeColors.primary }} />
                Información del Producto
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Nombre:</span>{" "}
                  <span className="font-semibold">{analysis.productInfo.name}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Marca:</span>{" "}
                  <span className="font-semibold">{analysis.productInfo.brand}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Categoría:</span>{" "}
                  <span className="font-semibold">{analysis.productInfo.category}</span>
                </div>
                {analysis.productInfo.model && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Modelo:</span>{" "}
                    <span className="font-semibold">{analysis.productInfo.model}</span>
                  </div>
                )}
                {analysis.productInfo.color && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Color:</span>{" "}
                    <span className="font-semibold">{analysis.productInfo.color}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Confianza:</span>{" "}
                  <span
                    className="font-bold"
                    style={{
                      color:
                        analysis.confidence >= 80
                          ? themeColors.primary
                          : analysis.confidence >= 60
                          ? themeColors.secondary
                          : themeColors.accent,
                    }}
                  >
                    {analysis.confidence}%
                  </span>
                </div>
              </div>
            </div>

            {/* Calidad de Imagen */}
            <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4">
              <h3 className="font-semibold text-lg mb-3">Calidad de Imagen</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Claridad:</span>{" "}
                  <span className="font-semibold capitalize">
                    {analysis.imageQuality.clarity}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Fondo:</span>{" "}
                  <span className="font-semibold capitalize">
                    {analysis.imageQuality.backgroundType}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Marca de agua:</span>{" "}
                  <span className="font-semibold">
                    {analysis.imageQuality.hasWatermark ? "Sí" : "No"}
                  </span>
                </div>
                {analysis.imageQuality.recommendations.length > 0 && (
                  <div className="mt-3">
                    <span className="text-gray-600 dark:text-gray-400 block mb-1">
                      Recomendaciones:
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      {analysis.imageQuality.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-gray-700 dark:text-gray-300">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4">
            <h3 className="font-semibold text-lg mb-2">Descripción Generada</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {analysis.description}
            </p>
          </div>

          {/* Tags */}
          {analysis.tags.length > 0 && (
            <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4">
              <h3 className="font-semibold text-lg mb-2">Etiquetas</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{
                      background: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Especificaciones Técnicas */}
          {Object.keys(analysis.technicalSpecs).length > 0 && (
            <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4">
              <h3 className="font-semibold text-lg mb-2">
                Especificaciones Técnicas
              </h3>
              <div className="grid md:grid-cols-2 gap-2 text-sm">
                {Object.entries(analysis.technicalSpecs).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <span className="text-gray-600 dark:text-gray-400">{key}:</span>
                    <span className="font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
