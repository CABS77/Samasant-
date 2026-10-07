'use client';

import { PatientDataControls } from './patient-data-controls';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import type { Doctor } from '@/types/doctor';

interface Row { id: string; doctor_id: string; start_at: string; status: 'requested' | 'confirmed' | 'cancelled' }


export function PatientAppointments({ doctors }: { doctors: Doctor[] }) {
  const { t, i18n } = useTranslation();
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
    } catch { setRows([]); setError(t('tracking_unavailable')); }
    finally { setBusy(false); }
  }, [t]);
  useEffect(() => { void load(); }, [load]);
  return <section className="space-y-2 border-t pt-4 text-sm">
    <div className="flex items-center justify-between gap-2">
      <h3 className="font-semibold">{t('my_requests')}</h3>
      <Button type="button" variant="outline" disabled={busy} onClick={load}>{t('refresh_requests')}</Button>
    </div>
    {error && <p role="alert">{error}</p>}
    {!busy && !error && !rows.length && <p>{t('no_requests')}</p>}
    <PatientDataControls onDeleted={() => void load()} />
    {rows.map(row => <div key={row.id} className="rounded-lg border p-3 space-y-1">
      <p>{doctors.find(d => d.id === row.doctor_id)?.name || row.doctor_id} — {t(row.status)}</p>
      <p>{new Date(row.start_at).toLocaleString(i18n.language === 'wo' ? 'wo-SN' : 'fr-FR', { timeZone: 'Africa/Dakar' })} ({t('senegal_time')})</p>
      <p className="text-xs break-all">{t('reference')} : {row.id}</p>
    </div>)}
  </section>;
}
