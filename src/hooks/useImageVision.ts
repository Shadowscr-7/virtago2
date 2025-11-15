/**
 * Hook personalizado para análisis de imágenes con IA
 * Simplifica el uso del servicio de visión en componentes React
 */

import { useState, useCallback } from "react";
import { toast } from "sonner";

// ============================================
// Tipos
// ============================================

export interface ProductImageAnalysis {
  productInfo: {
    name: string;
    brand: string;
    category: string;
    subcategory?: string;
    model?: string;
    color?: string;
    condition?: "new" | "used" | "refurbished";
  };
  technicalSpecs: Record<string, string>;
  tags: string[];
  description: string;
  confidence: number;
  suggestedProducts?: Array<{
    sku: string;
    name: string;
    similarity: number;
  }>;
  imageQuality: {
    resolution: string;
    clarity: "excellent" | "good" | "fair" | "poor";
    hasWatermark: boolean;
    backgroundType: "white" | "transparent" | "colored" | "complex";
    recommendations: string[];
  };
  additionalInfo: {
    textDetected?: string[];
    logosBrands?: string[];
    packaging?: boolean;
    multipleProducts?: boolean;
    productCount?: number;
  };
}

export interface ProductMatch {
  sku: string;
  name: string;
  similarity: number;
  reason: string;
}

interface UseImageVisionOptions {
  showToasts?: boolean;
  onSuccess?: (analysis: ProductImageAnalysis) => void;
  onError?: (error: string) => void;
}

// ============================================
// Hook Principal
// ============================================

export function useImageVision(options: UseImageVisionOptions = {}) {
  const { showToasts = true, onSuccess, onError } = options;

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ProductImageAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Analiza una imagen individual
   */
  const analyzeImage = useCallback(
    async (
      imageSource: string | File,
      productContext?: {
        existingProducts?: Array<{ sku: string; name: string; brand: string }>;
        categories?: string[];
      }
    ): Promise<ProductImageAnalysis | null> => {
      setIsAnalyzing(true);
      setError(null);

      try {
        let imageData: string;

        // Convertir File a base64 si es necesario
        if (imageSource instanceof File) {
          imageData = await fileToBase64(imageSource);
        } else {
          imageData = imageSource;
        }

        // Determinar si es URL o base64
        const isUrl = imageData.startsWith("http");
        const requestBody = isUrl
          ? { imageUrl: imageData, productContext }
          : { imageBase64: imageData, productContext };

        const response = await fetch("/api/images/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al analizar imagen");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Error en el análisis");
        }

        setAnalysis(data.data);

        if (showToasts) {
          toast.success("Imagen analizada exitosamente", {
            description: `Producto detectado: ${data.data.productInfo.name}`,
          });
        }

        if (onSuccess) {
          onSuccess(data.data);
        }

        return data.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);

        if (showToasts) {
          toast.error("Error al analizar imagen", {
            description: errorMessage,
          });
        }

        if (onError) {
          onError(errorMessage);
        }

        return null;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [showToasts, onSuccess, onError]
  );

  /**
   * Analiza múltiples imágenes del mismo producto
   */
  const analyzeMultipleImages = useCallback(
    async (
      imageSources: Array<string | File>,
      productContext?: {
        existingProducts?: Array<{ sku: string; name: string; brand: string }>;
        categories?: string[];
      }
    ): Promise<ProductImageAnalysis | null> => {
      setIsAnalyzing(true);
      setError(null);

      try {
        // Convertir todas las imágenes a string (URL o base64)
        const imageDataPromises = imageSources.map(async (source) => {
          if (source instanceof File) {
            return await fileToBase64(source);
          }
          return source;
        });

        const imageDataArray = await Promise.all(imageDataPromises);

        // Separar URLs y base64
        const imageUrls = imageDataArray.filter((img) =>
          img.startsWith("http")
        );
        const imagesBase64 = imageDataArray.filter(
          (img) => !img.startsWith("http")
        );

        const requestBody: {
          imageUrls?: string[];
          imagesBase64?: string[];
          productContext?: typeof productContext;
        } = { productContext };

        if (imageUrls.length > 0) {
          requestBody.imageUrls = imageUrls;
        }
        if (imagesBase64.length > 0) {
          requestBody.imagesBase64 = imagesBase64;
        }

        const response = await fetch("/api/images/analyze-multiple", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al analizar imágenes");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Error en el análisis");
        }

        setAnalysis(data.data);

        if (showToasts) {
          toast.success(`${data.imagesAnalyzed} imágenes analizadas`, {
            description: `Producto: ${data.data.productInfo.name}`,
          });
        }

        if (onSuccess) {
          onSuccess(data.data);
        }

        return data.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);

        if (showToasts) {
          toast.error("Error al analizar imágenes", {
            description: errorMessage,
          });
        }

        if (onError) {
          onError(errorMessage);
        }

        return null;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [showToasts, onSuccess, onError]
  );

  /**
   * Encuentra productos coincidentes en el inventario
   */
  const findMatchingProducts = useCallback(
    async (
      imageSource: string | File,
      existingProducts: Array<{
        sku: string;
        name: string;
        brand: string;
        category: string;
      }>,
      minSimilarity: number = 60
    ): Promise<ProductMatch[]> => {
      setIsAnalyzing(true);
      setError(null);

      try {
        let imageData: string;

        if (imageSource instanceof File) {
          imageData = await fileToBase64(imageSource);
        } else {
          imageData = imageSource;
        }

        const isUrl = imageData.startsWith("http");
        const requestBody = {
          ...(isUrl ? { imageUrl: imageData } : { imageBase64: imageData }),
          existingProducts,
          minSimilarity,
        };

        const response = await fetch("/api/images/find-matches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Error al buscar coincidencias");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Error en la búsqueda");
        }

        const matches = data.data.matches;

        if (showToasts) {
          if (matches.length > 0) {
            toast.success(`${matches.length} productos coincidentes`, {
              description: `Mejor coincidencia: ${matches[0].name} (${matches[0].similarity}%)`,
            });
          } else {
            toast.info("No se encontraron productos coincidentes", {
              description: `Mínimo requerido: ${minSimilarity}% similitud`,
            });
          }
        }

        return matches;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error desconocido";
        setError(errorMessage);

        if (showToasts) {
          toast.error("Error al buscar productos", {
            description: errorMessage,
          });
        }

        if (onError) {
          onError(errorMessage);
        }

        return [];
      } finally {
        setIsAnalyzing(false);
      }
    },
    [showToasts, onError]
  );

  /**
   * Reinicia el estado del hook
   */
  const reset = useCallback(() => {
    setAnalysis(null);
    setError(null);
    setIsAnalyzing(false);
  }, []);

  return {
    // Estados
    isAnalyzing,
    analysis,
    error,

    // Acciones
    analyzeImage,
    analyzeMultipleImages,
    findMatchingProducts,
    reset,
  };
}

// ============================================
// Utilidades
// ============================================

/**
 * Convierte un File a base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Valida un archivo de imagen
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 10,
  allowedFormats: string[] = ["jpg", "jpeg", "png", "webp"]
): { valid: boolean; error?: string } {
  // Validar tamaño
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`,
    };
  }

  // Validar formato
  const fileExtension = file.name.split(".").pop()?.toLowerCase();
  if (!fileExtension || !allowedFormats.includes(fileExtension)) {
    return {
      valid: false,
      error: `Formato no permitido. Formatos aceptados: ${allowedFormats.join(", ")}`,
    };
  }

  return { valid: true };
}
