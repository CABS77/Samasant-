import { NextResponse } from 'next/server';
import { AdminAuthError, currentAdminId, requireAdmin, requireSameOrigin } from '@/lib/admin-auth';
import { serverDatabase } from '@/lib/server-database';
import { z } from 'zod';
const headers = { 'Cache-Control': 'private, no-store' };
export async function GET() {
  try {
    await requireAdmin();
    const { data, error } = await serverDatabase().from('sms_notifications')
      .select('id,partner_name,state,acknowledged_at,created_at').order('created_at', { ascending: false }).limit(100);
    if (error) throw error;
    return NextResponse.json({ notifications: data }, { headers });
  } catch (error) { return NextResponse.json({ error: 'Suivi indisponible.' }, { status: error instanceof AdminAuthError ? error.status : 503, headers }); }
}
export async function PATCH(request: Request) {
  try {
    const operator = await currentAdminId();
    requireSameOrigin(request);
    const body = z.object({ id: z.string().uuid(), acknowledge: z.literal(true) }).strict().safeParse(await request.json());
    if (!body.success) return NextResponse.json({ error: 'Requête invalide.' }, { status: 400, headers });
    const { data, error } = await serverDatabase().from('sms_notifications').update({
      acknowledged_at: new Date().toISOString(), acknowledged_by: operator,
    }).eq('id', body.data.id).is('acknowledged_at', null).select('id').maybeSingle();
    if (error) throw error;
    return NextResponse.json({ acknowledged: Boolean(data) }, { headers });
  } catch (error) { return NextResponse.json({ error: 'Accusé indisponible.' }, { status: error instanceof AdminAuthError ? error.status : 503, headers }); }
}
