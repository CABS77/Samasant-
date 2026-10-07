import { NextResponse } from 'next/server';
import { serverDatabase, verifiedPatient } from '@/lib/server-database';
import { requireSameOrigin, AdminAuthError } from '@/lib/admin-auth';

const headers = { 'Cache-Control': 'private, no-store' };
export async function GET(request: Request) {
  try {
    const user = await verifiedPatient(request);
    if (!user) return NextResponse.json({ error: 'Connexion requise.' }, { status: 401, headers });
    const { data, error } = await serverDatabase().from('appointment_requests')
      .select('id,doctor_id,start_at,motif,phone,mode,status,created_at').eq('user_id', user.id).order('created_at');
    if (error) throw error;
    return NextResponse.json({ exportedAt: new Date().toISOString(), appointments: data }, {
      headers: { ...headers, 'Content-Disposition': 'attachment; filename="samasante-demandes.json"' },
    });
  } catch { return NextResponse.json({ error: 'Export indisponible.' }, { status: 503, headers }); }
}

export async function DELETE(request: Request) {
  try {
    requireSameOrigin(request);
    const user = await verifiedPatient(request);
    if (!user) return NextResponse.json({ error: 'Connexion requise.' }, { status: 401, headers });
    const body = await request.json();
    if (body.confirm !== 'delete-my-appointment-requests') return NextResponse.json({ error: 'Confirmation requise.' }, { status: 400, headers });
    // The verified identity comes exclusively from Auth, never from the body.
    const { error } = await serverDatabase().from('appointment_requests').delete().eq('user_id', user.id);
    if (error) throw error;
    return NextResponse.json({ deleted: true }, { headers });
  } catch (error) { return NextResponse.json({ error: 'Suppression indisponible.' }, { status: error instanceof AdminAuthError ? error.status : error instanceof SyntaxError ? 400 : 503, headers }); }
}
