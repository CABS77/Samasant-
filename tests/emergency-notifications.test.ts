// @vitest-environment node
vi.mock('next/headers', () => ({ headers: async () => new Headers({ 'x-forwarded-for': 'flow-test' }) }));
vi.mock('@/lib/service-quota', () => ({ consumeQuota: vi.fn(), clientAddress: () => 'flow-test', quotaIdentity: () => 'test-hash' }));
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ sms: vi.fn(), prompt: vi.fn() }));
vi.mock('@/services/sms', () => ({ sendSms: mocks.sms }));
vi.mock('@/ai/ai-instance', () => ({ ai: {
  definePrompt: () => mocks.prompt,
  defineFlow: (_config: unknown, handler: unknown) => handler,
} }));
import { notifyEmergencyClinics } from '@/services/emergency-notifications';
import { prioritizeEmergencyAndAlert } from '@/ai/flows/emergency-alert-prioritization';
const location = { latitude: 14.7, longitude: -17.4 };
const clinics = [1, 2, 3].map(i => ({ ...location, id: `${i}`, name: `Partner ${i}`, phoneNumber: `+22177123456${i}` }));
beforeEach(() => {
  vi.clearAllMocks(); vi.stubEnv('EMERGENCY_CLINICS_JSON', JSON.stringify(clinics));
  mocks.prompt.mockResolvedValue({ output: { isEmergency: true, reason: 'Test determination' } });
});
afterEach(() => { vi.unstubAllEnvs(); });

describe('emergency notification regression', () => {
  it('never announces the three clinics as alerted when no SMS is sent', async () => {
    mocks.sms.mockResolvedValue({ status: 'unavailable' });
    const result = await prioritizeEmergencyAndAlert({ ...location, ageConfirmed: true, shareConsent: true, symptoms: 'test', phoneNumber: '+221771234567' });
    expect(result.clinicsAlerted).toEqual([]); expect(result.clinicsPending).toEqual([]);
    expect(result.notificationStatus).toBe('unavailable'); expect(result.notificationsFailed).toBe(3);
  });
  it('distinguishes queued, delivered and failed messages in a partial result', async () => {
    mocks.sms.mockResolvedValueOnce({ status: 'accepted' }).mockResolvedValueOnce({ status: 'delivered' }).mockResolvedValueOnce({ status: 'failed' });
    const result = await notifyEmergencyClinics(location, 'Test');
    expect(result).toEqual({ clinicsAlerted: ['Partner 2'], clinicsPending: ['Partner 1'], notificationsFailed: 1, notificationStatus: 'partial' });
  });
  it('does not fall back to fake or unverified directory contacts', async () => {
    vi.stubEnv('EMERGENCY_CLINICS_JSON', '');
    expect((await notifyEmergencyClinics(location, 'Test')).notificationStatus).toBe('unavailable');
    vi.stubEnv('EMERGENCY_CLINICS_JSON', '{broken');
    expect((await notifyEmergencyClinics(location, 'Test')).clinicsAlerted).toEqual([]);
    expect(mocks.sms).not.toHaveBeenCalled();
  });
  it('limits recipients to nearby partners and deduplicates phone numbers', async () => {
    vi.stubEnv('EMERGENCY_CLINICS_JSON', JSON.stringify([...clinics, clinics[0], { ...clinics[0], phoneNumber: '+221771234569', latitude: 0 }]));
    mocks.sms.mockResolvedValue({ status: 'accepted' });
    expect((await notifyEmergencyClinics(location, 'Test')).clinicsPending).toHaveLength(3);
    expect(mocks.sms).toHaveBeenCalledTimes(3);
  });
  it('does not send any SMS for a non emergency result', async () => {
    mocks.prompt.mockResolvedValue({ output: { isEmergency: false, reason: 'Test' } });
    expect((await prioritizeEmergencyAndAlert({ ...location, ageConfirmed: true, shareConsent: true, symptoms: 'test', phoneNumber: '+221771234567' })).notificationStatus).toBe('not-needed');
    expect(mocks.sms).not.toHaveBeenCalled();
  });
});
