
// initial-health-assessment.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for performing an initial health assessment based on user input in Wolof, French, or Pulaar.
 *
 * - initialHealthAssessment - A function that initiates the health assessment flow.
 * - InitialHealthAssessmentInput - The input type for the initialHealthAssessment function, including the user's message and language.
 * - InitialHealthAssessmentOutput - The return type for the initialHealthAssessment function, providing an assessment and suggested next steps.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {translateToWolof} from '@/ai/flows/translate-to-wolof';

const STANDARD_MEDICAL_DISCLAIMER =
  'IMPORTANT : Je ne suis pas médecin. Ces informations sont issues de la tradition et ne remplacent pas un avis professionnel. Consultez toujours un professionnel de santé et considérez ces remèdes comme complémentaires.';

const InitialHealthAssessmentInputSchema = z.object({
  message: z.string().describe('The user message describing their symptoms or health concerns.'),
  language: z.enum(['wolof', 'french', 'pulaar', 'franco-wolof']).describe('The language of the user message. Franco-Wolof is a mix of French and Wolof.'),
});
export type InitialHealthAssessmentInput = z.infer<typeof InitialHealthAssessmentInputSchema>;

const RemedyDetailSchema = z.object({
  name: z.string().describe("Nom du remède/astuce."),
  description: z.string().describe("Description et utilisation du remède/astuce.")
});

const InitialHealthAssessmentOutputSchema = z.object({
  assessment: z.string().describe('An initial assessment of the user provided symptoms.'),
  traditionalRemedies: z.array(RemedyDetailSchema).describe('A list of at least 5 traditional remedies or grandmother\'s tips (conseils de grand-mère / astuces de mag ñi) relevant to the user\'s symptoms, each with a name and description.'),
  nextSteps: z.string().describe('General next steps advice, including whether to see a doctor (rendez-vous ak doktoor) or go to a clinic (dem ci daara-jàngu).'),
});
export type InitialHealthAssessmentOutput = z.infer<typeof InitialHealthAssessmentOutputSchema>;

export async function initialHealthAssessment(input: InitialHealthAssessmentInput): Promise<InitialHealthAssessmentOutput> {
  return initialHealthAssessmentFlow(input);
}

const initialHealthAssessmentPrompt = ai.definePrompt({
  name: 'initialHealthAssessmentPrompt',
  input: {
    schema: z.object({
      message: z.string().describe('The user message describing their symptoms or health concerns.'),
      language: z.enum(['wolof', 'french', 'pulaar', 'franco-wolof']).describe('The language of the user message. Franco-Wolof is a mix of French and Wolof.'),
    }),
  },
  output: {
    schema: InitialHealthAssessmentOutputSchema,
  },
  prompt: `Vous êtes "Sama Kër Xel" (Ma Maison de Sagesse), un assistant IA amical de SamaSanté. Votre rôle est de partager la sagesse traditionnelle sénégalaise et des conseils de grand-mère ('conseils de grand-mère' / 'astuces de mag ñi') pour les préoccupations de santé courantes.
L'utilisateur fournira un message décrivant ses symptômes et la langue de réponse souhaitée via le paramètre 'language'.

${STANDARD_MEDICAL_DISCLAIMER}
Répondez uniquement en '{{{language}}}'.
- 'french': en français
- 'wolof': en wolof uniquement
- 'franco-wolof': mélange français et wolof
- 'pulaar': en pulaar si possible, sinon en franco-wolof avec une note.

Basé sur '{{{message}}}', retournez un objet JSON :
1. 'assessment' – brève évaluation non diagnostique
2. 'traditionalRemedies' – au moins 5 remèdes ou astuces avec nom et description
3. 'nextSteps' – conseils généraux et rappel de consulter un professionnel.
  `,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
    generationConfig: {
      maxOutputTokens: 300,
      temperature: 0.7,
    },
  },
});

const initialHealthAssessmentFlow = ai.defineFlow<
  typeof InitialHealthAssessmentInputSchema,
  typeof InitialHealthAssessmentOutputSchema
>({
  name: 'initialHealthAssessmentFlow',
  inputSchema: InitialHealthAssessmentInputSchema,
  outputSchema: InitialHealthAssessmentOutputSchema,
}, async input => {
  try {
    const {output} = await initialHealthAssessmentPrompt(input);
    if (!output) {
      console.error('AI prompt output was null or undefined for initialHealthAssessmentPrompt');
      throw new Error("AI failed to generate a response. Output was empty.");
    }
    // Ensure traditionalRemedies is an array, even if the AI fails to provide it as such
    if (!Array.isArray(output.traditionalRemedies)) {
      console.warn('AI output for traditionalRemedies was not an array, correcting.');
      output.traditionalRemedies = [];
    }
//     if (input.language === 'wolof') {
//       const translations = [
//         translateToWolof({ text: output.assessment })
//           .then(res => {
//             output.assessment = res.translation;
//           })
//           .catch(e => {
//             console.error('Failed to translate assessment to Wolof', e);
//           }),
//         translateToWolof({ text: output.nextSteps })
//           .then(res => {
//             output.nextSteps = res.translation;
//           })
//           .catch(e => {
//             console.error('Failed to translate next steps to Wolof', e);
//           }),
//         ...output.traditionalRemedies.map(r =>
//           translateToWolof({ text: r.description })
//             .then(res => {
//               r.description = res.translation;
//             })
//             .catch(e => {
//               console.error('Failed to translate remedy description', e);
//             })
//         ),
//       ];
// 
//       await Promise.all(translations);
//     }
    return output;
  } catch (error: any) {
    console.error(`Error in initialHealthAssessmentFlow: ${error.message}`, error.stack);
    throw new Error(`Failed to process health assessment: ${error.message}`);
  }
});
