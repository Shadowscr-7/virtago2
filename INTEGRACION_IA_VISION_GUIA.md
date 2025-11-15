# 🔗 Integración del Sistema de IA de Visión con la Gestión de Imágenes

Este documento explica cómo integrar el sistema de IA de visión con la página de gestión de imágenes existente.

## 📍 Archivo Actual
`src/app/admin/imagenes/page.tsx`

## 🎯 Integraciones Sugeridas

### 1. Auto-Análisis al Subir Imágenes

Modificar el componente `ImageUploadZone` para analizar automáticamente cada imagen subida:

```typescript
// En ImageUploadZone.tsx
import { useImageVision } from '@/hooks/useImageVision';

export function ImageUploadZone({ onUpload, isUploading }) {
  const { analyzeImage, isAnalyzing } = useImageVision();

  const handleFileUpload = async (files: File[]) => {
    for (const file of files) {
      // 1. Subir imagen
      await uploadImageToServer(file);
      
      // 2. Analizar con IA
      const analysis = await analyzeImage(file, {
        existingProducts: productosDelInventario,
        categories: categoriasDisponibles
      });
      
      // 3. Guardar metadatos
      if (analysis) {
        await saveImageMetadata({
          filename: file.name,
          productInfo: analysis.productInfo,
          tags: analysis.tags,
          description: analysis.description,
          confidence: analysis.confidence,
          aiSuggestions: analysis.suggestedProducts
        });
      }
    }
  };
}
```

### 2. Botón de Auto-Asignación Inteligente

Agregar funcionalidad al botón "Auto-Asignar" existente:

```typescript
// En page.tsx (imagenes admin)
import { useImageVision } from '@/hooks/useImageVision';

const { findMatchingProducts } = useImageVision();

const handleAutoAssign = async () => {
  // Obtener imágenes sin asignar
  const unassignedImages = images.filter(img => img.status === 'UPLOADED');
  
  for (const image of unassignedImages) {
    // Buscar productos coincidentes
    const matches = await findMatchingProducts(
      image.url,
      allProducts, // Lista de todos los productos
      75 // Mínimo 75% de similitud
    );
    
    if (matches.length > 0) {
      const bestMatch = matches[0];
      
      // Auto-asignar si la confianza es alta
      if (bestMatch.similarity >= 85) {
        await assignImageToProduct(image.id, bestMatch.sku);
      } else {
        // Si no es tan alta, mostrar para confirmación manual
        showConfirmationDialog(image, matches);
      }
    }
  }
};
```

### 3. Panel de Información de IA en ImageGallery

Mostrar información detectada por IA en cada imagen:

```typescript
// En ImageGallery.tsx o en los detalles de imagen
{analysis && (
  <div className="ai-info-panel">
    <div className="flex items-center gap-2 mb-2">
      <Sparkles className="w-4 h-4" />
      <span className="font-semibold">Detectado por IA</span>
      <span className="text-xs opacity-70">
        {analysis.confidence}% confianza
      </span>
    </div>
    
    <div className="space-y-1 text-sm">
      <p><strong>Producto:</strong> {analysis.productInfo.name}</p>
      <p><strong>Marca:</strong> {analysis.productInfo.brand}</p>
      <p><strong>Categoría:</strong> {analysis.productInfo.category}</p>
    </div>
    
    <div className="flex flex-wrap gap-1 mt-2">
      {analysis.tags.slice(0, 5).map(tag => (
        <span key={tag} className="px-2 py-0.5 bg-blue-100 rounded text-xs">
          {tag}
        </span>
      ))}
    </div>
    
    {analysis.suggestedProducts && analysis.suggestedProducts.length > 0 && (
      <div className="mt-3">
        <p className="text-xs font-semibold mb-1">Productos sugeridos:</p>
        {analysis.suggestedProducts.map(product => (
          <button
            key={product.sku}
            onClick={() => assignImageToProduct(imageId, product.sku)}
            className="text-xs px-2 py-1 bg-green-50 rounded hover:bg-green-100 w-full text-left mb-1"
          >
            {product.name} ({product.similarity}%)
          </button>
        ))}
      </div>
    )}
  </div>
)}
```

