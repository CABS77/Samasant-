// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  getUser: vi.fn(), doctor: vi.fn(), from: vi.fn(), insert: vi.fn(), update: vi.fn(),
  select: vi.fn(), eq: vi.fn(), in: vi.fn(), order: vi.fn(), limit: vi.fn(), maybeSingle: vi.fn(), single: vi.fn(),
  cookie: undefined as string | undefined,
}));
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({ auth: { getUser: mocks.getUser }, from: mocks.from }) }));
vi.mock('@/lib/doctor-store', () => ({ getDoctorById: mocks.doctor }));
vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => mocks.cookie ? { value: mocks.cookie } : undefined }) }));
import { POST } from '@/app/api/appointments/route';
import { GET as adminList, PATCH as adminUpdate } from '@/app/api/admin/appointments/route';
import { issueAdminToken } from '@/lib/admin-auth';
import { isValidAppointmentTime } from '@/lib/appointment-validation';
const input = { doctorId: 'dr-1', startAt: '2026-10-12T08:00:00.000Z', mode: 'clinic',
  motif: 'Test', phone: '+221771234567', requestKey: '00000000-0000-4000-8000-000000000001' };
const row = { id: '00000000-0000-4000-8000-000000000002', user_id: 'verified-patient', doctor_id: input.doctorId,
  start_at: input.startAt, motif: input.motif, phone: input.phone, mode: input.mode, request_key: input.requestKey, status: 'requested' };
