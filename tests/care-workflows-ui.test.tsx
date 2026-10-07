import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
const mocks = vi.hoisted(() => ({ create: vi.fn(), emergency: vi.fn(), toast: vi.fn(), connected: true,
  sessionChange: undefined as ((value: string | null) => void) | undefined,
}));
vi.mock('@/services/appointments', () => ({ createAppointment: mocks.create }));
vi.mock('@/ai/flows/emergency-alert-prioritization', () => ({ prioritizeEmergencyAndAlert: mocks.emergency }));
vi.mock('@/hooks/use-toast', () => ({ toast: mocks.toast }));
vi.mock('@/components/patient-sign-in', () => ({ PatientSignIn: ({ onSessionChange }: { onSessionChange: (value: string | null) => void }) => {
  React.useEffect(() => { mocks.sessionChange = onSessionChange; onSessionChange(mocks.connected ? 'test-patient' : null); }, [onSessionChange]);
  return <p>Patient session</p>;
} }));
vi.mock('@/components/patient-appointments', () => ({ PatientAppointments: () => <p>Mes demandes</p> }));
vi.mock('@/components/date-picker', () => ({ DatePicker: ({ onChange }: { onChange: (date: Date) => void }) => <button type="button" onClick={() => onChange(new Date(2026, 9, 12))}>Choisir lundi</button> }));
vi.mock('@/components/time-picker', () => ({ TimePicker: ({ onChange }: { onChange: (time: string) => void }) => <button type="button" onClick={() => onChange('08:00')}>Choisir 08:00</button> }));
import { AppointmentForm } from '@/components/appointment-form';
import { EmergencyAlert } from '@/components/emergency-alert';
const doctors = [{ id: 'dr-test', name: 'Dr Test', specialty: 'Généraliste', available: ['Lun'] }];
const saved = { id: '00000000-0000-4000-8000-000000000002', status: 'requested', startAt: '2026-10-12T08:00:00.000Z' };
beforeEach(() => {
  vi.clearAllMocks(); mocks.connected = true; mocks.sessionChange = undefined;
  Object.defineProperty(navigator, 'geolocation', { configurable: true, value: {
    getCurrentPosition: (resolve: (value: unknown) => void) => resolve({ coords: { latitude: 14.7, longitude: -17.4 } }),
  } });
});
afterEach(() => { vi.useRealTimers(); });
function form() { render(<AppointmentForm doctors={doctors} selectedDoctor="dr-test" onSelectDoctor={vi.fn()} />); }
function fill() {
  fireEvent.click(screen.getByText('Choisir lundi')); fireEvent.click(screen.getByText('Choisir 08:00'));
  fireEvent.change(screen.getByLabelText('Téléphone de contact'), { target: { value: '+221 77 123 45 67' } });
  fireEvent.change(screen.getByLabelText('Motif de consultation'), { target: { value: 'Test' } });
  fireEvent.click(screen.getByRole('button', { name: 'Envoyer la demande de rendez-vous' }));
}
describe('patient reservation wording', () => {
  it('shows a stable persisted reference and pending status, without SMS or video promises', async () => {
    mocks.create.mockResolvedValue(saved); form(); fill();
    expect(await screen.findByText('Demande enregistrée')).toBeInTheDocument();
    expect(screen.getByText('En attente de confirmation par le médecin.')).toBeInTheDocument();
    expect(screen.getByText(`Référence : ${saved.id}`)).toBeInTheDocument();
    expect(screen.queryByText(/Rendez-vous confirmé/)).not.toBeInTheDocument();
    expect(screen.queryByText(/SMS de confirmation/)).not.toBeInTheDocument();
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ phone: '+221771234567', mode: 'clinic', startAt: saved.startAt }));
  });
  it('does not render success on a persistence failure and reuses the retry key', async () => {
    mocks.create.mockRejectedValueOnce(new Error('Base indisponible')).mockResolvedValueOnce(saved);
    form(); fill();
    await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'destructive' })));
    expect(screen.queryByText('Demande enregistrée')).not.toBeInTheDocument();
    await waitFor(() => expect((screen.getByRole('button', { name: 'Envoyer la demande de rendez-vous' }) as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(screen.getByRole('button', { name: 'Envoyer la demande de rendez-vous' }));
    await screen.findByText('Demande enregistrée');
    expect(mocks.create.mock.calls[0][0].requestKey).toBe(mocks.create.mock.calls[1][0].requestKey);
  });
  it('prevents reservation submission while disconnected', () => {
    mocks.connected = false; form();
    expect((screen.getByRole('button', { name: 'Envoyer la demande de rendez-vous' }) as HTMLButtonElement).disabled).toBe(true);
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it('clears a saved reference and contact details when the patient logs out', async () => {
    mocks.create.mockResolvedValue(saved); form(); fill();
    await screen.findByText(`Référence : ${saved.id}`);
    mocks.connected = false;
    act(() => { mocks.sessionChange!(null); });
    expect(screen.queryByText(`Référence : ${saved.id}`)).not.toBeInTheDocument();
    expect((screen.getByLabelText('Téléphone de contact') as HTMLInputElement).value).toBe('');
  });
  it('does not reveal a late response after a different patient takes over the session', async () => {
    let resolve: (value: typeof saved) => void = () => {};
    mocks.create.mockImplementation(() => new Promise(done => { resolve = done; }));
    form(); fill();
    act(() => { mocks.sessionChange!('different-patient'); });
    await act(async () => { resolve(saved); });
    expect(screen.queryByText(`Référence : ${saved.id}`)).not.toBeInTheDocument();
    expect(mocks.toast).not.toHaveBeenCalledWith(expect.objectContaining({ title: 'Demande enregistrée' }));
  });
});

describe('patient emergency notification wording', () => {
  async function submit() {
    render(<EmergencyAlert />);
    fireEvent.change(screen.getByPlaceholderText(/Décrivez les symptômes/), { target: { value: 'Test' } });
    fireEvent.change(screen.getByPlaceholderText('+221 7X XXX XX XX'), { target: { value: '+221771234567' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Vérifier l’urgence|Vérifier l'urgence/ })); });
  }
  it('clearly reports that no delivery is confirmed when the service is unavailable', async () => {
    mocks.emergency.mockResolvedValue({ isEmergency: true, reason: 'Test', clinicsAlerted: [], clinicsPending: [], notificationsFailed: 3, notificationStatus: 'unavailable' });
    await submit();
    expect(await screen.findByText(/Aucun envoi de SMS confirmé/)).toBeInTheDocument();
    expect(screen.queryByText('SMS livrés aux cliniques :')).not.toBeInTheDocument();
  });
  it('reports accepted messages as unconfirmed rather than delivered', async () => {
    mocks.emergency.mockResolvedValue({ isEmergency: true, reason: 'Test', clinicsAlerted: [], clinicsPending: ['Partner'], notificationsFailed: 0, notificationStatus: 'pending' });
    await submit();
    expect(await screen.findByText(/Livraison non confirmée/)).toBeInTheDocument();
    expect(screen.queryByText('SMS livrés aux cliniques :')).not.toBeInTheDocument();
  });
});
