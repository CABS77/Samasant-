import { NextResponse } from 'next/server';
import { z } from 'zod';
import { serverFetch } from '@/lib/server-fetch';

export async function POST(request: Request) {
  const headers = { 'Cache-Control': 'no-store' };
  try {
    const parsed = z.object({ query: z.string().trim().min(2).max(120) }).strict().safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Lieu invalide.' }, { status: 400, headers });
    const token = process.env.MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return NextResponse.json({ error: 'Recherche indisponible.' }, { status: 503, headers });
    const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(parsed.data.query)}.json`);
    url.search = new URLSearchParams({ access_token: token, country: 'sn', types: 'place,locality,neighborhood', limit: '5', language: 'fr' }).toString();
    const response = await serverFetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error();
    const data = await response.json() as { features?: { id: string; place_name: string; center: number[] }[] };
    const places = (data.features || []).filter(p => p.center?.length === 2 && p.center.every(Number.isFinite))
      .map(p => ({ id: p.id, name: p.place_name, longitude: p.center[0], latitude: p.center[1] }));
    return NextResponse.json({ places }, { headers });
  } catch { return NextResponse.json({ error: 'Recherche indisponible.' }, { status: 503, headers }); }
}
