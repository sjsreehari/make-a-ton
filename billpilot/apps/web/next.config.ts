import type { NextConfig } from "next";

const API_TARGET = process.env.API_DEV_TARGET ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_TARGET}/api/:path*`,
      },
    ];
  },
  devIndicators: false,
  images: { unoptimized: true },
  trailingSlash: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
