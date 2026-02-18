/**
 * POST /api/product-images
 * 
 * Procesa imágenes subidas, las analiza con IA y busca productos coincidentes
 * Recibe el token del cliente y lo pasa al backend
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "https://virtago-backend.vercel.app/api";

interface ImageInput {
  imageUrl: string;
  metadata: {
    filename: string;
    size: number;
    format: string;
  };
}

interface ProductMatchResult {
  imageUrl: string;
  matchScore: number;
  matchedProduct: Record<string, unknown> | null;
  visionData: Record<string, unknown>;
  allMatches: Array<{ product: Record<string, unknown>; score: number; matchReasons?: string[] }>;
  processingTime: number;
}

interface ErrorResult {
  imageUrl: string;
  error: string;
  message: string;
}

// ============================================================
// Búsqueda parcial por nombre/marca/keywords cuando no hay match
// ============================================================

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quitar acentos
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

function calculatePartialScore(
  productName: string,
  productBrand: string,
  productCategory: string,
  searchTerms: { brand?: string; productName?: string; keywords?: string[]; category?: string }
): { score: number; reasons: string[] } {
  const normName = normalizeText(productName);
  const normBrand = normalizeText(productBrand || "");
  const normCategory = normalizeText(productCategory || "");
  const reasons: string[] = [];
  let score = 0;

  // 1. Coincidencia de marca (peso alto: +40)
  if (searchTerms.brand) {
    const normSearchBrand = normalizeText(searchTerms.brand);
    if (normBrand === normSearchBrand) {
      score += 40;
      reasons.push(`Marca exacta: ${searchTerms.brand}`);
    } else if (normBrand.includes(normSearchBrand) || normSearchBrand.includes(normBrand)) {
      score += 30;
      reasons.push(`Marca parcial: ${searchTerms.brand}`);
    } else if (normName.includes(normSearchBrand)) {
      score += 25;
      reasons.push(`Marca en nombre: ${searchTerms.brand}`);
    }
  }

  // 2. Coincidencia de nombre de producto (peso alto: hasta +35)
  if (searchTerms.productName) {
    const nameWords = normalizeText(searchTerms.productName).split(/\s+/).filter(w => w.length > 2);
    let nameMatches = 0;
    for (const word of nameWords) {
      if (normName.includes(word) || normBrand.includes(word)) {
        nameMatches++;
      }
    }
    if (nameWords.length > 0) {
      const nameRatio = nameMatches / nameWords.length;
      if (nameRatio >= 0.8) {
        score += 35;
        reasons.push(`Nombre muy similar`);
      } else if (nameRatio >= 0.5) {
        score += 25;
        reasons.push(`Nombre parcial (${nameMatches}/${nameWords.length} palabras)`);
      } else if (nameMatches > 0) {
        score += 15;
        reasons.push(`${nameMatches} palabra(s) coinciden`);
      }
    }
  }

  // 3. Coincidencia de keywords (peso medio: hasta +20)
  if (searchTerms.keywords && searchTerms.keywords.length > 0) {
    let kwMatches = 0;
    const matchedKws: string[] = [];
    for (const kw of searchTerms.keywords) {
      const normKw = normalizeText(kw);
      if (normKw.length > 2 && (normName.includes(normKw) || normBrand.includes(normKw) || normCategory.includes(normKw))) {
        kwMatches++;
        matchedKws.push(kw);
      }
    }
    if (kwMatches > 0) {
      score += Math.min(kwMatches * 5, 20);
      reasons.push(`Keywords: ${matchedKws.join(", ")}`);
    }
  }

  // 4. Coincidencia de categoría (peso bajo: +5)
  if (searchTerms.category) {
    const normSearchCat = normalizeText(searchTerms.category);
    if (normCategory.includes(normSearchCat) || normSearchCat.includes(normCategory)) {
      score += 5;
      reasons.push(`Categoría similar`);
    }
  }

  return { score: Math.min(score, 95), reasons };
}

async function searchProductsByPartialMatch(
  visionData: Record<string, unknown>,
  authHeader: string
): Promise<Array<{ product: Record<string, unknown>; score: number; matchReasons: string[] }>> {
  const brand = (visionData.brand || visionData.detectedBrand || "") as string;
  const productName = (visionData.productName || "") as string;
  const keywords = (visionData.keywords || visionData.detectedFeatures || []) as string[];
  const category = (visionData.category || visionData.suggestedCategory || "") as string;

  if (!brand && !productName && keywords.length === 0) {
    return [];
  }

  // Construir términos de búsqueda únicos
  const searchQueries = new Set<string>();
  
  // Buscar por marca (prioridad alta)
  if (brand) searchQueries.add(brand.toLowerCase());
  
  // Buscar por palabras clave del nombre del producto
  if (productName) {
    // Agregar el nombre completo
    searchQueries.add(productName.toLowerCase());
    // También buscar por palabras individuales significativas (>3 chars)
    const words = productName.split(/\s+/).filter(w => w.length > 3);
    for (const word of words) {
      searchQueries.add(word.toLowerCase());
    }
  }

  // Buscar por keywords relevantes
  for (const kw of keywords) {
    if (kw.length > 3) {
      searchQueries.add(kw.toLowerCase());
    }
  }

  console.log('🔍 Búsqueda parcial - Términos:', Array.from(searchQueries));

  // Hacer búsquedas al backend por cada término
  const allProducts = new Map<string, { product: Record<string, unknown>; score: number; matchReasons: string[] }>();

  for (const query of Array.from(searchQueries).slice(0, 5)) { // Limitar a 5 búsquedas
    try {
      const searchUrl = `${BACKEND_API_URL}/products?search=${encodeURIComponent(query)}&limit=10`;
      const response = await fetch(searchUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authHeader,
        },
      });

      if (!response.ok) continue;

      const data = await response.json();
      const products = data.data?.products || data.products || [];

      for (const product of products) {
        const productId = product.id || product.prodVirtaId || product._id;
        if (!productId) continue;

        // Calcular score de coincidencia parcial
        const { score, reasons } = calculatePartialScore(
          product.name || product.nombre || "",
          product.brand || product.marca || "",
          product.category || product.categoria || "",
          { brand, productName, keywords, category }
        );

        // Solo incluir si tiene al menos un match razonable
        if (score >= 15) {
          const existing = allProducts.get(productId);
          if (!existing || existing.score < score) {
            allProducts.set(productId, {
              product: {
                id: productId,
                prodVirtaId: product.prodVirtaId || productId,
                nombre: product.name || product.nombre || "Sin nombre",
                codigo: product.sku || product.codigo || "",
                precio: product.price || product.precio || 0,
                categoria: product.category || product.categoria || "",
                marca: product.brand || product.marca || "",
                imagen: product.images?.[0] || product.imagen || "",
              },
              score,
              matchReasons: reasons,
            });
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️ Error buscando "${query}":`, error);
    }
  }

  // Ordenar por score descendente
  const sortedResults = Array.from(allProducts.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 10); // Máximo 10 resultados

  console.log(`🔍 Búsqueda parcial encontró ${sortedResults.length} coincidencias parciales`);
  return sortedResults;
}

export async function POST(request: NextRequest) {
  try {
    // Obtener token del header
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          error: "No autorizado",
          message: "Se requiere autenticación",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { images, useAI = true } = body as { images: ImageInput[]; useAI?: boolean };

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Se requiere un array de imágenes",
          summary: { total: 0, successful: 0, failed: 0 },
        },
        { status: 400 }
      );
    }

    // Procesar cada imagen
    const results: ProductMatchResult[] = [];
    const errors: ErrorResult[] = [];

    for (const image of images) {
      const startTime = Date.now();

      try {
        // Llamar al backend pasando el token y el parámetro useAI
        const response = await fetch(`${BACKEND_API_URL}/product-images`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": authHeader, // Pasar el token al backend
          },
          body: JSON.stringify({
            imageUrl: image.imageUrl,
            metadata: image.metadata,
            useAI, // 🎯 Pasar el parámetro useAI al backend
          }),
        });

        if (!response.ok) {
          throw new Error(`Backend respondió con ${response.status}`);
        }

        const data = await response.json();

        // Log para debugging - ver qué devuelve el backend
        console.log('🔍 Respuesta del backend:', JSON.stringify(data, null, 2));

        // Extraer el primer resultado del array results
        const result = data.results?.[0] || {};

        let matchedProduct = result.matchedProduct || null;
        let matchScore = result.matchScore || 0;
        let allMatches = result.allMatches || [];
        const visionData = result.visionData || {};

        // 🔍 FALLBACK: Si no hay match, buscar por partes del nombre/marca/keywords
        if (!matchedProduct && visionData && Object.keys(visionData).length > 0) {
          console.log('🔄 No hubo match directo, intentando búsqueda parcial...');
          
          try {
            const partialMatches = await searchProductsByPartialMatch(visionData, authHeader);
            
            if (partialMatches.length > 0) {
              console.log(`✅ Búsqueda parcial encontró ${partialMatches.length} candidatos`);
              
              // Si el mejor candidato tiene buen score (>=40), sugerirlo como match
              if (partialMatches[0].score >= 40) {
                matchedProduct = partialMatches[0].product;
                matchScore = partialMatches[0].score;
              }
              
              // Agregar todos los candidatos parciales a allMatches
              allMatches = partialMatches.map(pm => ({
                product: pm.product,
                score: pm.score,
                matchReasons: pm.matchReasons,
              }));
            }
          } catch (fallbackError) {
            console.warn('⚠️ Error en búsqueda parcial fallback:', fallbackError);
            // No fallar por esto, continuar sin matches parciales
          }
        }

        results.push({
          imageUrl: image.imageUrl,
          matchScore,
          matchedProduct,
          visionData,
          allMatches,
          processingTime: Date.now() - startTime,
        });
      } catch (error) {
        console.error(`Error procesando imagen ${image.imageUrl}:`, error);
        
        errors.push({
          imageUrl: image.imageUrl,
          error: error instanceof Error ? error.message : "Error desconocido",
          message: "No se pudo procesar la imagen. Intenta de nuevo.",
        });
      }
    }

    // Calcular resumen
    const summary = {
      total: images.length,
      successful: results.length,
      failed: errors.length,
    };

    return NextResponse.json({
      success: summary.successful > 0,
      summary,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error en endpoint product-images:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
