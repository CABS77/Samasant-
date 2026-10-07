
import { genkit } from 'genkit';
import claude, { CLAUDE_MODEL_NAME } from './plugins/claude';
import wrappedDeepseek, { deepseekChat, deepseekReasoner } from './plugins/wrapped-deepseek';

/**
 * AI provider selection.
 *
 * - AI_PROVIDER=claude or AI_PROVIDER=deepseek forces a provider.
 * - Otherwise Claude is used as soon as ANTHROPIC_API_KEY is set, and DeepSeek
 *   stays the fallback. Production keeps running on DeepSeek until the Claude
 *   key is added in Vercel, then switches without a code change.
 */
export type AiProvider = 'claude' | 'deepseek';

export function resolveAiProvider(env: NodeJS.ProcessEnv = process.env): AiProvider {
  const forced = env.AI_PROVIDER?.trim().toLowerCase();
  if (forced === 'claude' || forced === 'deepseek') return forced;
  return env.ANTHROPIC_API_KEY ? 'claude' : 'deepseek';
}

export const aiProvider = resolveAiProvider();

const deepseekModelEnv = process.env.DEEPSEEK_MODEL?.toLowerCase();
// DeepSeek: the faster chat model by default; DEEPSEEK_MODEL=reasoner for the slower one.
const deepseekModel =
  !deepseekModelEnv || deepseekModelEnv === 'chat' || deepseekModelEnv === 'deepseekchat'
    ? deepseekChat
    : deepseekReasoner;

export const ai =
  aiProvider === 'claude'
    ? genkit({
        promptDir: './prompts',
        plugins: [claude({ apiKey: process.env.ANTHROPIC_API_KEY })],
        model: CLAUDE_MODEL_NAME, // Claude model chosen with CLAUDE_MODEL
      })
    : genkit({
        promptDir: './prompts',
        plugins: [wrappedDeepseek({ apiKey: process.env.DEEPSEEK_API_KEY })],
        model: deepseekModel,
      });