### 4. Modal de Análisis en Lote

Crear un modal para analizar múltiples imágenes del mismo producto:

```typescript
function BulkAnalysisModal({ images, onClose }) {
  const { analyzeMultipleImages, isAnalyzing, analysis } = useImageVision();
  
  const handleAnalyze = async () => {
    const imageUrls = images.map(img => img.url);
    
    const result = await analyzeMultipleImages(imageUrls, {
      existingProducts: allProducts
    });
    
    if (result) {
      // Mostrar resultados y permitir crear producto
      setAnalysisResult(result);
    }
  };
  
  return (
    <Modal>
      <h2>Analizar {images.length} Imágenes</h2>
      <p>Se combinarán todas las imágenes para un análisis más preciso</p>
      
      <button onClick={handleAnalyze} disabled={isAnalyzing}>
        {isAnalyzing ? 'Analizando...' : 'Analizar Conjunto'}
      </button>
      
      {analysis && (
        <div className="results">
          <h3>{analysis.productInfo.name}</h3>
          <p>{analysis.description}</p>
          
          <button onClick={() => createProductFromAnalysis(analysis)}>
            Crear Producto Automáticamente
          </button>
        </div>
      )}
    </Modal>
  );
}
```

### 5. Validación de Calidad de Imagen

Validar automáticamente la calidad al subir:

```typescript
const validateImageQuality = async (file: File) => {
  const analysis = await analyzeImage(file);
  
  if (!analysis) return { valid: false, errors: ['No se pudo analizar'] };
  
  const errors = [];
  const warnings = [];
  
  // Validaciones
  if (analysis.imageQuality.clarity === 'poor') {
    errors.push('Imagen de baja calidad - Se requiere mejor resolución');
  }
  
  if (analysis.imageQuality.hasWatermark) {
    errors.push('La imagen contiene marca de agua');
  }
  
  if (analysis.imageQuality.backgroundType === 'complex') {
    warnings.push('Se recomienda fondo blanco o simple');
  }
  
  if (analysis.additionalInfo.multipleProducts) {
    warnings.push('Se detectaron múltiples productos - Use una imagen por producto');
  }
  
  if (analysis.confidence < 70) {
    warnings.push('Baja confianza en detección - Verifique manualmente');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    analysis
  };
};
```

## 🔄 Flujo Completo Sugerido

### Flujo de Carga de Imagen:

1. **Usuario sube imagen** → `ImageUploadZone`
2. **Validar archivo** → Tamaño, formato
3. **Subir a servidor/CDN** → Guardar archivo
4. **Analizar con IA** → `analyzeImage()`
5. **Validar calidad** → Rechazar si es muy mala
6. **Buscar coincidencias** → `findMatchingProducts()`
7. **Auto-asignar o sugerir** → Si hay alta coincidencia
8. **Guardar metadatos** → Tags, descripción, specs
9. **Actualizar UI** → Mostrar resultado

### Flujo de Auto-Asignación Masiva:

1. **Usuario hace clic en "Auto-Asignar"**
2. **Obtener imágenes sin asignar** → Filtrar por estado
3. **Obtener productos del inventario** → API
4. **Por cada imagen:**
   - Buscar coincidencias → `findMatchingProducts()`
   - Si similitud >= 85%: Auto-asignar
   - Si similitud 70-84%: Pedir confirmación
   - Si similitud < 70%: Dejar sin asignar
5. **Mostrar resumen** → X asignadas, Y pendientes
6. **Actualizar galería** → Refrescar vista

## 📝 Ejemplo de Implementación Completa

