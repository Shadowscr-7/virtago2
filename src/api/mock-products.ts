// Mock service for testing product bulk creation during development
import { ProductBulkData, ProductBulkCreateResponse } from './index';

// Mock de IA para sugerir categorías, marcas y subcategorías
const mockAIValidation = (products: ProductBulkData[]) => {
  const categoriesCreated: string[] = [];
  const brandsCreated: string[] = [];
  const subCategoriesCreated: string[] = [];
  const suggestedImprovements: { productIndex: number; suggestions: string[] }[] = [];

  products.forEach((product, index) => {
    // Simular creación de categorías basadas en el nombre del producto
    if (product.name.toLowerCase().includes('café')) {
      categoriesCreated.push('Bebidas Calientes');
      subCategoriesCreated.push('Café Premium');
      brandsCreated.push('Café Premium Colombia');
    }
    
    if (product.name.toLowerCase().includes('aceite')) {
      categoriesCreated.push('Aceites y Condimentos');
      subCategoriesCreated.push('Aceites Vegetales');
      brandsCreated.push('Aceites Naturales');
    }

    if (product.name.toLowerCase().includes('arroz')) {
      categoriesCreated.push('Granos y Cereales');
      subCategoriesCreated.push('Arroz Premium');
      brandsCreated.push('Granos Selectos');
    }

    if (product.name.toLowerCase().includes('jabón')) {
      categoriesCreated.push('Higiene Personal');
      subCategoriesCreated.push('Cuidado de Manos');
      brandsCreated.push('Higiene Total');
    }

    if (product.name.toLowerCase().includes('galletas')) {
      categoriesCreated.push('Snacks y Dulces');
      subCategoriesCreated.push('Galletas Saludables');
      brandsCreated.push('Artesanal Natural');
    }

    // Sugerencias de mejora basadas en IA simulada
    const suggestions: string[] = [];
    
    if (!product.shortDescription) {
      suggestions.push('Agregar descripción corta para mejorar SEO');
    }
    
    if (!product.metaTitle) {
      suggestions.push('Incluir meta título para optimización en buscadores');
    }
    
    if (!product.productTags) {
      suggestions.push('Agregar tags de producto para mejor categorización');
    }
    
    if (product.price && !product.priceSale) {
      suggestions.push('Considerar agregar precio promocional');
    }

    if (!product.gtin) {
      suggestions.push('Incluir código GTIN/EAN para mejor trazabilidad');
    }

    if (suggestions.length > 0) {
      suggestedImprovements.push({
        productIndex: index,
        suggestions
      });
    }
  });

  return {
    categoriesCreated: [...new Set(categoriesCreated)],
    brandsCreated: [...new Set(brandsCreated)],
    subCategoriesCreated: [...new Set(subCategoriesCreated)],
    suggestedImprovements
  };
};

export const mockProductBulkCreate = (products: ProductBulkData[]): Promise<ProductBulkCreateResponse> => {
  return new Promise((resolve, reject) => {
    // Simular delay de procesamiento con IA
    setTimeout(() => {
      // Validar productos y simular errores
      const errors: { index: number; product: ProductBulkData; error: string }[] = [];
      
      products.forEach((product, index) => {
        // Validaciones básicas
        if (!product.name) {
          errors.push({
            index,
            product,
            error: 'Nombre del producto es requerido'
          });
        }
        
        if (!product.price || product.price <= 0) {
          errors.push({
            index,
            product,
            error: 'Precio debe ser mayor que 0'
          });
        }

        if (product.name && product.name.length < 3) {
          errors.push({
            index,
            product,
            error: 'Nombre del producto debe tener al menos 3 caracteres'
          });
        }

        // Simular validación de GTIN duplicado
        if (product.gtin === '7701234567890' && index > 0) {
          errors.push({
            index,
            product,
            error: 'GTIN ya existe en el sistema'
          });
        }
      });

      // Calcular estadísticas
      const totalProcessed = products.length;
      const errorCount = errors.length;
      const successCount = totalProcessed - errorCount;

      // Simular que falla si más del 60% tiene errores
      if (errorCount > totalProcessed * 0.6) {
        reject(new Error('Demasiados errores en los productos. Revisa el formato y datos requeridos.'));
        return;
      }

      // Generar validaciones de IA
      const aiValidations = mockAIValidation(products.filter((_, index) => !errors.some(e => e.index === index)));

      // Respuesta exitosa
      const response: ProductBulkCreateResponse = {
        success: true,
        message: `Bulk creation completed. ${successCount} products created successfully${errorCount > 0 ? `, ${errorCount} errors found` : ''}`,
        results: {
          totalProcessed,
          successCount,
          errorCount,
          products: errorCount === 0 ? products : products.filter((_, index) => !errors.some(e => e.index === index)),
          errors: errorCount > 0 ? errors : undefined,
          aiValidations: successCount > 0 ? aiValidations : undefined
        }
      };

      resolve(response);
    }, 3000 + Math.random() * 2000); // 3-5 segundos de delay simulado (más tiempo por la "IA")
  });
};

// Función para alternar entre mock y API real
export const shouldUseMockProductAPI = (): boolean => {
  return process.env.NODE_ENV === 'development' && 
         (process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || !localStorage.getItem('auth_token'));
};