// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ configured: vi.fn(), session: vi.fn(), fetch: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ isSupabaseConfigured: mocks.configured, supabase: { auth: { getSession: mocks.session } } }));
import { createAppointment } from '@/services/appointments';
const input = { doctorId: 'dr-1', startAt: '2026-10-12T08:00:00.000Z', mode: 'clinic' as const,
  motif: 'Test', phone: '+221771234567', requestKey: '00000000-0000-4000-8000-000000000001' };
const saved = { id: '00000000-0000-4000-8000-000000000002', status: 'requested', startAt: input.startAt };
beforeEach(() => {
  vi.clearAllMocks(); vi.stubGlobal('fetch', mocks.fetch);
  mocks.configured.mockReturnValue(true);
  mocks.session.mockResolvedValue({ data: { session: { access_token: 'patient-test-token' } }, error: null });
});
afterEach(() => { vi.unstubAllGlobals(); });

describe('persisted appointment service', () => {
  it('fails instead of returning a demo id with no database configuration', async () => {
    mocks.configured.mockReturnValue(false);
    await expect(createAppointment(input)).rejects.toThrow('indisponibles');
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it('requires a patient session', async () => {
    mocks.session.mockResolvedValue({ data: { session: null }, error: null });
    await expect(createAppointment(input)).rejects.toThrow('Connectez-vous');
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it('returns only a validated persisted pending receipt and sends the auth token', async () => {
    mocks.fetch.mockResolvedValue(new Response(JSON.stringify(saved), { status: 201 }));
    expect(await createAppointment(input)).toEqual(saved);
    expect(mocks.fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer patient-test-token');
    expect(JSON.parse(mocks.fetch.mock.calls[0][1].body)).not.toHaveProperty('user_id');
  });
  it('propagates slot conflicts without success', async () => {
    mocks.fetch.mockResolvedValue(new Response(JSON.stringify({ error: 'Ce créneau est déjà réservé.' }), { status: 409 }));
    await expect(createAppointment(input)).rejects.toThrow('déjà réservé');
  });
  it.each([{ id: 'demo-123', status: 'requested', startAt: input.startAt }, { ...saved, status: 'confirmed' }, {}])('rejects fabricated or malformed receipts', async body => {
    mocks.fetch.mockResolvedValue(new Response(JSON.stringify(body), { status: 201 }));
    await expect(createAppointment(input)).rejects.toThrow('Enregistrement non confirmé');
  });
});
