import { genkitPlugin } from 'genkit/plugin';
import { GenerationCommonConfigSchema, type GenerateRequest } from 'genkit/model';
import OpenAI from 'openai';
import { serverFetch } from '@/lib/server-fetch';
import { withAICircuit } from '@/lib/ai-request';

export const deepseekChat = 'deepseek/chat';
export const deepseekReasoner = 'deepseek/reasoner';
export interface PluginOptions { apiKey?: string; baseURL?: string }

export function toDeepseekRequest(request: GenerateRequest, model: string): OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming {
  const config = request.config || {};
  return {
    model,
    messages: request.messages.map(message => ({
      role: message.role === 'model' ? 'assistant' : message.role === 'system' ? 'system' : 'user',
      content: message.content.map(part => 'text' in part ? part.text : '').join('\n'),
    })),
    max_tokens: Math.min(2048, Math.max(1, Number(config.maxOutputTokens) || 1024)),
    temperature: typeof config.temperature === 'number' ? config.temperature : 0.7,
    stream: false,
  };
}

export const wrappedDeepseek = (options: PluginOptions = {}) => genkitPlugin('deepseek', async ai => {
  for (const [name, model] of [
    [deepseekChat, 'deepseek-flash'], [deepseekReasoner, 'deepseek-v4-pro'],
  ]) {
    let client: OpenAI | undefined;
    ai.defineModel({
      name, configSchema: GenerationCommonConfigSchema.passthrough(),
      supports: { multiturn: true, systemRole: true, media: false, tools: false, output: ['text', 'json'], constrained: 'none' },
    }, async request => {
      const apiKey = options.apiKey || process.env.DEEPSEEK_API_KEY;
      if (!apiKey) throw new Error('Assistant indisponible.');
      client ??= new OpenAI({ apiKey, baseURL: options.baseURL || process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com',
        fetch: serverFetch, timeout: 15000, maxRetries: 0 });
      return withAICircuit('deepseek', async () => {
        const result = await client!.chat.completions.create(toDeepseekRequest(request, model));
        const choice = result.choices[0];
        if (!choice?.message.content) throw new Error('Empty output');
        return {
          message: { role: 'model', content: [{ text: choice.message.content }] },
          finishReason: choice.finish_reason === 'length' ? 'length' : 'stop',
          usage: { inputTokens: result.usage?.prompt_tokens, outputTokens: result.usage?.completion_tokens },
        };
      });
    });
  }
});
export default wrappedDeepseek;
