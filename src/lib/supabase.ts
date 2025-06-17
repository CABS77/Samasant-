import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Create the Supabase client only when the required environment
 * variables are available. Otherwise export a proxy object that will
 * throw on access. This avoids build-time failures when the variables
 * are missing (e.g. during static builds or CI).
 */
export const supabase: SupabaseClient =
  url && key
    ? createClient(url, key)
    : (new Proxy({} as SupabaseClient, {
        get() {
          throw new Error(
            'Supabase environment variables are not set. Please define ' +
              'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
          );
        },
      }) as SupabaseClient);
