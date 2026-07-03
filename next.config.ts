import type { NextConfig } from "next";

const securityHeaders = [
  // X-Frame-Options removed — framing is controlled via CSP frame-ancestors below
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'self' https://www.weblaunchacademy.com http://localhost:*",
  },
];

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
  // Note: swcMinify is enabled by default in Next.js 13+
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
