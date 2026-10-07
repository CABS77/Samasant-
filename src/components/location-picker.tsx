'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Input } from './ui/input';
export interface SelectedPlace { latitude: number; longitude: number; name?: string }

export function LocationPicker({ onSelect }: { onSelect: (place: SelectedPlace) => void }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState<(SelectedPlace & { id: string })[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const search = async () => {
    setBusy(true); setError(''); setPlaces([]);
    try {
      const response = await fetch('/api/locations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }), signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error();
      const result = await response.json(); setPlaces(result.places);
      if (!result.places.length) setError(t('clinic_search_empty'));
    } catch { setError(t('location_unavailable')); } finally { setBusy(false); }
  };
  const locate = () => {
    if (!navigator.geolocation) { setError(t('location_unavailable')); return; }
    setBusy(true); setError('');
    navigator.geolocation.getCurrentPosition(position => {
      onSelect({ latitude: position.coords.latitude, longitude: position.coords.longitude }); setBusy(false);
    }, () => { setError(t('location_unavailable')); setBusy(false); }, { timeout: 8000, maximumAge: 60000 });
  };
  return <div className="space-y-3">
    <Button type="button" variant="outline" disabled={busy} onClick={locate}>{t('position_button')}</Button>
    <label className="block space-y-1 text-sm"><span>{t('manual_place')}</span><Input value={query} maxLength={120} onChange={event => setQuery(event.target.value)} /></label>
    <Button type="button" variant="outline" disabled={busy || query.trim().length < 2} onClick={() => void search()}>{busy ? t('loading') : t('search_place')}</Button>
    {error && <p role="status" className="text-sm">{error}</p>}
    <ul className="space-y-2">{places.map(place => <li key={place.id}><Button type="button" variant="outline" className="h-auto min-h-11 w-full whitespace-normal text-left" onClick={() => { onSelect(place); setPlaces([]); }}>{place.name} — {t('choose_place')}</Button></li>)}</ul>
  </div>;
}
