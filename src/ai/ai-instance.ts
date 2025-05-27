
import { genkit } from 'genkit';
import { openAI } from '@genkit-ai/openai';

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    openAI({
      apiKey: process.env.OPENAI_API_KEY,
    }),
  ],
  main
  model: 'openai/deepseek-r1',
});
