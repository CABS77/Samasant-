'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import type { Doctor } from '@/types/doctor';

interface Row { id: string; doctor_id: string; start_at: string; status: 'requested' | 'confirmed' | 'cancelled' }
const labels = { requested: 'En attente de confirmation', confirmed: 'Confirmé par la clinique', cancelled: 'Annulé' };

export function PatientAppointments({ doctors }: { doctors: Doctor[] }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    setBusy(true); setError('');
    try {
      // RLS grants only this authenticated patient's rows; never trust a caller-supplied user id.
      const { data, error: failure } = await supabase.from('appointment_requests')
        .select('id,doctor_id,start_at,status').order('start_at', { ascending: false }).limit(50);
      if (failure) throw failure;
      setRows(data || []);
    } catch { setRows([]); setError('Le suivi des demandes est temporairement indisponible.'); }
    finally { setBusy(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  return <section className="space-y-2 border-t pt-4 text-sm">
    <div className="flex items-center justify-between gap-2">
      <h3 className="font-semibold">Mes demandes</h3>
      <Button type="button" variant="outline" disabled={busy} onClick={load}>Actualiser le suivi</Button>
    </div>
    {error && <p role="alert">{error}</p>}
    {rows.map(row => <div key={row.id} className="rounded-lg border p-3 space-y-1">
      <p>{doctors.find(d => d.id === row.doctor_id)?.name || row.doctor_id} — {labels[row.status]}</p>
      <p>{new Date(row.start_at).toLocaleString('fr-FR', { timeZone: 'Africa/Dakar' })} (Sénégal)</p>
      <p className="text-xs break-all">Référence : {row.id}</p>
    </div>)}
  </section>;
}
