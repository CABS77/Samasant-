import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AdminAuditLog } from '@/components/admin-audit-log';

afterEach(() => vi.unstubAllGlobals());
describe('operator journal', () => {
  it('displays the recorded operator and distinguishes an unattributed historical or automatic operation', async () => {
    const operator = '00000000-0000-4000-8000-000000000001';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ events: [
      { id: 'event-a', entity: 'appointment_requests', entity_id: 'request-a', action: 'UPDATE', from_state: 'requested', to_state: 'confirmed', operator_id: operator, created_at: '2026-10-08T08:00:00Z' },
      { id: 'event-b', entity: 'sms_notifications', entity_id: 'notification-b', action: 'UPDATE', from_state: 'accepted', to_state: 'delivered', operator_id: null, created_at: '2026-10-08T08:01:00Z' },
    ] }))));
    render(<AdminAuditLog />);
    expect(await screen.findByText(operator)).toBeInTheDocument();
    expect(screen.getByText('État : Demandé → Confirmé')).toBeInTheDocument();
    expect(screen.getByText('Opération automatique, patient ou historique sans opérateur enregistré')).toBeInTheDocument();
    expect(screen.getByText('État : Accepté par le prestataire → Livré')).toBeInTheDocument();
  });
  it('reports a failure and allows a retry without treating it as an empty journal', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(new Response('{}', { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ events: [] })));
    vi.stubGlobal('fetch', fetch); render(<AdminAuditLog />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Journal indisponible');
    expect(screen.queryByText('Aucune opération enregistrée.')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Actualiser le journal' }));
    await waitFor(() => expect(screen.getByText('Aucune opération enregistrée.')).toBeInTheDocument());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
