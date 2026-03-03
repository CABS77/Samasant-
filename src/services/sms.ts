/**
 * Represents a phone number.
 */
export interface PhoneNumber {
  /**
   * The phone number.
   */
  phoneNumber: string;
}

/**
 * Sends an SMS message to a phone number using Twilio.
 *
 * @param phoneNumber The phone number to send the SMS to (format: +221xxxxxxxxx)
 * @param message The message to send.
 * @returns A promise that resolves when the SMS is sent.
 * @throws Error if Twilio credentials are not configured or if SMS sending fails
 */
export async function sendSms(phoneNumber: string, message: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  // Si les credentials Twilio ne sont pas configurés, logger et retourner
  if (!accountSid || !authToken || !fromNumber) {
    console.warn(
      '⚠️ Twilio credentials not configured. SMS not sent.',
      `To: ${phoneNumber}, Message: ${message}`
    );
    return;
  }

  try {
    // Appel à l'API Twilio
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          To: phoneNumber,
          From: fromNumber,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Twilio API error: ${errorData.message || response.statusText}`
      );
    }

    const data = await response.json();
    console.log(`✅ SMS sent successfully to ${phoneNumber}. SID: ${data.sid}`);
  } catch (error: any) {
    console.error(`❌ Failed to send SMS to ${phoneNumber}:`, error.message);
    throw new Error(`SMS sending failed: ${error.message}`);
  }
}
