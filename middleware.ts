import { NextRequest, NextResponse } from 'next/server';

const requests = new Map<string, { count: number; resetAt: number }>();

// Limits per route group (requests per 60 seconds per IP)
const RATE_LIMITS: Record<string, number> = {
  '/api/bookings':    10,
  '/api/clients':     10,
  '/api/contact':     10,
  '/api/newsletter':  15,
  '/api/testimonials': 15,
};
const DEFAULT_LIMIT = 60;
const WINDOW_MS = 60_000;

export function middleware(request: NextRequest) {
  if (request.method !== 'POST') return NextResponse.next();

  const pathname = request.nextUrl.pathname;
  const limit = RATE_LIMITS[pathname] ?? DEFAULT_LIMIT;

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  const key = `${ip}:${pathname}`;
  const now = Date.now();

  const entry = requests.get(key) ?? { count: 0, resetAt: now + WINDOW_MS };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + WINDOW_MS;
  }
  entry.count++;
  requests.set(key, entry);

  if (entry.count > limit) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment and try again.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((entry.resetAt - now) / 1000)),
        },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/bookings', '/api/clients', '/api/contact', '/api/newsletter', '/api/testimonials'],
};
