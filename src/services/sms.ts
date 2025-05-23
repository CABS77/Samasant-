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
 * Sends an SMS message to a phone number.
 *
 * @param phoneNumber The phone number to send the SMS to.
 * @param message The message to send.
 * @returns A promise that resolves when the SMS is sent.
 */
export async function sendSms(phoneNumber: string, message: string): Promise<void> {
  // TODO: Implement this by calling an API.
  console.log(`Sending SMS to ${phoneNumber} with message: ${message}`);
}
