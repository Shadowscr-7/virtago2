/**
 * API Route: Encontrar productos coincidentes
 * POST /api/images/find-matches
 * 
 * Compara una imagen con el inventario de productos existentes
 * para encontrar coincidencias automáticamente.
 * Útil para auto-asignar imágenes a productos.
 */

import { NextRequest, NextResponse } from "next/server";
import { getVisionService } from "@/services/image-vision.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface FindMatchesRequest {
  imageUrl?: string;
  imageBase64?: string;
  existingProducts: Array<{
    sku: string;
    name: string;
    brand: string;
    category: string;
  }>;
  minSimilarity?: number; // Umbral mínimo de similitud (0-100)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as FindMatchesRequest;
    const { imageUrl, imageBase64, existingProducts, minSimilarity = 60 } = body;

    // Validar imagen
    if (!imageUrl && !imageBase64) {
      return NextResponse.json(
        {
          success: false,
          error: "Se requiere imageUrl o imageBase64",
        },
        { status: 400 }
      );
    }

    // Validar productos existentes
    if (!existingProducts || existingProducts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Se requiere al menos un producto en existingProducts",
        },
        { status: 400 }
      );
    }

    // Obtener el servicio de visión
    const visionService = getVisionService();

    // Usar la URL o base64 proporcionada
    const imageSource = imageUrl || imageBase64!;

    // Buscar coincidencias
    const matches = await visionService.findMatchingProducts(
      imageSource,
      existingProducts
    );

    // Filtrar por umbral mínimo de similitud
    const filteredMatches = matches.filter(
      (match) => match.similarity >= minSimilarity
    );

    return NextResponse.json({
      success: true,
      data: {
        matches: filteredMatches,
        totalMatches: filteredMatches.length,
        productsScanned: existingProducts.length,
        minSimilarity,
      },
      message:
        filteredMatches.length > 0
          ? `Se encontraron ${filteredMatches.length} productos coincidentes`
          : "No se encontraron productos coincidentes",
    });
  } catch (error) {
    console.error("Error en /api/images/find-matches:", error);

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
        error: "Error al buscar productos coincidentes",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/images/find-matches",
    method: "POST",
    description:
      "Encuentra productos en el inventario que coincidan con una imagen",
    requiredFields: {
      imageUrl: "URL de la imagen (opcional si se proporciona imageBase64)",
      imageBase64: "Imagen en base64 (opcional si se proporciona imageUrl)",
      existingProducts: "Array de productos para comparar",
    },
    optionalFields: {
      minSimilarity:
        "Umbral mínimo de similitud 0-100 (por defecto: 60)",
    },
    exampleRequest: {
      imageUrl: "https://example.com/unknown-product.jpg",
      existingProducts: [
        {
          sku: "SKU-001",
          name: "iPhone 15 Pro Max 256GB",
          brand: "Apple",
          category: "Smartphones",
        },
        {
          sku: "SKU-002",
          name: "Samsung Galaxy S24 Ultra",
          brand: "Samsung",
          category: "Smartphones",
        },
      ],
      minSimilarity: 70,
    },
  });
}
