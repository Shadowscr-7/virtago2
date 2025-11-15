/**
 * API Route: Obtener Imágenes del Distribuidor
 * Endpoint para obtener todas las imágenes del distribuidor con paginación
 */

import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export async function GET(request: NextRequest) {
  try {
    // Obtener parámetros de paginación
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "20";
    const assignmentFilter = searchParams.get("assignmentFilter") || ""; // 🎯 Cambiado de 'status' a 'assignmentFilter'
    const search = searchParams.get("search") || "";

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

    // Construir URL con parámetros
    const url = new URL(`${API_URL}/product-images/my-distributor`);
    url.searchParams.set("page", page);
    url.searchParams.set("limit", limit);
    if (assignmentFilter) url.searchParams.set("assignmentFilter", assignmentFilter); // 🎯 Enviar assignmentFilter al backend
    if (search) url.searchParams.set("search", search);

    // Llamar al backend
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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
    console.error("Error en /api/product-images/my-distributor:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
