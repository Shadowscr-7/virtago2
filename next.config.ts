import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración del puerto (también se puede usar -p en el comando)
  env: {
    PORT: process.env.PORT || '3002',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    return [
      // Documentación de la API
      {
        source: '/redoc',
        destination: `${backendUrl}/redoc`,
      },
      {
        source: '/redoc-es',
        destination: `${backendUrl}/redoc-es`,
      },
      {
        source: '/docs',
        destination: `${backendUrl}/docs`,
      },
      // Archivos OpenAPI/Swagger
      {
        source: '/openapi.json',
        destination: `${backendUrl}/openapi.json`,
      },
      {
        source: '/swagger-en.json',
        destination: `${backendUrl}/swagger-en.json`,
      },
      {
        source: '/swagger-es.json',
        destination: `${backendUrl}/swagger-es.json`,
      },
      {
        source: '/swagger.json',
        destination: `${backendUrl}/swagger.json`,
      },
      // Recursos estáticos de la documentación
      {
        source: '/docs/:path*',
        destination: `${backendUrl}/docs/:path*`,
      },
      {
        source: '/redoc/:path*',
        destination: `${backendUrl}/redoc/:path*`,
      },
    ];
  },
};

export default nextConfig;