```typescript
// src/app/admin/imagenes/page.tsx
"use client";

import { useState } from "react";
import { useImageVision } from "@/hooks/useImageVision";
import { toast } from "sonner";

export default function ImagenesAdminPage() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const {
    analyzeImage,
    findMatchingProducts,
    analyzeMultipleImages,
    isAnalyzing
  } = useImageVision();

  // 1. Analizar imagen al subirla
  const handleImageUpload = async (files: File[]) => {
    for (const file of files) {
      try {
        // Subir archivo
        const uploadedImage = await uploadImage(file);
        
        // Analizar con IA
        const analysis = await analyzeImage(file, {
          existingProducts: products.map(p => ({
            sku: p.sku,
            name: p.name,
            brand: p.brand
          })),
          categories: getCategories()
        });
        
        if (analysis) {
          // Guardar con metadatos
          await saveImageWithMetadata({
            ...uploadedImage,
            aiAnalysis: analysis,
            tags: analysis.tags,
            description: analysis.description
          });
          
          toast.success(`Imagen analizada: ${analysis.productInfo.name}`);
        }
      } catch (error) {
        toast.error('Error al procesar imagen');
      }
    }
    
    // Refrescar lista
    await loadImages();
  };

  // 2. Auto-asignar imágenes
  const handleAutoAssign = async () => {
    const unassigned = images.filter(img => !img.assignedTo);
    let assigned = 0;
    let suggested = 0;
    
    for (const image of unassigned) {
      const matches = await findMatchingProducts(
        image.url,
        products.map(p => ({
          sku: p.sku,
          name: p.name,
          brand: p.brand,
          category: p.category
        })),
        70
      );
      
      if (matches.length > 0) {
        const best = matches[0];
        
        if (best.similarity >= 85) {
          // Auto-asignar automáticamente
          await assignImage(image.id, best.sku);
          assigned++;
        } else {
          // Marcar como sugerido
          await markAsSuggested(image.id, matches);
          suggested++;
        }
      }
    }
    
    toast.success(
      `${assigned} imágenes asignadas, ${suggested} con sugerencias`
    );
    
    await loadImages();
  };

  // 3. Analizar múltiples imágenes del mismo producto
  const handleMultiImageAnalysis = async (imageIds: string[]) => {
    const selectedImages = images.filter(img => imageIds.includes(img.id));
    const imageUrls = selectedImages.map(img => img.url);
    
    const analysis = await analyzeMultipleImages(imageUrls);
    
    if (analysis) {
      // Mostrar modal para crear producto
      showCreateProductModal(analysis, imageIds);
    }
  };

  return (
    <AdminLayout>
      {/* Tu UI existente */}
      <button onClick={handleAutoAssign} disabled={isAnalyzing}>
        {isAnalyzing ? 'Procesando...' : 'Auto-Asignar con IA'}
      </button>
      
      <ImageUploadZone onUpload={handleImageUpload} />
      
      <ImageGallery
        images={images}
        onMultiSelect={handleMultiImageAnalysis}
      />
    </AdminLayout>
  );
}
```

## 🎨 Mejoras de UX Recomendadas

1. **Indicador de procesamiento IA**
   - Mostrar spinner cuando se está analizando
   - Badge "Analizando con IA..." en la imagen

2. **Nivel de confianza visual**
   - Verde: >= 90% (Muy confiable)
   - Amarillo: 70-89% (Revisar)
   - Rojo: < 70% (Baja confianza)

3. **Preview de sugerencias**
   - Mostrar productos sugeridos al pasar el mouse
   - Botón rápido "Asignar" en cada sugerencia

4. **Historial de análisis**
   - Guardar todos los análisis de IA
   - Permitir re-analizar si es necesario

5. **Estadísticas de IA**
   - Cuántas imágenes se analizaron hoy
   - Tasa de auto-asignación exitosa
   - Ahorro de tiempo estimado

## 📚 Recursos Adicionales

- Ver `IMAGE_AI_VISION_README.md` para documentación completa
- Ver `useImageVision.ts` para todos los métodos disponibles
- Ver `image-vision.service.ts` para API de bajo nivel

---

**¡El sistema está listo para integrarse! Dime qué ajustes específicos quieres hacer a la administración de imágenes.** 🚀
