import { NextRequest, NextResponse } from 'next/server';
import { initialHealthAssessment } from '@/ai/flows/initial-health-assessment';
import { validateAndSanitizeInput, detectSpam } from '@/lib/inputValidation';
import { QuotaExceededError, ServiceUnavailableError } from '@/lib/service-quota';
import { z } from 'zod';

const RequestSchema = z.object({
  message: z.string().min(3).max(1000),
  language: z.enum(['wolof', 'french', 'pulaar', 'franco-wolof']),
  deviceId: z.string().max(160).optional(), // compatibility only; never used for quotas
  ageConfirmed: z.boolean().optional(),
}).strict();
const headers = { 'Cache-Control': 'no-store' };

export async function POST(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Requête JSON invalide.' }, { status: 400, headers });
  }
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Entrée invalide.' }, { status: 400, headers });
  if (!parsed.data.ageConfirmed) return NextResponse.json({ error: 'Confirmation d’âge requise.' }, { status: 403, headers });
  const input = validateAndSanitizeInput(parsed.data);
  if (!input.valid || detectSpam(parsed.data.message)) return NextResponse.json({ error: input.error || 'Message invalide.' }, { status: 400, headers });
  try {
    // The action itself protects every call path, including other Server Actions.
    return NextResponse.json(await initialHealthAssessment({ ...input.sanitized!, ageConfirmed: true }), { headers });
  } catch (error) {
    if (error instanceof QuotaExceededError) return NextResponse.json({ message: error.message }, {
      status: 429, headers: { ...headers, 'Retry-After': String(error.retryAfter) },
    });
    return NextResponse.json({ message: 'Assistant momentanément indisponible. Le recours humain reste accessible.' }, {
      status: error instanceof ServiceUnavailableError ? 503 : 502, headers,
    });
  }
}
