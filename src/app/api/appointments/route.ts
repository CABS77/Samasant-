import { serverFetch } from '@/lib/server-fetch';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { getDoctorById } from '@/lib/doctor-store';
import { appointmentRequestSchema, appointmentReceiptSchema, isValidAppointmentTime } from '@/lib/appointment-validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const reply = (error: string, status: number) => NextResponse.json({ error }, {
    status, headers: { 'Cache-Control': 'no-store' },
  });
  const token = request.headers.get('authorization')?.match(/^Bearer (\S+)$/)?.[1];
  if (!token) return reply('Connectez-vous pour réserver.', 401);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !serviceKey) return reply('Les réservations sont temporairement indisponibles.', 503);

  try {
    const options = { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input: RequestInfo | URL, init?: RequestInit) => serverFetch(input, { ...init, signal: init?.signal || AbortSignal.timeout(10000) }) } };
    const authClient = createClient(url, key, options);
    const { data: auth, error: authError } = await authClient.auth.getUser(token);
    if (authError || !auth.user) return reply('Session expirée. Reconnectez-vous.', 401);
    const parsed = appointmentRequestSchema.safeParse(await request.json());
    if (!parsed.success) return reply('Vérifiez le médecin, la date, le téléphone et le motif.', 400);
    const input = parsed.data;
    const database = createClient(url, serviceKey, options);

    // Read an earlier write before checking time: retrying a lost response is safe even later.
    const previous = await database.from('appointment_requests').select('*')
      .eq('user_id', auth.user.id).eq('request_key', input.requestKey).maybeSingle();
    if (previous.error) return reply('Les réservations sont temporairement indisponibles.', 503);
    const receipt = (row: Record<string, unknown>) => {
      const same = row.doctor_id === input.doctorId && new Date(String(row.start_at)).getTime() === new Date(input.startAt).getTime()
        && row.motif === input.motif && row.phone === input.phone && row.mode === input.mode;
      if (!same || row.status !== 'requested') return reply('Cette référence de demande est déjà utilisée.', 409);
      const validated = appointmentReceiptSchema.safeParse({ id: row.id, status: row.status, startAt: row.start_at });
      if (!validated.success) return reply('Enregistrement non confirmé. Réessayez avec la même demande.', 503);
      return NextResponse.json(validated.data, { status: 201, headers: { 'Cache-Control': 'no-store' } });
    };
    if (previous.data) return receipt(previous.data);

    const doctor = await getDoctorById(input.doctorId);
    if (!doctor) return reply('Médecin introuvable.', 404);
    if (!isValidAppointmentTime(input.startAt, doctor.available)) {
      return reply('Choisissez un créneau futur dans les jours de disponibilité du médecin.', 400);
    }
    const { data, error } = await database.from('appointment_requests').insert({
      user_id: auth.user.id, doctor_id: input.doctorId, start_at: input.startAt,
      motif: input.motif, phone: input.phone, mode: input.mode,
      status: 'requested', request_key: input.requestKey,
    }).select('*').single();
    if (error?.code === '23505') {
      const retry = await database.from('appointment_requests').select('*')
        .eq('user_id', auth.user.id).eq('request_key', input.requestKey).maybeSingle();
      if (retry.data && !retry.error) return receipt(retry.data);
      return reply('Ce créneau est déjà réservé. Choisissez-en un autre.', 409);
    }
    if (error || !data) return reply('Enregistrement non confirmé. Réessayez avec la même demande.', 503);
    return receipt(data);
  } catch (error) {
    if (error instanceof SyntaxError) return reply('Demande invalide.', 400);
    return reply('Les réservations sont temporairement indisponibles.', 503);
  }
}
