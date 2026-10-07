import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'samasante_admin';
export const ADMIN_SESSION_SECONDS = 60 * 60;

export class AdminAuthError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

function signingKey(): Buffer | null {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!password || password.length < 16 || !secret || secret.length < 32) return null;
  // Rotating either setting invalidates existing cookies.
  return createHmac('sha256', secret).update(password).digest();
}

export function adminConfigured(): boolean {
  return signingKey() !== null;
}

export function passwordMatches(password: string): boolean {
  if (!adminConfigured() || typeof password !== 'string') return false;
  const hash = (value: string) => createHash('sha256').update(value).digest();
  return timingSafeEqual(hash(password), hash(process.env.ADMIN_PASSWORD!));
}

export function issueAdminToken(now = Date.now()): string {
  const key = signingKey();
  if (!key) throw new AdminAuthError(503, 'Administration indisponible.');
  const payload = Buffer.from(JSON.stringify({
    role: 'admin', exp: Math.floor(now / 1000) + ADMIN_SESSION_SECONDS, nonce: randomUUID(),
  })).toString('base64url');
  return `${payload}.${createHmac('sha256', key).update(payload).digest('base64url')}`;
}

export function validAdminToken(token: string | undefined, now = Date.now()): boolean {
  const key = signingKey();
  if (!key || !token || token.length > 1024) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [payload, signature] = parts;
    const expected = createHmac('sha256', key).update(payload).digest();
    const actual = Buffer.from(signature, 'base64url');
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return false;
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    const seconds = Math.floor(now / 1000);
    return session.role === 'admin' && Number.isInteger(session.exp)
      && session.exp > seconds && session.exp <= seconds + ADMIN_SESSION_SECONDS;
  } catch {
    return false;
  }
}

export const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: ADMIN_SESSION_SECONDS,
};

export async function requireAdmin(): Promise<void> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!validAdminToken(token)) throw new AdminAuthError(401, 'Connexion administrateur requise.');
}

export function requireSameOrigin(request: Request): void {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) {
    throw new AdminAuthError(403, 'Origine non autorisée.');
  }
}

// Defense in depth within one instance; use an edge/distributed limiter in production too.
const attempts = new Map<string, { count: number; expires: number }>();
export function allowAdminLogin(identifier: string, now = Date.now()): boolean {
  for (const [key, entry] of attempts) if (entry.expires <= now) attempts.delete(key);
  const entry = attempts.get(identifier);
  if (!entry) {
    if (attempts.size >= 1000) return false;
    attempts.set(identifier, { count: 1, expires: now + 15 * 60 * 1000 });
    return true;
  }
  return ++entry.count <= 5;
}
