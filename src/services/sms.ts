export type SmsResult =
  | { status: 'unavailable' | 'failed' }
  | { status: 'accepted' | 'delivered'; messageId: string };

/** Provider acceptance is not proof of delivery or of medical assistance. */
export async function sendSms(phoneNumber: string, message: string): Promise<SmsResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!accountSid || !authToken || !fromNumber) return { status: 'unavailable' };
  if (!/^\+[1-9]\d{7,14}$/.test(phoneNumber)) return { status: 'failed' };
  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        },
        body: new URLSearchParams({ To: phoneNumber, From: fromNumber, Body: message }),
        signal: AbortSignal.timeout(10000),
      }
    );
    if (!response.ok) return { status: 'failed' };
    const data = await response.json();
    if (typeof data.sid !== 'string' || !/^SM[0-9a-f]{32}$/i.test(data.sid)) return { status: 'failed' };
    if (data.status === 'delivered') return { status: 'delivered', messageId: data.sid };
    if (['accepted', 'queued', 'scheduled', 'sending', 'sent'].includes(data.status)) {
      return { status: 'accepted', messageId: data.sid };
    }
    return { status: 'failed' };
  } catch {
    // Never log symptoms, phone numbers, credentials or provider response bodies.
    return { status: 'failed' };
  }
}
