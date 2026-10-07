// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toDeepseekRequest } from '@/ai/plugins/wrapped-deepseek';
import type { GenerateRequest } from 'genkit/model';
const mocks = vi.hoisted(() => ({ create: vi.fn(), constructor: vi.fn() }));
vi.mock('openai', () => ({ default: function(options: unknown) { mocks.constructor(options); return { chat: { completions: { create: mocks.create } } }; } }));
vi.mock('next/headers', () => ({ headers: async () => new Headers() }));
vi.mock('@/lib/service-quota', () => ({ consumeQuota: vi.fn(), clientAddress: () => 'fixture' }));
beforeEach(() => { vi.resetModules(); vi.clearAllMocks(); vi.stubEnv('AI_PROVIDER','deepseek'); vi.stubEnv('DEEPSEEK_API_KEY','test-only'); });
afterEach(() => vi.unstubAllEnvs());
describe('DeepSeek model resolution and request controls', () => {
  it('maps supported token configuration, roles and text without ignored provider settings', () => {
    const request = { messages: [{role:'system',content:[{text:'test-system'}]},{role:'user',content:[{text:'fixture'}]},{role:'model',content:[{text:'reply'}]}], config:{maxOutputTokens:50000,temperature:0.2} } as GenerateRequest;
    const result = toDeepseekRequest(request,'deepseek-flash');
    expect(result.max_tokens).toBe(2048); expect(result.temperature).toBe(0.2); expect(result.messages.map(row=>row.role)).toEqual(['system','user','assistant']); expect(result.stream).toBe(false);
  });
  it.each([['chat','deepseek-flash'],['reasoner','deepseek-v4-pro']])('resolves %s through real Genkit and parses a structured response', async (configuration, model) => {
    vi.stubEnv('DEEPSEEK_MODEL',configuration);
    const output={assessment:'Fixture response',traditionalRemedies:Array.from({length:5},(_,i)=>({name:`Fixture ${i}`,description:'Test-only text'})),nextSteps:'Fixture next step'};
    mocks.create.mockResolvedValue({choices:[{message:{content:JSON.stringify(output)},finish_reason:'stop'}],usage:{prompt_tokens:100,completion_tokens:50}});
    const {initialHealthAssessment}=await import('@/ai/flows/initial-health-assessment');
    expect(await initialHealthAssessment({message:'Fixture request',language:'french',ageConfirmed:true})).toEqual(output);
    const sent=mocks.create.mock.calls[0][0]; expect(sent.model).toBe(model); expect(sent.max_tokens).toBe(800);
    expect(sent.messages.some((row:{content:string})=>row.content.includes('traditionalRemedies'))).toBe(true);
    expect(mocks.constructor).toHaveBeenCalledWith(expect.objectContaining({timeout:15000,maxRetries:0,fetch:expect.any(Function)}));
  });
});
