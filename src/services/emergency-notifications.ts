import { z } from 'zod';
import { sendSms } from '@/services/sms';
import type { Coordinate } from '@/services/mapbox';

const recipientsSchema = z.array(z.object({
  id: z.string().min(1), name: z.string().min(1).max(120),
  phoneNumber: z.string().regex(/^\+[1-9]\d{7,14}$/),
  latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180),
})).max(50);

export interface EmergencyNotifications {
  clinicsAlerted: string[];
  clinicsPending: string[];
  notificationsFailed: number;
  notificationStatus: 'not-needed' | 'unavailable' | 'failed' | 'pending' | 'delivered' | 'partial';
}

function distanceKm(a: Coordinate, b: Coordinate): number {
  const rad = (n: number) => n * Math.PI / 180;
  const x = Math.sin(rad(b.latitude - a.latitude) / 2) ** 2
    + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude))
    * Math.sin(rad(b.longitude - a.longitude) / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/** Only explicitly configured partner clinics receive sensitive alerts. No demo fallback. */
export async function notifyEmergencyClinics(
  coordinate: Coordinate, message: string
): Promise<EmergencyNotifications> {
  const result: EmergencyNotifications = {
    clinicsAlerted: [], clinicsPending: [], notificationsFailed: 0, notificationStatus: 'unavailable',
  };
  let recipients: z.infer<typeof recipientsSchema>;
  try {
    recipients = recipientsSchema.parse(JSON.parse(process.env.EMERGENCY_CLINICS_JSON || '[]'));
  } catch {
    return result;
  }
  const phones = new Set<string>();
  const nearby = recipients.filter(clinic => {
    if (distanceKm(coordinate, clinic) > 10 || phones.has(clinic.phoneNumber)) return false;
    phones.add(clinic.phoneNumber);
    return true;
  }).sort((a, b) => distanceKm(coordinate, a) - distanceKm(coordinate, b)).slice(0, 3);
  let unavailable = 0;
  for (const clinic of nearby) {
    const sms = await sendSms(clinic.phoneNumber, message);
    if (sms.status === 'delivered') result.clinicsAlerted.push(clinic.name);
    else if (sms.status === 'accepted') result.clinicsPending.push(clinic.name);
    else {
      result.notificationsFailed++;
      if (sms.status === 'unavailable') unavailable++;
    }
  }
  const sent = result.clinicsAlerted.length + result.clinicsPending.length;
  if (sent && result.notificationsFailed) result.notificationStatus = 'partial';
  else if (result.clinicsPending.length) result.notificationStatus = 'pending';
  else if (result.clinicsAlerted.length) result.notificationStatus = 'delivered';
  else if (nearby.length && unavailable !== nearby.length) result.notificationStatus = 'failed';
  return result;
}
