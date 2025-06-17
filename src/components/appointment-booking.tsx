"use client";

import React from 'react';
import { AppointmentForm } from '@/components/appointment-form';
import DoctorCard from '@/components/doctor-card';
import { DoctorSearch } from '@/components/doctor-search';
import { Icons } from '@/components/icons';
import type { Doctor } from '@/types/doctor';
import { getDoctors } from '@/services/doctors';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function AppointmentBooking() {
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filtered, setFiltered] = useState<Doctor[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    getDoctors()
      .then((docs) => {
        setDoctors(docs);
        setFiltered(docs);
      })
      .catch((err) => console.error('Error fetching doctors', err));
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const check = () => {
      const hasOverflow = el.scrollWidth > el.clientWidth + 1;
      if (!hasOverflow) {
        setShowHint(false);
        return;
      }
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
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

  return (
    <div className="space-y-4">
      <DoctorSearch doctors={doctors} onFilter={(docs) => setFiltered(docs)} />
      <h2 className="text-xl font-semibold">
        {t('doctor_availability_title')}
      </h2>
      <div className="relative">
        <div
          ref={listRef}
          className="flex gap-4 flex-nowrap overflow-x-auto pb-4"
        >
          {filtered.map((d) => (
            <div key={d.id} className="flex-shrink-0 w-[48%] snap-center md:w-[30%]">
              <DoctorCard doctor={d} />
            </div>
          ))}
        </div>
        {showHint && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <Icons.arrowRight className="w-6 h-6 text-gray-500" />
          </div>
        )}
      </div>
      {showHint && (
        <p className="text-center text-gray-500 text-sm">
          {t('scroll_hint_doctors')}
        </p>
      )}
      <AppointmentForm doctors={doctors} />
    </div>
  );
}
