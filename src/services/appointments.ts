import { supabase } from '@/lib/supabase';
import type { RendezVous } from '@/types/firestore';

const COLLECTION_NAME = 'rendezVous';

function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function createAppointment(data: RendezVous): Promise<string> {
  if (!isSupabaseConfigured()) {
    // Mode démo : simuler la création
    const fakeId = `demo-${Date.now()}`;
    console.warn('⚠️ Supabase non configuré. Rendez-vous simulé:', fakeId);
    return fakeId;
  }

  const { data: res, error } = await supabase
    .from(COLLECTION_NAME)
    .insert(data)
    .select('id')
    .single();
  if (error) throw error;
  return res!.id as string;
}

export async function getAppointment(id: string): Promise<RendezVous | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from(COLLECTION_NAME)
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data as RendezVous;
}

export async function updateAppointment(id: string, data: Partial<RendezVous>): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const { error } = await supabase
    .from(COLLECTION_NAME)
    .update(data)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteAppointment(id: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const { error } = await supabase
    .from(COLLECTION_NAME)
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function getAppointmentsForUser(userId: string): Promise<RendezVous[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from(COLLECTION_NAME)
    .select('*')
    .eq('jefandikukat_id', userId);
  if (error) throw error;
  return (data as RendezVous[]) || [];
}
