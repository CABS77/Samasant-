import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  toAnthropicRequest,
  fromAnthropicResponse,
  DEFAULT_CLAUDE_MODEL,
} from '../src/ai/plugins/claude';

const defaults = { model: DEFAULT_CLAUDE_MODEL, maxTokens: 4096 };

describe('toAnthropicRequest', () => {
  it('moves system messages to the system field and maps model to assistant', () => {
    const req = toAnthropicRequest(
      {
        messages: [
          { role: 'system', content: [{ text: 'Tu es SamaSanté.' }] },
          { role: 'user', content: [{ text: 'Mangi am sëkk' }] },
          { role: 'model', content: [{ text: 'Depuis quand ?' }] },
          { role: 'user', content: [{ text: 'Ñaari fan' }] },
        ],
      } as any,
      defaults
    );

    expect(req.system).toBe('Tu es SamaSanté.');
    expect(req.messages.map((m) => m.role)).toEqual(['user', 'assistant', 'user']);
    expect(req.model).toBe(DEFAULT_CLAUDE_MODEL);
    expect(req.max_tokens).toBe(4096);
  });

  it('merges consecutive user messages, including injected JSON instructions', () => {
    const req = toAnthropicRequest(
      {
        messages: [
          { role: 'user', content: [{ text: 'Symptômes : fièvre' }] },
          { role: 'user', content: [{ text: 'Output should be in JSON format.' }] },
        ],
      } as any,
      defaults
    );

    expect(req.messages).toHaveLength(1);
    expect(req.messages[0].content).toContain('fièvre');
    expect(req.messages[0].content).toContain('JSON');
  });

  it('maps common config and ignores Gemini-only keys', () => {
    const req = toAnthropicRequest(
      {
        messages: [{ role: 'user', content: [{ text: 'hi' }] }],
        config: {
          temperature: 0.3,
          maxOutputTokens: 1000,
          safetySettings: [{ category: 'X', threshold: 'BLOCK_NONE' }],
          generationConfig: { maxOutputTokens: 600 },
        },
      } as any,
      defaults
    );

    expect(req.temperature).toBe(0.3);
    expect(req.max_tokens).toBe(1000);
    expect(req).not.toHaveProperty('safetySettings');
    expect(req).not.toHaveProperty('generationConfig');
  });

  it('rejects a request without a user message', () => {
    expect(() =>
      toAnthropicRequest({ messages: [{ role: 'system', content: [{ text: 'x' }] }] } as any, defaults)
    ).toThrow(/user message/);
  });
});

describe('fromAnthropicResponse', () => {
  it('joins text blocks and maps stop reasons and usage', () => {
    const res = fromAnthropicResponse({
      content: [
        { type: 'text', text: '{"a":' },
        { type: 'text', text: '1}' },
      ],
      stop_reason: 'end_turn',
      usage: { input_tokens: 12, output_tokens: 5 },
    });
    expect(res.message?.content[0]).toEqual({ text: '{"a":1}' });
    expect(res.finishReason).toBe('stop');
    expect(res.usage).toEqual({ inputTokens: 12, outputTokens: 5 });
  });

  it('reports truncation as length', () => {
    expect(fromAnthropicResponse({ content: [], stop_reason: 'max_tokens' }).finishReason).toBe('length');
  });
});

describe('resolveAiProvider', () => {
  it('uses Claude when a key is present, DeepSeek otherwise, and honours AI_PROVIDER', async () => {
    vi.resetModules();
    vi.doMock('genkit', () => ({ genkit: vi.fn(() => ({})) }));
    const { resolveAiProvider } = await import('../src/ai/ai-instance');

    expect(resolveAiProvider({} as any)).toBe('deepseek');
    expect(resolveAiProvider({ ANTHROPIC_API_KEY: 'k' } as any)).toBe('claude');
    expect(resolveAiProvider({ ANTHROPIC_API_KEY: 'k', AI_PROVIDER: 'deepseek' } as any)).toBe('deepseek');
    expect(resolveAiProvider({ AI_PROVIDER: 'Claude' } as any)).toBe('claude');
    vi.doUnmock('genkit');
  });
});

describe('initial health assessment through Genkit with Claude', () => {
  const create = vi.fn();
  const saved = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    create.mockReset();
    process.env.ANTHROPIC_API_KEY = 'test-key';
    delete process.env.AI_PROVIDER;
    vi.doMock('@anthropic-ai/sdk', () => ({
      default: vi.fn().mockImplementation(() => ({ messages: { create } })),
    }));
  });

  afterEach(() => {
    process.env = { ...saved };
    vi.doUnmock('@anthropic-ai/sdk');
  });

  it('sends the prompt with the JSON schema to Claude and parses the structured reply', async () => {
    const reply = {
      assessment: 'Sëkk bu yàgg.',
      traditionalRemedies: Array.from({ length: 5 }, (_, i) => ({ name: `r${i}`, description: `d${i}` })),
      nextSteps: 'Dem ci doktoor bu sëkk bi yàggee.',
    };
    create.mockResolvedValue({
      content: [{ type: 'text', text: '```json\n' + JSON.stringify(reply) + '\n```' }],
      stop_reason: 'end_turn',
      usage: { input_tokens: 400, output_tokens: 200 },
    });

    const { initialHealthAssessment } = await import('../src/ai/flows/initial-health-assessment');
    const result = await initialHealthAssessment({ message: 'Mangi am sëkk', language: 'wolof' });

    expect(result).toEqual(reply);
    expect(create).toHaveBeenCalledTimes(1);
    const sent = create.mock.calls[0][0];
    expect(sent.model).toBe(DEFAULT_CLAUDE_MODEL);
    expect(sent.max_tokens).toBe(4096);
    expect(sent.messages[0].role).toBe('user');
    expect(sent.messages[0].content).toContain('Mangi am sëkk');
    expect(sent.messages[0].content).toContain('traditionalRemedies'); // schema injected by Genkit
    expect(sent).not.toHaveProperty('safetySettings');
  });
});
