
import { genkit } from 'genkit';
import wrappedDeepseek, { deepseekChat, deepseekReasoner } from './plugins/wrapped-deepseek';

const modelEnv = process.env.DEEPSEEK_MODEL?.toLowerCase();
// Use the faster chat model by default. Explicitly set DEEPSEEK_MODEL=reasoner
// to use the more advanced but slower model.
const selectedModel =
  !modelEnv || modelEnv === 'chat' || modelEnv === 'deepseekchat'
    ? deepseekChat
    : deepseekReasoner;

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    wrappedDeepseek({
      apiKey: process.env.DEEPSEEK_API_KEY,
    }),
  ],
  model: selectedModel, // Modèle par défaut configurable via DEEPSEEK_MODEL
});
