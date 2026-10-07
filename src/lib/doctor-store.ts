import { serverFetch } from '@/lib/server-fetch';
import type { Doctor } from '@/types/doctor';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// The demo directory is local only. Configured deployments use the shared database.
const INITIAL_DOCTORS: Doctor[] = ['Généraliste', 'Cardiologie', 'Pédiatrie', 'Dermatologie', 'Gynécologie', 'Généraliste'].map((specialty, index) => ({
  id: `dr-${index + 1}`, name: `Praticien de démonstration ${index + 1}`, specialty,
  location: 'Dakar', bio: 'Fiche de démonstration locale, aucun praticien réel ni disponibilité de soins attestée.',
  available: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'],
}));

type Store = { doctors: Doctor[] };
const shared = globalThis as typeof globalThis & { samasanteDoctorStore?: Store };
const columns = 'id,name,specialty,location,bio,available,rating,reviews';

function database() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input: RequestInfo | URL, init?: RequestInit) => serverFetch(input, { ...init, signal: init?.signal || AbortSignal.timeout(10000) }) } });
  if (process.env.VERCEL) throw new Error('Annuaire indisponible : configurez Supabase.');
  return null;
}

function localStore(): Store {
  if (!shared.samasanteDoctorStore) shared.samasanteDoctorStore = { doctors: [...INITIAL_DOCTORS] };
  const store = shared.samasanteDoctorStore;
  const file = join(process.cwd(), 'data', 'doctors.json');
  // Read again across compiled routes and separate local server processes. Empty is valid.
  if (existsSync(file)) {
    const data: unknown = JSON.parse(readFileSync(file, 'utf8'));
    if (!Array.isArray(data)) throw new Error('Annuaire local invalide.');
    store.doctors = data as Doctor[];
  }
  return store;
}

function persist(store: Store): void {
  const dir = join(process.cwd(), 'data');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'doctors.json'), JSON.stringify(store.doctors, null, 2), 'utf8');
}

export async function getAllDoctors(): Promise<Doctor[]> {
  const db = database();
  if (db) {
    const { data, error } = await db.from('doctor_directory').select(columns).order('name');
    if (error) throw new Error('Annuaire temporairement indisponible.');
    return (data || []) as Doctor[];
  }
  return [...localStore().doctors];
}

export async function getDoctorById(id: string): Promise<Doctor | undefined> {
  const db = database();
  if (db) {
    const { data, error } = await db.from('doctor_directory').select(columns).eq('id', id).maybeSingle();
    if (error) throw new Error('Annuaire temporairement indisponible.');
    return (data || undefined) as Doctor | undefined;
  }
  return localStore().doctors.find(d => d.id === id);
}

export async function createDoctor(data: Omit<Doctor, 'id'>): Promise<Doctor> {
  const doctor = { ...data, id: `dr-${randomUUID()}` };
  const db = database();
  if (db) {
    const result = await db.from('doctor_directory').insert(doctor).select(columns).single();
    if (result.error || !result.data) throw new Error('Impossible d’enregistrer le médecin.');
    return result.data as Doctor;
  }
  const store = localStore();
  const updated = { doctors: [...store.doctors, doctor] };
  persist(updated); shared.samasanteDoctorStore = updated;
  return doctor;
}

export async function updateDoctor(id: string, data: Partial<Omit<Doctor, 'id'>>): Promise<Doctor> {
  const db = database();
  if (db) {
    const result = await db.from('doctor_directory').update(data).eq('id', id).select(columns).maybeSingle();
    if (result.error) throw new Error('Impossible de modifier le médecin.');
    if (!result.data) throw new Error('Médecin introuvable');
    return result.data as Doctor;
  }
  const store = localStore();
  const existing = store.doctors.find(d => d.id === id);
  if (!existing) throw new Error('Médecin introuvable');
  const doctor = { ...existing, ...data };
  const updated = { doctors: store.doctors.map(d => d.id === id ? doctor : d) };
  persist(updated); shared.samasanteDoctorStore = updated;
  return doctor;
}

export async function deleteDoctor(id: string): Promise<boolean> {
  const db = database();
  if (db) {
    const { data, error } = await db.from('doctor_directory').delete().eq('id', id).select('id').maybeSingle();
    if (error) throw new Error('Impossible de supprimer le médecin.');
    if (!data) throw new Error('Médecin introuvable');
    return true;
  }
  const store = localStore();
  if (!store.doctors.some(d => d.id === id)) throw new Error('Médecin introuvable');
  const updated = { doctors: store.doctors.filter(d => d.id !== id) };
  persist(updated); shared.samasanteDoctorStore = updated;
  return true;
}
