/**
 * API Route: Analizar una imagen de producto con IA
 * POST /api/images/analyze
 * 
 * Recibe una imagen y devuelve información extraída automáticamente:
 * - Nombre del producto
 * - Marca
 * - Categoría
 * - Especificaciones técnicas
 * - Descripción
 * - Tags
 * - Calidad de imagen
 * - Sugerencias de productos similares
 */

import { NextRequest, NextResponse } from "next/server";
import { getVisionService } from "@/services/image-vision.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface AnalyzeImageRequest {
  imageUrl?: string;
  imageBase64?: string;
  productContext?: {
    existingProducts?: Array<{ sku: string; name: string; brand: string }>;
    categories?: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as AnalyzeImageRequest;
    const { imageUrl, imageBase64, productContext } = body;

    // Validar que se proporcione una imagen
    if (!imageUrl && !imageBase64) {
      return NextResponse.json(
        {
          success: false,
          error: "Se requiere imageUrl o imageBase64",
        },
        { status: 400 }
      );
    }

    // Obtener el servicio de visión
    const visionService = getVisionService();

    // Usar la URL o base64 proporcionada
    const imageSource = imageUrl || imageBase64!;

    // Analizar la imagen
    const analysis = await visionService.analyzeProductImage(
      imageSource,
      productContext
    );

    return NextResponse.json({
      success: true,
      data: analysis,
      message: "Imagen analizada exitosamente",
    });
  } catch (error) {
    console.error("Error en /api/images/analyze:", error);

    // Manejar errores específicos
    if (error instanceof Error) {
      if (error.message.includes("OPENAI_API_KEY")) {
        return NextResponse.json(
          {
            success: false,
            error: "API key no configurada",
            message:
              "Por favor configura OPENAI_API_KEY en el archivo .env.local",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Error al analizar la imagen",
      },
      { status: 500 }
    );
  }
}

// Método GET para verificar que el endpoint está activo
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/images/analyze",
    method: "POST",
    description: "Analiza una imagen de producto con IA",
    requiredFields: {
      imageUrl: "URL de la imagen (opcional si se proporciona imageBase64)",
      imageBase64: "Imagen en formato base64 (opcional si se proporciona imageUrl)",
    },
    optionalFields: {
      productContext: {
        existingProducts: "Array de productos existentes para comparar",
        categories: "Array de categorías disponibles",
      },
    },
    exampleRequest: {
      imageUrl: "https://example.com/product-image.jpg",
      productContext: {
        existingProducts: [
          {
            sku: "SKU-001",
            name: "iPhone 15 Pro Max",
            brand: "Apple",
          },
        ],
        categories: ["Smartphones", "Electrónica", "Apple"],
      },
    },
  });
}