function req(body: unknown = input, token: string | null = 'valid-test-token') {
  return new Request('http://localhost/api/appointments', { method: 'POST', headers: {
    'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }, body: JSON.stringify(body) });
}
beforeEach(() => {
  vi.clearAllMocks(); vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-07T12:00:00Z'));
  for (const [key, value] of Object.entries({ NEXT_PUBLIC_SUPABASE_URL: 'https://fixture.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon', SUPABASE_SERVICE_ROLE_KEY: 'test-service',
    ADMIN_PASSWORD: 'test-admin-password-long', ADMIN_SESSION_SECRET: 'test-admin-secret-at-least-32-characters',
  })) vi.stubEnv(key, value);
  const chain = { insert: mocks.insert, update: mocks.update, select: mocks.select, eq: mocks.eq,
    in: mocks.in, order: mocks.order, limit: mocks.limit, maybeSingle: mocks.maybeSingle, single: mocks.single };
  mocks.from.mockReturnValue(chain);
  for (const fn of [mocks.insert, mocks.update, mocks.select, mocks.eq, mocks.in, mocks.order]) fn.mockReturnValue(chain);
  mocks.limit.mockResolvedValue({ data: [row], error: null });
  mocks.maybeSingle.mockResolvedValue({ data: null, error: null });
  mocks.single.mockResolvedValue({ data: row, error: null });
  mocks.getUser.mockResolvedValue({ data: { user: { id: 'verified-patient' } }, error: null });
  mocks.doctor.mockResolvedValue({ id: 'dr-1', available: ['Lun'] }); mocks.cookie = undefined;
});
afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers(); });

describe('appointment API integrity', () => {
  it('rejects missing or invalid patient identity before database writes', async () => {
    expect((await POST(req(input, null))).status).toBe(401);
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'expired' } });
    expect((await POST(req())).status).toBe(401);
    expect(mocks.insert).not.toHaveBeenCalled();
  });
  it('returns unavailable with missing configuration or failed database reads', async () => {
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
    expect((await POST(req())).status).toBe(503);
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service');
    mocks.maybeSingle.mockResolvedValue({ data: null, error: { code: '42P01' } });
    expect((await POST(req())).status).toBe(503);
    expect(mocks.insert).not.toHaveBeenCalled();
  });
  it('uses the server verified identity and returns only a persisted pending receipt', async () => {
    const response = await POST(req());
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ id: row.id, status: 'requested', startAt: row.start_at });
    expect(mocks.getUser).toHaveBeenCalledWith('valid-test-token');
    expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({ user_id: 'verified-patient', status: 'requested' }));
    expect((await POST(req({ ...input, user_id: 'another-patient' }))).status).toBe(400);
  });
  it.each([
    { startAt: '2026-10-05T08:00:00Z' }, { startAt: '2026-10-13T08:00:00Z' },
    { startAt: '2026-10-12T12:00:00Z' }, { startAt: '2026-10-12T08:15:00Z' },
    { startAt: '2026-10-12T08:00:00.100Z' }, { mode: 'video' }, { phone: 'invalid' },
    { startAt: '2028-10-09T08:00:00Z' },
  ])('rejects invalid, past and unavailable appointments', async changes => {
    expect((await POST(req({ ...input, ...changes }))).status).toBe(400);
    expect(mocks.insert).not.toHaveBeenCalled();
  });
  it('rejects unknown doctors', async () => {
    mocks.doctor.mockResolvedValue(undefined);
    expect((await POST(req())).status).toBe(404); expect(mocks.insert).not.toHaveBeenCalled();
  });
  it('does not report success if a write fails or returns an invalid receipt', async () => {
    mocks.single.mockResolvedValue({ data: null, error: { code: 'XX000' } });
    expect((await POST(req())).status).toBe(503);
    mocks.single.mockResolvedValue({ data: { ...row, id: 'demo-123' }, error: null });
    expect((await POST(req())).status).toBe(503);
  });
  it('returns the same receipt for retries and rejects reusing its key for a changed payload', async () => {
    mocks.maybeSingle.mockResolvedValue({ data: row, error: null });
    expect((await POST(req())).status).toBe(201);
    expect(mocks.insert).not.toHaveBeenCalled();
    expect((await POST(req({ ...input, motif: 'Changed' }))).status).toBe(409);
  });
  it('handles concurrent retries without creating a second booking', async () => {
    mocks.maybeSingle.mockResolvedValueOnce({ data: null, error: null }).mockResolvedValueOnce({ data: row, error: null });
    mocks.single.mockResolvedValue({ data: null, error: { code: '23505' } });
    expect((await POST(req())).status).toBe(201);
    expect(mocks.insert).toHaveBeenCalledTimes(1);
  });
  it('reports a conflicting doctor slot instead of confirmation', async () => {
    mocks.single.mockResolvedValue({ data: null, error: { code: '23505' } });
    expect((await POST(req())).status).toBe(409);
  });
  it('validates Senegal slots without depending on the caller timezone', () => {
    expect(isValidAppointmentTime(input.startAt, ['Lun'])).toBe(true);
    expect(isValidAppointmentTime('2026-10-12T18:00:00Z', ['Lun'])).toBe(false);
  });
});

describe('clinic processing authorization', () => {
  const patch = () => new Request('http://localhost/api/admin/appointments', { method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: row.id, status: 'confirmed' }) });
  it('protects both private booking lists and status mutations', async () => {
    expect((await adminList()).status).toBe(401);
    expect((await adminUpdate(patch())).status).toBe(401);
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it('allows clinic confirmation only from a pending request with an admin session', async () => {
    mocks.cookie = issueAdminToken();
    expect((await adminList()).status).toBe(200);
    mocks.maybeSingle.mockResolvedValue({ data: { id: row.id, status: 'confirmed' }, error: null });
    expect((await adminUpdate(patch())).status).toBe(200);
    expect(mocks.in).toHaveBeenCalledWith('status', ['requested']);
    expect(mocks.update).toHaveBeenCalledWith({ status: 'confirmed' });
  });
  it('rejects stale state transitions and foreign origins', async () => {
    mocks.cookie = issueAdminToken();
    expect((await adminUpdate(patch())).status).toBe(409);
    const request = patch(); request.headers.set('origin', 'https://untrusted.example');
    expect((await adminUpdate(request)).status).toBe(403);
  });
});
