
import { genkit } from 'genkit';
import { openAI } from '@genkit-ai/openai';

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    openAI({
      apiKey: process.env.OPENAI_API_KEY,
    }),
  ],
  // Use DeepSeek R1
  model: 'openai/deepseek-r1',
});
