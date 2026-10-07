import type { Doctor } from '@/types/doctor';

/** The server labels its development directory explicitly. A failure never creates practitioners. */
export async function getDoctors(): Promise<Doctor[]> {
  const response = await fetch('/api/doctors', { cache: 'no-store' });
  if (!response.ok) throw new Error('Annuaire indisponible.');
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error('Annuaire indisponible.');
  return data as Doctor[];
}
