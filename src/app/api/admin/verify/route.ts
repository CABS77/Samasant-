import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, AdminAuthError, adminConfigured, adminCookieOptions,
  allowAdminLogin, issueAdminToken, passwordMatches, requireSameOrigin, validAdminToken } from '@/lib/admin-auth';
import { z } from 'zod';

export const runtime = 'nodejs';

const LoginSchema = z.object({ password: z.string().min(1).max(512) });

export async function GET(request: NextRequest) {
  return NextResponse.json({ authenticated: validAdminToken(request.cookies.get(ADMIN_COOKIE)?.value) },
    { headers: { 'Cache-Control': 'no-store' } });
}

export async function DELETE(request: NextRequest) {
  try {
    requireSameOrigin(request);
    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_COOKIE, '', { ...adminCookieOptions, maxAge: 0 });
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Origine non autorisée.' }, { status: error instanceof AdminAuthError ? error.status : 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    if (!adminConfigured()) return NextResponse.json({ error: 'Administration indisponible.' }, { status: 503 });
    const identifier = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
    if (!allowAdminLogin(identifier)) return NextResponse.json({ error: 'Trop de tentatives. Réessayez plus tard.' }, { status: 429 });
    const input = LoginSchema.safeParse(await request.json());
    if (!input.success) return NextResponse.json({ error: 'Mot de passe requis.' }, { status: 400 });

    if (passwordMatches(input.data.password)) {
      const response = NextResponse.json({ success: true });
      response.cookies.set(ADMIN_COOKIE, issueAdminToken(), adminCookieOptions);
      response.headers.set('Cache-Control', 'no-store');
      return response;
    }

    return NextResponse.json(
      { success: false, error: 'Mot de passe incorrect' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof AdminAuthError ? error.message : 'Requête invalide.' },
      { status: error instanceof AdminAuthError ? error.status : 400 }
    );
  }
}
