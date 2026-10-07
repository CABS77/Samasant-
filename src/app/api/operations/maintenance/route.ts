import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { serverDatabase } from '@/lib/server-database';
import { drainNotifications } from '@/services/notification-outbox';

export async function GET(request: Request) {
  const headers = { 'Cache-Control': 'no-store' };
  const secret = process.env.CRON_SECRET;
  const supplied = request.headers.get('authorization') || '';
  const expected = `Bearer ${secret}`;
  if (!secret || secret.length < 32 || supplied.length !== expected.length
    || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return new NextResponse(null, { status: 401, headers });
  try {
    // Configure retention explicitly; do not silently choose a legal retention policy.
    const days = Number(process.env.APPOINTMENT_RETENTION_DAYS);
    if (!Number.isInteger(days) || days < 30 || days > 365) return NextResponse.json({ status: 'configuration-required' }, { status: 503, headers });
    const { error } = await serverDatabase().rpc('cleanup_care_data', { p_appointment_days: days });
    if (error) throw error;
    await drainNotifications();
    return NextResponse.json({ status: 'completed' }, { headers });
  } catch { return NextResponse.json({ status: 'failed' }, { status: 503, headers }); }
}
