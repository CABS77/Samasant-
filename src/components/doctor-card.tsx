'use client';

import type { Doctor } from '@/types/doctor';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { MapPin, CalendarDays, ArrowUpRight, Check } from 'lucide-react';

export default function DoctorCard({ doctor, onSelect, selected = false }: { doctor: Doctor; onSelect?: (id: string) => void; selected?: boolean }) {
  const { t } = useTranslation();
  const initials = doctor.name.replace(/^dr\.?\s*/i, '').split(/\s+/).filter(Boolean).slice(0,2).map(part => part[0]).join('');
  return <article className={`flex h-full flex-col rounded-2xl border bg-card p-5 transition-colors ${selected ? 'border-primary ring-1 ring-primary/20' : 'hover:border-primary/40'}`}>
    <div className="flex items-center justify-between"><span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-sm font-semibold text-primary">{initials}</span><span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">{doctor.specialty}</span></div>
    <h3 className="mt-4 text-base font-semibold">{doctor.name}</h3>
    {doctor.location && <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />{doctor.location}</p>}
    {doctor.bio && <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{doctor.bio}</p>}
    <div className="mt-auto pt-5">{doctor.available.length > 0 && <div className="mb-4 flex items-center gap-2"><CalendarDays aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /><div className="flex flex-wrap gap-1">{doctor.available.map(day => <span key={day} className="rounded bg-muted px-1.5 py-1 text-[11px]">{day}</span>)}</div></div>}
      <Button type="button" onClick={() => onSelect?.(doctor.id)} variant={selected ? 'default' : 'outline'} aria-pressed={selected} className="w-full text-xs">{selected ? t('design_doctor_selected') : t('doctor_select_button')}{selected ? <Check aria-hidden="true" /> : <ArrowUpRight aria-hidden="true" />}</Button>
    </div>
  </article>;
}
