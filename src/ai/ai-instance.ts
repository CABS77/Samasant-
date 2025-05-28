
import { genkit } from 'genkit';
import { openAI as deepSeek } from '@genkit-ai/openai';

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    deepSeek({
      apiKey: process.env.DEEPSEEK_API_KEY,
    }),
  ],
  model: 'deepseek/deepseek-r1',
});
