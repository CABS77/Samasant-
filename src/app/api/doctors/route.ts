import { NextResponse } from 'next/server';
import { getAllDoctors, createDoctor } from '@/lib/doctor-store';
import { doctorCreateSchema } from '@/lib/doctor-validation';

export async function GET() {
  try {
    const doctors = await getAllDoctors();
    return NextResponse.json(doctors);
  } catch (error) {
    console.error('GET /api/doctors error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des médecins' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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
    console.error('POST /api/doctors error:', error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la création du médecin" },
      { status: 500 }
    );
  }
}
