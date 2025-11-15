/**
 * Servicio de Análisis de Imágenes con IA
 * Utiliza OpenAI GPT-4 Vision para analizar imágenes de productos
 * y extraer información relevante automáticamente
 */

import OpenAI from "openai";

// ============================================
// Tipos y Interfaces
// ============================================

export interface ProductImageAnalysis {
  // Información del producto detectado
  productInfo: {
    name: string;
    brand: string;
    category: string;
    subcategory?: string;
    model?: string;
    color?: string;
    condition?: "new" | "used" | "refurbished";
  };

  // Características técnicas detectadas
  technicalSpecs: {
    [key: string]: string;
  };

  // Etiquetas y palabras clave
  tags: string[];

  // Descripción generada automáticamente
  description: string;

  // Nivel de confianza del análisis (0-100)
  confidence: number;

  // Sugerencias de productos similares en el inventario
  suggestedProducts?: Array<{
    sku: string;
    name: string;
    similarity: number;
  }>;

  // Calidad de la imagen
  imageQuality: {
    resolution: string;
    clarity: "excellent" | "good" | "fair" | "poor";
    hasWatermark: boolean;
    backgroundType: "white" | "transparent" | "colored" | "complex";
    recommendations: string[];
  };

  // Información adicional extraída
  additionalInfo: {
    textDetected?: string[];
    logosBrands?: string[];
    packaging?: boolean;
    multipleProducts?: boolean;
    productCount?: number;
  };
}

export interface VisionServiceConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

// ============================================
// Clase Principal del Servicio
// ============================================

export class ImageVisionService {
  private openai: OpenAI;
  private config: Required<VisionServiceConfig>;

  constructor(config: VisionServiceConfig) {
    this.config = {
      apiKey: config.apiKey,
      model: config.model || process.env.OPENAI_VISION_MODEL || "gpt-4o",
      maxTokens: config.maxTokens || parseInt(process.env.OPENAI_MAX_TOKENS || "1000"),
      temperature: config.temperature || 0.2,
    };

    this.openai = new OpenAI({
      apiKey: this.config.apiKey,
    });
  }

