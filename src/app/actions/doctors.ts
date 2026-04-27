'use server';

import { getAllDoctors } from '@/lib/doctor-store';
import type { Doctor } from '@/types/doctor';

/**
 * Server Action partagée pour charger les médecins.
 * Utilisée par la page admin ET la page rendez-vous.
 */
export async function fetchDoctorsServer(): Promise<Doctor[]> {
  return getAllDoctors();
}
