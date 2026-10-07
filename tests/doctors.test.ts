import { afterEach, describe, expect, it, vi } from 'vitest';
import { getDoctors } from '@/services/doctors';
afterEach(() => vi.unstubAllGlobals());
describe('doctor directory transport', () => {
  it('reads the public server directory without caching it', async () => {
    const doctors = [{ id: '1', name: 'Dr Fixture', specialty: 'Gen', available: [] }];
    const fetcher = vi.fn().mockResolvedValue(Response.json(doctors)); vi.stubGlobal('fetch', fetcher);
    expect(await getDoctors()).toEqual(doctors);
    expect(fetcher).toHaveBeenCalledWith('/api/doctors', { cache: 'no-store' });
  });
  it('preserves an empty directory and never fills it with invented practitioners', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json([])));
    expect(await getDoctors()).toEqual([]);
  });
  it('reports outages without fictitious fallback doctors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 503 })));
    await expect(getDoctors()).rejects.toThrow('Annuaire indisponible');
  });
});
