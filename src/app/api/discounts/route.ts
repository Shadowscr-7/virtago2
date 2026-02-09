import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Obtener token de autorización
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "No autorizado - Token requerido" },
        { status: 401 }
      );
    }
    
    // Construir URL con parámetros
    const url = new URL(`${BACKEND_URL}/api/discounts`);
    
    // Parámetros de paginación
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "50";
    url.searchParams.set("page", page);
    url.searchParams.set("limit", limit);
    
    // Parámetros de filtrado
    const discountType = searchParams.get("discount_type");
    if (discountType) {
      url.searchParams.set("discount_type", discountType);
    }
    
    const status = searchParams.get("status");
    if (status) {
      url.searchParams.set("status", status);
    }
    
    // Parámetro de búsqueda
    const search = searchParams.get("search");
    if (search) {
      url.searchParams.set("search", search);
    }
    
    // Parámetros de ordenamiento
    const sortBy = searchParams.get("sortBy");
    if (sortBy) {
      url.searchParams.set("sortBy", sortBy);
    }
    
    const sortOrder = searchParams.get("sortOrder");
    if (sortOrder) {
      url.searchParams.set("sortOrder", sortOrder);
    }

    console.log('🔍 Fetching discounts from:', url.toString());

    // Llamar al backend
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error('❌ Backend error:', response.status, response.statusText);
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          success: false, 
          error: errorData.message || `Error del backend: ${response.status}` 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Discounts fetched successfully');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Error en /api/discounts:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Error desconocido" 
      },
      { status: 500 }
    );
  }
}
