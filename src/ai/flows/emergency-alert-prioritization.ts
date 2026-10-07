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
import {notifyEmergencyClinics, type EmergencyNotifications} from '@/services/emergency-notifications';

const PrioritizeEmergencyAndAlertInputSchema = z.object({
  symptoms: z.string().trim().min(1).max(2000),
  phoneNumber: z.string().trim().regex(/^\+[1-9]\d{7,14}$/),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
export type PrioritizeEmergencyAndAlertInput = z.infer<typeof PrioritizeEmergencyAndAlertInputSchema>;

const PrioritizeEmergencyAndAlertOutputSchema = z.object({
  isEmergency: z.boolean().describe('Whether the case is an emergency.'),
  reason: z.string().describe('The reason for the emergency determination.'),
  clinicsAlerted: z.array(z.string()).describe('The names of the clinics that were alerted.'),
  clinicsPending: z.array(z.string()),
  notificationsFailed: z.number().int().nonnegative(),
  notificationStatus: z.enum(['not-needed', 'unavailable', 'failed', 'pending', 'delivered', 'partial']),
});
export type PrioritizeEmergencyAndAlertOutput = z.infer<typeof PrioritizeEmergencyAndAlertOutputSchema>;

export async function prioritizeEmergencyAndAlert(input: PrioritizeEmergencyAndAlertInput): Promise<PrioritizeEmergencyAndAlertOutput> {
  return prioritizeEmergencyAndAlertFlow(input);
}

const emergencyAlertPrompt = ai.definePrompt({
  name: 'emergencyAlertPrompt',
  input: {
    schema: z.object({
      symptoms: z.string().describe('The symptoms reported by the user.'),
      latitude: z.number().describe('The latitude of the user.'),
      longitude: z.number().describe('The longitude of the user.'),
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

    if (emergencyOutput.isEmergency) {
      const message = `SamaSanté : demande d'assistance urgente. Symptômes rapportés : ${symptoms}. Contact : ${phoneNumber}.`;
      notifications = await notifyEmergencyClinics({latitude, longitude}, message);
    }

    return {
      isEmergency: emergencyOutput.isEmergency,
      reason: emergencyOutput.reason,
      ...notifications,
    };
  } catch {
    throw new Error("Impossible de traiter l'alerte. Appelez le 1515 en cas d'urgence.");
  }
});
