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

const TranslateToWolofInputSchema = z.object({
  text: z.string().describe('French or Franco-Wolof text to translate to Wolof.'),
});
export type TranslateToWolofInput = z.infer<typeof TranslateToWolofInputSchema>;

const TranslateToWolofOutputSchema = z.object({
  translation: z.string().describe('The text translated into Wolof.'),
});
export type TranslateToWolofOutput = z.infer<typeof TranslateToWolofOutputSchema>;

export async function translateToWolof(
  input: TranslateToWolofInput
): Promise<TranslateToWolofOutput> {
  return translateToWolofFlow(input);
}

const translateToWolofPrompt = ai.definePrompt({
  name: 'translateToWolofPrompt',
  input: { schema: z.object({ text: z.string().describe('Text to translate.') }) },
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
  } catch (error: any) {
    console.error(`Error in translateToWolofFlow: ${error.message}`, error.stack);
    throw new Error(`Failed to translate text to Wolof: ${error.message}`);
  }
});
