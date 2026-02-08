import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración del puerto (también se puede usar -p en el comando)
  env: {
    PORT: process.env.PORT || '3002',
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
      // API proxy - Todas las rutas /api/* van al backend
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
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
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
