'use server';

import { getAllDoctors, createDoctor, updateDoctor, deleteDoctor } from '@/lib/doctor-store';
import { doctorCreateSchema, doctorUpdateSchema } from '@/lib/doctor-validation';
import type { Doctor } from '@/types/doctor';

export async function fetchDoctorsAction(): Promise<Doctor[]> {
  return getAllDoctors();
}

export async function createDoctorAction(data: unknown): Promise<{ success: boolean; doctor?: Doctor; error?: string }> {
  const result = doctorCreateSchema.safeParse(data);
  if (!result.success) {
    const messages = result.error.issues.map((i) => i.message).join(', ');
    return { success: false, error: messages };
  }
  try {
    const doctor = await createDoctor(result.data);
    return { success: true, doctor };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erreur serveur' };
  }
}

export async function updateDoctorAction(id: string, data: unknown): Promise<{ success: boolean; doctor?: Doctor; error?: string }> {
  const result = doctorUpdateSchema.safeParse(data);
  if (!result.success) {
    const messages = result.error.issues.map((i) => i.message).join(', ');
    return { success: false, error: messages };
  }
  try {
    const doctor = await updateDoctor(id, result.data);
    return { success: true, doctor };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erreur serveur' };
  }
}

export async function deleteDoctorAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDoctor(id);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erreur serveur' };
  }
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD || 'samasante2026';
  return password === adminPassword;
}
