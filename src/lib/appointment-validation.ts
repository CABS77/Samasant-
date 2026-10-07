import { z } from 'zod';

export const appointmentRequestSchema = z.object({
  doctorId: z.string().min(1).max(100),
  startAt: z.string().datetime(),
  motif: z.string().trim().min(1).max(1000),
  phone: z.string().regex(/^\+[1-9]\d{7,14}$/),
  mode: z.literal('clinic'),
  requestKey: z.string().uuid(),
}).strict();

export type AppointmentRequest = z.infer<typeof appointmentRequestSchema>;
export interface AppointmentReceipt { id: string; status: 'requested'; startAt: string }

export const appointmentReceiptSchema = z.object({
  id: z.string().uuid(), status: z.literal('requested'), startAt: z.string().datetime({ offset: true }),
});

export const weekdays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

/** Senegal uses UTC year-round. Only the half-hour slots shown by the form are bookable. */
export function isValidAppointmentTime(startAt: string, available: string[], now = Date.now()): boolean {
  const date = new Date(startAt);
  const h = date.getUTCHours();
  return Number.isFinite(date.getTime()) && date.getTime() > now
    && date.getTime() <= now + 366 * 86400000
    && date.getUTCSeconds() === 0 && date.getUTCMilliseconds() === 0
    && [0, 30].includes(date.getUTCMinutes())
    && ((h >= 8 && h < 12) || (h >= 14 && h < 18))
    && available.includes(weekdays[date.getUTCDay()]);
}
