import { describe, it, expect, vi, beforeEach } from 'vitest';

const supabaseMocks = {
  from: vi.fn(),
};

vi.mock('../src/lib/supabase', () => ({
  supabase: { from: (...args: any[]) => supabaseMocks.from(...args) },
}));

async function loadService() {
  vi.resetModules();
  return await import('../src/services/doctors');
}

describe('doctors service', () => {
  beforeEach(() => {
    Object.values(supabaseMocks).forEach((fn) => fn.mockReset());
  });

  it('getDoctors returns mapped data', async () => {
    const selectFn = vi.fn().mockResolvedValue({
      data: [
        { id: '1', name: 'Dr X', specialty: 'Gen', available: [] },
      ],
      error: null,
    });
    supabaseMocks.from.mockReturnValue({ select: selectFn });
    const { getDoctors } = await loadService();
    const docs = await getDoctors();
    expect(supabaseMocks.from).toHaveBeenCalledWith('doctors');
    expect(selectFn).toHaveBeenCalledWith('*');
    expect(docs).toEqual([
      { id: '1', name: 'Dr X', specialty: 'Gen', available: [] },
    ]);
  });
});
