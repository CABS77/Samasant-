// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({ cookie: { value: undefined as string | undefined },
  create: vi.fn(), update: vi.fn(), remove: vi.fn(), get: vi.fn(), all: vi.fn(),
}));
vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => mocks.cookie.value ? { value: mocks.cookie.value } : undefined }) }));
vi.mock('@/lib/doctor-store', () => ({ createDoctor: mocks.create, updateDoctor: mocks.update,
  deleteDoctor: mocks.remove, getDoctorById: mocks.get, getAllDoctors: mocks.all }));

import { ADMIN_COOKIE, ADMIN_SESSION_SECONDS, issueAdminToken, validAdminToken } from '@/lib/admin-auth';
import { POST as create, GET as list } from '@/app/api/doctors/route';
import { PUT as update, DELETE as remove } from '@/app/api/doctors/[id]/route';
import { POST as login, GET as session, DELETE as logout } from '@/app/api/admin/verify/route';
import { createDoctorAction, updateDoctorAction, deleteDoctorAction } from '@/app/admin/actions';

const doctor = { name: 'Dr Test', specialty: 'Généraliste', available: ['Lun'] };
const context = { params: Promise.resolve({ id: 'dr-test' }) };
function req(path: string, method: string, body?: unknown, origin?: string) {
  return new NextRequest(`http://localhost${path}`, { method, headers: {
    'Content-Type': 'application/json', ...(origin ? { origin } : {}), 'x-forwarded-for': crypto.randomUUID(),
  }, ...(body ? { body: JSON.stringify(body) } : {}) });
}
beforeEach(() => {
  vi.stubEnv('ADMIN_PASSWORD', 'test-password-only-long-enough');
  vi.stubEnv('ADMIN_SESSION_SECRET', 'test-signing-secret-with-at-least-32-characters');
  mocks.cookie.value = undefined; vi.clearAllMocks();
  mocks.get.mockResolvedValue({ ...doctor, id: 'dr-test' });
  mocks.create.mockResolvedValue({ ...doctor, id: 'dr-test' });
  mocks.update.mockResolvedValue({ ...doctor, id: 'dr-test' });
  mocks.remove.mockResolvedValue(true); mocks.all.mockResolvedValue([doctor]);
});
afterEach(() => { vi.unstubAllEnvs(); });

describe('server enforced administration', () => {
  it('denies every anonymous REST mutation before reading or changing the store', async () => {
    expect((await create(req('/api/doctors', 'POST', doctor))).status).toBe(401);
    expect((await update(req('/api/doctors/dr-test', 'PUT', doctor), context)).status).toBe(401);
    expect((await remove(req('/api/doctors/dr-test', 'DELETE'), context)).status).toBe(401);
    expect(mocks.create).not.toHaveBeenCalled(); expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.remove).not.toHaveBeenCalled(); expect(mocks.get).not.toHaveBeenCalled();
  });
  it('also denies direct server actions', async () => {
    await expect(createDoctorAction(doctor)).rejects.toMatchObject({ status: 401 });
    await expect(updateDoctorAction('dr-test', doctor)).rejects.toMatchObject({ status: 401 });
    await expect(deleteDoctorAction('dr-test')).rejects.toMatchObject({ status: 401 });
    expect(mocks.create).not.toHaveBeenCalled(); expect(mocks.update).not.toHaveBeenCalled(); expect(mocks.remove).not.toHaveBeenCalled();
  });
  it('allows authenticated REST and action mutations, with public directory reads', async () => {
    mocks.cookie.value = issueAdminToken();
    expect((await create(req('/api/doctors', 'POST', doctor))).status).toBe(201);
    expect((await update(req('/api/doctors/dr-test', 'PUT', doctor), context)).status).toBe(200);
    expect((await remove(req('/api/doctors/dr-test', 'DELETE'), context)).status).toBe(200);
    expect((await createDoctorAction(doctor)).success).toBe(true);
    expect((await updateDoctorAction('dr-test', doctor)).success).toBe(true);
    expect((await deleteDoctorAction('dr-test')).success).toBe(true);
    mocks.cookie.value = undefined;
    expect((await list()).status).toBe(200);
  });
  it('rejects foreign origins even with a valid session', async () => {
    mocks.cookie.value = issueAdminToken();
    expect((await create(req('/api/doctors', 'POST', doctor, 'https://untrusted.example'))).status).toBe(403);
    expect(mocks.create).not.toHaveBeenCalled();
    expect((await login(req('/api/admin/verify', 'POST', { password: process.env.ADMIN_PASSWORD }, 'https://untrusted.example'))).status).toBe(403);
  });
  it('rejects tampering, expiration, fabricated client flags and rotated credentials', () => {
    const now = Date.now(); const token = issueAdminToken(now);
    expect(validAdminToken(token, now)).toBe(true);
    expect(validAdminToken('true', now)).toBe(false);
    expect(validAdminToken(`${token}x`, now)).toBe(false);
    expect(validAdminToken(token, now + ADMIN_SESSION_SECONDS * 1000)).toBe(false);
    vi.stubEnv('ADMIN_PASSWORD', 'a-different-long-password');
    expect(validAdminToken(token, now)).toBe(false);
  });
  it('fails closed with missing admin configuration and has no default password', async () => {
    vi.stubEnv('ADMIN_PASSWORD', '');
    expect((await login(req('/api/admin/verify', 'POST', { password: 'samasante2026' }))).status).toBe(503);
    expect((await create(req('/api/doctors', 'POST', doctor))).status).toBe(401);
  });
  it('issues a signed HttpOnly strict cookie and verifies or clears it on the server', async () => {
    expect((await login(req('/api/admin/verify', 'POST', { password: 'wrong' }))).status).toBe(401);
    const result = await login(req('/api/admin/verify', 'POST', { password: process.env.ADMIN_PASSWORD }));
    expect(result.status).toBe(200);
    const cookie = result.cookies.get(ADMIN_COOKIE);
    expect(validAdminToken(cookie?.value)).toBe(true);
    expect(result.headers.get('set-cookie')).toContain('HttpOnly');
    expect(result.headers.get('set-cookie')).toContain('SameSite=strict');
    const check = new NextRequest('http://localhost/api/admin/verify', { headers: { cookie: `${ADMIN_COOKIE}=${cookie!.value}` } });
    expect(await (await session(check)).json()).toEqual({ authenticated: true });
    expect((await logout(req('/api/admin/verify', 'DELETE'))).headers.get('set-cookie')).toContain('Max-Age=0');
  });
  it('limits repeated password attempts within an instance', async () => {
    for (let i = 0; i < 5; i++) {
      const request = req('/api/admin/verify', 'POST', { password: 'wrong' });
      request.headers.set('x-forwarded-for', 'rate-limit-test');
      expect((await login(request)).status).toBe(401);
    }
    const request = req('/api/admin/verify', 'POST', { password: 'wrong' });
    request.headers.set('x-forwarded-for', 'rate-limit-test');
    expect((await login(request)).status).toBe(429);
  });
});
