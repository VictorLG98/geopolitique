import type { NextConfig } from "next";

// Content-Security-Policy
// Note: 'unsafe-inline' on script-src is required by Next.js hydration scripts.
// The proper upgrade path is CSP nonces via middleware, but adds significant complexity.
// 'unsafe-inline' on style-src is required by Tiptap's inline formatting styles.
// 'unsafe-eval' is required by React in development mode (source maps, HMR).
const isDev = process.env.NODE_ENV === 'development';

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://res.cloudinary.com",
  "font-src 'self' data:",
  "connect-src 'self' https://challenges.cloudflare.com https://*.onrender.com http://localhost:8000",
  "frame-src https://challenges.cloudflare.com",
  "worker-src blob: 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(!isDev ? ["upgrade-insecure-requests"] : []),
].join("; ");

const PERMISSIONS_POLICY = [
  "camera=()",
  "microphone=()",
  "geolocation=()",
  "payment=()",
  "usb=()",
  "interest-cohort=()",
  "accelerometer=()",
  "gyroscope=()",
  "magnetometer=()",
].join(", ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Content-Security-Policy", value: CSP },
          { key: "Permissions-Policy", value: PERMISSIONS_POLICY },
        ],
      },
    ];
  },
};

export default nextConfig;
