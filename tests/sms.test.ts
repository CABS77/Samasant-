// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/server-fetch', () => ({ serverFetch: (...args: Parameters<typeof fetch>) => fetch(...args) }));
import { sendSms } from '@/services/sms';
import { getNearbyClinics } from '@/services/mapbox';
const fetchMock = vi.fn();
const sid = `SM${'a'.repeat(32)}`;
beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock); fetchMock.mockReset();
  vi.stubEnv('TWILIO_ACCOUNT_SID', 'test-account'); vi.stubEnv('TWILIO_AUTH_TOKEN', 'test-token');
  vi.stubEnv('TWILIO_PHONE_NUMBER', '+221771234567');
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('SMS provider truth', () => {
  it('reports unavailability without attempting delivery when credentials are missing', async () => {
    vi.stubEnv('TWILIO_AUTH_TOKEN', '');
    expect(await sendSms('+221771234568', 'Test')).toEqual({ status: 'unavailable' });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each(['accepted', 'queued', 'sent', 'sending', 'scheduled'])('does not call %s a delivery', async status => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ sid, status }), { status: 201 }));
    expect(await sendSms('+221771234568', 'Test')).toEqual({ status: 'accepted', messageId: sid });
    expect(fetchMock.mock.calls[0][1].signal).toBeDefined();
  });
  it('reports delivery only if Twilio explicitly reports delivered', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ sid, status: 'delivered' }), { status: 201 }));
    expect(await sendSms('+221771234568', 'Test')).toEqual({ status: 'delivered', messageId: sid });
  });
  it.each([{ sid, status: 'failed' }, { sid, status: 'undelivered' }, { status: 'queued' }, { sid, status: 'unknown' }])('rejects invalid or unsuccessful provider results', async body => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify(body), { status: 201 }));
    expect(await sendSms('+221771234568', 'Test')).toEqual({ status: 'failed' });
  });
  it('treats HTTP, network and timeout errors as unsuccessful', async () => {
    fetchMock.mockResolvedValueOnce(new Response('{}', { status: 401 }));
    fetchMock.mockRejectedValueOnce(new Error('Network unavailable'));
    fetchMock.mockRejectedValueOnce(new DOMException('Timeout', 'TimeoutError'));
    for (let i = 0; i < 3; i++) expect(await sendSms('+221771234568', 'Test')).toEqual({ status: 'failed' });
  });
  it('does not invent clinics or phone numbers when Mapbox is unavailable', async () => {
    vi.stubEnv('NEXT_PUBLIC_MAPBOX_TOKEN', '');
    expect(await getNearbyClinics({ latitude: 14.7, longitude: -17.4 })).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
    vi.stubEnv('NEXT_PUBLIC_MAPBOX_TOKEN', 'test-mapbox');
    fetchMock.mockResolvedValue(new Response('{}', { status: 503 }));
    expect(await getNearbyClinics({ latitude: 14.7, longitude: -17.4 })).toEqual([]);
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ features: [{ id: 'real-id', text: 'Clinic', center: [-17.4, 14.7] }] })));
    expect((await getNearbyClinics({ latitude: 14.7, longitude: -17.4 }))[0].phoneNumber).toBeUndefined();
  });
});
