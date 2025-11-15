/**
 * API Route: Asignar Imagen a Producto
 * Endpoint para asignar una imagen aprobada a un producto específico
 */

import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, prodVirtaId, visionData, metadata } = body;

    // Validar campos requeridos
    if (!imageUrl || !prodVirtaId) {
      return NextResponse.json(
        {
          success: false,
          error: "imageUrl y prodVirtaId son requeridos",
        },
        { status: 400 }
      );
    }

    // Obtener token de autorización
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "No autorizado - Token requerido",
        },
        { status: 401 }
      );
    }

    // Llamar al backend
    const response = await fetch(`${API_URL}/product-images/assign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        imageUrl,
        prodVirtaId,
        visionData: visionData || {},
        metadata: metadata || {},
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: errorData.message || `Error del backend: ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: "Imagen asignada exitosamente",
      data,
    });
  } catch (error) {
    console.error("Error en /api/product-images/assign:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
