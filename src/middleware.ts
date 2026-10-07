import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isApi = request.nextUrl.pathname.startsWith('/api/');
  const development = process.env.NODE_ENV !== 'production';
  const nonce = btoa(crypto.randomUUID());
  const csp = isApi ? "default-src 'none'; frame-ancestors 'none'; base-uri 'none'" : [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'", "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.mapbox.com${development ? ' ws: http:' : ''}`,
    "worker-src 'self'", "frame-ancestors 'none'", "base-uri 'self'", "form-action 'self'",
  ].join('; ');
  const forwarded = new Headers(request.headers);
  forwarded.set('x-nonce', nonce);
  forwarded.set('Content-Security-Policy', csp);
  const response = NextResponse.next({ request: { headers: forwarded } });
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(self), geolocation=(self)');
  if (process.env.NODE_ENV === 'production') response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  if (isApi || request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/appointments')) {
    response.headers.set('Cache-Control', 'private, no-store');
  }
  if (request.nextUrl.pathname.startsWith('/admin') || isApi) response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  // Same-origin application: no wildcard CORS or credentials exposed to other sites.
  return response;
}
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)'],
};
