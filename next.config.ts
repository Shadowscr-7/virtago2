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
    ],
  },
};

export default nextConfig;
