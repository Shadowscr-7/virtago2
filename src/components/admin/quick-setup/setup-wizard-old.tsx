"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/theme-context";
import { AdminLayout } from "@/components/admin/admin-layout";
import { 
  Users, 
  Package, 
  DollarSign, 
  FileText, 
  Percent,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Zap,
  Code,
  Upload,
  Download,
  AlertCircle,
  X,
  Brain,
  ArrowRight,
  Edit,
  Check
} from "lucide-react";
import { ClientsSetupStep } from "./steps/clients-setup-step";

// Product Upload Interface Component
const ProductUploadInterface = ({ 
  method, 
  onUpload, 
  onBack, 
  isProcessing, 
  sampleData, 
  themeColors 
}: {
  method: string;
  onUpload: (data: ProductData[]) => void;
  onBack: () => void;
  isProcessing: boolean;
  sampleData: ProductData[];
  themeColors: { 
    primary: string; 
    secondary: string; 
    accent: string; 
    surface: string;
    text: { primary: string; secondary: string; };
  };
}) => {
  const [jsonInput, setJsonInput] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setUploadedFile(file);
    onUpload(sampleData); // Usar datos de ejemplo
  };

  const downloadSample = () => {
    if (method === "json") {
      const jsonContent = JSON.stringify(sampleData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'productos_ejemplo.json';
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      const csvContent = "code,name,description,category,brand,price,stock\n" +
        sampleData.map(product => 
          `"${product.code}","${product.name}","${product.description}","${product.category}","${product.brand}","${product.price}","${product.stock}"`
        ).join("\n");
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'productos_ejemplo.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  if (isProcessing) {
    return (
      <div className="text-center space-y-6">
        <div className="flex items-center justify-between mb-6">
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg"
            style={{ color: themeColors.text.secondary }}
          >
            <X className="w-4 h-4" />
            Cancelar
          </motion.button>
          <h3 className="text-xl font-semibold" style={{ color: themeColors.text.primary }}>
            Procesando con IA...
          </h3>
          <div></div>
        </div>

        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: `${themeColors.primary}20` }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="w-10 h-10" style={{ color: themeColors.primary }} />
          </motion.div>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold" style={{ color: themeColors.text.primary }}>
            Analizando productos con IA
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm" style={{ color: themeColors.text.secondary }}>
              <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
              Identificando categorías y marcas...
            </div>
            <div className="flex items-center justify-center gap-2 text-sm" style={{ color: themeColors.text.secondary }}>
              <div className="w-2 h-2 rounded-full bg-current animate-pulse delay-150"></div>
              Matching con base de datos...
            </div>
            <div className="flex items-center justify-center gap-2 text-sm" style={{ color: themeColors.text.secondary }}>
              <div className="w-2 h-2 rounded-full bg-current animate-pulse delay-300"></div>
              Generando sugerencias...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold" style={{ color: themeColors.text.primary }}>
          {method === "file" ? "Subir Archivo" : "Importar JSON"}
        </h3>
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-lg"
          style={{ color: themeColors.text.secondary }}
        >
          <X className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Sample Download */}
      <div className="text-center">
        <motion.button
          onClick={downloadSample}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium"
          style={{
            backgroundColor: `${themeColors.secondary}20`,
            color: themeColors.secondary,
          }}
        >
          <Download className="w-4 h-4" />
          Descargar {method === "json" ? "JSON" : "CSV"} de Ejemplo
        </motion.button>
      </div>

      {method === "file" ? (
        /* File Upload */
        <motion.div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer
            ${dragActive ? 'scale-105 border-opacity-100' : 'border-opacity-50'}
          `}
          style={{
            borderColor: dragActive ? themeColors.primary : `${themeColors.primary}50`,
            backgroundColor: dragActive ? `${themeColors.primary}10` : `${themeColors.surface}30`,
          }}
        >
          <input
            type="file"
            accept=".csv,.xlsx,.txt"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <Upload className="w-16 h-16 mx-auto mb-4" style={{ color: themeColors.primary }} />
          <h4 className="text-xl font-semibold mb-2" style={{ color: themeColors.text.primary }}>
            {uploadedFile ? `Archivo: ${uploadedFile.name}` : "Arrastra tu archivo aquí"}
          </h4>
          <p className="mb-4" style={{ color: themeColors.text.secondary }}>
            {uploadedFile ? "Archivo cargado correctamente" : "o haz clic para seleccionar"}
          </p>
          <div className="flex items-center justify-center gap-4 text-sm" style={{ color: themeColors.text.secondary }}>
            <span>CSV</span>
            <span>XLSX</span>
            <span>TXT</span>
          </div>
        </motion.div>
      ) : (
        /* JSON Input */
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text.primary }}>
              Pega tu JSON aquí:
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={`[\n  {\n    "code": "PROD001",\n    "name": "Producto ejemplo",\n    "description": "Descripción...",\n    "category": "Categoría",\n    "brand": "Marca",\n    "price": 99.99,\n    "stock": 10\n  }\n]`}
              rows={12}
              className="w-full p-4 rounded-xl border font-mono text-sm focus:outline-none focus:ring-2"
              style={{
                backgroundColor: `${themeColors.surface}50`,
                borderColor: `${themeColors.primary}30`,
                color: themeColors.text.primary,
              }}
            />
          </div>
          <motion.button
            onClick={() => {
              try {
                const data = JSON.parse(jsonInput);
                onUpload(Array.isArray(data) ? data : [data]);
              } catch {
                onUpload(sampleData); // Usar datos de ejemplo si hay error
              }
            }}
            disabled={!jsonInput.trim()}
            whileHover={{ scale: jsonInput.trim() ? 1.02 : 1 }}
            whileTap={{ scale: jsonInput.trim() ? 0.98 : 1 }}
            className={`
              w-full py-3 rounded-xl font-medium transition-all duration-200
              ${!jsonInput.trim() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            style={{
              backgroundColor: themeColors.primary,
              color: 'white',
            }}
          >
            Procesar con IA
          </motion.button>
        </div>
      )}
    </div>
  );
};

// Product Matching Interface Component - Pantalla principal de matching con IA
const ProductMatchingInterface = ({ 
  products, 
  onComplete, 
  onBack, 
  themeColors, 
  mockCategories, 
  mockBrands 
}: {
  products: MatchedProduct[];
  onComplete: (finalProducts: MatchedProduct[]) => void;
  onBack: () => void;
  themeColors: { 
    primary: string; 
    secondary: string; 
    accent: string; 
    surface: string;
    text: { primary: string; secondary: string; };
  };
  mockCategories: Category[];
  mockBrands: string[];
}) => {
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const [finalProducts, setFinalProducts] = useState(products);

  const updateProduct = (index: number, field: string, value: string) => {
    const updated = [...finalProducts];
    updated[index] = { 
      ...updated[index], 
      [field]: value 
    };
    setFinalProducts(updated);
  };

  const acceptSuggestion = (index: number, field: string, suggestion: { name: string; confidence: number; }) => {
    updateProduct(index, field, suggestion.name);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return themeColors.secondary; // Verde - Alta confianza
    if (confidence >= 0.6) return themeColors.primary;   // Azul - Media confianza  
    return "#f59e0b"; // Amarillo - Baja confianza
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return "Alta";
    if (confidence >= 0.6) return "Media";
    return "Baja";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: themeColors.text.primary }}>
            Matching Inteligente Completado
          </h2>
          <p style={{ color: themeColors.text.secondary }}>
            Revisa las sugerencias de IA y confirma o ajusta según sea necesario
          </p>
        </div>
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg"
          style={{ color: themeColors.text.secondary }}
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          Volver
        </motion.button>
      </div>

      {/* AI Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          className="p-4 rounded-xl border"
          style={{
            backgroundColor: `${themeColors.secondary}10`,
            borderColor: `${themeColors.secondary}30`
          }}
        >
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8" style={{ color: themeColors.secondary }} />
            <div>
              <div className="text-lg font-bold" style={{ color: themeColors.text.primary }}>
                {products.length}
              </div>
              <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                Productos Analizados
              </div>
            </div>
          </div>
        </div>

        <div 
          className="p-4 rounded-xl border"
          style={{
            backgroundColor: `${themeColors.primary}10`,
            borderColor: `${themeColors.primary}30`
          }}
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8" style={{ color: themeColors.primary }} />
            <div>
              <div className="text-lg font-bold" style={{ color: themeColors.text.primary }}>
                {products.filter(p => p.aiSuggestions.confidence > 0.7).length}
              </div>
              <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                Matches de Alta Confianza
              </div>
            </div>
          </div>
        </div>

        <div 
          className="p-4 rounded-xl border"
          style={{
            backgroundColor: `${themeColors.accent}10`,
            borderColor: `${themeColors.accent}30`
          }}
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8" style={{ color: themeColors.accent }} />
            <div>
              <div className="text-lg font-bold" style={{ color: themeColors.text.primary }}>
                {products.filter(p => p.aiSuggestions.confidence <= 0.7).length}
              </div>
              <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                Requieren Revisión
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="space-y-4">
        {finalProducts.map((product, index) => (
          <motion.div
            key={product.code}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border p-6"
            style={{ borderColor: `${themeColors.primary}30` }}
          >
            {/* Product Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="text-lg font-semibold mb-1" style={{ color: themeColors.text.primary }}>
                  {product.name}
                </h4>
                <p className="text-sm mb-2" style={{ color: themeColors.text.secondary }}>
                  Código: {product.code} | Precio: ${product.price} | Stock: {product.stock}
                </p>
                <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                  {product.description}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <div 
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${getConfidenceColor(product.aiSuggestions.confidence)}20`,
                    color: getConfidenceColor(product.aiSuggestions.confidence)
                  }}
                >
                  Confianza: {getConfidenceText(product.aiSuggestions.confidence)} ({Math.round(product.aiSuggestions.confidence * 100)}%)
                </div>
                <motion.button
                  onClick={() => setEditingProduct(editingProduct === index ? null : index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg"
                  style={{ color: themeColors.primary }}
                >
                  <Edit className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Suggestion */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2" style={{ color: themeColors.text.primary }}>
                  Categoría
                  {product.aiSuggestions.category.confidence > 0.7 && (
                    <Check className="w-3 h-3" style={{ color: themeColors.secondary }} />
                  )}
                </label>
                
                {editingProduct === index ? (
                  <select
                    value={product.category || ''}
                    onChange={(e) => updateProduct(index, 'category', e.target.value)}
                    className="w-full p-2 rounded-lg border text-sm"
                    style={{
                      backgroundColor: `${themeColors.surface}50`,
                      borderColor: `${themeColors.primary}30`,
                      color: themeColors.text.primary,
                    }}
                  >
                    <option value="">Seleccionar categoría</option>
                    {mockCategories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: themeColors.text.primary }}>
                      {product.category || product.aiSuggestions.category.name}
                    </span>
                    {product.category !== product.aiSuggestions.category.name && (
                      <motion.button
                        onClick={() => acceptSuggestion(index, 'category', product.aiSuggestions.category)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-xs px-2 py-1 rounded font-medium"
                        style={{
                          backgroundColor: `${themeColors.primary}20`,
                          color: themeColors.primary
                        }}
                      >
                        Usar sugerencia IA
                      </motion.button>
                    )}
                  </div>
                )}
                
                {product.aiSuggestions.category.name !== "Sin categoría" && (
                  <div className="text-xs opacity-75" style={{ color: themeColors.text.secondary }}>
                    IA sugiere: {product.aiSuggestions.category.name} ({Math.round(product.aiSuggestions.category.confidence * 100)}%)
                  </div>
                )}
              </div>

              {/* Brand Suggestion */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2" style={{ color: themeColors.text.primary }}>
                  Marca
                  {product.aiSuggestions.brand.confidence > 0.7 && (
                    <Check className="w-3 h-3" style={{ color: themeColors.secondary }} />
                  )}
                </label>
                
                {editingProduct === index ? (
                  <select
                    value={product.brand || ''}
                    onChange={(e) => updateProduct(index, 'brand', e.target.value)}
                    className="w-full p-2 rounded-lg border text-sm"
                    style={{
                      backgroundColor: `${themeColors.surface}50`,
                      borderColor: `${themeColors.primary}30`,
                      color: themeColors.text.primary,
                    }}
                  >
                    <option value="">Seleccionar marca</option>
                    {mockBrands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: themeColors.text.primary }}>
                      {product.brand || product.aiSuggestions.brand.name}
                    </span>
                    {product.brand !== product.aiSuggestions.brand.name && (
                      <motion.button
                        onClick={() => acceptSuggestion(index, 'brand', product.aiSuggestions.brand)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-xs px-2 py-1 rounded font-medium"
                        style={{
                          backgroundColor: `${themeColors.primary}20`,
                          color: themeColors.primary
                        }}
                      >
                        Usar sugerencia IA
                      </motion.button>
                    )}
                  </div>
                )}
                
                {product.aiSuggestions.brand.name !== "Sin marca" && (
                  <div className="text-xs opacity-75" style={{ color: themeColors.text.secondary }}>
                    IA sugiere: {product.aiSuggestions.brand.name} ({Math.round(product.aiSuggestions.brand.confidence * 100)}%)
                  </div>
                )}
              </div>

              {/* Subcategory Suggestion */}
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: themeColors.text.primary }}>
                  Subcategoría
                </label>
                
                {editingProduct === index ? (
                  <select
                    value={product.subcategory || ''}
                    onChange={(e) => updateProduct(index, 'subcategory', e.target.value)}
                    className="w-full p-2 rounded-lg border text-sm"
                    style={{
                      backgroundColor: `${themeColors.surface}50`,
                      borderColor: `${themeColors.primary}30`,
                      color: themeColors.text.primary,
                    }}
                  >
                    <option value="">Seleccionar subcategoría</option>
                    {mockCategories
                      .flatMap(cat => cat.subcategories)
                      .map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                  </select>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: themeColors.text.primary }}>
                      {product.subcategory || product.aiSuggestions.subcategory.name}
                    </span>
                    {product.subcategory !== product.aiSuggestions.subcategory.name && (
                      <motion.button
                        onClick={() => acceptSuggestion(index, 'subcategory', product.aiSuggestions.subcategory)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-xs px-2 py-1 rounded font-medium"
                        style={{
                          backgroundColor: `${themeColors.primary}20`,
                          color: themeColors.primary
                        }}
                      >
                        Usar sugerencia IA
                      </motion.button>
                    )}
                  </div>
                )}
                
                {product.aiSuggestions.subcategory.name !== "Sin subcategoría" && (
                  <div className="text-xs opacity-75" style={{ color: themeColors.text.secondary }}>
                    IA sugiere: {product.aiSuggestions.subcategory.name} ({Math.round(product.aiSuggestions.subcategory.confidence * 100)}%)
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6">
        <motion.button
          onClick={() => {
            // Aceptar todas las sugerencias de alta confianza automáticamente
            const autoAccepted = finalProducts.map(product => ({
              ...product,
              category: product.aiSuggestions.category.confidence > 0.8 
                ? product.aiSuggestions.category.name 
                : product.category,
              brand: product.aiSuggestions.brand.confidence > 0.8 
                ? product.aiSuggestions.brand.name 
                : product.brand,
              subcategory: product.aiSuggestions.subcategory.confidence > 0.8 
                ? product.aiSuggestions.subcategory.name 
                : product.subcategory,
            }));
            setFinalProducts(autoAccepted);
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium border"
          style={{
            backgroundColor: `${themeColors.secondary}20`,
            borderColor: `${themeColors.secondary}30`,
            color: themeColors.secondary,
          }}
        >
          <Brain className="w-5 h-5" />
          Auto-Aceptar Sugerencias de Alta Confianza
        </motion.button>

        <motion.button
          onClick={() => onComplete(finalProducts)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-8 py-3 rounded-xl font-medium"
          style={{
            backgroundColor: themeColors.primary,
            color: 'white',
          }}
        >
          <CheckCircle className="w-5 h-5" />
          Confirmar y Continuar
        </motion.button>
      </div>
    </div>
  );
};

// Products Setup Step with AI Matching
const ProductsSetupStep = ({ onComplete }: WizardStepProps) => {
  const { themeColors } = useTheme();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const [matchingResults, setMatchingResults] = useState<MatchedProduct[] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMatching, setShowMatching] = useState(false);

  // Mock data para categorías, marcas y subcategorías existentes
  const mockCategories = [
    { id: 1, name: "Electrónicos", subcategories: ["Smartphones", "Laptops", "Tablets", "Accesorios"] },
    { id: 2, name: "Hogar", subcategories: ["Cocina", "Decoración", "Limpieza", "Jardinería"] },
    { id: 3, name: "Deportes", subcategories: ["Fitness", "Fútbol", "Running", "Natación"] },
    { id: 4, name: "Ropa", subcategories: ["Hombre", "Mujer", "Niños", "Accesorios"] },
  ];

  const mockBrands = ["Samsung", "Apple", "Sony", "LG", "Nike", "Adidas", "Zara", "H&M"];

  // Datos de ejemplo para productos importados
  const sampleProducts = [
    {
      code: "PROD001",
      name: "iPhone 15 Pro Max 256GB",
      description: "Smartphone Apple con pantalla de 6.7 pulgadas",
      category: "Celulares", // No coincide exactamente
      brand: "Apple",
      price: 1299.99,
      stock: 25
    },
    {
      code: "PROD002", 
      name: "Zapatillas Running Nike Air",
      description: "Zapatillas deportivas para correr, color negro",
      category: "", // Sin categoría
      brand: "Nike",
      price: 89.99,
      stock: 50
    },
    {
      code: "PROD003",
      name: "Smart TV 55 pulgadas",
      description: "Televisor inteligente con resolución 4K, marca Samsung",
      category: "TV", // No coincide exactamente
      brand: "", // Sin marca explícita, pero está en la descripción
      price: 699.99,
      stock: 15
    }
  ];

  const importMethods = [
    {
      id: "file",
      title: "Subir Archivo",
      description: "Sube un archivo CSV, XLSX o TXT con tus productos",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      id: "json",
      title: "API / JSON", 
      description: "Pega un JSON o conecta con tu API",
      icon: <Code className="w-6 h-6" />,
    },
  ];

  const handleFileUpload = (data: ProductData[]) => {
    setIsProcessing(true);
    
    // Simular procesamiento de IA
    setTimeout(() => {
      const matchedProducts = data.map(product => ({
        ...product,
        original: { ...product },
        aiSuggestions: {
          category: findBestCategoryMatch(product),
          brand: findBestBrandMatch(product),
          subcategory: findBestSubcategoryMatch(product),
          confidence: Math.random() * 0.4 + 0.6 // 60-100% confidence
        }
      }));
      
      setMatchingResults(matchedProducts);
      setIsProcessing(false);
      setShowMatching(true);
    }, 3000);
  };

  const findBestCategoryMatch = (product: ProductData) => {
    const text = `${product.name} ${product.description} ${product.category}`.toLowerCase();
    
    if (text.includes('iphone') || text.includes('smartphone') || text.includes('celular')) {
      return { name: "Electrónicos", confidence: 0.95 };
    }
    if (text.includes('zapatillas') || text.includes('running') || text.includes('deportiva')) {
      return { name: "Deportes", confidence: 0.90 };
    }
    if (text.includes('tv') || text.includes('televisor') || text.includes('smart tv')) {
      return { name: "Electrónicos", confidence: 0.92 };
    }
    
    return { name: "Sin categoría", confidence: 0.1 };
  };

  const findBestBrandMatch = (product: ProductData) => {
    const text = `${product.name} ${product.description} ${product.brand}`.toLowerCase();
    
    for (const brand of mockBrands) {
      if (text.includes(brand.toLowerCase())) {
        return { name: brand, confidence: 0.95 };
      }
    }
    
    return { name: "Sin marca", confidence: 0.1 };
  };

  const findBestSubcategoryMatch = (product: ProductData) => {
    const text = `${product.name} ${product.description}`.toLowerCase();
    
    if (text.includes('smartphone') || text.includes('iphone')) {
      return { name: "Smartphones", confidence: 0.93 };
    }
    if (text.includes('running') || text.includes('correr')) {
      return { name: "Running", confidence: 0.90 };
    }
    if (text.includes('tv') || text.includes('televisor')) {
      return { name: "Tablets", confidence: 0.85 }; // Ejemplo de sugerencia
    }
    
    return { name: "Sin subcategoría", confidence: 0.1 };
  };

  if (showMatching && matchingResults) {
    return <ProductMatchingInterface 
      products={matchingResults}
      onComplete={(finalProducts) => onComplete({ products: finalProducts })}
      onBack={() => setShowMatching(false)}
      themeColors={themeColors}
      mockCategories={mockCategories}
      mockBrands={mockBrands}
    />;
  }

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="text-center">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: `${themeColors.primary}20` }}
        >
          <Package className="w-8 h-8" style={{ color: themeColors.primary }} />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: themeColors.text.primary }}>
          Cargar Productos
        </h2>
        <p style={{ color: themeColors.text.secondary }}>
          Importa tu catálogo de productos con matching inteligente por IA
        </p>
      </div>

      {!selectedMethod ? (
        /* Method Selection */
        <div className="grid md:grid-cols-2 gap-6">
          {importMethods.map((method) => (
            <motion.div
              key={method.id}
              whileHover={{ scale: 1.02, y: -4 }}
              className="relative group"
            >
              <motion.button
                onClick={() => setSelectedMethod(method.id)}
                whileTap={{ scale: 0.98 }}
                className="w-full p-8 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden"
                style={{
                  backgroundColor: `${themeColors.surface}30`,
                  borderColor: `${themeColors.primary}30`,
                }}
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${themeColors.primary}10, ${themeColors.secondary}05)`
                  }}
                />
                
                <div className="relative z-10">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: `${themeColors.primary}20` }}
                  >
                    {method.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: themeColors.text.primary }}>
                    {method.title}
                  </h3>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: themeColors.text.secondary }}>
                    {method.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs font-medium" style={{ color: themeColors.accent }}>
                    <div className="w-2 h-2 rounded-full bg-current"></div>
                    Matching inteligente incluido
                  </div>
                </div>
              </motion.button>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Selected Method Content */
        <ProductUploadInterface 
          method={selectedMethod}
          onUpload={handleFileUpload}
          onBack={() => setSelectedMethod(null)}
          isProcessing={isProcessing}
          sampleData={sampleProducts}
          themeColors={themeColors}
        />
      )}
    </div>
  );
};

const PriceListsSetupStep = ({ onComplete }: WizardStepProps) => {
  const { themeColors } = useTheme();
  return (
    <div className="space-y-8 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${themeColors.primary}20` }}>
        <FileText className="w-8 h-8" style={{ color: themeColors.primary }} />
      </div>
      <h2 className="text-2xl font-bold mb-2" style={{ color: themeColors.text.primary }}>Listas de Precios</h2>
      <p style={{ color: themeColors.text.secondary }}>Este paso se implementará próximamente...</p>
      <motion.button onClick={() => onComplete({ priceLists: [] })} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-6 py-3 rounded-xl font-medium transition-all duration-200" style={{ backgroundColor: themeColors.primary, color: 'white' }}>Continuar</motion.button>
    </div>
  );
};

