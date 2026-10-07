import { createClient } from '@supabase/supabase-js';
import { serverFetch } from './server-fetch';

export function serverDatabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Base indisponible.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => serverFetch(input, { ...init, signal: init?.signal || AbortSignal.timeout(10000) }) } });
}

export async function verifiedPatient(request: Request) {
  const token = request.headers.get('authorization')?.match(/^Bearer (\S+)$/)?.[1];
  if (!token) return null;
  const db = serverDatabase();
  const { data, error } = await db.auth.getUser(token);
  return error ? null : data.user;
}
