"use client";

import { AppointmentForm } from '@/components/appointment-form';
import DoctorCard from '@/components/doctor-card';
import { DoctorSearch } from '@/components/doctor-search';
import { useEffect, useRef, useState } from 'react';
import { Icons } from '@/components/icons';
import type { Doctor } from '@/types/doctor';
import { useTranslation } from 'react-i18next';
import { getDoctors } from '@/services/doctors';


export default function AppointmentsPage() {
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filtered, setFiltered] = useState<Doctor[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const check = () => {
      const hasOverflow = el.scrollWidth > el.clientWidth + 1;
      if (!hasOverflow) {
        setShowHint(false);
        return;
      }
      const atEnd =
        el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
      setShowHint(!atEnd);
    };
    check();
    el.addEventListener('scroll', check);
    window.addEventListener('resize', check);
    return () => {
      el.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, [filtered.length]);

  useEffect(() => {
    getDoctors()
      .then((docs) => {
        setDoctors(docs);
        setFiltered(docs);
      })
      .catch((err) => console.error('Error fetching doctors', err));
  }, []);

  return (
    <div className="p-4 space-y-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold font-poppins-bold">
        {t('appointments_book_link')}
      </h1>
      <DoctorSearch doctors={doctors} onFilter={(docs) => setFiltered(docs)} />
      <h2 className="text-xl font-semibold">
        {t('doctor_availability_title')}
      </h2>
      <div className="relative">
        <div
          ref={listRef}
          className="flex gap-4 flex-nowrap overflow-x-auto pb-4 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible"
        >
          {filtered.map((d) => (
            <div key={d.id} className="flex-shrink-0 w-[48%] snap-center md:w-auto">
              <DoctorCard doctor={d} />
            </div>
          ))}
        </div>
        {showHint && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none md:hidden">
            <Icons.arrowRight className="w-6 h-6 text-gray-500" />
          </div>
        )}
      </div>
      {showHint && (
        <p className="text-center text-gray-500 text-sm md:hidden">
          {t('scroll_hint_doctors')}
        </p>
      )}
      <AppointmentForm doctors={doctors} />
    </div>
  );
}
