'use client';

import { useEffect, useState, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import type { Doctor } from '@/types/doctor';

export function DoctorSearch({ doctors, onFilter }: { doctors: Doctor[]; onFilter: (docs: Doctor[]) => void }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState('all');
  const [location, setLocation] = useState('all');
  const specialties = useMemo(() => Array.from(new Set(doctors.map(d => d.specialty))).sort(), [doctors]);
  const locations = useMemo(() => Array.from(new Set(doctors.map(d => d.location).filter((value): value is string => Boolean(value)))).sort(), [doctors]);
  useEffect(() => {
    const q = query.trim().toLocaleLowerCase();
    onFilter(doctors.filter(d => (specialty === 'all' || d.specialty === specialty) && (location === 'all' || d.location === location)
      && (!q || `${d.name} ${d.specialty} ${d.location ?? ''}`.toLocaleLowerCase().includes(q))));
  }, [query, specialty, location, doctors, onFilter]);
  return <div className="rounded-2xl border bg-card p-4">
    <label className="relative block"><span className="sr-only">{t('doctor_search')}</span><Search aria-hidden="true" className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" /><Input placeholder={t('doctor_search')} value={query} onChange={event => setQuery(event.target.value)} className="pl-10" /></label>
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      <Select value={specialty} onValueChange={setSpecialty}><SelectTrigger aria-label={t('specialty_label')}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{t('doctor_filter_specialty_all')}</SelectItem>{specialties.map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select>
      <Select value={location} onValueChange={setLocation}><SelectTrigger aria-label={t('location_label')}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">{t('doctor_filter_location_all')}</SelectItem>{locations.map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select>
    </div>
    {(query || specialty !== 'all' || location !== 'all') && <button type="button" onClick={() => { setQuery(''); setSpecialty('all'); setLocation('all'); }} className="mt-2 inline-flex min-h-11 items-center gap-2 text-xs font-medium text-primary"><SlidersHorizontal aria-hidden="true" className="h-3.5 w-3.5" />{t('design_reset_filters')}</button>}
  </div>;
}