  /**
   * Analiza una imagen y extrae información del producto
   * @param imageUrl URL de la imagen o base64 data URL
   * @param productContext Contexto adicional sobre el inventario de productos
   */
  async analyzeProductImage(
    imageUrl: string,
    productContext?: {
      existingProducts?: Array<{ sku: string; name: string; brand: string }>;
      categories?: string[];
    }
  ): Promise<ProductImageAnalysis> {
    try {
      const prompt = this.buildAnalysisPrompt(productContext);

      const response = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                  detail: "high", // high, low, auto
                },
              },
            ],
          },
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      });

      const analysisText = response.choices[0]?.message?.content;
      if (!analysisText) {
        throw new Error("No se recibió respuesta del análisis de imagen");
      }

      // Parsear la respuesta JSON
      const analysis = this.parseAnalysisResponse(analysisText);
      
      return analysis;
    } catch (error) {
      console.error("Error al analizar imagen con IA:", error);
      throw new Error(
        `Error en análisis de imagen: ${error instanceof Error ? error.message : "Error desconocido"}`
      );
    }
  }

  /**
   * Analiza múltiples imágenes del mismo producto
   */
  async analyzeMultipleProductImages(
    imageUrls: string[],
    productContext?: {
      existingProducts?: Array<{ sku: string; name: string; brand: string }>;
      categories?: string[];
    }
  ): Promise<ProductImageAnalysis> {
    try {
      if (imageUrls.length === 0) {
        throw new Error("Se requiere al menos una imagen");
      }

      const prompt = this.buildMultiImagePrompt(productContext);

      const content: Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string; detail: string } }
      > = [
        {
          type: "text",
          text: prompt,
        },
      ];

      // Agregar todas las imágenes
      imageUrls.forEach((url) => {
        content.push({
          type: "image_url",
          image_url: {
            url: url,
            detail: "high",
          },
        });
      });

      const response = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: "user",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            content: content as any, // OpenAI SDK typing issue with mixed content
          },
        ],
        max_tokens: this.config.maxTokens * 1.5, // Más tokens para múltiples imágenes
        temperature: this.config.temperature,
      });

      const analysisText = response.choices[0]?.message?.content;
      if (!analysisText) {
        throw new Error("No se recibió respuesta del análisis de imágenes");
      }

      return this.parseAnalysisResponse(analysisText);
    } catch (error) {
      console.error("Error al analizar múltiples imágenes:", error);
      throw new Error(
        `Error en análisis de imágenes: ${error instanceof Error ? error.message : "Error desconocido"}`
      );
    }
  }

  /**
   * Compara una imagen con productos existentes para encontrar coincidencias
   */
  async findMatchingProducts(
    imageUrl: string,
    existingProducts: Array<{ sku: string; name: string; brand: string; category: string }>
  ): Promise<Array<{ sku: string; name: string; similarity: number; reason: string }>> {
    try {
      const prompt = `Analiza esta imagen de producto y compárala con los siguientes productos existentes en el inventario:

${existingProducts.map((p) => `- SKU: ${p.sku}, Nombre: ${p.name}, Marca: ${p.brand}, Categoría: ${p.category}`).join("\n")}

Identifica los productos que podrían coincidir con la imagen y devuelve un JSON con el siguiente formato:
{
  "matches": [
    {
      "sku": "SKU del producto",
      "name": "Nombre del producto",
      "similarity": 0-100,
      "reason": "Explicación de por qué coincide"
    }
  ]
}

Ordena los resultados por similitud de mayor a menor. Solo incluye productos con similitud >= 60.`;

      const response = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                  detail: "high",
                },
              },
            ],
          },
        ],
        max_tokens: 800,
        temperature: 0.1,
      });

      const resultText = response.choices[0]?.message?.content;
      if (!resultText) {
        return [];
      }

      const result = this.parseJSON(resultText);
      return (result.matches as Array<{ sku: string; name: string; similarity: number; reason: string }>) || [];
    } catch (error) {
      console.error("Error al buscar productos coincidentes:", error);
      return [];
    }
  }

  /**
   * Construye el prompt para análisis de una sola imagen
   */
  private buildAnalysisPrompt(productContext?: {
    existingProducts?: Array<{ sku: string; name: string; brand: string }>;
    categories?: string[];
  }): string {
    let prompt = `Analiza esta imagen de producto y extrae toda la información relevante. Devuelve un JSON estructurado con el siguiente formato:

{
  "productInfo": {
    "name": "Nombre completo del producto",
    "brand": "Marca del producto",
    "category": "Categoría principal",
    "subcategory": "Subcategoría si aplica",
    "model": "Modelo o código si es visible",
    "color": "Color del producto",
    "condition": "new | used | refurbished"
  },
  "technicalSpecs": {
    "clave": "valor de especificación técnica visible o deducible"
  },
  "tags": ["etiqueta1", "etiqueta2", "etiqueta3"],
  "description": "Descripción detallada del producto en español, optimizada para e-commerce",
  "confidence": 0-100,
  "imageQuality": {
    "resolution": "dimensiones aproximadas",
    "clarity": "excellent | good | fair | poor",
    "hasWatermark": true/false,
    "backgroundType": "white | transparent | colored | complex",
    "recommendations": ["sugerencia de mejora 1", "sugerencia 2"]
  },
  "additionalInfo": {
    "textDetected": ["texto visible en la imagen"],
    "logosBrands": ["logos o marcas detectadas"],
    "packaging": true/false,
    "multipleProducts": true/false,
    "productCount": número de productos visibles
  }
}`;

    if (productContext?.existingProducts && productContext.existingProducts.length > 0) {
      prompt += `\n\nProductos existentes en inventario:\n${productContext.existingProducts.map((p) => `- ${p.sku}: ${p.name} (${p.brand})`).join("\n")}`;
      prompt += `\n\nSi la imagen coincide con algún producto existente, inclúyelo en el campo "suggestedProducts" con un nivel de similitud.`;
    }

    if (productContext?.categories && productContext.categories.length > 0) {
      prompt += `\n\nCategorías disponibles: ${productContext.categories.join(", ")}`;
    }

    prompt += `\n\nIMPORTANTE: 
- Devuelve SOLO el JSON, sin texto adicional.
- Sé preciso y detallado.
- Si no puedes detectar algún campo, usa null.
- La descripción debe ser comercial y atractiva.
- Las etiquetas deben ser útiles para búsqueda y SEO.`;

    return prompt;
  }

  /**
   * Construye el prompt para análisis de múltiples imágenes
   */
  private buildMultiImagePrompt(productContext?: {
    existingProducts?: Array<{ sku: string; name: string; brand: string }>;
    categories?: string[];
  }): string {
    let prompt = `Analiza estas múltiples imágenes del MISMO producto desde diferentes ángulos. Combina la información de todas las imágenes para crear un análisis completo.

Devuelve un JSON estructurado con el siguiente formato:

{
  "productInfo": {
    "name": "Nombre completo del producto",
    "brand": "Marca del producto",
    "category": "Categoría principal",
    "subcategory": "Subcategoría si aplica",
    "model": "Modelo o código",
    "color": "Color del producto",
    "condition": "new | used | refurbished"
  },
  "technicalSpecs": {
    "clave": "valor de especificación técnica"
  },
  "tags": ["etiqueta1", "etiqueta2"],
  "description": "Descripción detallada combinando información de todas las imágenes",
  "confidence": 0-100,
  "imageQuality": {
    "resolution": "mejor resolución detectada",
    "clarity": "excellent | good | fair | poor",
    "hasWatermark": true/false,
    "backgroundType": "white | transparent | colored | complex",
    "recommendations": ["sugerencias de mejora"]
  },
  "additionalInfo": {
    "textDetected": ["todo el texto visible"],
    "logosBrands": ["logos detectados"],
    "packaging": true/false,
    "multipleProducts": false,
    "productCount": 1
  }
}`;

    if (productContext?.existingProducts && productContext.existingProducts.length > 0) {
      prompt += `\n\nProductos en inventario:\n${productContext.existingProducts.map((p) => `- ${p.sku}: ${p.name} (${p.brand})`).join("\n")}`;
    }

    prompt += `\n\nIMPORTANTE: Devuelve SOLO el JSON, sin texto adicional.`;

    return prompt;
  }

  /**
   * Parsea la respuesta de la IA y la convierte en ProductImageAnalysis
   */
  private parseAnalysisResponse(responseText: string): ProductImageAnalysis {
    try {
      // Extraer JSON si viene envuelto en markdown
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || responseText.match(/```\n?([\s\S]*?)\n?```/);
      const jsonText = jsonMatch ? jsonMatch[1] : responseText;

      const parsed = JSON.parse(jsonText.trim());

      // Validar estructura mínima
      if (!parsed.productInfo) {
        throw new Error("Respuesta inválida: falta productInfo");
      }

      return {
        productInfo: parsed.productInfo,
        technicalSpecs: parsed.technicalSpecs || {},
        tags: parsed.tags || [],
        description: parsed.description || "",
        confidence: parsed.confidence || 0,
        suggestedProducts: parsed.suggestedProducts || [],
        imageQuality: parsed.imageQuality || {
          resolution: "unknown",
          clarity: "fair",
          hasWatermark: false,
          backgroundType: "complex",
          recommendations: [],
        },
        additionalInfo: parsed.additionalInfo || {},
      };
    } catch (error) {
      console.error("Error al parsear respuesta:", error);
      console.error("Texto recibido:", responseText);
      throw new Error("No se pudo parsear la respuesta del análisis de imagen");
    }
  }

  /**
   * Helper para parsear JSON de forma segura
   */
  private parseJSON(text: string): Record<string, unknown> {
    try {
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/```\n?([\s\S]*?)\n?```/);
      const jsonText = jsonMatch ? jsonMatch[1] : text;
      return JSON.parse(jsonText.trim()) as Record<string, unknown>;
    } catch (error) {
      console.error("Error parseando JSON:", error);
      return {};
    }
  }
}

// ============================================
// Instancia singleton del servicio
// ============================================

let visionServiceInstance: ImageVisionService | null = null;

export function getVisionService(): ImageVisionService {
  if (!visionServiceInstance) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY no está configurada. Por favor, añádela a tu archivo .env.local"
      );
    }

    visionServiceInstance = new ImageVisionService({
      apiKey,
      model: process.env.OPENAI_VISION_MODEL,
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || "1000"),
    });
  }

  return visionServiceInstance;
}

// ============================================
// Funciones de utilidad
// ============================================

/**
 * Convierte un archivo File a base64 data URL
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Valida el tamaño y formato de una imagen
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
