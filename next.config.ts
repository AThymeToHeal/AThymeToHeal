import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // Enable compression
  compress: true,
  // Optimize production builds
  productionBrowserSourceMaps: false,
  // Enable React strict mode for better performance
  reactStrictMode: true,
  // Minimize JavaScript
  swcMinify: true,
};

export default nextConfig;
