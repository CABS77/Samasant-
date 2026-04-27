import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'samasante2026';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (password === ADMIN_PASSWORD) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: 'Mot de passe incorrect' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
