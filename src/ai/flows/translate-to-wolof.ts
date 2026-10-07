'use server';
/**
 * @fileOverview Genkit flow to translate French or Franco-Wolof text to pure Wolof.
 *
 * - translateToWolof - A function that translates text to Wolof.
 * - TranslateToWolofInput - The input type for the translateToWolof function.
 * - TranslateToWolofOutput - The return type for the translateToWolof function.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';
import { protectAIRequest } from '@/lib/ai-request';

const TranslateToWolofInputSchema = z.object({
  text: z.string().trim().min(3).max(1000).describe('French or Franco-Wolof text to translate to Wolof.'),
});
export type TranslateToWolofInput = z.infer<typeof TranslateToWolofInputSchema>;

const TranslateToWolofOutputSchema = z.object({
  translation: z.string().describe('The text translated into Wolof.'),
});
export type TranslateToWolofOutput = z.infer<typeof TranslateToWolofOutputSchema>;

export async function translateToWolof(
  input: TranslateToWolofInput
): Promise<TranslateToWolofOutput> {
  TranslateToWolofInputSchema.parse(input);
  await protectAIRequest();
  return translateToWolofFlow(input);
}

const translateToWolofPrompt = ai.definePrompt({
  name: 'translateToWolofPrompt',
  config: { maxOutputTokens: 1024, temperature: 0.7 },
  input: { schema: z.object({ text: z.string().trim().min(3).max(1000).describe('Text to translate.') }) },
  output: { schema: z.object({ translation: z.string().describe('The text translated into Wolof.') }) },
  prompt: `Vous êtes un traducteur expert de wolof. Traduisez fidèlement le texte suivant en wolof pur et naturel, sans ajouter de commentaires :\n"{{{text}}}"`,
});

const translateToWolofFlow = ai.defineFlow<
  typeof TranslateToWolofInputSchema,
  typeof TranslateToWolofOutputSchema
>({
  name: 'translateToWolofFlow',
  inputSchema: TranslateToWolofInputSchema,
  outputSchema: TranslateToWolofOutputSchema,
}, async (input) => {
  try {
    const { output } = await translateToWolofPrompt(input);
    if (!output) {
      throw new Error('AI failed to return translation.');
    }
    return output;
  } catch {

    throw new Error('Traduction momentanément indisponible.');
  }
});
