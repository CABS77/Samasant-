import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { appointmentReceiptSchema, type AppointmentRequest, type AppointmentReceipt } from '@/lib/appointment-validation';

/** A receipt is returned only after the server has persisted the patient's request. */
export async function createAppointment(input: AppointmentRequest): Promise<AppointmentReceipt> {
  if (!isSupabaseConfigured()) throw new Error('Les réservations sont temporairement indisponibles.');
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) throw new Error('Connectez-vous pour réserver.');
  const response = await fetch('/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}` },
    body: JSON.stringify(input),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Enregistrement impossible. Réessayez.');
  const receipt = appointmentReceiptSchema.safeParse(result);
  if (!receipt.success) throw new Error('Enregistrement non confirmé. Réessayez avec la même demande.');
  return receipt.data;
}
