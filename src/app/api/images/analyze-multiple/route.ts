/**
 * API Route: Analizar múltiples imágenes del mismo producto
 * POST /api/images/analyze-multiple
 * 
 * Recibe varias imágenes del mismo producto desde diferentes ángulos
 * y combina la información para crear un análisis más completo.
 */

import { NextRequest, NextResponse } from "next/server";
import { getVisionService } from "@/services/image-vision.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface AnalyzeMultipleRequest {
  imageUrls?: string[];
  imagesBase64?: string[];
  productContext?: {
    existingProducts?: Array<{ sku: string; name: string; brand: string }>;
    categories?: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as AnalyzeMultipleRequest;
    const { imageUrls, imagesBase64, productContext } = body;

    // Validar que se proporcionen imágenes
    if ((!imageUrls || imageUrls.length === 0) && (!imagesBase64 || imagesBase64.length === 0)) {
      return NextResponse.json(
        {
          success: false,
          error: "Se requiere al menos una imagen en imageUrls o imagesBase64",
        },
        { status: 400 }
      );
    }

    // Usar el array que esté disponible
    const images = imageUrls || imagesBase64!;

    // Limitar el número de imágenes para evitar costos excesivos
    const MAX_IMAGES = 5;
    if (images.length > MAX_IMAGES) {
      return NextResponse.json(
        {
          success: false,
          error: `Máximo ${MAX_IMAGES} imágenes permitidas por solicitud`,
        },
        { status: 400 }
      );
    }

    // Obtener el servicio de visión
    const visionService = getVisionService();

    // Analizar las imágenes
    const analysis = await visionService.analyzeMultipleProductImages(
      images,
      productContext
    );

    return NextResponse.json({
      success: true,
      data: analysis,
      imagesAnalyzed: images.length,
      message: `${images.length} imágenes analizadas exitosamente`,
    });
  } catch (error) {
    console.error("Error en /api/images/analyze-multiple:", error);

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
        error: "Error al analizar las imágenes",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/images/analyze-multiple",
    method: "POST",
    description: "Analiza múltiples imágenes del mismo producto",
    requiredFields: {
      imageUrls: "Array de URLs de imágenes (opcional si se proporciona imagesBase64)",
      imagesBase64: "Array de imágenes en base64 (opcional si se proporciona imageUrls)",
    },
    optionalFields: {
      productContext: {
        existingProducts: "Array de productos existentes",
        categories: "Array de categorías disponibles",
      },
    },
    limits: {
      maxImages: 5,
    },
    exampleRequest: {
      imageUrls: [
        "https://example.com/product-front.jpg",
        "https://example.com/product-back.jpg",
        "https://example.com/product-side.jpg",
      ],
      productContext: {
        categories: ["Electrónica", "Smartphones"],
      },
    },
  });
}
