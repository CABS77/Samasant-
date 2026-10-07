import { NextResponse } from 'next/server';
import { updateDoctor, deleteDoctor, getDoctorById } from '@/lib/doctor-store';
import { doctorUpdateSchema } from '@/lib/doctor-validation';
import { AdminAuthError, requireAdmin, requireSameOrigin } from '@/lib/admin-auth';

// Force Node.js runtime (needed for fs operations in doctor-store)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    requireSameOrigin(request);
    const { id } = await params;
    const existing = await getDoctorById(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Médecin introuvable' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const result = doctorUpdateSchema.safeParse(body);

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

    const doctor = await updateDoctor(id, result.data);
    return NextResponse.json(doctor);
  } catch (error) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json(
      { error: 'Erreur serveur lors de la mise à jour du médecin' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    requireSameOrigin(request);
    const { id } = await params;
    const existing = await getDoctorById(id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Médecin introuvable' },
        { status: 404 }
      );
    }

    await deleteDoctor(id);
    return NextResponse.json({ success: true, message: 'Médecin supprimé' });
  } catch (error) {
    if (error instanceof AdminAuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json(
      { error: 'Erreur serveur lors de la suppression du médecin' },
      { status: 500 }
    );
  }
}
