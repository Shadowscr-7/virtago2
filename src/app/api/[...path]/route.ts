import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://virtago-backend.vercel.app';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'DELETE');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'PATCH');
}

async function proxyRequest(
  request: NextRequest,
  path: string[],
  method: string
) {
  try {
    const pathString = path.join('/');
    const url = `${BACKEND_URL}/api/${pathString}`;
    
    // Obtener el search params de la URL original
    const searchParams = request.nextUrl.searchParams.toString();
    const fullUrl = searchParams ? `${url}?${searchParams}` : url;

    console.log(`[API Proxy] ${method} ${fullUrl}`);

    // Obtener headers de la petición original
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      // Excluir headers que no deben ser reenviados
      if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });

    // Obtener el body si existe
    let body: string | undefined;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        const jsonBody = await request.json();
        body = JSON.stringify(jsonBody);
        headers['content-type'] = 'application/json';
      } catch {
        // No hay body o no es JSON
      }
    }

    // Hacer la petición al backend
    const response = await fetch(fullUrl, {
      method,
      headers,
      body,
    });

    // Obtener la respuesta como texto primero
    const responseText = await response.text();
    
    console.log(`[API Proxy] ${method} ${fullUrl} - Status: ${response.status}`);
    console.log(`[API Proxy] Response body:`, responseText);

    // Intentar parsear como JSON para logging
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log(`[API Proxy] Parsed JSON:`, responseData);
    } catch {
      console.log(`[API Proxy] Response is not JSON`);
    }

    // Crear los headers de respuesta
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });

    // IMPORTANTE: Siempre devolver la respuesta, incluso si es error
    // Esto permite que el cliente maneje el error apropiadamente
    return new NextResponse(responseText, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('[API Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Proxy error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
