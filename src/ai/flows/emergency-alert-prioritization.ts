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
import {getNearbyClinics} from '@/services/mapbox';
import {sendSms} from '@/services/sms';

const PrioritizeEmergencyAndAlertInputSchema = z.object({
  symptoms: z.string().describe('The symptoms reported by the user.'),
  phoneNumber: z.string().describe('The phone number of the user.'),
  latitude: z.number().describe('The latitude of the user.'),
  longitude: z.number().describe('The longitude of the user.'),
});
export type PrioritizeEmergencyAndAlertInput = z.infer<typeof PrioritizeEmergencyAndAlertInputSchema>;

const PrioritizeEmergencyAndAlertOutputSchema = z.object({
  isEmergency: z.boolean().describe('Whether the case is an emergency.'),
  reason: z.string().describe('The reason for the emergency determination.'),
  clinicsAlerted: z.array(z.string()).describe('The names of the clinics that were alerted.'),
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

    const nearbyClinics = await getNearbyClinics({latitude, longitude});
    const clinicsAlerted: string[] = [];

    if (emergencyOutput.isEmergency) {
      const message = `Emergency alert: Possible malaria case reported near you. Symptoms: ${symptoms}. Contact: ${phoneNumber}.`;
      for (const clinic of nearbyClinics) {
        try {
            await sendSms('+' + phoneNumber, message);
            clinicsAlerted.push(clinic.name);
        } catch (smsError: any) {
            console.error(`Failed to send SMS to ${clinic.name}: ${smsError.message}`);
            // Optionally, decide if this should stop the whole process or just log and continue
            // For now, it logs and continues.
        }
      }
    }

    return {
      isEmergency: emergencyOutput.isEmergency,
      reason: emergencyOutput.reason,
      clinicsAlerted: clinicsAlerted,
    };
  } catch (error: any) {
    console.error(`Error in prioritizeEmergencyAndAlertFlow: ${error.message}`, error.stack);
    throw new Error(`Failed to process emergency alert: ${error.message}`);
  }
});
