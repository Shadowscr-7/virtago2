import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileUploadComponent } from '../shared/FileUploadComponent';
import { StepProps, ProductData, MatchedProduct, Category, UploadMethod, UploadResult, ThemeColors } from '../shared/types';
import { Check, Edit3, X } from 'lucide-react';

// Datos de ejemplo y lógica de matching (movidos del wizard principal)
const sampleData: ProductData[] = [
  {
    code: "LAP001",
    name: "Laptop Gaming RGB Ultra",
    description: "Laptop para gaming con iluminación RGB, procesador Intel i7, 16GB RAM, SSD 512GB",
    category: "Computadoras",
    brand: "TechPro",
    price: 1299.99,
    stock: 15
  },
  {
    code: "MON002", 
    name: "Monitor Curvo 27 pulgadas",
    description: "Monitor gaming curvo de 27 pulgadas, 144Hz, resolución 2K",
    category: "Monitores",
    brand: "ViewMax", 
    price: 399.99,
    stock: 8
  },
  {
    code: "TEC003",
    name: "Teclado Mecánico RGB",
    description: "Teclado mecánico gaming con switches azules y retroiluminación RGB",
    category: "Periféricos",
    brand: "KeyMaster",
    price: 89.99,
    stock: 25
  },
  {
    code: "GPU009",
    name: "Tarjeta Gráfica RTX Super",
    description: "Tarjeta gráfica de alta gama para gaming 4K y ray tracing",
    category: "Componentes",
    brand: "GraphicsMax",
    price: 899.99,
    stock: 5
  }
];

const mockCategories: Category[] = [
  { id: 1, name: "Electrónicos", subcategories: ["Laptops", "Monitores", "Tablets"] },
  { id: 2, name: "Gaming", subcategories: ["Periféricos", "Consolas", "Accesorios"] },
  { id: 3, name: "Audio", subcategories: ["Auriculares", "Micrófonos", "Speakers"] },
  { id: 4, name: "Componentes", subcategories: ["RAM", "GPU", "CPU"] },
];

const mockBrands = ["TechMaster", "GamePro", "AudioMax", "ComponentPlus", "ElectroTech"];

interface ProductStepProps extends StepProps {
  stepData?: {
    matchedProducts?: MatchedProduct[];
  };
}

