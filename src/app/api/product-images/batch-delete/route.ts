/**
 * API Route: Eliminar Imágenes en Lote
 * Endpoint para eliminar múltiples imágenes
 */

import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageIds } = body;

    // Validar campos requeridos
    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "imageIds es requerido y debe ser un array no vacío",
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
    const response = await fetch(`${API_URL}/product-images/batch-delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ imageIds }),
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

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en /api/product-images/batch-delete:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
