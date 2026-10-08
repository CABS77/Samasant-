'use server';

import { createDoctor, updateDoctor, deleteDoctor } from '@/lib/doctor-store';
import { doctorCreateSchema, doctorUpdateSchema } from '@/lib/doctor-validation';
import type { Doctor } from '@/types/doctor';
import { currentAdminSessionId } from '@/lib/admin-auth';

export async function createDoctorAction(data: unknown): Promise<{ success: boolean; doctor?: Doctor; error?: string }> {
  const sessionId = await currentAdminSessionId();
  const result = doctorCreateSchema.safeParse(data);
  if (!result.success) {
    const messages = result.error.issues.map((i) => i.message).join(', ');
    return { success: false, error: messages };
  }
  try {
    const doctor = await createDoctor(result.data, sessionId);
    return { success: true, doctor };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur serveur' };
  }
}

export async function updateDoctorAction(id: string, data: unknown): Promise<{ success: boolean; doctor?: Doctor; error?: string }> {
  const sessionId = await currentAdminSessionId();
  const result = doctorUpdateSchema.safeParse(data);
  if (!result.success) {
    const messages = result.error.issues.map((i) => i.message).join(', ');
    return { success: false, error: messages };
  }
  try {
    const doctor = await updateDoctor(id, result.data, sessionId);
    return { success: true, doctor };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur serveur' };
  }
}

export async function deleteDoctorAction(id: string): Promise<{ success: boolean; error?: string }> {
  const sessionId = await currentAdminSessionId();
  try {
    await deleteDoctor(id, sessionId);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Erreur serveur' };
  }
}
