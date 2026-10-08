// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createHmac } from 'node:crypto';
import { NextRequest } from 'next/server';
const mocks = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn(), user: vi.fn(), patient: vi.fn(), cookie: undefined as string | undefined,
  select: vi.fn(), eq: vi.fn(), order: vi.fn(), insert: vi.fn(), update: vi.fn(), delete: vi.fn(), is: vi.fn(), gt: vi.fn(), single: vi.fn() }));
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({ rpc: mocks.rpc }) }));
vi.mock('@/lib/server-database', () => ({ serverDatabase: () => ({ from: mocks.from, rpc: mocks.rpc, auth: { getUser: mocks.user } }), verifiedPatient: mocks.patient }));
vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => mocks.cookie ? { value: mocks.cookie } : undefined }), headers: async () => new Headers() }));
import { consumeQuota, quotaIdentity, clientAddress, QuotaExceededError } from '@/lib/service-quota';
import { withAICircuit } from '@/lib/ai-request';
import { encryptNotification, decryptNotification } from '@/services/notification-outbox';
import { POST as webhook } from '@/app/api/notifications/twilio/route';
import { GET as exportData, DELETE as deleteData } from '@/app/api/patient/data/route';
import { POST as login, GET as session, DELETE as logout } from '@/app/api/admin/verify/route';
import { ADMIN_COOKIE, validAdminToken, requireAdmin, issueAdminToken } from '@/lib/admin-auth';
import { GET as auditLog } from '@/app/api/admin/audit/route';
import { PATCH as acknowledge } from '@/app/api/admin/notifications/route';
import { GET as maintenance } from '@/app/api/operations/maintenance/route';
const operator = '00000000-0000-4000-8000-000000000001';
const patient = '00000000-0000-4000-8000-000000000002';
const chain = { select: mocks.select, eq: mocks.eq, order: mocks.order, insert: mocks.insert, update: mocks.update, delete: mocks.delete, is: mocks.is, gt: mocks.gt, maybeSingle: mocks.single };
beforeEach(() => {
  vi.clearAllMocks(); mocks.cookie = undefined;
  vi.stubEnv('ADMIN_USER_IDS', operator); vi.stubEnv('ADMIN_SESSION_SECRET', 'test-only-secret-at-least-thirty-two-characters');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://fixture.supabase.co'); vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-only');
  vi.stubEnv('SMS_OUTBOX_KEY', 'ab'.repeat(32));
  mocks.from.mockReturnValue(chain);
  for (const method of [mocks.select,mocks.eq,mocks.update,mocks.delete,mocks.is,mocks.gt]) method.mockReturnValue(chain);
  mocks.order.mockResolvedValue({ data: [{ id: 'own-request' }], error: null }); mocks.insert.mockResolvedValue({ error: null });
  mocks.single.mockResolvedValue({ data: { id: 'session' }, error: null }); mocks.rpc.mockResolvedValue({ data: true, error: null });
  mocks.user.mockResolvedValue({ data: { user: { id: operator } }, error: null }); mocks.patient.mockResolvedValue({ id: patient });
});
afterEach(() => vi.unstubAllEnvs());
const request = (url: string, method: string, body?: unknown, headers = {}) => new NextRequest(`https://fixture.test${url}`, { method, headers: { 'Content-Type': 'application/json', 'x-forwarded-for': crypto.randomUUID(), ...headers }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
const jwt = (id: string, aal: string) => `header.${Buffer.from(JSON.stringify({ sub: id, aal })).toString('base64url')}.test-signature-verified-by-auth`;
describe('shared quotas and provider failures', () => {
  it('uses one atomic RPC for the per-network allowance and the global budget', async () => {
    await consumeQuota('ai', '192.0.2.1');
    const payload = mocks.rpc.mock.calls[0][1];
    expect(payload.p_keys).toEqual(['ai:global', `ai:ip:${quotaIdentity('192.0.2.1')}`]);
    expect(payload.p_limits).toEqual([1000, 7]); expect(JSON.stringify(payload)).not.toContain('192.0.2.1');
    mocks.rpc.mockResolvedValue({ data: false, error: null }); await expect(consumeQuota('ai', '192.0.2.1')).rejects.toBeInstanceOf(QuotaExceededError);
  });
  it('fails closed in production when persistence or hashing keys are missing', async () => {
    vi.stubEnv('NODE_ENV','production'); vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY','');
    await expect(consumeQuota('ai','test')).rejects.toThrow();
    vi.stubEnv('ADMIN_SESSION_SECRET',''); vi.stubEnv('AI_QUOTA_SECRET',''); expect(() => quotaIdentity('test')).toThrow();
  });
  it('trusts the Vercel proxy header instead of a client-supplied forwarding header', () => {
    vi.stubEnv('VERCEL','1'); expect(clientAddress(new Headers({ 'x-vercel-forwarded-for': '192.0.2.10', 'x-forwarded-for': 'forged' }))).toBe('192.0.2.10');
  });
  it('opens the provider circuit, redacts error bodies and recovers after cooldown', async () => {
    vi.useFakeTimers(); const provider = crypto.randomUUID(); const run = vi.fn().mockRejectedValue(new Error('private-health-data'));
    try {
      for(let i=0;i<3;i++) await expect(withAICircuit(provider,run)).rejects.toThrow('Assistant momentanément');
      await expect(withAICircuit(provider,run)).rejects.not.toThrow('private-health-data'); expect(run).toHaveBeenCalledTimes(3);
      vi.advanceTimersByTime(31000); run.mockResolvedValue('ready'); expect(await withAICircuit(provider,run)).toBe('ready');
    } finally { vi.useRealTimers(); }
  });
});
describe('individual administrator access', () => {
  it('keeps the operational journal private and excludes medical payload columns', async () => {
    const unauthorized = await auditLog();
    expect(unauthorized.status).toBe(401);
    expect(unauthorized.headers.get('cache-control')).toContain('private, no-store');
    expect(mocks.from).not.toHaveBeenCalled();
    mocks.cookie = issueAdminToken(Date.now(), operator);
    const events = [{ entity: 'doctor_directory', operator_id: operator, action: 'INSERT' }];
    const limit = vi.fn().mockResolvedValue({ data: events, error: null });
    mocks.order.mockReturnValue({ limit });
    const response = await auditLog();
    expect(response.status).toBe(200); expect(await response.json()).toEqual({ events });
    expect(mocks.select).toHaveBeenCalledWith('id,entity,entity_id,action,from_state,to_state,operator_id,created_at');
    expect(limit).toHaveBeenCalledWith(100);
    limit.mockResolvedValue({ data: null, error: { message: 'private-query-details' } });
    const failure = await auditLog(); expect(failure.status).toBe(503);
    expect(await failure.text()).not.toContain('private-query-details');
  });
  it('records a human acknowledgement with the signed individual session, preserving a previous receipt', async () => {
    mocks.cookie = issueAdminToken(Date.now(), operator);
    const id = '00000000-0000-4000-8000-000000000010';
    const response = await acknowledge(request('/api/admin/notifications', 'PATCH', { id, acknowledge: true }));
    expect(response.status).toBe(200); expect(await response.json()).toEqual({ acknowledged: true });
    const session = JSON.parse(Buffer.from(mocks.cookie.split('.')[0], 'base64url').toString());
    expect(mocks.rpc).toHaveBeenCalledWith('admin_acknowledge_notification', { p_session_id: session.nonce, p_id: id });
    mocks.rpc.mockResolvedValue({ data: false, error: null });
    expect(await (await acknowledge(request('/api/admin/notifications', 'PATCH', { id, acknowledge: true }))).json()).toEqual({ acknowledged: false });
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it('rejects patients, first-factor-only admins and shared production passwords', async () => {
    vi.stubEnv('NODE_ENV','production');
    mocks.user.mockResolvedValueOnce({ data: { user: { id: patient } }, error: null });
    expect((await login(request('/api/admin/verify','POST',{ accessToken: jwt(patient,'aal2') }))).status).toBe(403);
    expect((await login(request('/api/admin/verify','POST',{ accessToken: jwt(operator,'aal1') }))).status).toBe(403);
    vi.stubEnv('ADMIN_PASSWORD','a-long-shared-password'); expect((await login(request('/api/admin/verify','POST',{ password: 'a-long-shared-password' }))).status).toBe(401);
    expect(mocks.insert).not.toHaveBeenCalled();
  });
  it('registers only a verified MFA identity, checks revocation and revokes on logout', async () => {
    vi.stubEnv('NODE_ENV','production');
    const response = await login(request('/api/admin/verify','POST',{ accessToken: jwt(operator,'aal2') }));
    expect(response.status).toBe(200); const token = response.cookies.get(ADMIN_COOKIE)!.value;
    expect(validAdminToken(token)).toBe(true); expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({ operator_id: operator }));
    mocks.cookie = token; await expect(requireAdmin()).resolves.toBeUndefined();
    mocks.single.mockResolvedValue({ data: null, error: null }); await expect(requireAdmin()).rejects.toMatchObject({ status: 401 });
    expect((await session(new NextRequest('https://fixture.test/api/admin/verify', { headers: { cookie: `${ADMIN_COOKIE}=${token}` } }))).status).toBe(200);
    mocks.eq.mockResolvedValueOnce({ error: null });
    expect((await logout(new NextRequest('https://fixture.test/api/admin/verify', { method: 'DELETE', headers: { cookie: `${ADMIN_COOKIE}=${token}` } }))).status).toBe(200);
    expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({ revoked_at: expect.any(String) }));
  });
});
describe('data ownership and operations', () => {
  it('exports only records filtered by the verified identity', async () => {
    const result = await exportData(request('/api/patient/data','GET'));
    expect(result.status).toBe(200); expect(mocks.eq).toHaveBeenCalledWith('user_id', patient); expect(result.headers.get('cache-control')).toContain('no-store');
  });
  it('never deletes for an anonymous, foreign-origin or unconfirmed request', async () => {
    expect((await deleteData(request('/api/patient/data','DELETE',{ confirm: 'delete-my-appointment-requests' }, { origin: 'https://foreign.test' }))).status).toBe(403);
    mocks.patient.mockResolvedValueOnce(null); expect((await deleteData(request('/api/patient/data','DELETE',{ confirm: 'delete-my-appointment-requests' }))).status).toBe(401);
    expect((await deleteData(request('/api/patient/data','DELETE',{}))).status).toBe(400); expect(mocks.delete).not.toHaveBeenCalled();
  });
  it('ignores forged identity fields when deleting a verified patient’s requests', async () => {
    mocks.eq.mockResolvedValueOnce({ error: null });
    expect((await deleteData(request('/api/patient/data','DELETE',{ confirm: 'delete-my-appointment-requests', userId: operator }))).status).toBe(200);
    expect(mocks.eq).toHaveBeenCalledWith('user_id',patient);
  });
  it('requires scheduler authorization and an explicit retention duration', async () => {
    vi.stubEnv('CRON_SECRET','c'.repeat(40)); vi.stubEnv('APPOINTMENT_RETENTION_DAYS','');
    expect((await maintenance(request('/api/operations/maintenance','GET'))).status).toBe(401);
    expect((await maintenance(request('/api/operations/maintenance','GET',undefined,{ authorization: `Bearer ${'c'.repeat(40)}` }))).status).toBe(503);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
describe('notification confidentiality and callback authentication', () => {
  it('encrypts with randomized authenticated ciphertext and rejects alteration', () => {
    const clear = 'private-health-data'; const encrypted = encryptNotification(clear);
    expect(encrypted).not.toContain(clear); expect(encryptNotification(clear)).not.toBe(encrypted); expect(decryptNotification(encrypted)).toBe(clear);
    const bad = Buffer.from(encrypted,'base64'); bad[20] ^= 1; expect(() => decryptNotification(bad.toString('base64'))).toThrow();
  });
  it('rejects forged delivery receipts and records a correctly signed provider event', async () => {
    const id = '00000000-0000-4000-8000-000000000010'; const endpoint = 'https://fixture.test/api/notifications/twilio';
    vi.stubEnv('TWILIO_STATUS_CALLBACK_URL',endpoint); vi.stubEnv('TWILIO_AUTH_TOKEN','test-token'); vi.stubEnv('TWILIO_ACCOUNT_SID','ACfixture');
    const url = `${endpoint}?notification=${id}`;
    const params = new URLSearchParams({ AccountSid:'ACfixture',MessageSid:`SM${'1'.repeat(32)}`,MessageStatus:'delivered' });
    const make = (signature: string) => new Request(url,{ method:'POST', headers:{ 'content-type':'application/x-www-form-urlencoded','x-twilio-signature':signature },body:params.toString() });
    expect((await webhook(make('forged'))).status).toBe(403); expect(mocks.rpc).not.toHaveBeenCalled();
    const input = url + [...params.keys()].sort().map(key => key + params.get(key)).join('');
    const signature = createHmac('sha1','test-token').update(input).digest('base64');
    expect((await webhook(make(signature))).status).toBe(204);
    expect(mocks.rpc).toHaveBeenCalledWith('record_sms_status',{p_id:id,p_sid:`SM${'1'.repeat(32)}`,p_state:'delivered'});
  });
});
