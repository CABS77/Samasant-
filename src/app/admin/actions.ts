'use server';

import { createDoctor, updateDoctor, deleteDoctor } from '@/lib/doctor-store';
import { doctorCreateSchema, doctorUpdateSchema } from '@/lib/doctor-validation';
import type { Doctor } from '@/types/doctor';
import { requireAdmin } from '@/lib/admin-auth';

export async function createDoctorAction(data: unknown): Promise<{ success: boolean; doctor?: Doctor; error?: string }> {
  await requireAdmin();
  const result = doctorCreateSchema.safeParse(data);
  if (!result.success) {
    const messages = result.error.issues.map((i) => i.message).join(', ');
    return { success: false, error: messages };
  }
  try {
    const doctor = await createDoctor(result.data);
    return { success: true, doctor };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur serveur' };
  }
}

export async function updateDoctorAction(id: string, data: unknown): Promise<{ success: boolean; doctor?: Doctor; error?: string }> {
  await requireAdmin();
  const result = doctorUpdateSchema.safeParse(data);
  if (!result.success) {
    const messages = result.error.issues.map((i) => i.message).join(', ');
    return { success: false, error: messages };
  }
  try {
    const doctor = await updateDoctor(id, result.data);
    return { success: true, doctor };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur serveur' };
  }
}

export async function deleteDoctorAction(id: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  try {
    await deleteDoctor(id);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur serveur' };
  }
}
