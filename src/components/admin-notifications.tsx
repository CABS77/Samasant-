'use client';
import { useCallback, useEffect, useState } from 'react';
import { Button } from './ui/button';
interface Row { id: string; partner_name: string; state: string; acknowledged_at: string | null }
const labels: Record<string, string> = { queued: 'À envoyer', processing: 'Envoi en cours', accepted: 'Accepté par le prestataire', delivered: 'Livraison confirmée', failed: 'Échec', unknown: 'État à vérifier auprès du prestataire' };
export function AdminNotifications() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/notifications', { cache: 'no-store' });
      if (!response.ok) throw new Error();
      setRows((await response.json()).notifications); setError('');
    } catch { setError('Suivi des notifications indisponible.'); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const acknowledge = async (id: string) => {
    try {
      const response = await fetch('/api/admin/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, acknowledge: true }) });
      if (!response.ok) throw new Error();
      await load();
    } catch { setError('Accusé non enregistré.'); }
  };
  return <section className="space-y-3 rounded-xl border p-4">
    <h2 className="text-xl font-semibold">Suivi des notifications</h2>
    <p className="text-sm">L’accusé de réception par un opérateur reste distinct de la livraison du SMS et d’une prise en charge médicale.</p>
    <Button variant="outline" onClick={() => void load()}>Actualiser les notifications</Button>
    {error && <p role="alert">{error}</p>}
    {rows.map(row => <div key={row.id} className="flex flex-wrap items-center gap-3 rounded-lg border p-3 text-sm">
      <p>{row.partner_name} — {labels[row.state] || row.state}</p>
      {row.acknowledged_at ? <p>Réception reconnue par un opérateur</p> : <Button variant="outline" onClick={() => void acknowledge(row.id)}>Accuser réception de cette notification</Button>}
    </div>)}
  </section>;
}
