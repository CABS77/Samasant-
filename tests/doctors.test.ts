import { describe, it, expect, vi, beforeEach } from 'vitest';

const firestoreMocks = {
  getDocs: vi.fn(),
  collection: vi.fn(),
};

vi.mock('firebase/firestore', () => ({
  getDocs: (...args: any[]) => firestoreMocks.getDocs(...args),
  collection: (...args: any[]) => firestoreMocks.collection(...args),
}));

vi.mock('../src/lib/firebase', () => ({ db: {} }));

async function loadService() {
  vi.resetModules();
  return await import('../src/services/doctors');
}

describe('doctors service', () => {
  beforeEach(() => {
    Object.values(firestoreMocks).forEach((fn) => fn.mockReset());
  });

  it('getDoctors returns mapped data', async () => {
    firestoreMocks.getDocs.mockResolvedValue({
      docs: [
        { id: '1', data: () => ({ name: 'Dr X', specialty: 'Gen', available: [] }) },
      ],
    });
    const { getDoctors } = await loadService();
    const docs = await getDoctors();
    expect(firestoreMocks.collection).toHaveBeenCalled();
    expect(docs).toEqual([
      { id: '1', name: 'Dr X', specialty: 'Gen', available: [] },
    ]);
  });
});