const PricesSetupStep = ({ onComplete }: WizardStepProps) => {
  const { themeColors } = useTheme();
  return (
    <div className="space-y-8 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${themeColors.primary}20` }}>
        <DollarSign className="w-8 h-8" style={{ color: themeColors.primary }} />
      </div>
      <h2 className="text-2xl font-bold mb-2" style={{ color: themeColors.text.primary }}>Cargar Precios</h2>
      <p style={{ color: themeColors.text.secondary }}>Este paso se implementará próximamente...</p>
      <motion.button onClick={() => onComplete({ prices: [] })} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-6 py-3 rounded-xl font-medium transition-all duration-200" style={{ backgroundColor: themeColors.primary, color: 'white' }}>Continuar</motion.button>
    </div>
  );
};

const DiscountsSetupStep = ({ onComplete }: WizardStepProps) => {
  const { themeColors } = useTheme();
  return (
    <div className="space-y-8 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${themeColors.primary}20` }}>
        <Percent className="w-8 h-8" style={{ color: themeColors.primary }} />
      </div>
      <h2 className="text-2xl font-bold mb-2" style={{ color: themeColors.text.primary }}>Descuentos</h2>
      <p style={{ color: themeColors.text.secondary }}>Este paso es opcional y se implementará próximamente...</p>
      <motion.button onClick={() => onComplete({ discounts: [] })} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-6 py-3 rounded-xl font-medium transition-all duration-200" style={{ backgroundColor: themeColors.primary, color: 'white' }}>Continuar</motion.button>
    </div>
  );
};

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType<WizardStepProps>;
  optional?: boolean;
}

