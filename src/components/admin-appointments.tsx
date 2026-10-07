'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Doctor } from '@/types/doctor';

interface RequestRow { id: string; doctor_id: string; start_at: string; motif: string; phone: string; status: 'requested' | 'confirmed' | 'cancelled' }
const labels = { requested: 'En attente', confirmed: 'Confirmé', cancelled: 'Annulé' };

export function AdminAppointments({ doctors }: { doctors: Doctor[] }) {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/admin/appointments', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setRows(data);
    } catch (failure) {
      setRows([]);
      setError(failure instanceof Error ? failure.message : 'Chargement impossible.');
    } finally { setBusy(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const update = async (id: string, status: 'confirmed' | 'cancelled') => {
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/admin/appointments', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      await load();
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Modification impossible.'); }
    finally { setBusy(false); }
  };
  return (
    <section className="bg-card rounded-2xl border p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Demandes de rendez-vous</h2>
        <Button type="button" variant="outline" disabled={busy} onClick={load}>Actualiser</Button>
      </div>
      <p className="text-sm text-muted-foreground">Confirmez uniquement après accord de la clinique. Jusqu’à 100 demandes affichées, par date croissante.</p>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {!error && !busy && !rows.length && <p>Aucune demande enregistrée.</p>}
      {rows.map(row => <article key={row.id} className="border rounded-lg p-4 space-y-2 text-sm">
        <p className="font-medium">{doctors.find(d => d.id === row.doctor_id)?.name || row.doctor_id} — {labels[row.status]}</p>
        <p>{new Date(row.start_at).toLocaleString('fr-FR', { timeZone: 'Africa/Dakar' })} (Sénégal)</p>
        <p>Contact : {row.phone}</p><p>Motif : {row.motif}</p>
        <p className="text-xs break-all">Référence : {row.id}</p>
        <div className="flex gap-2">
          {row.status === 'requested' && <Button size="sm" disabled={busy} onClick={() => update(row.id, 'confirmed')}>Confirmer</Button>}
          {row.status !== 'cancelled' && <Button size="sm" variant="outline" disabled={busy} onClick={() => update(row.id, 'cancelled')}>Annuler la demande</Button>}
        </div>
      </article>)}
    </section>
  );
}
