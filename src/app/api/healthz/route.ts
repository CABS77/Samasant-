import { NextResponse } from 'next/server';
import { serverDatabase } from '@/lib/server-database';
export async function GET() {
  const headers = { 'Cache-Control': 'no-store' };
  try {
    const { data, error } = await serverDatabase().rpc('check_care_schema');
    return NextResponse.json({ status: !error && data === true ? 'ready' : 'degraded' }, { status: !error && data === true ? 200 : 503, headers });
  } catch { return NextResponse.json({ status: 'degraded' }, { status: 503, headers }); }
}
