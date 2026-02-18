import { NextRequest, NextResponse } from 'next/server';

// Países permitidos (código ISO 3166-1 alpha-2)
const ALLOWED_COUNTRIES = ['UY'];

export function middleware(request: NextRequest) {
  // Obtener el país del visitante (Vercel lo proporciona automáticamente)
  const country = request.geo?.country || request.headers.get('x-vercel-ip-country') || '';

  // En desarrollo local no hay header de país, permitir acceso
  if (!country || process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  // Si el país está permitido, continuar normalmente
  if (ALLOWED_COUNTRIES.includes(country)) {
    return NextResponse.next();
  }

  // Si ya está en la página de bloqueo, no redirigir (evitar loop)
  if (request.nextUrl.pathname === '/geo-blocked') {
    return NextResponse.next();
  }

  // Bloquear: redirigir a página de "no disponible"
  const url = request.nextUrl.clone();
  url.pathname = '/geo-blocked';
  return NextResponse.rewrite(url);
}

export const config = {
  // Aplicar a todas las rutas excepto archivos estáticos internos de Next.js
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|templates).*)',
  ],
};
