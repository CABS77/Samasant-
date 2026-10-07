import { NextResponse } from 'next/server';
import { validTwilioSignature } from '@/lib/twilio-signature';
import { serverDatabase } from '@/lib/server-database';

export async function POST(request: Request) {
  const headers = { 'Cache-Control': 'no-store' };
  try {
    const configured = process.env.TWILIO_STATUS_CALLBACK_URL;
    const secret = process.env.TWILIO_AUTH_TOKEN;
    if (!configured || !secret) return new NextResponse(null, { status: 503, headers });
    const id = new URL(request.url).searchParams.get('notification') || '';
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) return new NextResponse(null, { status: 400, headers });
    const body = await request.text();
    if (body.length > 8192) return new NextResponse(null, { status: 413, headers });
    const params = new URLSearchParams(body);
    const callback = new URL(configured); callback.searchParams.set('notification', id);
    if (!validTwilioSignature(callback.toString(), params, request.headers.get('x-twilio-signature') || '', secret)) {
      return new NextResponse(null, { status: 403, headers });
    }
    if (params.get('AccountSid') !== process.env.TWILIO_ACCOUNT_SID) return new NextResponse(null, { status: 403, headers });
    const status = params.get('MessageStatus');
    if (!status || !['accepted', 'queued', 'sending', 'sent', 'delivered', 'failed', 'undelivered'].includes(status)) return new NextResponse(null, { status: 400, headers });
    const state = status === 'delivered' ? 'delivered' : status === 'failed' || status === 'undelivered' ? 'failed' : 'accepted';
    const { data, error } = await serverDatabase().rpc('record_sms_status', { p_id: id, p_sid: params.get('MessageSid'), p_state: state });
    return new NextResponse(null, { status: error ? 503 : data ? 204 : 404, headers });
  } catch { return new NextResponse(null, { status: 503, headers }); }
}
