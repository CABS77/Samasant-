import { describe, it, expect, beforeEach, vi } from 'vitest';

// Helper to import the service after setting env vars
async function loadService() {
  vi.resetModules();
  return await import('../src/services/imageService');
}

describe('getRemedyImageUrl', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
    delete process.env.NEXT_PUBLIC_PEXELS_API_KEY;
  });

  it('returns Unsplash image URL on success', async () => {
    process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY = 'u-key';
    process.env.NEXT_PUBLIC_PEXELS_API_KEY = 'p-key';

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [{ urls: { small: 'unsplash_url' } }] }),
    });
    (globalThis as any).fetch = fetchMock;

    const { getRemedyImageUrl } = await loadService();
    const url = await getRemedyImageUrl('test');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(url).toBe('unsplash_url');
  });

  it('falls back to Pexels when Unsplash fails', async () => {
    process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY = 'u-key';
    process.env.NEXT_PUBLIC_PEXELS_API_KEY = 'p-key';

    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'error',
        text: async () => 'err',
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ photos: [{ src: { medium: 'pexels_url' } }] }),
      });
    (globalThis as any).fetch = fetchMock;

    const { getRemedyImageUrl } = await loadService();
    const url = await getRemedyImageUrl('test');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(url).toBe('pexels_url');
  });

  it('returns null when API keys are missing', async () => {
    process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY = '';
    process.env.NEXT_PUBLIC_PEXELS_API_KEY = '';

    const fetchMock = vi.fn();
    (globalThis as any).fetch = fetchMock;

    const { getRemedyImageUrl } = await loadService();
    const url = await getRemedyImageUrl('test');

    expect(fetchMock).not.toHaveBeenCalled();
    expect(url).toBeNull();
  });
});
