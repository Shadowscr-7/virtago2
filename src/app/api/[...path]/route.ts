import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://virtago-backend.vercel.app';

/**
 * Whitelist de prefijos de path permitidos.
 * Solo estos paths serán proxied al backend. Todo lo demás retorna 403.
 */
const ALLOWED_PATH_PREFIXES = [
  'auth',
  'users',
  'products',
  'clients',
  'categories',
  'brands',
  'subcategories',
  'prices',
  'price-lists',
  'discounts',
  'orders',
  'dashboard',
  'onboarding',
  'distributors',
  'plans',
  'sync',
  'export',
  'imports',
  'redoc',
  'docs',
];

/**
 * Paths públicos que no requieren Authorization header.
 * Todo lo demás requiere un token Bearer válido.
 */
const PUBLIC_PATH_PREFIXES = [
  'auth/login',
  'auth/register',
  'auth/verify',
  'auth/resend',
  'auth/forgot',
  'auth/reset',
  'redoc',
  'docs',
];

/**
 * Límite máximo del body en bytes (5 MB)
 */
const MAX_BODY_SIZE = 5 * 1024 * 1024;

function isPathAllowed(pathString: string): boolean {
  return ALLOWED_PATH_PREFIXES.some(prefix => pathString.startsWith(prefix));
}

function isPublicPath(pathString: string): boolean {
  return PUBLIC_PATH_PREFIXES.some(prefix => pathString.startsWith(prefix));
}

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

    // 1. Validar que el path está en la whitelist
    if (!isPathAllowed(pathString)) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Path not allowed' },
        { status: 403 }
      );
    }

    // 2. Validar autenticación para paths no públicos
    if (!isPublicPath(pathString)) {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Authentication required' },
          { status: 401 }
        );
      }
    }

    const url = `${BACKEND_URL}/api/${pathString}`;
    
    // Obtener el search params de la URL original
    const searchParams = request.nextUrl.searchParams.toString();
    const fullUrl = searchParams ? `${url}?${searchParams}` : url;

    // Obtener headers de la petición original (solo los necesarios)
    const headers: Record<string, string> = {};
    const FORWARDED_HEADERS = ['authorization', 'content-type', 'accept', 'accept-language'];
    for (const headerName of FORWARDED_HEADERS) {
      const value = request.headers.get(headerName);
      if (value) {
        headers[headerName] = value;
      }
    }

    // Obtener el body si existe, con límite de tamaño
    let body: string | undefined;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        const rawBody = await request.text();
        if (rawBody.length > MAX_BODY_SIZE) {
          return NextResponse.json(
            { error: 'Payload too large', message: `Body exceeds ${MAX_BODY_SIZE / 1024 / 1024}MB limit` },
            { status: 413 }
          );
        }
        body = rawBody;
        if (!headers['content-type']) {
          headers['content-type'] = 'application/json';
        }
      } catch {
        // No hay body o no se puede leer
      }
    }

    // Hacer la petición al backend
    const response = await fetch(fullUrl, {
      method,
      headers,
      body,
    });

    // Obtener la respuesta como texto
    const responseText = await response.text();

    // Crear los headers de respuesta (solo los seguros)
    const responseHeaders = new Headers();
    const SAFE_RESPONSE_HEADERS = ['content-type', 'cache-control', 'x-request-id'];
    for (const headerName of SAFE_RESPONSE_HEADERS) {
      const value = response.headers.get(headerName);
      if (value) {
        responseHeaders.set(headerName, value);
      }
    }

    return new NextResponse(responseText, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('[API Proxy] Error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Proxy error', message: 'Internal proxy error' },
      { status: 500 }
    );
  }
}
