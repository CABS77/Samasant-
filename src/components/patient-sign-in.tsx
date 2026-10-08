'use client';

import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Props { onSessionChange: (userId: string | null) => void; returnPath?: '/admin' | '/appointments' }

export function PatientSignIn({ onSessionChange, returnPath = '/appointments' }: Props) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) { onSessionChange(null); return; }
    let active = true;
    const update = (userId: string | null) => {
      if (!active) return;
      setConnected(Boolean(userId));
      onSessionChange(userId);
    };
    let observedAuthEvent = false;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      observedAuthEvent = true;
      update(session?.user.id || null);
    });
    void supabase.auth.getSession().then(({ data: session }) => {
      if (!observedAuthEvent) update(session.session?.user.id || null);
    }).catch(() => { if (!observedAuthEvent) update(null); });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, [configured, onSessionChange]);

  const signIn = async () => {
    if (!email.trim() || busy) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(), options: { emailRedirectTo: `${window.location.origin}${returnPath}` },
      });
      if (error) throw error;
      setMessage(t('patient_email_sent'));
    } catch {
      setMessage(t('patient_email_error'));
    } finally { setBusy(false); }
  };
  const signOut = async () => {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setMessage('');
      navigator.serviceWorker?.controller?.postMessage({ type: 'CLEAR_PRIVATE_DATA' });
    } catch { setMessage(t('sign_out_error')); }
    finally { setBusy(false); }
  };

  if (!configured) return <p role="status" className="status-notice">{t(returnPath === '/admin' ? 'design_admin_unavailable' : 'patient_unavailable')}</p>;
  if (connected) return (
    <div className="space-y-2 text-sm">
      <p>{t('patient_connected')}</p>
      <Button type="button" variant="outline" disabled={busy} onClick={signOut}>{t('sign_out')}</Button>
      {message && <p role="status">{message}</p>}
    </div>
  );
  return (
    <div className="space-y-3 rounded-2xl border bg-secondary/30 p-4">
      <p className="text-sm font-semibold">{t('design_patient_signin_title')}</p>
      <p className="text-xs leading-relaxed text-muted-foreground">{t('design_patient_signin_text')}</p>
      <label htmlFor="patient-email" className="text-sm font-medium">{t('patient_email_label')}</label>
      <Input id="patient-email" type="email" autoComplete="email" value={email}
        onChange={event => setEmail(event.target.value)} placeholder="vous@exemple.com" />
      <Button type="button" disabled={busy || !email.trim()} onClick={signIn}>
        {busy ? t('sending') : t('send_sign_in')}
      </Button>
      {message && <p role="status" className="text-sm">{message}</p>}
    </div>
  );
}
