import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { serverDatabase } from './server-database';

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
  if (!secret || secret.length < 32) return null;
  if (process.env.NODE_ENV === 'production') {
    if (!adminUserIds().length) return null;
  } else if (!adminUserIds().length && (!password || password.length < 16)) return null;
  // Rotating either setting invalidates existing cookies.
  return createHmac('sha256', secret).update(password || 'individual-mfa-administration').digest();
}

export function adminUserIds(): string[] {
  return (process.env.ADMIN_USER_IDS || '').split(',').map(id => id.trim())
    .filter(id => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id));
}

export function adminConfigured(): boolean {
  return signingKey() !== null;
}

export function passwordMatches(password: string): boolean {
  if (process.env.NODE_ENV === 'production' || !process.env.ADMIN_PASSWORD
    || !adminConfigured() || typeof password !== 'string') return false;
  const hash = (value: string) => createHash('sha256').update(value).digest();
  return timingSafeEqual(hash(password), hash(process.env.ADMIN_PASSWORD!));
}

export function issueAdminToken(now = Date.now(), subject = 'local-admin'): string {
  const key = signingKey();
  if (!key) throw new AdminAuthError(503, 'Administration indisponible.');
  const payload = Buffer.from(JSON.stringify({
    role: 'admin', subject, exp: Math.floor(now / 1000) + ADMIN_SESSION_SECONDS, nonce: randomUUID(),
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
    const allowed = process.env.NODE_ENV !== 'production' && session.subject === 'local-admin'
      || adminUserIds().includes(session.subject);
    return allowed && session.role === 'admin' && Number.isInteger(session.exp)
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
  await verifiedAdminSession();
}

async function verifiedAdminSession(): Promise<{ subject: string; nonce: string; exp: number }> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!validAdminToken(token)) throw new AdminAuthError(401, 'Connexion administrateur requise.');
  if (!await adminSessionLive(token!)) throw new AdminAuthError(401, 'Session administrateur révoquée.');
  return payloadOf(token!);
}

export async function currentAdminSessionId(): Promise<string | null> {
  const session = await verifiedAdminSession();
  return session.subject === 'local-admin' ? null : session.nonce;
}

function payloadOf(token: string): { subject: string; nonce: string; exp: number } {
  return JSON.parse(Buffer.from(token.split('.')[0], 'base64url').toString('utf8'));
}

export async function registerAdminSession(token: string): Promise<void> {
  const payload = payloadOf(token);
  if (payload.subject === 'local-admin' && process.env.NODE_ENV !== 'production') return;
  const { error } = await serverDatabase().from('admin_sessions').insert({
    id: payload.nonce, operator_id: payload.subject, expires_at: new Date(payload.exp * 1000).toISOString(),
  });
  if (error) throw new AdminAuthError(503, 'Administration indisponible.');
}

export async function adminSessionLive(token: string): Promise<boolean> {
  if (!validAdminToken(token)) return false;
  const payload = payloadOf(token);
  if (payload.subject === 'local-admin' && process.env.NODE_ENV !== 'production') return true;
  try {
    const { data, error } = await serverDatabase().from('admin_sessions').select('id')
      .eq('id', payload.nonce).eq('operator_id', payload.subject).is('revoked_at', null)
      .gt('expires_at', new Date().toISOString()).maybeSingle();
    return !error && Boolean(data);
  } catch { return false; }
}

export async function revokeAdminSession(token: string | undefined): Promise<void> {
  if (!validAdminToken(token)) return;
  const payload = payloadOf(token!);
  if (payload.subject === 'local-admin' && process.env.NODE_ENV !== 'production') return;
  const { error } = await serverDatabase().from('admin_sessions').update({ revoked_at: new Date().toISOString() }).eq('id', payload.nonce);
  if (error) throw new AdminAuthError(503, 'Déconnexion indisponible.');
}

export async function currentAdminId(): Promise<string | null> {
  const { subject } = await verifiedAdminSession();
  return subject === 'local-admin' ? null : subject;
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
