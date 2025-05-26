
'use server';
/**
 * @fileOverview Genkit flow to generate traditional remedies when none are found in the database.
 *
 * - generateRemedies - A function that generates remedies based on a symptom.
 * - GenerateRemediesInput - The input type for the generateRemedies function.
 * - GenerateRemediesOutput - The return type for the generateRemedies function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

// Input Schema
const GenerateRemediesInputSchema = z.object({
  symptom: z.string().describe('The symptom for which remedies are needed.'),
});
export type GenerateRemediesInput = z.infer<typeof GenerateRemediesInputSchema>;

// Output Schema for a single generated remedy
const GeneratedRemedySchema = z.object({
  name: z.string().describe("Nom franco-wolof du remède/astuce."),
  description: z.string().describe("Description franco-wolof et utilisation pratique du remède/astuce."),
  symptom: z.string().describe("Le symptôme principal que ce remède vise (repeat of input)."),
  isGenerated: z.literal(true).describe("Indique que ce remède a été généré par l'IA.") 
});
export type GeneratedRemedy = z.infer<typeof GeneratedRemedySchema>;


// Output Schema for the flow
const GenerateRemediesOutputSchema = z.object({
  generatedRemedies: z.array(GeneratedRemedySchema).describe("Liste d'au moins 3 remèdes traditionnels sénégalais générés par l'IA pour le symptôme donné.")
});
export type GenerateRemediesOutput = z.infer<typeof GenerateRemediesOutputSchema>;


// Exported wrapper function
export async function generateRemedies(input: GenerateRemediesInput): Promise<GenerateRemediesOutput> {
  return generateRemediesFlow(input);
}

// Prompt Definition
const generateRemediesPrompt = ai.definePrompt({
  name: 'generateRemediesPrompt',
  input: { schema: GenerateRemediesInputSchema },
  output: { schema: GenerateRemediesOutputSchema },
  prompt: `You are an AI assistant knowledgeable about traditional Senegalese remedies ('safara yu mag ñi').
The user is searching for remedies for the symptom: '{{{symptom}}}' but none were found in the database.

Generate a list of AT LEAST 3 relevant traditional Senegalese remedies or grandmother's tips ('conseils de grand-mère' / 'astuces de mag ñi') for this symptom.
Respond ONLY in Franco-Wolof, mixing French and common Wolof terms naturally as spoken in Senegal.

For each remedy, provide:
1. 'name': The Franco-Wolof name of the remedy/tip.
2. 'description': A practical and easy-to-understand Franco-Wolof description of how to prepare and use it.
3. 'symptom': Repeat the input symptom '{{{symptom}}}'.
4. 'isGenerated': Set this field to \`true\`.

DO NOT include an 'imageUrl' field. This will be handled separately.

Return the response as a JSON object matching the output schema. Ensure the remedies are culturally relevant to Senegal. Focus on simple, common remedies.
`,
});

// Flow Definition
const generateRemediesFlow = ai.defineFlow<
  typeof GenerateRemediesInputSchema,
  typeof GenerateRemediesOutputSchema
>({
  name: 'generateRemediesFlow',
  inputSchema: GenerateRemediesInputSchema,
  outputSchema: GenerateRemediesOutputSchema,
}, async (input) => {
  try {
    const { output } = await generateRemediesPrompt(input);

    if (!output?.generatedRemedies) {
      console.error("AI failed to generate remedies or returned an invalid format from prompt.");
      throw new Error("AI failed to generate remedies or returned an invalid format.");
    }
    return output;
  } catch (error: any) {
    console.error(`Error in generateRemediesFlow: ${error.message}`, error.stack);
    throw new Error(`Failed to generate remedies: ${error.message}`);
  }
});
