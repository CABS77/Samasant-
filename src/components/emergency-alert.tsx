'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { prioritizeEmergencyAndAlert, type PrioritizeEmergencyAndAlertOutput } from '@/ai/flows/emergency-alert-prioritization';
import { hasConfirmedAdult, confirmAdult } from '@/lib/ageConfirmation';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { LocationPicker, type SelectedPlace } from './location-picker';
import type { NotificationRow } from '@/services/notification-outbox';

export function EmergencyAlert() {
  const { t } = useTranslation();
  const [symptoms, setSymptoms] = useState('');
  const [phone, setPhone] = useState('');
  const [place, setPlace] = useState<SelectedPlace | null>(null);
  const [consent, setConsent] = useState(false);
  const [adult, setAdult] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PrioritizeEmergencyAndAlertOutput | null>(null);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [error, setError] = useState('');
  const replay = useRef<{ payload: string; key: string; token: string }>();
  useEffect(() => setAdult(hasConfirmedAdult()), []);
  const refresh = async () => {
    if (!result?.receipt) return;
    try {
      const response = await fetch('/api/notifications/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(result.receipt) });
      if (!response.ok) throw new Error();
      const rows = (await response.json()).notifications as NotificationRow[];
      setNotifications(rows);
      setResult(previous => previous && ({ ...previous, clinicsAlerted: rows.filter(row => row.state === 'delivered').map(row => row.partner_name), clinicsPending: rows.filter(row => ['accepted', 'processing', 'queued'].includes(row.state)).map(row => row.partner_name) }));
    } catch { setError(t('error')); }
  };
  const submit = async () => {
    setBusy(true); setResult(null); setNotifications([]); setError('');
    try {
      const input = { symptoms, phoneNumber: phone.replace(/[\s()-]/g, ''), latitude: place?.latitude, longitude: place?.longitude, ageConfirmed: adult, shareConsent: consent };
      const payload = JSON.stringify(input);
      if (replay.current?.payload !== payload) replay.current = { payload, key: crypto.randomUUID(), token: Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('') };
      const response = await prioritizeEmergencyAndAlert({ ...input, requestKey: replay.current.key, receiptToken: replay.current.token });
      setResult(response);
    } catch { setError(t('error')); } finally { setBusy(false); }
  };
  return <section className="min-w-0 space-y-4">
    <p className="text-sm">{t('emergency_form_notice')}</p>
    <label className="block space-y-2 text-sm"><span>{t('emergency_symptoms')}</span><Textarea value={symptoms} maxLength={2000} onChange={event => setSymptoms(event.target.value)} /></label>
    <label className="block space-y-2 text-sm"><span>{t('phone_label')}</span><Input type="tel" autoComplete="tel" value={phone} maxLength={30} onChange={event => setPhone(event.target.value)} placeholder="+221…" /></label>
    <LocationPicker onSelect={setPlace} />
    {place && <p className="break-words text-sm">{place.name || `${place.latitude.toFixed(3)}, ${place.longitude.toFixed(3)}`}</p>}
    <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={adult} onChange={event => { setAdult(event.target.checked); if (event.target.checked) confirmAdult(); }} />{t('ageGate_confirm')}</label>
    <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} />{t('share_emergency_consent')}</label>
    <a href="/confidentialite" className="inline-block text-sm underline">{t('privacy')}</a>
    <Button type="button" className="h-auto min-h-11 w-full whitespace-normal" disabled={busy || !consent || !adult || symptoms.trim().length < 3 || !phone.trim()} onClick={() => void submit()}>{busy ? t('emergency_waiting') : t('emergency_submit')}</Button>
    {error && <p role="alert">{error}</p>}
    {result && <div role="status" className="space-y-3 rounded-xl border p-4 text-sm">
      <h3 className="font-semibold">{t('emergency_result')}</h3><p>{result.reason}</p>
      <p>{t('sms_delivered')} : {result.clinicsAlerted.join(', ') || '0'}</p>
      <p>{t('sms_pending')} : {result.clinicsPending.join(', ') || '0'}</p>
      {!result.clinicsAlerted.length && <p>{t('sms_none')}</p>}
      <p className="font-semibold">{t('care_unconfirmed')}</p>
      {result.receipt && <Button type="button" variant="outline" onClick={() => void refresh()}>{t('refresh_requests')}</Button>}
      {notifications.map(row => <p key={row.id}>{row.partner_name} — {row.state === 'delivered' ? t('sms_delivered') : row.state === 'accepted' ? t('sms_pending') : t('care_unconfirmed')}{row.acknowledged_at ? ' · Accusé humain enregistré' : ''}</p>)}
    </div>}
  </section>;
}
