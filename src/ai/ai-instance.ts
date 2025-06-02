
import { genkit } from 'genkit';
import deepseek, { deepseekChat, deepseekReasoner } from 'genkitx-deepseek';

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    deepseek({
      apiKey: process.env.DEEPSEEK_API_KEY,
    }),
  ],
  model: deepseekReasoner, // Utilise le modèle de raisonnement pour les évaluations de santé
});
