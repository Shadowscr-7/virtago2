'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import { FileUploadComponent } from '../shared/FileUploadComponent';
import { parseProductFile } from '@/lib/file-parser';
import { matchWithAI, type MatchResult } from '@/lib/product-matcher';
import { api } from '@/api';

interface ProductStepProps {
  onNext: (data: { 
    matchedProducts: ProductMatchResult[];
    createdEntities?: {
      brands: string[];
      categories: string[];
      subcategories: string[];
    };
  }) => void;
  onBack: () => void;
}

// Interfaz para el resultado del matching interno
interface ProductMatchResult {
  product: ParsedProduct;
  brandMatch: MatchResult & { wasCreated?: boolean };
  categoryMatch: MatchResult & { wasCreated?: boolean };
  subcategoryMatch: MatchResult & { wasCreated?: boolean };
}

// Interfaz para producto parseado
interface ParsedProduct {
  productId?: string;
  sku?: string;
  status?: string;
  published?: boolean;
  name?: string;
  shortDescription?: string;
  fullDescription?: string;
  brand?: string;
  category?: string;
  subCategory?: string;
  price?: number;
  compareAtPrice?: number;
  costPrice?: number;
  stockQuantity?: number;
  stockStatus?: string;
  weight?: number;
  dimensions?: string;
  tags?: string;
  images?: string;
  ean?: string;
  upc?: string;
  isbn?: string;
  mpn?: string;
  [key: string]: unknown;
}

interface UploadResult<T> {
  success: boolean;
  data: T[];
  error?: string;
}

