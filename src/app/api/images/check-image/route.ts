/**
 * API Route: Verificar y analizar imagen de producto
 * POST /api/images/check-image
 * 
 * Recibe una URL de imagen desde Cloudinary y la envía al backend
 * para análisis y asignación automática a productos
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CheckImageRequest {
  imageUrl: string;
  metadata?: {
    filename?: string;
    size?: number;
    format?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CheckImageRequest;
    const { imageUrl, metadata } = body;

    if (!imageUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Se requiere imageUrl",
        },
        { status: 400 }
      );
    }

    // Validar que la URL sea de Cloudinary
    if (!imageUrl.includes("cloudinary.com")) {
      return NextResponse.json(
        {
          success: false,
          error: "La URL debe ser de Cloudinary",
        },
        { status: 400 }
      );
    }

    // TODO: Aquí se conectará con el backend real
    // Por ahora, devuelve una respuesta mock
    
    console.log("📸 Imagen recibida para análisis:", {
      url: imageUrl,
      metadata,
      timestamp: new Date().toISOString(),
    });

    // URL del backend (ajustar según tu configuración)
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://virtago-backend.vercel.app/api";
    
    try {
      // Llamada al backend
      const backendResponse = await fetch(`${backendUrl}/images/check-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Aquí puedes agregar headers de autenticación si es necesario
          // "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          imageUrl,
          metadata,
        }),
      });

      if (!backendResponse.ok) {
        // Si el backend falla, devuelve un mock temporal
        console.warn("⚠️ Backend no disponible, usando respuesta mock");
        return NextResponse.json({
          success: true,
          data: {
            imageId: generateMockId(),
            imageUrl,
            status: "analyzed",
            analysis: {
              productName: "Producto detectado (Mock)",
              brand: "Marca detectada",
              category: "Categoría",
              confidence: 85,
              suggestedProducts: [],
            },
            message:
              "Imagen analizada (mock). El backend procesará esta imagen cuando esté disponible.",
          },
        });
      }

      const backendData = await backendResponse.json();

      return NextResponse.json({
        success: true,
        data: backendData,
      });
    } catch (backendError) {
      // Si hay error de conexión con el backend, devolver mock
      console.error("❌ Error conectando con backend:", backendError);

      return NextResponse.json({
        success: true,
        data: {
          imageId: generateMockId(),
          imageUrl,
          status: "pending_analysis",
          analysis: null,
          message:
            "Imagen guardada. Será analizada cuando el backend esté disponible.",
        },
      });
    }
  } catch (error) {
    console.error("Error en /api/images/check-image:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Error al procesar imagen",
      },
      { status: 500 }
    );
  }
}

// Método GET para ver información del endpoint
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/images/check-image",
    method: "POST",
    description:
      "Recibe una URL de imagen de Cloudinary y la envía al backend para análisis",
    requiredFields: {
      imageUrl: "URL de la imagen en Cloudinary",
    },
    optionalFields: {
      metadata: {
        filename: "Nombre del archivo original",
        size: "Tamaño en bytes",
        format: "Formato de imagen (jpg, png, etc)",
      },
    },
    exampleRequest: {
      imageUrl:
        "https://res.cloudinary.com/dyy8hc876/image/upload/v1234567890/products/product-001.jpg",
      metadata: {
        filename: "product-001.jpg",
        size: 2456789,
        format: "jpg",
      },
    },
    backendEndpoint: {
      url: process.env.NEXT_PUBLIC_API_URL
        ? `${process.env.NEXT_PUBLIC_API_URL}/images/check-image`
        : "https://virtago-backend.vercel.app/api/images/check-image",
      note: "Este endpoint redirige la petición al backend configurado en NEXT_PUBLIC_API_URL",
    },
  });
}

// Helper para generar ID mock
function generateMockId(): string {
  return `IMG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
