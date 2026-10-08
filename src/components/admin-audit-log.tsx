'use client';
import { useCallback, useEffect, useState } from 'react';
import { Button } from './ui/button';

interface AuditEvent {
  id: string; entity: string; entity_id: string; action: string;
  from_state: string | null; to_state: string | null;
  operator_id: string | null; created_at: string;
}
const entities: Record<string, string> = {
  doctor_directory: 'Médecin', appointment_requests: 'Rendez-vous',
  admin_sessions: 'Session', sms_notifications: 'Notification',
};
const actions: Record<string, string> = {
  INSERT: 'Création', UPDATE: 'Modification', DELETE: 'Suppression', ACKNOWLEDGE: 'Accusé de réception',
};
const states: Record<string, string> = {
  requested: 'Demandé', confirmed: 'Confirmé', cancelled: 'Annulé', queued: 'À envoyer',
  processing: 'Envoi en cours', accepted: 'Accepté par le prestataire', delivered: 'Livré',
  failed: 'Échec', unknown: 'À vérifier',
};

export function AdminAuditLog() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/audit', { cache: 'no-store' });
      if (!response.ok) throw new Error();
      setEvents((await response.json()).events); setLoaded(true); setError('');
    } catch { setError('Journal indisponible. Réessayez.'); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  return <section className="space-y-3 rounded-xl border p-4" aria-labelledby="audit-heading">
    <h2 id="audit-heading" className="text-xl font-semibold">Journal des opérations</h2>
    <p className="text-sm">Les 100 opérations les plus récentes. L’identifiant opérateur correspond au compte Supabase autorisé. Horaires en UTC.</p>
    <Button variant="outline" onClick={() => void load()}>Actualiser le journal</Button>
    {error && <p role="alert">{error}</p>}
    {!loaded && !error && <p role="status">Chargement du journal…</p>}
    {loaded && !error && events.length === 0 && <p>Aucune opération enregistrée.</p>}
    <ol className="space-y-2">
      {events.map(event => <li key={event.id} className="space-y-1 rounded-lg border p-3 text-sm break-words">
        <p className="font-medium">{entities[event.entity] || event.entity} : {actions[event.action] || event.action}</p>
        <p>Référence : <span className="break-all">{event.entity_id}</span></p>
        {(event.from_state || event.to_state) && <p>État : {event.from_state ? states[event.from_state] || event.from_state : 'Absent'} → {event.to_state ? states[event.to_state] || event.to_state : 'Absent'}</p>}
        <p>Opérateur : <span className="break-all">{event.operator_id || 'Opération automatique, patient ou historique sans opérateur enregistré'}</span></p>
        <time dateTime={event.created_at}>{new Date(event.created_at).toLocaleString('fr-FR', { timeZone: 'UTC' })} UTC</time>
      </li>)}
    </ol>
  </section>;
}
