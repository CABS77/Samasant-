import { createHmac, randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { serverFetch } from './server-fetch';

export class ServiceUnavailableError extends Error {}
export class QuotaExceededError extends Error {
  constructor(public readonly retryAfter: number) { super('Limite atteinte. Réessayez plus tard.'); }
}

const localKey = randomBytes(32).toString('hex');
const localCounters = new Map<string, { count: number; end: number }>();
export function clientAddress(headers: Headers): string {
  // Vercel overwrites this header. Self-hosting must use a trusted reverse proxy.
  const header = process.env.VERCEL ? 'x-vercel-forwarded-for' : 'x-forwarded-for';
  return headers.get(header)?.split(',')[0]?.trim().slice(0, 80) || 'unknown';
}

export function quotaIdentity(address: string): string {
  const key = process.env.AI_QUOTA_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (!key && process.env.NODE_ENV === 'production') throw new ServiceUnavailableError('Service indisponible.');
  return createHmac('sha256', key || localKey).update(address).digest('hex');
}

/** Atomic counters shared by all instances. No raw IP, symptoms or device IDs stored. */
export async function consumeQuota(scope: 'ai' | 'login' | 'notification', address: string): Promise<void> {
  const key = quotaIdentity(address);
  const window = scope === 'login' ? 900 : scope === 'notification' ? 3600 : 86400;
  const budget = Math.min(10000, Math.max(1, Number(process.env.AI_DAILY_BUDGET_REQUESTS) || 1000));
  const keys = scope === 'ai' ? ['ai:global', `ai:ip:${key}`] : [`${scope}:ip:${key}`];
  const limits = scope === 'ai' ? [budget, 7] : [scope === 'login' ? 5 : 3];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && serviceKey) {
    const client = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => serverFetch(input, { ...init, signal: init?.signal || AbortSignal.timeout(10000) }) },
    });
    const { data, error } = await client.rpc('consume_service_quota', {
      p_keys: keys, p_limits: limits, p_window_seconds: window,
    });
    if (error || typeof data !== 'boolean') throw new ServiceUnavailableError('Service indisponible.');
    if (!data) throw new QuotaExceededError(window - Math.floor(Date.now() / 1000) % window);
    return;
  }
  if (process.env.NODE_ENV === 'production') throw new ServiceUnavailableError('Service indisponible.');
  const end = (Math.floor(Date.now() / 1000 / window) + 1) * window * 1000;
  for (const [k, value] of localCounters) if (value.end <= Date.now()) localCounters.delete(k);
  if (localCounters.size > 10000) throw new ServiceUnavailableError('Service indisponible.');
  if (keys.some((k, i) => (localCounters.get(k)?.count || 0) >= limits[i])) {
    throw new QuotaExceededError(Math.ceil((end - Date.now()) / 1000));
  }
  keys.forEach(k => localCounters.set(k, { count: (localCounters.get(k)?.count || 0) + 1, end }));
}