export interface WizardStepProps {
  onNext: () => void;
  onPrevious: () => void;
  onComplete: (data: Record<string, unknown>) => void;
  data?: Record<string, unknown>;
}

interface ProductData {
  code: string;
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  price?: number;
  stock?: number;
}

interface MatchedProduct extends ProductData {
  original: ProductData;
  subcategory?: string;
  aiSuggestions: {
    category: { name: string; confidence: number };
    brand: { name: string; confidence: number };
    subcategory: { name: string; confidence: number };
    confidence: number;
  };
}

interface Category {
  id: number;
  name: string;
  subcategories: string[];
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: "clients",
    title: "Cargar Clientes",
    description: "Importa tu base de clientes existente",
    icon: <Users className="w-6 h-6" />,
    component: ClientsSetupStep,
  },
  {
    id: "products",
    title: "Cargar Productos",
    description: "Agrega tu catálogo de productos",
    icon: <Package className="w-6 h-6" />,
    component: ProductsSetupStep,
  },
  {
    id: "price-lists",
    title: "Listas de Precios",
    description: "Configura tus diferentes listas de precios",
    icon: <FileText className="w-6 h-6" />,
    component: PriceListsSetupStep,
  },
  {
    id: "prices",
    title: "Cargar Precios",
    description: "Asigna precios a tus productos",
    icon: <DollarSign className="w-6 h-6" />,
    component: PricesSetupStep,
  },
  {
    id: "discounts",
    title: "Descuentos",
    description: "Configura descuentos y promociones (opcional)",
    icon: <Percent className="w-6 h-6" />,
    component: DiscountsSetupStep,
    optional: true,
  },
];

