import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ADMIN_COOKIE, AdminAuthError, adminConfigured, adminCookieOptions, adminSessionLive, adminUserIds,
  allowAdminLogin, issueAdminToken, passwordMatches, requireSameOrigin, registerAdminSession, revokeAdminSession } from '@/lib/admin-auth';
import { clientAddress, consumeQuota, QuotaExceededError, ServiceUnavailableError } from '@/lib/service-quota';
import { serverDatabase } from '@/lib/server-database';

export const runtime = 'nodejs';
const noStore = { 'Cache-Control': 'no-store' };
const LoginSchema = z.union([
  z.object({ password: z.string().min(1).max(512) }).strict(),
  z.object({ accessToken: z.string().min(20).max(12000) }).strict(),
]);
export async function GET(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  return NextResponse.json({ authenticated: Boolean(token && await adminSessionLive(token)),
    authenticationMode: process.env.NODE_ENV === 'production' || adminUserIds().length ? 'mfa' : 'local' }, { headers: noStore });
}
export async function DELETE(request: NextRequest) {
  try {
    requireSameOrigin(request);
    await revokeAdminSession(request.cookies.get(ADMIN_COOKIE)?.value);
    const response = NextResponse.json({ success: true }, { headers: noStore });
    response.cookies.set(ADMIN_COOKIE, '', { ...adminCookieOptions, maxAge: 0 });
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Déconnexion indisponible.' }, { status: error instanceof AdminAuthError ? error.status : 503, headers: noStore });
  }
}
export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    if (!adminConfigured()) throw new AdminAuthError(503, 'Administration indisponible.');
    const address = clientAddress(request.headers);
    if (!allowAdminLogin(address)) throw new QuotaExceededError(900);
    await consumeQuota('login', address);
    const parsed = LoginSchema.safeParse(await request.json());
    if (!parsed.success) throw new AdminAuthError(400, 'Connexion invalide.');
    let subject = 'local-admin';
    if ('accessToken' in parsed.data) {
      const { data, error } = await serverDatabase().auth.getUser(parsed.data.accessToken);
      if (error || !data.user) throw new AdminAuthError(401, 'Session expirée.');
      if (!adminUserIds().includes(data.user.id)) throw new AdminAuthError(403, 'Compte sans droit d’administration.');
      // getUser has verified this token's signature with Auth before inspecting assurance.
      const claims = JSON.parse(Buffer.from(parsed.data.accessToken.split('.')[1], 'base64url').toString('utf8'));
      if (claims.aal !== 'aal2' || claims.sub !== data.user.id) throw new AdminAuthError(403, 'Double authentification requise.');
      subject = data.user.id;
    } else if (!passwordMatches(parsed.data.password)) throw new AdminAuthError(401, 'Connexion refusée.');
    const token = issueAdminToken(Date.now(), subject);
    await registerAdminSession(token);
    const response = NextResponse.json({ success: true }, { headers: noStore });
    response.cookies.set(ADMIN_COOKIE, token, adminCookieOptions);
    return response;
  } catch (error) {
    if (error instanceof QuotaExceededError) return NextResponse.json({ error: error.message }, { status: 429, headers: { ...noStore, 'Retry-After': String(error.retryAfter) } });
    const status = error instanceof AdminAuthError ? error.status : error instanceof ServiceUnavailableError ? 503 : 400;
    return NextResponse.json({ error: error instanceof AdminAuthError ? error.message : 'Connexion indisponible.' }, { status, headers: noStore });
  }
}
