import { describe, it, expect, vi, beforeEach } from 'vitest';

const supabaseMocks = {
  from: vi.fn(),
};

vi.mock('../src/lib/supabase', () => ({
  supabase: { from: (...args: any[]) => supabaseMocks.from(...args) },
}));

async function loadService() {
  vi.resetModules();
  return await import('../src/services/appointments');
}

describe('appointments service', () => {
  beforeEach(() => {
    Object.values(supabaseMocks).forEach((fn) => fn.mockReset());
  });

  it('createAppointment returns new id', async () => {
    const singleFn = vi.fn().mockResolvedValue({ data: { id: '1' }, error: null });
    const selectFn = vi.fn().mockReturnValue({ single: singleFn });
    const insertFn = vi.fn().mockReturnValue({ select: selectFn });
    supabaseMocks.from.mockReturnValue({ insert: insertFn });
    const { createAppointment } = await loadService();
    const id = await createAppointment({} as any);
    expect(supabaseMocks.from).toHaveBeenCalledWith('rendezVous');
    expect(insertFn).toHaveBeenCalled();
    expect(id).toBe('1');
  });

  it('getAppointment returns data when exists', async () => {
    const singleFn = vi.fn().mockResolvedValue({ data: { id: '1', foo: 'bar' }, error: null });
    const eqFn = vi.fn().mockReturnValue({ single: singleFn });
    const selectFn = vi.fn().mockReturnValue({ eq: eqFn });
    supabaseMocks.from.mockReturnValue({ select: selectFn });
    const { getAppointment } = await loadService();
    const res = await getAppointment('1');
    expect(supabaseMocks.from).toHaveBeenCalledWith('rendezVous');
    expect(selectFn).toHaveBeenCalledWith('*');
    expect(eqFn).toHaveBeenCalledWith('id', '1');
    expect(res).toEqual({ id: '1', foo: 'bar' });
  });

  it('updateAppointment calls updateDoc', async () => {
    const eqFn = vi.fn().mockResolvedValue({ error: null });
    const updateFn = vi.fn().mockReturnValue({ eq: eqFn });
    supabaseMocks.from.mockReturnValue({ update: updateFn });
    const { updateAppointment } = await loadService();
    await updateAppointment('1', { estatu: 'termine' } as any);
    expect(supabaseMocks.from).toHaveBeenCalledWith('rendezVous');
    expect(updateFn).toHaveBeenCalled();
  });

  it('deleteAppointment calls deleteDoc', async () => {
    const eqFn = vi.fn().mockResolvedValue({ error: null });
    const deleteFn = vi.fn().mockReturnValue({ eq: eqFn });
    supabaseMocks.from.mockReturnValue({ delete: deleteFn });
    const { deleteAppointment } = await loadService();
    await deleteAppointment('1');
    expect(supabaseMocks.from).toHaveBeenCalledWith('rendezVous');
    expect(deleteFn).toHaveBeenCalled();
  });
});
