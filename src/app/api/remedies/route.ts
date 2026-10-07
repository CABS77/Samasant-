import { NextResponse } from 'next/server';
import { z } from 'zod';
import { fetchRemediesFromSource } from '@/services/remedies-source';

export async function POST(request: Request) {
  const headers = { 'Cache-Control': 'no-store' };
  const schema = z.object({ query: z.string().trim().max(100).default(''), category: z.string().max(40).default('all'), offset: z.number().int().min(0).max(1000).default(0) }).strict();
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Recherche invalide.' }, { status: 400, headers });
    const { query, category, offset } = parsed.data;
    const catalog = await fetchRemediesFromSource('', 'franco-wolof');
    const filtered = catalog.map((remedy, index) => ({ ...remedy, id: `remedy-${index}` })).filter(remedy => {
      const text = `${remedy.name} ${remedy.symptom} ${remedy.description}`.toLocaleLowerCase('fr').normalize('NFC');
      return text.includes(query.toLocaleLowerCase('fr').normalize('NFC')) && (category === 'all' || text.includes(category.toLocaleLowerCase('fr')));
    });
    return NextResponse.json({ remedies: filtered.slice(offset, offset + 8), total: filtered.length }, { headers });
  } catch { return NextResponse.json({ error: 'Catalogue indisponible.' }, { status: 503, headers }); }
}