export function ProductStep({ onNext, onBack, themeColors, stepData }: ProductStepProps) {
  const [method, setMethod] = useState<UploadMethod>("file");
  const [isProcessing, setIsProcessing] = useState(false);
  const [matchedProducts, setMatchedProducts] = useState<MatchedProduct[]>(stepData?.matchedProducts || []);

  const findBestCategoryMatch = (product: ProductData) => {
    const matches = mockCategories.map(cat => ({
      category: cat,
      score: calculateSimilarity(product.category.toLowerCase(), cat.name.toLowerCase())
    }));
    
    const bestMatch = matches.reduce((best, current) => 
      current.score > best.score ? current : best
    );
    
    return {
      name: bestMatch.category.name,
      confidence: Math.min(bestMatch.score + 0.1, 1.0)
    };
  };

  const findBestBrandMatch = (product: ProductData) => {
    const matches = mockBrands.map(brand => ({
      brand,
      score: calculateSimilarity(product.brand.toLowerCase(), brand.toLowerCase())
    }));
    
    const bestMatch = matches.reduce((best, current) => 
      current.score > best.score ? current : best
    );
    
    return {
      name: bestMatch.brand,
      confidence: Math.min(bestMatch.score + 0.15, 1.0)
    };
  };

  const findBestSubcategoryMatch = (product: ProductData) => {
    let allSubcategories: string[] = [];
    mockCategories.forEach(cat => {
      allSubcategories = [...allSubcategories, ...cat.subcategories];
    });
    
    const matches = allSubcategories.map(sub => ({
      subcategory: sub,
      score: calculateSimilarity(product.name.toLowerCase(), sub.toLowerCase()) * 0.8
    }));
    
    const bestMatch = matches.reduce((best, current) => 
      current.score > best.score ? current : best
    );
    
    return {
      name: bestMatch.subcategory,
      confidence: Math.min(bestMatch.score + 0.2, 1.0)
    };
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const words1 = str1.toLowerCase().split(' ');
    const words2 = str2.toLowerCase().split(' ');
    
    let matches = 0;
    words1.forEach(word1 => {
      if (words2.some(word2 => word2.includes(word1) || word1.includes(word2))) {
        matches++;
      }
    });
    
    return matches / Math.max(words1.length, words2.length);
  };

  const handleUpload = (result: UploadResult<ProductData>) => {
    if (result.success) {
      setIsProcessing(true);
      
      // Simular procesamiento de IA
      setTimeout(() => {
        const matched = result.data.map(product => ({
          ...product,
          original: { ...product },
          aiSuggestions: {
            category: findBestCategoryMatch(product),
            brand: findBestBrandMatch(product),
            subcategory: findBestSubcategoryMatch(product),
            confidence: (findBestCategoryMatch(product).confidence + 
                        findBestBrandMatch(product).confidence + 
                        findBestSubcategoryMatch(product).confidence) / 3
          }
        }));
        
        setMatchedProducts(matched);
        setIsProcessing(false);
      }, 3000);
    }
  };

  // Si tenemos productos procesados, mostrar la interfaz de matching
  if (matchedProducts.length > 0 && !isProcessing) {
    return (
      <ProductMatchingInterface
        products={matchedProducts}
        onComplete={(finalProducts) => onNext({ matchedProducts: finalProducts })}
        onBack={() => setMatchedProducts([])}
        themeColors={themeColors}
        mockCategories={mockCategories}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Selector de método */}
      <div className="flex items-center justify-center">
        <div 
          className="flex p-1 rounded-xl"
          style={{ backgroundColor: `${themeColors.surface}50` }}
        >
          <motion.button
            onClick={() => setMethod("file")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              method === "file" ? "" : "opacity-70"
            }`}
            style={{
              backgroundColor: method === "file" ? themeColors.primary : "transparent",
              color: method === "file" ? "white" : themeColors.text.primary,
            }}
          >
            Subir Archivo
          </motion.button>
          <motion.button
            onClick={() => setMethod("json")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              method === "json" ? "" : "opacity-70"
            }`}
            style={{
              backgroundColor: method === "json" ? themeColors.primary : "transparent",
              color: method === "json" ? "white" : themeColors.text.primary,
            }}
          >
            Importar JSON
          </motion.button>
        </div>
      </div>

      {/* Componente de upload */}
      <FileUploadComponent
        method={method}
        onUpload={handleUpload}
        onBack={onBack}
        themeColors={themeColors}
        sampleData={sampleData}
        title="Productos"
        acceptedFileTypes=".csv,.xlsx,.json"
        fileExtensions={["csv", "xlsx", "json"]}
        isProcessing={isProcessing}
      />
    </div>
  );
}

