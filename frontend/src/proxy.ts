import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV === 'development';

  // 'strict-dynamic' trusts scripts loaded by nonce-tagged scripts, removing the
  // need for 'unsafe-inline'. Dev adds 'unsafe-eval' for React HMR / source maps.
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://images.unsplash.com https://res.cloudinary.com",
    "font-src 'self'",
    "connect-src 'self' https://challenges.cloudflare.com https://*.railway.app http://localhost:8000",
    "frame-src https://challenges.cloudflare.com",
    "worker-src blob: 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    ...(!isDev ? ["upgrade-insecure-requests"] : []),
  ].join("; ");

  // Forward nonce in request headers so Next.js server components
  // (including the framework's own inline script injection) can read it.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Permissions-Policy', PERMISSIONS_POLICY);

  return response;
}

export const config = {
  matcher: [
    // Skip Next.js internals and static assets; apply to all other routes.
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
