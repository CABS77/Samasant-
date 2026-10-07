'use client';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { Button } from './ui/button';

export function PatientDataControls({ onDeleted }: { onDeleted?: () => void }) {
  const { t } = useTranslation();
  const active = useRef(true);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const run = async (remove: boolean) => {
    setBusy(true); setMessage('');
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw new Error();
      const response = await fetch('/api/patient/data', { method: remove ? 'DELETE' : 'GET', cache: 'no-store',
        headers: { Authorization: `Bearer ${data.session.access_token}`, 'Content-Type': 'application/json' },
        ...(remove ? { body: JSON.stringify({ confirm: 'delete-my-appointment-requests' }) } : {}) });
      if (!response.ok) throw new Error();
      const current = await supabase.auth.getSession();
      if (!active.current || current.data.session?.user.id !== data.session.user.id) return;
      if (remove) { setMessage(t('delete_data_success')); setConfirm(false); onDeleted?.(); }
      else {
        const url = URL.createObjectURL(await response.blob());
        const link = document.createElement('a'); link.href = url; link.download = 'samasante-demandes.json'; link.click();
        URL.revokeObjectURL(url);
      }
    } catch { if (active.current) setMessage(t('export_data_error')); } finally { if (active.current) setBusy(false); }
  };
  return <section className="space-y-3 rounded-xl border p-4 text-sm">
    <h3 className="font-semibold">{t('privacy_tools')}</h3>
    <Button variant="outline" disabled={busy} onClick={() => void run(false)}>{t('export_data')}</Button>
    <p>{t('delete_data_description')}</p>
    <label className="flex items-start gap-2"><input type="checkbox" checked={confirm} onChange={event => setConfirm(event.target.checked)} />{t('delete_data_confirm')}</label>
    <Button variant="destructive" disabled={busy || !confirm} onClick={() => void run(true)}>{t('delete_data')}</Button>
    {message && <p role="status">{message}</p>}
  </section>;
}
