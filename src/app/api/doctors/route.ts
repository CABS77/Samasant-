import { NextResponse } from 'next/server';
import { getAllDoctors, createDoctor } from '@/lib/doctor-store';
import { doctorCreateSchema } from '@/lib/doctor-validation';
import { AdminAuthError, requireAdmin, requireSameOrigin } from '@/lib/admin-auth';

// Force Node.js runtime (needed for fs operations in doctor-store)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const doctors = await getAllDoctors();
    return NextResponse.json(doctors, { headers: { 'Cache-Control': 'no-store', 'X-Directory-Mode': process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY ? 'live' : 'demo' } });
  } catch {
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des médecins' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    requireSameOrigin(request);
    const body = await request.json();
    const result = doctorCreateSchema.safeParse(body);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json(
        { error: 'Données invalides', details },
        { status: 400 }
      );
    }

    const doctor = await createDoctor(result.data);
    return NextResponse.json(doctor, { status: 201 });
  } catch (error) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json(
      { error: "Erreur serveur lors de la création du médecin" },
      { status: 500 }
    );
  }
}
