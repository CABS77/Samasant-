'use client';

import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Props { onSessionChange: (userId: string | null) => void }

export function PatientSignIn({ onSessionChange }: Props) {
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
        email: email.trim(), options: { emailRedirectTo: `${window.location.origin}/appointments` },
      });
      if (error) throw error;
      setMessage('Consultez votre e-mail et ouvrez le lien de connexion, puis revenez réserver.');
    } catch {
      setMessage('Lien de connexion indisponible. Vérifiez votre e-mail et réessayez.');
    } finally { setBusy(false); }
  };
  const signOut = async () => {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch { setMessage('Déconnexion impossible. Réessayez.'); }
    finally { setBusy(false); }
  };

  if (!configured) return <p role="status">Les réservations sont temporairement indisponibles. Contactez directement la clinique.</p>;
  if (connected) return (
    <div className="space-y-2 text-sm">
      <p>Vous êtes connecté pour envoyer votre demande.</p>
      <Button type="button" variant="outline" disabled={busy} onClick={signOut}>Se déconnecter</Button>
      {message && <p role="status">{message}</p>}
    </div>
  );
  return (
    <div className="space-y-2 rounded-lg border p-4">
      <label htmlFor="patient-email" className="text-sm font-medium">Connectez-vous par e-mail pour réserver</label>
      <Input id="patient-email" type="email" autoComplete="email" value={email}
        onChange={event => setEmail(event.target.value)} placeholder="vous@exemple.com" />
      <Button type="button" disabled={busy || !email.trim()} onClick={signIn}>
        {busy ? 'Envoi en cours…' : 'Recevoir un lien de connexion'}
      </Button>
      {message && <p role="status" className="text-sm">{message}</p>}
    </div>
  );
}
