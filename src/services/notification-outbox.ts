import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from 'node:crypto';
import { serverDatabase } from '@/lib/server-database';
import { sendSms } from './sms';

export interface NotificationReceipt { id: string; token: string }
export interface NotificationRow { id: string; partner_name: string; state: string; acknowledged_at: string | null }
interface Job extends NotificationRow { recipient: string; encrypted_payload: string }
const hash = (text: string) => createHash('sha256').update(text).digest('hex');
function encryptionKey(): Buffer {
  const value = process.env.SMS_OUTBOX_KEY;
  if (!value || !/^[0-9a-f]{64}$/i.test(value)) throw new Error('Notifications indisponibles.');
  return Buffer.from(value, 'hex');
}
export function encryptNotification(message: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const data = Buffer.concat([cipher.update(message, 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), data]).toString('base64');
}
export function decryptNotification(payload: string): string {
  const data = Buffer.from(payload, 'base64');
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), data.subarray(0, 12));
  decipher.setAuthTag(data.subarray(12, 28));
  return Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]).toString('utf8');
}
export function outboxConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    && /^[0-9a-f]{64}$/i.test(process.env.SMS_OUTBOX_KEY || '') && process.env.TWILIO_STATUS_CALLBACK_URL
    && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER);
}
export async function enqueueNotifications(input: {
  recipients: { id: string; name: string; phoneNumber: string }[];
  message: string; requestKey: string; token: string; ownerHash: string;
}): Promise<NotificationReceipt> {
  if (!outboxConfigured()) throw new Error('Notifications indisponibles.');
  const id = randomUUID();
  const jobs = input.recipients.map(partner => ({ id: randomUUID(), partner_id: partner.id,
    partner_name: partner.name, recipient: partner.phoneNumber, encrypted_payload: encryptNotification(input.message) }));
  const { data, error } = await serverDatabase().rpc('enqueue_notifications', {
    p_id: id, p_lookup_hash: hash(input.token), p_request_key: input.requestKey,
    p_owner_hash: input.ownerHash, p_payload_hash: hash(input.message), p_jobs: jobs,
  });
  if (error || typeof data !== 'string') throw new Error('Notifications indisponibles.');
  return { id: data, token: input.token };
}
export async function drainNotifications(alertId: string | null = null): Promise<void> {
  if (!outboxConfigured()) return;
  const db = serverDatabase();
  const { data, error } = await db.rpc('claim_sms_notifications', { p_alert_id: alertId, p_limit: 3 });
  if (error || !Array.isArray(data)) throw new Error('Notifications indisponibles.');
  await Promise.all((data as Job[]).map(async job => {
    try {
      const callback = new URL(process.env.TWILIO_STATUS_CALLBACK_URL!);
      if (callback.protocol !== 'https:') throw new Error();
      callback.searchParams.set('notification', job.id);
      const result = await sendSms(job.recipient, decryptNotification(job.encrypted_payload), callback.toString());
      if (result.status === 'accepted' || result.status === 'delivered') {
        const saved = await db.rpc('record_sms_status', { p_id: job.id, p_sid: result.messageId, p_state: result.status });
        if (saved.error || saved.data !== true) throw new Error();
      } else {
        // A network failure may conceal provider acceptance. Never retry it automatically.
        await db.from('sms_notifications').update({ state: 'unknown', encrypted_payload: null, updated_at: new Date().toISOString() })
          .eq('id', job.id).eq('state', 'processing');
      }
    } catch {
      await db.from('sms_notifications').update({ state: 'unknown', encrypted_payload: null, updated_at: new Date().toISOString() })
        .eq('id', job.id).eq('state', 'processing');
    }
  }));
}
export async function notificationStatus(receipt: NotificationReceipt): Promise<NotificationRow[] | null> {
  const db = serverDatabase();
  const { data: alert, error } = await db.from('sms_alerts').select('id').eq('id', receipt.id)
    .eq('lookup_hash', hash(receipt.token)).gt('created_at', new Date(Date.now() - 7 * 86400000).toISOString()).maybeSingle();
  if (error) throw new Error('Suivi indisponible.');
  if (!alert) return null;
  const result = await db.from('sms_notifications').select('id,partner_name,state,acknowledged_at').eq('alert_id', alert.id);
  if (result.error) throw new Error('Suivi indisponible.');
  return result.data;
}
