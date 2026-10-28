import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySession } from '@/lib/auth';

const requests = new Map<string, { count: number; resetAt: number }>();

// Limits per route group (requests per 60 seconds per IP)
const RATE_LIMITS: Record<string, number> = {
  '/api/bookings':    10,
  '/api/clients':     10,
  '/api/contact':     10,
  '/api/newsletter':  15,
  '/api/testimonials': 15,
  '/admin/login':        10, // password guesses and reset-link requests
  '/admin/set-password': 10,
};
const DEFAULT_LIMIT = 60;
// Client self-service pages (/booking/<token>): cancel, reschedule, slot lookups
const BOOKING_MANAGE_LIMIT = 20;
// Reachable without a session: sign-in and the set-password link from an invite/reset email
const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/set-password'];
const WINDOW_MS = 60_000;

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Everything under /admin except the login page needs a valid signed session.
  // NOTE: this gates page ROUTES only. Server actions authorise themselves via
  // requireSession() in lib/admin/actions.ts.
  if (pathname.startsWith('/admin') && !PUBLIC_ADMIN_PATHS.includes(pathname)) {
    const ok = await verifySession(request.cookies.get(SESSION_COOKIE_NAME)?.value);
    if (!ok) return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (request.method !== 'POST') return NextResponse.next();
  const limit = RATE_LIMITS[pathname] ?? (pathname.startsWith('/booking/') ? BOOKING_MANAGE_LIMIT : DEFAULT_LIMIT);

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
  matcher: ['/api/bookings', '/api/clients', '/api/contact', '/api/newsletter', '/api/testimonials', '/admin/:path*', '/booking/:path*'],
};
