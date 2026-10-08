'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { AppointmentForm } from '@/components/appointment-form';
import DoctorCard from '@/components/doctor-card';
import { DoctorSearch } from '@/components/doctor-search';
import type { Doctor } from '@/types/doctor';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { Stethoscope, CalendarDays, Search, Info } from 'lucide-react';

export default function AppointmentBooking() {
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filtered, setFiltered] = useState<Doctor[]>([]);
  const [error, setError] = useState(false);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const formHeading = useRef<HTMLHeadingElement>(null);
  const handleFilter = useCallback((docs: Doctor[]) => setFiltered(docs), []);
  useEffect(() => {
    let active = true;
    fetch('/api/doctors', { cache: 'no-store' })
      .then(async response => { if (!response.ok) throw new Error(); if (active) setDemo(response.headers.get('X-Directory-Mode') === 'demo'); return response.json() as Promise<Doctor[]>; })
      .then(docs => { if (active) { setDoctors(docs); setFiltered(docs); } })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const selectDoctor = (id: string) => {
    setSelectedDoctor(id);
    requestAnimationFrame(() => {
      formHeading.current?.focus({ preventScroll: true });
      if (window.innerWidth < 1024) formHeading.current?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    });
  };
  const doctor = doctors.find(d => d.id === selectedDoctor);
  return <div className="space-y-5">
    {demo && <p role="status" className="status-notice">{t('local_demo')}</p>}
    {error && <p role="alert" className="status-notice">{t('patient_unavailable')}</p>}
    <div className="grid items-start gap-7 lg:grid-cols-[1.4fr_1fr]">
      <section aria-labelledby="directory-heading" className="space-y-5">
        <DoctorSearch doctors={doctors} onFilter={handleFilter} />
        <div className="flex flex-wrap items-center justify-between gap-2"><h2 id="directory-heading" className="flex items-center gap-2 text-lg font-semibold"><Stethoscope aria-hidden="true" className="h-5 w-5 text-primary" />{t('design_directory_title')}</h2>{!loading && <p role="status" className="text-xs text-muted-foreground">{t('design_directory_count', { count: filtered.length })}</p>}</div>
        {loading ? <div className="grid gap-4 sm:grid-cols-2">{[1,2,3,4].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}</div> : !filtered.length ? <div className="empty-state"><Search aria-hidden="true" className="mx-auto h-8 w-8 text-muted-foreground" /><h3 className="mt-4 font-semibold">{t('design_directory_empty_title')}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t('design_directory_empty_text')}</p></div> : <div className="grid gap-4 sm:grid-cols-2">{filtered.map(d => <DoctorCard key={d.id} doctor={d} selected={selectedDoctor === d.id} onSelect={selectDoctor} />)}</div>}
      </section>
      <section className="booking-form-panel" aria-labelledby="booking-form-heading"><div className="panel-heading"><span className="panel-icon"><CalendarDays aria-hidden="true" className="h-5 w-5" /></span><div><h2 ref={formHeading} tabIndex={-1} id="booking-form-heading" className="text-lg font-semibold">{t('design_form_title')}</h2><p aria-live="polite" className="mt-1 text-xs text-muted-foreground">{doctor ? doctor.name : t('design_form_intro')}</p></div></div>
        <AppointmentForm doctors={doctors} selectedDoctor={selectedDoctor} onSelectDoctor={setSelectedDoctor} />
      </section>
    </div>
    <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"><Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />{t('design_booking_note')}</p>
  </div>;
}
