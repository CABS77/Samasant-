import { adminMutation } from '@/lib/admin-mutations';
import { serverFetch } from '@/lib/server-fetch';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AdminAuthError, requireAdmin, requireSameOrigin, currentAdminSessionId } from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const updateSchema = z.object({ id: z.string().uuid(), status: z.enum(['confirmed', 'cancelled']) }).strict();

function database() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new AdminAuthError(503, 'Les réservations sont indisponibles.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input: RequestInfo | URL, init?: RequestInit) => serverFetch(input, { ...init, signal: init?.signal || AbortSignal.timeout(10000) }) } });
}

function failure(error: unknown) {
  return NextResponse.json({ error: error instanceof AdminAuthError ? error.message : 'Les réservations sont indisponibles.' }, {
    status: error instanceof AdminAuthError ? error.status : 503,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function GET() {
  try {
    await requireAdmin();
    const { data, error } = await database().from('appointment_requests')
      .select('id,doctor_id,start_at,motif,phone,status').order('start_at', { ascending: true }).limit(100);
    if (error) throw error;
    return NextResponse.json(data || [], { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return failure(error); }
}

export async function PATCH(request: Request) {
  try {
    const sessionId = await currentAdminSessionId();
    requireSameOrigin(request);
    const parsed = updateSchema.safeParse(await request.json());
    if (!parsed.success) throw new AdminAuthError(400, 'Demande invalide.');
    const { id, status } = parsed.data;
    const data = await adminMutation<{ id: string; status: string }>('admin_appointment_write', sessionId, { p_id: id, p_status: status });
    if (!data) throw new AdminAuthError(409, 'Cette demande a déjà été traitée. Actualisez la liste.');
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return failure(error); }
}
