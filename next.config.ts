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
    value: "frame-ancestors 'self' https://www.weblaunchacademy.com https://*.weblaunchacademy.com;",
  },
];

const nextConfig: NextConfig = {
  // Image optimization enabled (removed unoptimized: true) — Next.js will
  // now serve correctly-sized, compressed images via /_next/image
  compress: true,
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
