import { NextResponse } from 'next/server';
import { AdminAuthError, requireAdmin } from '@/lib/admin-auth';
import { serverDatabase } from '@/lib/server-database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'private, no-store' };

export async function GET() {
  try {
    await requireAdmin();
    const { data, error } = await serverDatabase().from('care_audit_events')
      .select('id,entity,entity_id,action,from_state,to_state,operator_id,created_at')
      .order('created_at', { ascending: false }).limit(100);
    if (error) throw error;
    return NextResponse.json({ events: data || [] }, { headers });
  } catch (error) {
    return NextResponse.json({ error: 'Journal indisponible.' }, {
      status: error instanceof AdminAuthError ? error.status : 503, headers,
    });
  }
}