// Componente de interfaz de matching (extraído del wizard principal)
function ProductMatchingInterface({ 
  products, 
  onComplete, 
  onBack, 
  themeColors, 
  mockCategories
}: {
  products: MatchedProduct[];
  onComplete: (finalProducts: MatchedProduct[]) => void;
  onBack: () => void;
  themeColors: ThemeColors;
  mockCategories: Category[];
}) {
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
    if (confidence >= 0.8) return themeColors.secondary;
    if (confidence >= 0.6) return themeColors.primary;  
    return "#f59e0b";
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return "Alta";
    if (confidence >= 0.6) return "Media";
    return "Baja";
  };

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div 
        className="p-6 rounded-xl"
        style={{ backgroundColor: `${themeColors.surface}30` }}
      >
        <h3 className="text-xl font-semibold mb-4" style={{ color: themeColors.text.primary }}>
          Matching Completado
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold" style={{ color: themeColors.primary }}>
              {products.length}
            </div>
            <div className="text-sm" style={{ color: themeColors.text.secondary }}>
              Productos Procesados
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: themeColors.secondary }}>
              {products.filter(p => p.aiSuggestions.confidence >= 0.8).length}
            </div>
            <div className="text-sm" style={{ color: themeColors.text.secondary }}>
              Alta Confianza
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold" style={{ color: themeColors.accent }}>
              {Math.round(products.reduce((sum, p) => sum + p.aiSuggestions.confidence, 0) / products.length * 100)}%
            </div>
            <div className="text-sm" style={{ color: themeColors.text.secondary }}>
              Confianza Promedio
            </div>
          </div>
        </div>
      </div>

      {/* Lista de productos con sugerencias */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {finalProducts.map((product, index) => (
          <motion.div
            key={`${product.code}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: `${themeColors.surface}20`,
              borderColor: `${themeColors.primary}30`,
            }}
          >
            {/* Información del producto */}
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-1" style={{ color: themeColors.text.primary }}>
                {product.name}
              </h4>
              <p className="text-sm mb-2" style={{ color: themeColors.text.secondary }}>
                {product.description}
              </p>
              <p className="text-sm" style={{ color: themeColors.text.secondary }}>
                <strong>Original:</strong> {product.category} • {product.brand}
              </p>
            </div>

            {/* Sugerencias de IA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Categoría */}
              <div>
                <label className="text-sm font-medium flex items-center gap-2" style={{ color: themeColors.text.primary }}>
                  Categoría
                  <div 
                    className="px-2 py-1 rounded text-xs"
                    style={{ 
                      backgroundColor: `${getConfidenceColor(product.aiSuggestions.category.confidence)}20`,
                      color: getConfidenceColor(product.aiSuggestions.category.confidence)
                    }}
                  >
                    {getConfidenceText(product.aiSuggestions.category.confidence)}
                  </div>
                </label>
                <div className="mt-1 flex items-center gap-2">
                  {editingProduct === index ? (
                    <select
                      value={product.category}
                      onChange={(e) => updateProduct(index, 'category', e.target.value)}
                      className="flex-1 p-2 rounded border text-sm"
                      style={{
                        backgroundColor: `${themeColors.surface}50`,
                        borderColor: `${themeColors.primary}30`,
                        color: themeColors.text.primary,
                      }}
                    >
                      {mockCategories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-sm" style={{ color: themeColors.text.primary }}>
                      {product.category || product.aiSuggestions.category.name}
                    </span>
                  )}
                  {product.category !== product.aiSuggestions.category.name && (
                    <motion.button
                      onClick={() => acceptSuggestion(index, 'category', product.aiSuggestions.category)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1 rounded text-xs"
                      style={{ 
                        backgroundColor: `${themeColors.secondary}20`,
                        color: themeColors.secondary
                      }}
                    >
                      <Check className="w-3 h-3" />
                    </motion.button>
                  )}
                </div>
                <div className="text-xs opacity-75" style={{ color: themeColors.text.secondary }}>
                  IA sugiere: {product.aiSuggestions.category.name}
                </div>
              </div>

              {/* Marca */}
              <div>
                <label className="text-sm font-medium flex items-center gap-2" style={{ color: themeColors.text.primary }}>
                  Marca
                  <div 
                    className="px-2 py-1 rounded text-xs"
                    style={{ 
                      backgroundColor: `${getConfidenceColor(product.aiSuggestions.brand.confidence)}20`,
                      color: getConfidenceColor(product.aiSuggestions.brand.confidence)
                    }}
                  >
                    {getConfidenceText(product.aiSuggestions.brand.confidence)}
                  </div>
                </label>
                <div className="mt-1 flex items-center gap-2">
                  {editingProduct === index ? (
                    <input
                      type="text"
                      value={product.brand}
                      onChange={(e) => updateProduct(index, 'brand', e.target.value)}
                      className="flex-1 p-2 rounded border text-sm"
                      style={{
                        backgroundColor: `${themeColors.surface}50`,
                        borderColor: `${themeColors.primary}30`,
                        color: themeColors.text.primary,
                      }}
                    />
                  ) : (
                    <span className="text-sm" style={{ color: themeColors.text.primary }}>
                      {product.brand || product.aiSuggestions.brand.name}
                    </span>
                  )}
                  {product.brand !== product.aiSuggestions.brand.name && (
                    <motion.button
                      onClick={() => acceptSuggestion(index, 'brand', product.aiSuggestions.brand)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1 rounded text-xs"
                      style={{ 
                        backgroundColor: `${themeColors.secondary}20`,
                        color: themeColors.secondary
                      }}
                    >
                      <Check className="w-3 h-3" />
                    </motion.button>
                  )}
                </div>
                <div className="text-xs opacity-75" style={{ color: themeColors.text.secondary }}>
                  IA sugiere: {product.aiSuggestions.brand.name}
                </div>
              </div>

              {/* Subcategoría */}
              <div>
                <label className="text-sm font-medium flex items-center gap-2" style={{ color: themeColors.text.primary }}>
                  Subcategoría
                  <div 
                    className="px-2 py-1 rounded text-xs"
                    style={{ 
                      backgroundColor: `${getConfidenceColor(product.aiSuggestions.subcategory.confidence)}20`,
                      color: getConfidenceColor(product.aiSuggestions.subcategory.confidence)
                    }}
                  >
                    {getConfidenceText(product.aiSuggestions.subcategory.confidence)}
                  </div>
                </label>
                <div className="mt-1 flex items-center gap-2">
                  {editingProduct === index ? (
                    <input
                      type="text"
                      value={product.subcategory || ''}
                      onChange={(e) => updateProduct(index, 'subcategory', e.target.value)}
                      className="flex-1 p-2 rounded border text-sm"
                      style={{
                        backgroundColor: `${themeColors.surface}50`,
                        borderColor: `${themeColors.primary}30`,
                        color: themeColors.text.primary,
                      }}
                    />
                  ) : (
                    <span className="text-sm" style={{ color: themeColors.text.primary }}>
                      {product.subcategory || product.aiSuggestions.subcategory.name}
                    </span>
                  )}
                  {product.subcategory !== product.aiSuggestions.subcategory.name && (
                    <motion.button
                      onClick={() => acceptSuggestion(index, 'subcategory', product.aiSuggestions.subcategory)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1 rounded text-xs"
                      style={{ 
                        backgroundColor: `${themeColors.secondary}20`,
                        color: themeColors.secondary
                      }}
                    >
                      <Check className="w-3 h-3" />
                    </motion.button>
                  )}
                </div>
                <div className="text-xs opacity-75" style={{ color: themeColors.text.secondary }}>
                  IA sugiere: {product.aiSuggestions.subcategory.name}
                </div>
              </div>
            </div>

            {/* Botón de editar */}
            <div className="mt-4 flex justify-end">
              <motion.button
                onClick={() => setEditingProduct(editingProduct === index ? null : index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-1 rounded text-sm"
                style={{
                  backgroundColor: editingProduct === index ? `${themeColors.accent}20` : `${themeColors.primary}20`,
                  color: editingProduct === index ? themeColors.accent : themeColors.primary
                }}
              >
                {editingProduct === index ? <X className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
                {editingProduct === index ? "Cerrar" : "Editar"}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between pt-6">
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 rounded-xl font-medium"
          style={{
            backgroundColor: `${themeColors.surface}50`,
            color: themeColors.text.secondary,
          }}
        >
          Volver
        </motion.button>
        <motion.button
          onClick={() => onComplete(finalProducts)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 rounded-xl font-medium text-white"
          style={{ backgroundColor: themeColors.primary }}
        >
          Continuar
        </motion.button>
      </div>
    </div>
  );
}