export function SetupWizard() {
  const { themeColors } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [stepData, setStepData] = useState<Record<string, Record<string, unknown>>>({});

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepComplete = (data: Record<string, unknown>) => {
    const stepId = WIZARD_STEPS[currentStep].id;
    setStepData(prev => ({ ...prev, [stepId]: data }));
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    handleNext();
  };

  const handleStepClick = (stepIndex: number) => {
    // Permitir navegar solo a pasos completados o al paso siguiente
    if (stepIndex <= currentStep || completedSteps.has(stepIndex)) {
      setCurrentStep(stepIndex);
    }
  };

  const currentStepData = WIZARD_STEPS[currentStep];
  const CurrentStepComponent = currentStepData.component;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: `${themeColors.primary}20` }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="w-8 h-8" style={{ color: themeColors.primary }} />
            </motion.div>
          </div>
          <h1 
            className="text-3xl font-bold mb-4 bg-gradient-to-r bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary})`
            }}
          >
            Asistente de Configuración Rápida
          </h1>
          <p 
            className="text-lg max-w-2xl mx-auto"
            style={{ color: themeColors.text.secondary }}
          >
            Te guiaremos paso a paso para configurar los elementos esenciales de tu tienda
          </p>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border mb-8"
          style={{ borderColor: `${themeColors.primary}30` }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold" style={{ color: themeColors.text.primary }}>
              Progreso del Asistente
            </h2>
            <span 
              className="text-sm px-3 py-1 rounded-full font-medium"
              style={{ 
                backgroundColor: `${themeColors.primary}20`,
                color: themeColors.primary 
              }}
            >
              {completedSteps.size} de {WIZARD_STEPS.length} completados
            </span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedSteps.size / WIZARD_STEPS.length) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-3 rounded-full"
              style={{ 
                background: `linear-gradient(90deg, ${themeColors.primary}, ${themeColors.secondary})`
              }}
            />
          </div>
          
          <p className="text-sm" style={{ color: themeColors.text.secondary }}>
            Completa todos los pasos para finalizar la configuración inicial
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="overflow-x-auto">
            <div className="flex items-center space-x-3 pb-4 min-w-max">
              {WIZARD_STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <motion.button
                    onClick={() => handleStepClick(index)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      relative flex flex-col items-center p-4 rounded-2xl transition-all duration-300 min-w-[140px] border
                      ${index <= currentStep || completedSteps.has(index) 
                        ? 'cursor-pointer' 
                        : 'cursor-not-allowed opacity-50'
                      }
                    `}
                    style={{
                      backgroundColor: 
                        index === currentStep 
                          ? `${themeColors.primary}15`
                          : completedSteps.has(index)
                            ? `${themeColors.secondary}15`
                            : `${themeColors.surface}30`,
                      borderColor: 
                        index === currentStep 
                          ? themeColors.primary
                          : completedSteps.has(index)
                            ? themeColors.secondary
                            : `${themeColors.primary}20`,
                    }}
                  >
                    {/* Step Number Badge */}
                    <div 
                      className="absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white"
                      style={{
                        backgroundColor: 
                          index === currentStep 
                            ? themeColors.primary
                            : completedSteps.has(index)
                              ? themeColors.secondary
                              : themeColors.text.secondary,
                        color: 'white',
                      }}
                    >
                      {index + 1}
                    </div>

                    {/* Step Icon */}
                    <div 
                      className="flex items-center justify-center w-10 h-10 rounded-xl mb-3 relative"
                      style={{
                        backgroundColor: 
                          index === currentStep 
                            ? `${themeColors.primary}20`
                            : completedSteps.has(index)
                              ? `${themeColors.secondary}20`
                              : `${themeColors.surface}50`,
                        color: 
                          index === currentStep 
                            ? themeColors.primary
                            : completedSteps.has(index)
                              ? themeColors.secondary
                              : themeColors.text.secondary,
                      }}
                    >
                      {completedSteps.has(index) ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <div className="w-5 h-5 flex items-center justify-center">
                          {step.icon}
                        </div>
                      )}
                      
                      {step.optional && (
                        <span 
                          className="absolute -top-1 -right-1 text-xs w-4 h-4 rounded-full font-bold flex items-center justify-center"
                          style={{
                            backgroundColor: themeColors.accent,
                            color: 'white',
                          }}
                        >
                          ?
                        </span>
                      )}
                    </div>

                    {/* Step Info */}
                    <div className="text-center">
                      <h3 
                        className="font-semibold text-sm mb-1"
                        style={{ 
                          color: index === currentStep 
                            ? themeColors.primary 
                            : themeColors.text.primary 
                        }}
                      >
                        {step.title}
                      </h3>
                      <p 
                        className="text-xs leading-tight opacity-75"
                        style={{ color: themeColors.text.secondary }}
                      >
                        {step.description.split(' ').slice(0, 4).join(' ')}...
                      </p>
                    </div>
                  </motion.button>

                  {/* Connector Line */}
                  {index < WIZARD_STEPS.length - 1 && (
                    <div className="flex items-center mx-2">
                      <div 
                        className="w-6 h-0.5 rounded-full"
                        style={{
                          backgroundColor: completedSteps.has(index) 
                            ? themeColors.secondary
                            : `${themeColors.primary}30`,
                        }}
                      />
                      <div 
                        className="w-1 h-1 rounded-full mx-1"
                        style={{
                          backgroundColor: completedSteps.has(index) 
                            ? themeColors.secondary
                            : `${themeColors.primary}30`,
                        }}
                      />
                      <div 
                        className="w-6 h-0.5 rounded-full"
                        style={{
                          backgroundColor: completedSteps.has(index) 
                            ? themeColors.secondary
                            : `${themeColors.primary}30`,
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Current Step Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border p-6 mb-6"
          style={{ borderColor: `${themeColors.primary}30` }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${themeColors.primary}20` }}
            >
              {currentStepData.icon}
            </div>
            <div className="flex-1">
              <h2 
                className="text-xl font-bold mb-1"
                style={{ color: themeColors.text.primary }}
              >
                {currentStepData.title}
              </h2>
              <p style={{ color: themeColors.text.secondary }}>
                {currentStepData.description}
              </p>
            </div>
            <div className="text-right">
              <span 
                className="text-sm font-medium px-3 py-1 rounded-full"
                style={{ 
                  backgroundColor: `${themeColors.primary}20`,
                  color: themeColors.primary 
                }}
              >
                {currentStep + 1} / {WIZARD_STEPS.length}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Step Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border p-8"
          style={{ borderColor: `${themeColors.primary}30` }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CurrentStepComponent
                onNext={handleNext}
                onPrevious={handlePrevious}
                onComplete={handleStepComplete}
                data={stepData[currentStepData.id]}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-between items-center mt-8"
        >
          <motion.button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            whileHover={{ scale: currentStep === 0 ? 1 : 1.02 }}
            whileTap={{ scale: currentStep === 0 ? 1 : 0.98 }}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 border
              ${currentStep === 0 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:shadow-lg'}
            `}
            style={{
              backgroundColor: currentStep === 0 ? `${themeColors.surface}20` : `${themeColors.surface}40`,
              borderColor: `${themeColors.primary}30`,
              color: themeColors.text.primary,
            }}
          >
            <ChevronLeft className="w-5 h-5" />
            Anterior
          </motion.button>

          <div className="flex items-center gap-2">
            {WIZARD_STEPS.map((_, index) => (
              <div
                key={index}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: 
                    index === currentStep 
                      ? themeColors.primary
                      : completedSteps.has(index)
                        ? themeColors.secondary
                        : `${themeColors.primary}30`,
                }}
              />
            ))}
          </div>

          <motion.button
            onClick={handleNext}
            disabled={currentStep === WIZARD_STEPS.length - 1}
            whileHover={{ scale: currentStep === WIZARD_STEPS.length - 1 ? 1 : 1.02 }}
            whileTap={{ scale: currentStep === WIZARD_STEPS.length - 1 ? 1 : 0.98 }}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200
              ${currentStep === WIZARD_STEPS.length - 1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:shadow-lg'}
            `}
            style={{
              backgroundColor: currentStep === WIZARD_STEPS.length - 1 
                ? `${themeColors.surface}30` 
                : themeColors.primary,
              color: currentStep === WIZARD_STEPS.length - 1 
                ? themeColors.text.secondary 
                : 'white',
            }}
          >
            {currentStep === WIZARD_STEPS.length - 1 ? 'Finalizar' : 'Siguiente'}
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </AdminLayout>
  );
}