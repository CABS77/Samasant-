'use client';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PatientSignIn } from './patient-sign-in';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function AdminSignIn({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [factor, setFactor] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const sessionChanged = useCallback((id: string | null) => setUserId(id), []);
  useEffect(() => {
    setFactor(''); setSecret(''); setCode('');
    if (!userId) return;
    let active = true;
    void supabase.auth.mfa.listFactors().then(({ data, error }) => {
      if (!active) return;
      if (error) setError('Double authentification indisponible.');
      else setFactor(data?.totp.find(f => f.status === 'verified')?.id || '');
    });
    return () => { active = false; };
  }, [userId]);
  const enroll = async () => {
    setBusy(true); setError('');
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'SamaSanté administration' });
      if (error || !data) throw new Error();
      setFactor(data.id); setSecret(data.totp.secret);
    } catch { setError('Activation indisponible. Réessayez.'); } finally { setBusy(false); }
  };
  const verify = async () => {
    setBusy(true); setError('');
    try {
      const result = await supabase.auth.mfa.challengeAndVerify({ factorId: factor, code });
      if (result.error) throw new Error('Code incorrect ou expiré.');
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw new Error('Reconnectez-vous.');
      const response = await fetch('/api/admin/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: data.session.access_token }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Connexion refusée.');
      setSecret(''); setCode(''); onAuthenticated();
    } catch (error) { setError(error instanceof Error ? error.message : 'Connexion refusée.'); } finally { setBusy(false); }
  };
  return <div className="space-y-4">
    <p className="text-sm">Compte individuel autorisé et double authentification requis.</p>
    <PatientSignIn onSessionChange={sessionChanged} returnPath="/admin" />
    {userId && !factor && <Button disabled={busy} onClick={() => void enroll()}>Activer un authentificateur TOTP</Button>}
    {secret && <p className="break-all text-sm">Ajoutez cette clé dans votre application d’authentification : <code>{secret}</code></p>}
    {factor && <div className="space-y-2">
      <label htmlFor="admin-totp" className="text-sm font-medium">Code de votre authentificateur</label>
      <Input id="admin-totp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={event => setCode(event.target.value.replace(/\D/g, ''))} />
      <Button disabled={busy || code.length !== 6} onClick={() => void verify()}>Vérifier et ouvrir l’administration</Button>
    </div>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </div>;
}
