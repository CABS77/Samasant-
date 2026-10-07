import Anthropic from '@anthropic-ai/sdk';
import type {
  GenerateRequest,
  GenerateResponseData,
  MessageData,
} from 'genkit/model';
import { GenerationCommonConfigSchema } from 'genkit/model';
import { genkitPlugin } from 'genkit/plugin';

/**
 * Claude provider for Genkit.
 *
 * Exposes a single model, `claude/chat`, whose underlying Claude model is
 * chosen at runtime with CLAUDE_MODEL. The model declares no native
 * constrained output, so Genkit injects the JSON schema of each prompt into
 * the request and parses the JSON reply, exactly as it does for DeepSeek.
 * The existing flows therefore work unchanged.
 */

export const CLAUDE_MODEL_NAME = 'claude/chat';
export const DEFAULT_CLAUDE_MODEL = 'claude-sonnet-5-5';
export const DEFAULT_MAX_TOKENS = 4096;

export interface ClaudePluginOptions {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
}

type AnthropicRole = 'user' | 'assistant';

export interface AnthropicRequest {
  model: string;
  max_tokens: number;
  system?: string;
  temperature?: number;
  top_p?: number;
  stop_sequences?: string[];
  messages: { role: AnthropicRole; content: string }[];
}

const textOf = (message: MessageData) =>
  message.content
    .map((part) => ('text' in part && typeof part.text === 'string' ? part.text : ''))
    .filter(Boolean)
    .join('\n');

/** Converts a Genkit request into a Claude Messages API request. */
export function toAnthropicRequest(
  request: GenerateRequest,
  defaults: { model: string; maxTokens: number }
): AnthropicRequest {
  const system: string[] = [];
  const messages: AnthropicRequest['messages'] = [];

  for (const message of request.messages) {
    const text = textOf(message);
    if (!text) continue;

    if (message.role === 'system') {
      system.push(text);
      continue;
    }

    const role: AnthropicRole = message.role === 'model' ? 'assistant' : 'user';
    const previous = messages[messages.length - 1];
    if (previous && previous.role === role) {
      // Claude expects alternating turns: merge consecutive same-role messages.
      previous.content = `${previous.content}\n\n${text}`;
    } else {
      messages.push({ role, content: text });
    }
  }

  if (messages.length === 0 || messages[0].role !== 'user') {
    throw new Error('Claude request must start with a user message.');
  }

  // Only the common Genkit config keys are mapped. Provider-specific keys left
  // in the prompts (Gemini safetySettings, generationConfig) are ignored.
  const config = (request.config ?? {}) as Record<string, unknown>;
  const out: AnthropicRequest = {
    model: typeof config.version === 'string' ? config.version : defaults.model,
    max_tokens:
      typeof config.maxOutputTokens === 'number' ? config.maxOutputTokens : defaults.maxTokens,
    messages,
  };
  if (system.length) out.system = system.join('\n\n');
  if (typeof config.temperature === 'number') out.temperature = config.temperature;
  else if (typeof config.topP === 'number') out.top_p = config.topP;
  if (Array.isArray(config.stopSequences) && config.stopSequences.length) {
    out.stop_sequences = config.stopSequences as string[];
  }
  return out;
}

const FINISH_REASONS: Record<string, GenerateResponseData['finishReason']> = {
  end_turn: 'stop',
  stop_sequence: 'stop',
  max_tokens: 'length',
  refusal: 'blocked',
};

/** Converts a Claude Messages API response into a Genkit response. */
export function fromAnthropicResponse(response: {
  content: { type: string; text?: string }[];
  stop_reason?: string | null;
  usage?: { input_tokens?: number; output_tokens?: number };
}): GenerateResponseData {
  const text = response.content
    .filter((block) => block.type === 'text' && typeof block.text === 'string')
    .map((block) => block.text as string)
    .join('');

  return {
    message: { role: 'model', content: [{ text }] },
    finishReason: FINISH_REASONS[response.stop_reason ?? ''] ?? 'other',
    usage: {
      inputTokens: response.usage?.input_tokens,
      outputTokens: response.usage?.output_tokens,
    },
  };
}

export const claude = (options: ClaudePluginOptions = {}) =>
  genkitPlugin('claude', async (ai) => {
    const model = options.model || process.env.CLAUDE_MODEL || DEFAULT_CLAUDE_MODEL;
    const maxTokens =
      options.maxTokens || Number(process.env.CLAUDE_MAX_TOKENS) || DEFAULT_MAX_TOKENS;
    let client: Anthropic | undefined;

    ai.defineModel(
      {
        name: CLAUDE_MODEL_NAME,
        label: `Claude (${model})`,
        configSchema: GenerationCommonConfigSchema.passthrough(),
        supports: {
          multiturn: true,
          systemRole: true,
          media: false,
          tools: false,
          output: ['text', 'json'],
          constrained: 'none',
        },
      },
      async (request) => {
        // The key is checked per call rather than at start-up, so a missing key
        // fails the request with a clear message instead of breaking the build.
        const apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
          throw new Error('ANTHROPIC_API_KEY is not set: the Claude provider cannot be used.');
        }
        client ??= new Anthropic({ apiKey });
        const response = await client.messages.create(
          toAnthropicRequest(request, { model, maxTokens })
        );
        return fromAnthropicResponse(response);
      }
    );
  });

export default claude;
