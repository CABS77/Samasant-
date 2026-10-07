// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const mocks = vi.hoisted(() => ({ client: vi.fn() }));
vi.mock('@supabase/supabase-js', () => ({ createClient: mocks.client }));
let dir: string;
const shared = globalThis as typeof globalThis & { samasanteDoctorStore?: unknown };
beforeEach(() => {
  vi.clearAllMocks(); vi.resetModules(); delete shared.samasanteDoctorStore;
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', ''); vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', ''); vi.stubEnv('VERCEL', '');
  dir = mkdtempSync('/tmp/samasante-directory-test-');
  vi.spyOn(process, 'cwd').mockReturnValue(dir);
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); rmSync(dir, { recursive: true, force: true }); delete shared.samasanteDoctorStore; });
const doctor = { name: 'Dr Fixture', specialty: 'Généraliste', available: ['Lun'] };

describe('shared doctor directory', () => {
  it('keeps creations, changes and deletions visible across separately compiled module instances', async () => {
    const actions = await import('@/lib/doctor-store');
    const created = await actions.createDoctor(doctor);
    vi.resetModules();
    const api = await import('@/lib/doctor-store');
    expect(await api.getDoctorById(created.id)).toEqual(created);
    await api.updateDoctor(created.id, { name: 'Dr Updated' });
    expect((await actions.getDoctorById(created.id))?.name).toBe('Dr Updated');
    await actions.deleteDoctor(created.id);
    expect(await api.getDoctorById(created.id)).toBeUndefined();
  });
  it('does not resurrect demo doctors after the whole local directory is deleted', async () => {
    const first = await import('@/lib/doctor-store');
    for (const row of await first.getAllDoctors()) await first.deleteDoctor(row.id);
    vi.resetModules(); delete shared.samasanteDoctorStore;
    expect(await (await import('@/lib/doctor-store')).getAllDoctors()).toEqual([]);
  });
  it('does not announce a saved doctor if local persistence fails', async () => {
    const store = await import('@/lib/doctor-store');
    writeFileSync(join(dir, 'data'), 'block-directory-creation');
    await expect(store.createDoctor(doctor)).rejects.toThrow();
    expect((await store.getAllDoctors()).some(row => row.name === doctor.name)).toBe(false);
  });
  it('fails closed on Vercel without a durable directory', async () => {
    vi.stubEnv('VERCEL', '1'); const store = await import('@/lib/doctor-store');
    await expect(store.getAllDoctors()).rejects.toThrow('configurez Supabase');
    await expect(store.createDoctor(doctor)).rejects.toThrow('configurez Supabase');
  });
  it('uses the canonical database table without a demo fallback', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://fixture.supabase.co'); vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'fixture-service-key');
    const row = { ...doctor, id: 'dr-real' };
    const chain = { select: vi.fn(), order: vi.fn(), eq: vi.fn(), insert: vi.fn(), update: vi.fn(), delete: vi.fn(), single: vi.fn(), maybeSingle: vi.fn() };
    for (const fn of [chain.select, chain.eq, chain.insert, chain.update, chain.delete]) fn.mockReturnValue(chain);
    chain.order.mockResolvedValue({ data: [], error: null });
    chain.single.mockResolvedValue({ data: row, error: null }); chain.maybeSingle.mockResolvedValue({ data: row, error: null });
    const from = vi.fn(() => chain); mocks.client.mockReturnValue({ from });
    const store = await import('@/lib/doctor-store');
    expect(await store.getAllDoctors()).toEqual([]);
    expect(await store.createDoctor(doctor)).toEqual(row);
    expect(await store.getDoctorById(row.id)).toEqual(row);
    expect(await store.updateDoctor(row.id, { name: 'Dr Updated' })).toEqual(row);
    expect(await store.deleteDoctor(row.id)).toBe(true);
    expect(from.mock.calls).toEqual(Array(5).fill(['doctor_directory']));
    chain.order.mockResolvedValue({ data: null, error: { code: '42P01' } });
    await expect(store.getAllDoctors()).rejects.toThrow('indisponible');
  });
});
