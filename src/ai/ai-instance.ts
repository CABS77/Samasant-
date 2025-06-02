
import { genkit } from 'genkit';
import wrappedDeepseek, { deepseekChat, deepseekReasoner } from './plugins/wrapped-deepseek';

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    wrappedDeepseek({
      apiKey: process.env.DEEPSEEK_API_KEY,
    }),
  ],
  model: deepseekReasoner, // Utilise le modèle de raisonnement pour les évaluations de santé
});
