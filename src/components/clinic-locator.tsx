'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LocationPicker, type SelectedPlace } from './location-picker';
import { getNearbyClinics, type Clinic } from '@/services/mapbox';

export function ClinicLocator() {
  const { t } = useTranslation();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [searched, setSearched] = useState(false);
  const [busy, setBusy] = useState(false);
  const search = async (place: SelectedPlace) => {
    setBusy(true); setSearched(false); setClinics([]);
    try { setClinics(await getNearbyClinics(place)); } finally { setBusy(false); setSearched(true); }
  };
  return <section className="space-y-3">
    <h2 className="text-xl font-semibold">{t('clinic_search_title')}</h2>
    <p className="text-sm text-muted-foreground">{t('clinic_search_notice')}</p>
    <LocationPicker onSelect={place => void search(place)} />
    {busy && <p role="status">{t('loading')}</p>}
    {searched && !clinics.length && <p role="status">{t('clinic_search_empty')}</p>}
    <ul>{clinics.map(clinic => <li key={clinic.id} className="rounded-lg border p-3">{clinic.name}</li>)}</ul>
  </section>;
}
