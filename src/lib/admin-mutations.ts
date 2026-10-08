import { AdminAuthError } from './admin-auth';
import { serverDatabase } from './server-database';

/** The session comes from the signed cookie, never from a caller's JSON body. */
export async function adminMutation<T>(
  name: 'admin_doctor_write' | 'admin_appointment_write' | 'admin_acknowledge_notification',
  sessionId: string | null | undefined,
  parameters: Record<string, unknown>,
): Promise<T | null> {
  if (!sessionId) throw new AdminAuthError(403, 'Une session individuelle avec double authentification est requise pour modifier la base.');
  try {
    const { data, error } = await serverDatabase().rpc(name, { ...parameters, p_session_id: sessionId });
    if (error) {
      if (error.code === '42501') throw new AdminAuthError(401, 'Session administrateur révoquée ou expirée.');
      if (error.code === '22023') throw new AdminAuthError(400, 'Modification invalide.');
      if (error.code === '23505') throw new AdminAuthError(409, 'Cette modification est en conflit avec les données enregistrées.');
      throw new AdminAuthError(503, 'Modification indisponible. Réessayez.');
    }
    return data as T | null;
  } catch (error) {
    if (error instanceof AdminAuthError) throw error;
    throw new AdminAuthError(503, 'Modification indisponible. Réessayez.');
  }
}
