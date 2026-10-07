import { NextResponse } from 'next/server';
import { z } from 'zod';
import { notificationStatus, drainNotifications } from '@/services/notification-outbox';
export async function POST(request: Request) {
  const headers = { 'Cache-Control': 'private, no-store' };
  try {
    const parsed = z.object({ id: z.string().uuid(), token: z.string().regex(/^[0-9a-f]{64}$/i) }).strict().safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Référence invalide.' }, { status: 400, headers });
    let notifications = await notificationStatus(parsed.data);
    if (!notifications) return NextResponse.json({ error: 'Référence introuvable.' }, { status: 404, headers });
    if (notifications.some(row => row.state === 'queued')) {
      await drainNotifications(parsed.data.id);
      notifications = await notificationStatus(parsed.data);
    }
    return NextResponse.json({ notifications }, { headers });
  } catch { return NextResponse.json({ error: 'Suivi indisponible.' }, { status: 503, headers }); }
}
