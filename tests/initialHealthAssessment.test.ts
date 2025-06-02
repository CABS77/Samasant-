import { describe, it, expect, beforeEach, vi } from 'vitest';

let translateMock: any;
let promptOutputs: Record<string, any>;

vi.mock('../src/ai/flows/translate-to-wolof.ts', () => {
  translateMock = vi.fn(async ({ text }) => ({ translation: text + '_wolof' }));
  return { translateToWolof: translateMock };
});

vi.mock('../src/ai/ai-instance', () => {
  return {
    ai: {
      definePrompt: vi.fn((opts: any) => {
        return async () => ({ output: promptOutputs[opts.name] });
      }),
      defineFlow: vi.fn((opts: any, handler: any) => handler),
    },
  };
});

let initialHealthAssessment: any;

beforeEach(async () => {
  vi.resetModules();
  promptOutputs = {};
  const mod = await import('../src/ai/flows/initial-health-assessment');
  initialHealthAssessment = mod.initialHealthAssessment;
});

describe('initialHealthAssessment flow', () => {
  it('translates fields when language is wolof', async () => {
    promptOutputs['initialHealthAssessmentPrompt'] = {
      assessment: 'assess fr',
      traditionalRemedies: [
        { name: 'r1', description: 'desc1' },
        { name: 'r2', description: 'desc2' },
      ],
      nextSteps: 'next fr',
    };

    const result = await initialHealthAssessment({ message: 'm', language: 'wolof' });

    expect(translateMock).toHaveBeenCalledTimes(4);
    expect(result.assessment).toBe('assess fr_wolof');
    expect(result.traditionalRemedies[0].description).toBe('desc1_wolof');
    expect(result.nextSteps).toBe('next fr_wolof');
  });
});