export default function ProductStep({ onNext, onBack }: ProductStepProps) {
  const { themeColors } = useTheme();
  
  const [method] = useState<'file' | 'json'>('file');
  const [uploadedData, setUploadedData] = useState<ParsedProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  
  // Estado para resultados de matching
  const [matchingResults, setMatchingResults] = useState<ProductMatchResult[]>([]);
  
  // Estado para resumen de creación
  const [creationSummary, setCreationSummary] = useState<{
    brands: string[];
    categories: string[];
    subcategories: string[];
    productsCount: number;
  } | null>(null);
  
  const sampleProducts: ParsedProduct[] = [
    {
      sku: 'PROD-001',
      name: 'Laptop HP 15"',
      brand: 'HP',
      category: 'Electrónica',
      subCategory: 'Computadoras',
      price: 899.99,
      stockQuantity: 15,
    },
  ];

  const handleUpload = async (result: UploadResult<ParsedProduct>) => {
    if (!result.success || !result.data || result.data.length === 0) {
      setError('No se pudieron cargar los datos del archivo');
      return;
    }

    console.log('📤 [ProductStep] Datos cargados del archivo:', result.data.length);
    setUploadedData(result.data);
    setError(null);
    
    // Iniciar proceso de matching
    await performMatching(result.data);
  };

  const performMatching = async (products: ParsedProduct[]) => {
    setIsMatching(true);
    setError(null);
    
    try {
      console.log('🔍 [ProductStep] Iniciando matching inteligente...');
      console.log('📋 [ProductStep] Productos a procesar:', products);
      
      // 1. Primero cargar datos del sistema
      console.log('📥 [ProductStep] Cargando marcas, categorías y subcategorías del sistema...');
      const [brandsRes, categoriesRes, subcategoriesRes] = await Promise.all([
        api.product.getBrands(),
        api.product.getCategories(),
        api.product.getSubcategories(),
      ]);

      console.log('🔍 [ProductStep] Respuestas del API:');
      console.log('  - Brands:', brandsRes);
      console.log('  - Categories:', categoriesRes);
      console.log('  - Subcategories:', subcategoriesRes);

      let brands: Array<{ id: string; name: string }> = [];
      let categories: Array<{ id: string; name: string }> = [];
      let subcategories: Array<{ id: string; name: string }> = [];

      if (brandsRes.success && brandsRes.data?.data) {
        brands = brandsRes.data.data.map((b: { brandId?: string; id?: number | string; name: string }) => ({
          id: String(b.brandId || b.id),
          name: b.name,
        }));
        console.log('✅ Marcas cargadas:', brands.length, brands);
      } else {
        console.warn('⚠️ No se pudieron cargar marcas:', brandsRes);
      }

      if (categoriesRes.success && categoriesRes.data?.data) {
        categories = categoriesRes.data.data.map((c: { categoryId?: string; id?: number | string; name: string }) => ({
          id: String(c.categoryId || c.id),
          name: c.name,
        }));
        console.log('✅ Categorías cargadas:', categories.length, categories);
      } else {
        console.warn('⚠️ No se pudieron cargar categorías:', categoriesRes);
      }

      if (subcategoriesRes.success && subcategoriesRes.data?.data) {
        subcategories = subcategoriesRes.data.data.map((s: { subCategoryId?: string; id?: number | string; name: string }) => ({
          id: String(s.subCategoryId || s.id),
          name: s.name,
        }));
        console.log('✅ Subcategorías cargadas:', subcategories.length, subcategories);
      } else {
        console.warn('⚠️ No se pudieron cargar subcategorías:', subcategoriesRes);
      }

      // 2. Hacer matching producto por producto
      const results: ProductMatchResult[] = [];
      
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        console.log(`\n🔄 [${i + 1}/${products.length}] Matching producto:`, {
          name: product.name,
          brand: product.brand,
          category: product.category,
          subCategory: product.subCategory,
        });
        
        // Hacer matching con IA solo si el campo existe
        let brandMatch: MatchResult;
        if (product.brand) {
          console.log(`  🔍 Buscando brand "${product.brand}" en:`, brands.map(b => b.name));
          brandMatch = await matchWithAI(product.brand, brands, 'brand');
          console.log('  🏷️  Brand match resultado:', brandMatch);
        } else {
          console.log('  ⚠️  Sin brand para matchear');
          brandMatch = { matched: false, confidence: 0, shouldCreate: false, reason: 'No brand provided in file' };
        }
        
        let categoryMatch: MatchResult;
        if (product.category) {
          console.log(`  🔍 Buscando category "${product.category}" en:`, categories.map(c => c.name));
          categoryMatch = await matchWithAI(product.category, categories, 'category');
          console.log('  📁 Category match resultado:', categoryMatch);
        } else {
          console.log('  ⚠️  Sin category para matchear');
          categoryMatch = { matched: false, confidence: 0, shouldCreate: false, reason: 'No category provided in file' };
        }
        
        let subcategoryMatch: MatchResult;
        if (product.subCategory) {
          console.log(`  🔍 Buscando subcategory "${product.subCategory}" en:`, subcategories.map(s => s.name));
          subcategoryMatch = await matchWithAI(product.subCategory, subcategories, 'subcategory');
          console.log('  📂 Subcategory match resultado:', subcategoryMatch);
        } else {
          console.log('  ⚠️  Sin subcategory para matchear');
          subcategoryMatch = { matched: false, confidence: 0, shouldCreate: false, reason: 'No subcategory provided in file' };
        }
        
        // IMPORTANTE: NO crear aquí, solo marcar para crear
        // La creación real se hará cuando el usuario confirme
        
        results.push({
          product,
          brandMatch,
          categoryMatch,
          subcategoryMatch,
        });
      }
      
      console.log('✅ [ProductStep] Matching completado:', results.length, 'productos procesados');
      console.log('📊 [ProductStep] Resumen de matching:', {
        total: results.length,
        brandsToCreate: results.filter(r => r.brandMatch.shouldCreate && !r.brandMatch.matched).length,
        categoriesToCreate: results.filter(r => r.categoryMatch.shouldCreate && !r.categoryMatch.matched).length,
        subcategoriesToCreate: results.filter(r => r.subcategoryMatch.shouldCreate && !r.subcategoryMatch.matched).length,
        results: results,
      });
      
      setMatchingResults(results);
      setIsMatching(false);
      
    } catch (error) {
      console.error('❌ [ProductStep] Error en matching:', error);
      console.error('❌ [ProductStep] Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('❌ [ProductStep] Error details:', {
        message: error instanceof Error ? error.message : String(error),
        type: typeof error,
        error: error,
      });
      setError(`Error al hacer matching de productos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      setIsMatching(false);
    }
  };

  // Función para confirmar y crear las entidades necesarias
  const handleConfirm = async () => {
    setIsMatching(true);
    
    try {
      console.log('🚀 [ProductStep] Creando marcas, categorías y subcategorías nuevas...');
      console.log('🚀 [ProductStep] Matching results:', matchingResults);
      
      const createdEntities = {
        brands: [] as string[],
        categories: [] as string[],
        subcategories: [] as string[],
      };
      
      // Crear marcas nuevas
      for (const result of matchingResults) {
        console.log('🔍 [ProductStep] Procesando resultado:', {
          product: result.product.name,
          brandMatch: result.brandMatch,
          shouldCreate: result.brandMatch.shouldCreate,
          matched: result.brandMatch.matched,
          hasBrand: !!result.product.brand,
        });
        
        if (result.brandMatch.shouldCreate && !result.brandMatch.matched && result.product.brand) {
          try {
            console.log(`  ✨ Creando marca: ${result.product.brand}`);
            console.log(`  📤 Enviando request a: POST /admin/brands con body:`, { name: result.product.brand });
            const newBrand = await api.product.createBrand(result.product.brand);
            console.log(`  📥 Respuesta recibida:`, newBrand);
            
            if (newBrand.success) {
              result.brandMatch.matchedId = String(newBrand.data.id);
              result.brandMatch.matchedName = newBrand.data.name;
              result.brandMatch.matched = true;
              (result.brandMatch as MatchResult & { wasCreated?: boolean }).wasCreated = true;
              createdEntities.brands.push(newBrand.data.name);
              console.log(`  ✅ Marca creada: ${newBrand.data.name} (ID: ${newBrand.data.id})`);
            } else {
              console.error(`  ❌ Respuesta no exitosa:`, newBrand);
            }
          } catch (error) {
            console.error(`  ❌ Error creando marca "${result.product.brand}":`, error);
            console.error(`  ❌ Error completo:`, {
              message: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
              error: error,
            });
          }
        }
      }
      
      // Crear categorías nuevas
      for (const result of matchingResults) {
        if (result.categoryMatch.shouldCreate && !result.categoryMatch.matched && result.product.category) {
          try {
            console.log(`  ✨ Creando categoría: ${result.product.category}`);
            const newCategory = await api.product.createCategory(result.product.category);
            if (newCategory.success) {
              result.categoryMatch.matchedId = String(newCategory.data.id);
              result.categoryMatch.matchedName = newCategory.data.name;
              result.categoryMatch.matched = true;
              (result.categoryMatch as MatchResult & { wasCreated?: boolean }).wasCreated = true;
              createdEntities.categories.push(newCategory.data.name);
              console.log(`  ✅ Categoría creada: ${newCategory.data.name}`);
            }
          } catch (error) {
            console.error(`  ❌ Error creando categoría:`, error);
          }
        }
      }
      
      // Crear subcategorías nuevas
      for (const result of matchingResults) {
        if (result.subcategoryMatch.shouldCreate && !result.subcategoryMatch.matched && result.product.subCategory) {
          try {
            console.log(`  ✨ Creando subcategoría: ${result.product.subCategory}`);
            const newSubcategory = await api.product.createSubcategory(
              result.product.subCategory,
              result.categoryMatch.matchedId
            );
            if (newSubcategory.success) {
              result.subcategoryMatch.matchedId = String(newSubcategory.data.id);
              result.subcategoryMatch.matchedName = newSubcategory.data.name;
              result.subcategoryMatch.matched = true;
              (result.subcategoryMatch as MatchResult & { wasCreated?: boolean }).wasCreated = true;
              createdEntities.subcategories.push(newSubcategory.data.name);
              console.log(`  ✅ Subcategoría creada: ${newSubcategory.data.name}`);
            }
          } catch (error) {
            console.error(`  ❌ Error creando subcategoría:`, error);
          }
        }
      }
      
      console.log('✅ [ProductStep] Entidades creadas:', createdEntities);
      
      // 🆕 CREAR LOS PRODUCTOS CON LOS IDs CORRECTOS
      console.log('\n🚀 [ProductStep] Creando productos con IDs asignados...');
      
      const productsToCreate = matchingResults.map((result, index) => {
        const product = result.product;
        
        // Construir el objeto producto con los IDs del matching
        const productData: Record<string, unknown> = {
          // Campos requeridos
          name: product.name || `Producto ${index + 1}`,
          price: product.price || 0,
          
          // IDs del matching o creados
          brandId: result.brandMatch.matchedId || undefined,
          categoryId: result.categoryMatch.matchedId || undefined,
          subCategoryId: result.subcategoryMatch.matchedId || undefined,
          
          // Resto de campos del producto
          title: product.title,
          shortDescription: product.shortDescription,
          fullDescription: product.fullDescription,
          sku: product.sku,
          gtin: product.gtin,
          status: product.status || 'active',
          published: product.published !== undefined ? product.published : true,
          priceSale: product.priceSale,
          priceInPoints: product.priceInPoints,
          tax: product.tax,
          stockQuantity: product.stockQuantity,
          trackInventory: product.trackInventory,
          weight: product.weight,
          markAsNew: product.markAsNew,
          isTopSelling: product.isTopSelling,
          availableInLoyaltyMarket: product.availableInLoyaltyMarket,
          availableInPromoPack: product.availableInPromoPack,
          productTypeCode: product.productTypeCode,
          gama: product.gama,
          
          // Información nutricional
          energyKcal: product.energyKcal,
          fatG: product.fatG,
          saturatedFatG: product.saturatedFatG,
          carbsG: product.carbsG,
          sugarsG: product.sugarsG,
          proteinsG: product.proteinsG,
          saltG: product.saltG,
        };
        
        console.log(`  📦 Producto preparado:`, {
          name: productData.name,
          brandId: productData.brandId,
          categoryId: productData.categoryId,
          subCategoryId: productData.subCategoryId,
          price: productData.price,
        });
        
        return productData;
      });
      
      // Crear productos usando bulk create
      try {
        console.log(`  📤 Enviando ${productsToCreate.length} productos a POST /products`);
        const createResponse = await api.admin.products.bulkCreate(productsToCreate as any[]);
        console.log(`  📥 Respuesta de creación:`, createResponse);
        
        if (createResponse.success) {
          console.log(`  ✅ Productos creados exitosamente!`);
          
          // Mostrar resumen
          console.log('\n📊 [ProductStep] RESUMEN FINAL:');
          console.log(`  ✨ Marcas creadas: ${createdEntities.brands.length}`, createdEntities.brands);
          console.log(`  ✨ Categorías creadas: ${createdEntities.categories.length}`, createdEntities.categories);
          console.log(`  ✨ Subcategorías creadas: ${createdEntities.subcategories.length}`, createdEntities.subcategories);
          console.log(`  ✨ Productos creados: ${productsToCreate.length}`);
          
          // Guardar resumen para mostrar en pantalla
          setCreationSummary({
            brands: createdEntities.brands,
            categories: createdEntities.categories,
            subcategories: createdEntities.subcategories,
            productsCount: productsToCreate.length,
          });
          setIsMatching(false);
        } else {
          console.error(`  ❌ Error en respuesta:`, createResponse);
          setError('Error al crear productos. Revisa la consola para más detalles.');
        }
      } catch (error) {
        console.error(`  ❌ Error creando productos:`, error);
        console.error(`  ❌ Error completo:`, {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          error: error,
        });
        setError(`Error al crear productos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
      
    } catch (error) {
      console.error('❌ [ProductStep] Error en confirmación:', error);
      setError('Error al crear entidades. Intenta nuevamente.');
    } finally {
      setIsMatching(false);
    }
  };

  // Función para continuar al siguiente paso después de ver el resumen
  const handleContinueAfterCreation = () => {
    if (!creationSummary) return;
    
    onNext({ 
      matchedProducts: matchingResults,
      createdEntities: {
        brands: creationSummary.brands,
        categories: creationSummary.categories,
        subcategories: creationSummary.subcategories,
      },
    });
  };

  // Si estamos haciendo matching
  if (isMatching) {
    return (
      <div className="text-center space-y-6">
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: `${themeColors.primary}20` }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-transparent rounded-full"
            style={{ 
              borderTopColor: themeColors.primary,
              borderRightColor: themeColors.primary 
            }}
          />
        </div>
        <h4 className="text-lg font-semibold" style={{ color: themeColors.text.primary }}>
          🤖 Matching inteligente con IA...
        </h4>
        <p className="text-sm" style={{ color: themeColors.text.secondary }}>
          Analizando {uploadedData.length} productos con OpenAI
        </p>
        <div className="text-xs" style={{ color: themeColors.text.secondary }}>
          Verificando marcas, categorías y subcategorías...
        </div>
      </div>
    );
  }

  // Si tenemos resumen de creación, mostrar resultado final
  if (creationSummary) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: `${themeColors.secondary}20` }}
          >
            <CheckCircle2 className="w-10 h-10" style={{ color: themeColors.secondary }} />
          </motion.div>
          <h3 className="text-2xl font-bold" style={{ color: themeColors.text.primary }}>
            ¡Importación Completada! 🎉
          </h3>
          <p className="text-sm mt-2" style={{ color: themeColors.text.secondary }}>
            Todos los productos han sido creados exitosamente
          </p>
        </div>

        {/* Resumen de creación */}
        <div 
          className="p-6 rounded-xl"
          style={{ backgroundColor: `${themeColors.surface}30` }}
        >
          <h4 className="text-lg font-semibold mb-4" style={{ color: themeColors.text.primary }}>
            📊 Resumen de Creación
          </h4>
          
          <div className="space-y-4">
            {/* Productos creados */}
            <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: `${themeColors.secondary}10` }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${themeColors.secondary}20` }}>
                  <span className="text-xl">📦</span>
                </div>
                <div>
                  <div className="font-semibold" style={{ color: themeColors.text.primary }}>
                    Productos Creados
                  </div>
                  <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                    Importados correctamente
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold" style={{ color: themeColors.secondary }}>
                {creationSummary.productsCount}
              </div>
            </div>

            {/* Marcas creadas */}
            {creationSummary.brands.length > 0 && (
              <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: `${themeColors.primary}10` }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${themeColors.primary}20` }}>
                    <span className="text-xl">🏷️</span>
                  </div>
                  <div>
                    <div className="font-semibold" style={{ color: themeColors.text.primary }}>
                      Marcas Nuevas
                    </div>
                    <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                      {creationSummary.brands.join(', ')}
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold" style={{ color: themeColors.primary }}>
                  {creationSummary.brands.length}
                </div>
              </div>
            )}

            {/* Categorías creadas */}
            {creationSummary.categories.length > 0 && (
              <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: `${themeColors.accent}10` }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${themeColors.accent}20` }}>
                    <span className="text-xl">📁</span>
                  </div>
                  <div>
                    <div className="font-semibold" style={{ color: themeColors.text.primary }}>
                      Categorías Nuevas
                    </div>
                    <div className="text-xs" style={{ color: themeColors.text.secondary }}>
                      {creationSummary.categories.join(', ')}
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold" style={{ color: themeColors.accent }}>
                  {creationSummary.categories.length}
                </div>
              </div>
            )}

            {/* Subcategorías creadas */}
            {creationSummary.subcategories.length > 0 && (
              <div className="flex items-center justify-between p-4 rounded-lg bg-purple-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100">
                    <span className="text-xl">📂</span>
                  </div>
                  <div>
                    <div className="font-semibold text-purple-900">
                      Subcategorías Nuevas
                    </div>
                    <div className="text-xs text-purple-600">
                      {creationSummary.subcategories.join(', ')}
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-purple-700">
                  {creationSummary.subcategories.length}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4">
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-6 py-3 rounded-xl font-medium"
            style={{ 
              backgroundColor: `${themeColors.surface}50`,
              color: themeColors.text.secondary,
              border: `1px solid ${themeColors.primary}30`
            }}
          >
            ← Volver Atrás
          </motion.button>
          
          <motion.button
            onClick={handleContinueAfterCreation}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
            style={{ 
              backgroundColor: themeColors.secondary,
              color: 'white'
            }}
          >
            <CheckCircle2 className="w-5 h-5" />
            Confirmar y Continuar
          </motion.button>
        </div>
      </div>
    );
  }

  // Si tenemos resultados de matching, mostrar preview
  if (matchingResults.length > 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold" style={{ color: themeColors.text.primary }}>
              Productos Procesados con IA
            </h3>
            <p className="text-sm mt-1" style={{ color: themeColors.text.secondary }}>
              Revisa el matching inteligente antes de importar
            </p>
          </div>
          <motion.button
            onClick={() => {
              setMatchingResults([]);
              setUploadedData([]);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-lg flex items-center gap-2"
            style={{ 
              backgroundColor: `${themeColors.accent}20`,
              color: themeColors.accent,
              border: `1px solid ${themeColors.accent}30`
            }}
          >
            🔄 Cargar Otros Datos
          </motion.button>
        </div>

        {/* Estadísticas */}
        <div 
          className="p-6 rounded-xl"
          style={{ backgroundColor: `${themeColors.surface}30` }}
        >
          <h4 className="text-lg font-semibold mb-4" style={{ color: themeColors.text.primary }}>
            Resumen del Matching
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: themeColors.primary }}>
                {matchingResults.length}
              </div>
              <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                Total Productos
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {matchingResults.filter(r => 
                  (r.brandMatch.shouldCreate && !r.brandMatch.matched) ||
                  (r.categoryMatch.shouldCreate && !r.categoryMatch.matched) ||
                  (r.subcategoryMatch.shouldCreate && !r.subcategoryMatch.matched)
                ).length}
              </div>
              <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                A Crear (✨)
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: themeColors.secondary }}>
                {matchingResults.filter(r => r.brandMatch.matched && r.categoryMatch.matched).length}
              </div>
              <div className="text-sm" style={{ color: themeColors.text.secondary }}>
                Matched Completos
              </div>
            </div>
          </div>
        </div>

        {/* Lista de productos con matching */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {matchingResults.map((result, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-xl border"
              style={{
                backgroundColor: `${themeColors.surface}20`,
                borderColor: `${themeColors.primary}30`,
              }}
            >
              <h5 className="font-semibold mb-3" style={{ color: themeColors.text.primary }}>
                {result.product.name || 'Sin nombre'}
              </h5>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                {/* Marca */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium" style={{ color: themeColors.text.secondary }}>
                      🏷️ Marca:
                    </span>
                    {result.brandMatch.shouldCreate && !result.brandMatch.matched && (
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                        ✨ Se creará
                      </span>
                    )}
                    {result.brandMatch.wasCreated && (
                      <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">
                        🆕 Creada
                      </span>
                    )}
                  </div>
                  <div style={{ color: themeColors.text.primary }}>
                    {result.brandMatch.matchedName || result.product.brand || 'Sin marca'}
                  </div>
                  {result.brandMatch.confidence < 0.8 && (
                    <div className="text-xs text-yellow-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      Confianza: {(result.brandMatch.confidence * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
                
                {/* Categoría */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium" style={{ color: themeColors.text.secondary }}>
                      📁 Categoría:
                    </span>
                    {result.categoryMatch.shouldCreate && !result.categoryMatch.matched && (
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                        ✨ Se creará
                      </span>
                    )}
                    {result.categoryMatch.wasCreated && (
                      <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">
                        🆕 Creada
                      </span>
                    )}
                  </div>
                  <div style={{ color: themeColors.text.primary }}>
                    {result.categoryMatch.matchedName || result.product.category || 'Sin categoría'}
                  </div>
                  {result.categoryMatch.confidence < 0.8 && (
                    <div className="text-xs text-yellow-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      Confianza: {(result.categoryMatch.confidence * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
                
                {/* Subcategoría */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium" style={{ color: themeColors.text.secondary }}>
                      📂 Subcategoría:
                    </span>
                    {result.subcategoryMatch.shouldCreate && !result.subcategoryMatch.matched && (
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                        ✨ Se creará
                      </span>
                    )}
                    {result.subcategoryMatch.wasCreated && (
                      <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">
                        🆕 Creada
                      </span>
                    )}
                  </div>
                  <div style={{ color: themeColors.text.primary }}>
                    {result.subcategoryMatch.matchedName || result.product.subCategory || 'Sin subcategoría'}
                  </div>
                  {result.subcategoryMatch.confidence < 0.8 && (
                    <div className="text-xs text-yellow-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      Confianza: {(result.subcategoryMatch.confidence * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              </div>
              
              {/* Precio y stock */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t" style={{ borderColor: `${themeColors.primary}20` }}>
                <div className="text-sm">
                  <span className="font-medium" style={{ color: themeColors.text.secondary }}>Precio:</span>
                  <span className="ml-2 font-bold" style={{ color: themeColors.primary }}>
                    ${result.product.price?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-medium" style={{ color: themeColors.text.secondary }}>Stock:</span>
                  <span className="ml-2" style={{ color: themeColors.text.primary }}>
                    {result.product.stockQuantity || 0}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 rounded-xl font-medium"
            style={{
              backgroundColor: `${themeColors.surface}50`,
              color: themeColors.text.secondary,
              border: `2px solid ${themeColors.surface}`,
            }}
          >
            ← Volver Atrás
          </motion.button>
          
          <motion.button
            onClick={handleConfirm}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            disabled={isMatching}
            className="px-8 py-3 rounded-xl font-semibold text-white shadow-lg"
            style={{ 
              backgroundColor: isMatching ? `${themeColors.primary}80` : themeColors.primary,
              boxShadow: `0 4px 12px ${themeColors.primary}30`,
              cursor: isMatching ? 'not-allowed' : 'pointer',
            }}
          >
            {isMatching ? '⏳ Creando...' : '✅ Confirmar y Continuar'}
          </motion.button>
        </div>
      </div>
    );
  }

  // Pantalla principal de carga
  return (
    <div className="space-y-6">
      {/* Título y descripción */}
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: themeColors.text.primary }}>
          📦 Paso 2: Carga de Productos
        </h2>
        <p className="text-sm" style={{ color: themeColors.text.secondary }}>
          Sube tu archivo Excel o CSV con los productos. Usaremos IA para hacer matching inteligente.
        </p>
      </div>

      {error && (
        <div
          className="p-4 rounded-xl border flex items-start gap-3"
          style={{
            backgroundColor: '#fee',
            borderColor: '#fcc',
          }}
        >
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-700 mb-1">Error</h4>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Componente de carga */}
      <FileUploadComponent
        method={method}
        onUpload={handleUpload}
        onFileSelect={() => {}}
        onBack={onBack}
        themeColors={themeColors}
        sampleData={sampleProducts}
        title="Productos"
        acceptedFileTypes=".xlsx,.xls,.csv"
        fileExtensions={['xlsx', 'xls', 'csv']}
        isProcessing={isMatching}
        parseFile={parseProductFile}
      />

      {/* Información sobre el proceso */}
      <div
        className="p-6 rounded-xl"
        style={{ backgroundColor: `${themeColors.surface}30` }}
      >
        <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: themeColors.text.primary }}>
          <CheckCircle2 className="w-5 h-5" style={{ color: themeColors.primary }} />
          ¿Qué hace el matching inteligente?
        </h4>
        <ul className="space-y-2 text-sm" style={{ color: themeColors.text.secondary }}>
          <li className="flex items-start gap-2">
            <span className="text-base">🤖</span>
            <span>Usa OpenAI GPT-4 para encontrar la mejor coincidencia de marcas, categorías y subcategorías</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-base">✨</span>
            <span>Detecta variaciones (Sony/SONY/sony), abreviaturas (HP/Hewlett Packard) y errores tipográficos</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-base">🆕</span>
            <span>Crea automáticamente nuevas marcas/categorías si no existen en el sistema</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-base">📊</span>
            <span>Muestra el nivel de confianza del matching para cada producto</span>
          </li>
        </ul>
      </div>

      {/* Botón de navegación */}
      <div className="flex justify-between mt-6">
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 rounded-xl font-medium"
          style={{
            backgroundColor: `${themeColors.surface}50`,
            color: themeColors.text.secondary,
            border: `2px solid ${themeColors.surface}`,
          }}
        >
          ← Volver Atrás
        </motion.button>
      </div>
    </div>
  );
}
