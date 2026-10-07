'use server';
/**
 * @fileOverview Emergency alert prioritization flow.
 *
 * - prioritizeEmergencyAndAlert - A function that prioritizes emergency cases and sends SMS alerts to nearby clinics.
 * - PrioritizeEmergencyAndAlertInput - The input type for the prioritizeEmergencyAndAlert function.
 * - PrioritizeEmergencyAndAlertOutput - The return type for the prioritizeEmergencyAndAlert function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import { protectAIRequest } from '@/lib/ai-request';
import { headers } from 'next/headers';
import { clientAddress, consumeQuota, quotaIdentity } from '@/lib/service-quota';
import { drainNotifications, enqueueNotifications, notificationStatus, outboxConfigured } from '@/services/notification-outbox';
import {notifyEmergencyClinics, emergencyPartners, type EmergencyNotifications} from '@/services/emergency-notifications';

const PrioritizeEmergencyAndAlertInputSchema = z.object({
  ageConfirmed: z.boolean().optional(),
  shareConsent: z.boolean().optional(),
  requestKey: z.string().uuid().optional(),
  receiptToken: z.string().regex(/^[0-9a-f]{64}$/i).optional(),
  symptoms: z.string().trim().min(1).max(2000),
  phoneNumber: z.string().trim().regex(/^\+[1-9]\d{7,14}$/),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});
export type PrioritizeEmergencyAndAlertInput = z.infer<typeof PrioritizeEmergencyAndAlertInputSchema>;

const PrioritizeEmergencyAndAlertOutputSchema = z.object({
  receipt: z.object({ id: z.string().uuid(), token: z.string() }).optional(),
  isEmergency: z.boolean().describe('Whether the case is an emergency.'),
  reason: z.string().describe('The reason for the emergency determination.'),
  clinicsAlerted: z.array(z.string()).describe('The names of the clinics that were alerted.'),
  clinicsPending: z.array(z.string()),
  notificationsFailed: z.number().int().nonnegative(),
  notificationStatus: z.enum(['not-needed', 'unavailable', 'failed', 'pending', 'delivered', 'partial']),
});
export type PrioritizeEmergencyAndAlertOutput = z.infer<typeof PrioritizeEmergencyAndAlertOutputSchema>;

export async function prioritizeEmergencyAndAlert(input: PrioritizeEmergencyAndAlertInput): Promise<PrioritizeEmergencyAndAlertOutput> {
  PrioritizeEmergencyAndAlertInputSchema.parse(input);
  if (!input.ageConfirmed) throw new Error('Confirmation d’âge requise.');
  if (!input.shareConsent) throw new Error('Accord de partage requis.');
  await protectAIRequest();
  return prioritizeEmergencyAndAlertFlow(input);
}

const emergencyAlertPrompt = ai.definePrompt({
  name: 'emergencyAlertPrompt',
  config: { maxOutputTokens: 1024, temperature: 0.7 },
  input: {
    schema: z.object({
      symptoms: z.string().describe('The symptoms reported by the user.'),
      latitude: z.number().optional().describe('The latitude of the user.'),
      longitude: z.number().optional().describe('The longitude of the user.'),
    }),
  },
  output: {
    schema: z.object({
      isEmergency: z.boolean().describe('Whether the case is an emergency, particularly suspected malaria.'),
      reason: z.string().describe('The detailed reasoning for the emergency determination, including symptoms and location.  This is important if the value of `isEmergency` is true.'),
    }),
  },
  prompt: `Based on the user's reported symptoms: {{{symptoms}}}, and their location (latitude: {{{latitude}}}, longitude: {{{longitude}}}), determine if this is an emergency, especially considering the possibility of suspected malaria. Explain your reasoning. Return a JSON object. Include the full reasoning for your determination, and set isEmergency to true or false. If the user reports symptoms consistent with malaria, such as fever, chills, and headache, consider it an emergency.
`,
});

const prioritizeEmergencyAndAlertFlow = ai.defineFlow<
  typeof PrioritizeEmergencyAndAlertInputSchema,
  typeof PrioritizeEmergencyAndAlertOutputSchema
>({
  name: 'prioritizeEmergencyAndAlertFlow',
  inputSchema: PrioritizeEmergencyAndAlertInputSchema,
  outputSchema: PrioritizeEmergencyAndAlertOutputSchema,
},
async input => {
  try {
    const {latitude, longitude, symptoms, phoneNumber} = input;
    const {output: emergencyOutput} = await emergencyAlertPrompt({ // Renamed to avoid conflict if 'output' is used elsewhere
      symptoms: symptoms,
      latitude: latitude,
      longitude: longitude,
    });

    if (!emergencyOutput) {
      console.error('AI prompt output was null or undefined for emergencyAlertPrompt');
      throw new Error("AI failed to determine emergency status. Output was empty.");
    }

    let notifications: EmergencyNotifications = {
      clinicsAlerted: [], clinicsPending: [], notificationsFailed: 0, notificationStatus: 'not-needed',
    };

    let receipt;
    if (emergencyOutput.isEmergency) {
      await consumeQuota('notification', clientAddress(await headers()));
      if (latitude === undefined || longitude === undefined) notifications.notificationStatus = 'unavailable';
      else {
        const message = `SamaSanté : demande d'assistance urgente. Symptômes rapportés : ${symptoms}. Contact : ${phoneNumber}.`;
        if (outboxConfigured() && input.requestKey && input.receiptToken) {
          const partners = emergencyPartners({ latitude, longitude });
          if (partners.length) {
            receipt = await enqueueNotifications({ recipients: partners, message, requestKey: input.requestKey,
              token: input.receiptToken, ownerHash: quotaIdentity(clientAddress(await headers())) });
            await drainNotifications(receipt.id);
            const statuses = await notificationStatus(receipt) || [];
            notifications = {
              clinicsAlerted: statuses.filter(row => row.state === 'delivered').map(row => row.partner_name),
              clinicsPending: statuses.filter(row => ['queued', 'processing', 'accepted'].includes(row.state)).map(row => row.partner_name),
              notificationsFailed: statuses.filter(row => ['failed', 'unknown'].includes(row.state)).length,
              notificationStatus: statuses.length && statuses.every(row => row.state === 'delivered') ? 'delivered'
                : statuses.some(row => row.state === 'delivered') ? 'partial'
                : statuses.some(row => ['queued', 'processing', 'accepted'].includes(row.state)) ? 'pending' : 'failed',
            };
          } else notifications.notificationStatus = 'unavailable';
        } else if (process.env.NODE_ENV !== 'production') notifications = await notifyEmergencyClinics({ latitude, longitude }, message);
        else notifications.notificationStatus = 'unavailable';
      }
    }

    return {
      receipt,
      isEmergency: emergencyOutput.isEmergency,
      reason: emergencyOutput.reason,
      ...notifications,
    };
  } catch {
    throw new Error("Impossible de traiter l'alerte. Appelez le 1515 en cas d'urgence.");
  }
});
