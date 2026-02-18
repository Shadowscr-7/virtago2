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
  allMatches: Array<{ product: Record<string, unknown>; score: number }>;
  processingTime: number;
}

interface ErrorResult {
  imageUrl: string;
  error: string;
  message: string;
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

        results.push({
          imageUrl: image.imageUrl,
          matchScore: result.matchScore || 0,
          matchedProduct: result.matchedProduct || null,
          visionData: result.visionData || {},
          allMatches: result.allMatches || [],
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
