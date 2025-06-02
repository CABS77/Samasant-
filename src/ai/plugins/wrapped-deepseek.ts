import { genkitPlugin } from 'genkit/plugin';
import deepseek, { deepseekChat, deepseekReasoner } from 'genkitx-deepseek';
import { SUPPORTED_DEEPSEEK_MODELS } from 'genkitx-deepseek/dist/models';
import { deepseekRunner } from 'genkitx-deepseek/dist/runner';
import { OpenAI } from 'openai';

export interface PluginOptions {
  apiKey?: string;
  baseURL?: string;
}

export { deepseekChat, deepseekReasoner };

export const wrappedDeepseek = (options?: PluginOptions) =>
  genkitPlugin('wrapped-deepseek', async (ai) => {
    // Initialize original deepseek plugin to ensure any side effects
    await deepseek(options)(ai);

    const apiKey = options?.apiKey || process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error('Deepseek API key is required. Pass plugin options or set DEEPSEEK_API_KEY environment variable.');
    }

    const baseURL = options?.baseURL || process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com';
    const client = new OpenAI({ apiKey, baseURL });

    const wrapRunner = (runner: any) => async (request: any, streamingCallback?: any) => {
      const result = await runner(request, streamingCallback);
      if (result?.candidates) {
        result.candidates = result.candidates.map((c: any) => ({
          ...c,
          message: {
            role: c.message.role,
            content: [{ text: c.message.text }],
          },
        }));
      }
      return result;
    };

    for (const name of Object.keys(SUPPORTED_DEEPSEEK_MODELS)) {
      const model = SUPPORTED_DEEPSEEK_MODELS[name];
      ai.defineModel(
        {
          name: model.name,
          ...model.info,
          configSchema: model.configSchema,
        },
        wrapRunner(deepseekRunner(name, client))
      );
    }
  });

export default wrappedDeepseek;
