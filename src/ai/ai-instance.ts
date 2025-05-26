
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
  // Mise à jour vers un modèle plus récent et adapté pour le texte.
  // gemini-1.5-flash offre un bon équilibre entre performance, coût et capacités.
  model: 'googleai/gemini-1.5-flash',
});
