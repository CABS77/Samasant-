import { describe, it, expect, vi, beforeEach } from 'vitest';

const firestoreMocks = {
  addDoc: vi.fn(),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  getDocs: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
};

vi.mock('firebase/firestore', () => ({
  addDoc: (...args: any[]) => firestoreMocks.addDoc(...args),
  getDoc: (...args: any[]) => firestoreMocks.getDoc(...args),
  updateDoc: (...args: any[]) => firestoreMocks.updateDoc(...args),
  deleteDoc: (...args: any[]) => firestoreMocks.deleteDoc(...args),
  getDocs: (...args: any[]) => firestoreMocks.getDocs(...args),
  collection: (...args: any[]) => firestoreMocks.collection(...args),
  doc: (...args: any[]) => firestoreMocks.doc(...args),
  query: (...args: any[]) => firestoreMocks.query(...args),
  where: (...args: any[]) => firestoreMocks.where(...args),
}));

async function loadService() {
  vi.resetModules();
  return await import('../src/services/appointments');
}

describe('appointments service', () => {
  beforeEach(() => {
    Object.values(firestoreMocks).forEach((fn) => fn.mockReset());
  });

  it('createAppointment returns new id', async () => {
    firestoreMocks.addDoc.mockResolvedValue({ id: '1' });
    const { createAppointment } = await loadService();
    const id = await createAppointment({} as any);
    expect(firestoreMocks.addDoc).toHaveBeenCalled();
    expect(id).toBe('1');
  });

  it('getAppointment returns data when exists', async () => {
    firestoreMocks.getDoc.mockResolvedValue({ exists: () => true, id: '1', data: () => ({ foo: 'bar' }) });
    const { getAppointment } = await loadService();
    const res = await getAppointment('1');
    expect(firestoreMocks.getDoc).toHaveBeenCalled();
    expect(res).toEqual({ id: '1', foo: 'bar' });
  });

  it('updateAppointment calls updateDoc', async () => {
    const { updateAppointment } = await loadService();
    await updateAppointment('1', { estatu: 'termine' } as any);
    expect(firestoreMocks.updateDoc).toHaveBeenCalled();
  });

  it('deleteAppointment calls deleteDoc', async () => {
    const { deleteAppointment } = await loadService();
    await deleteAppointment('1');
    expect(firestoreMocks.deleteDoc).toHaveBeenCalled();
  });
});
