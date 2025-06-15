import { supabase } from '@/lib/supabase';
import type { Doctor } from '@/types/doctor';

const COLLECTION_NAME = 'doctors';

export async function getDoctors(): Promise<Doctor[]> {
  const { data, error } = await supabase.from(COLLECTION_NAME).select('*');
  if (error) throw error;
  return (data as Doctor[]) || [];
}
