"use client";

import { AppointmentForm } from '@/components/appointment-form';
import DoctorCard from '@/components/doctor-card';
import { DoctorSearch } from '@/components/doctor-search';
import { useEffect, useState } from 'react';
import type { Doctor } from '@/types/doctor';
import { useTranslation } from 'react-i18next';
import { getDoctors } from '@/services/doctors';


export default function AppointmentsPage() {
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filtered, setFiltered] = useState<Doctor[]>([]);

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
      <div
        className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible"
      >
        {filtered.map((d) => (
          <div key={d.id} className="flex-shrink-0 w-[48%] md:w-auto">
            <DoctorCard doctor={d} />
          </div>
        ))}
      </div>
      <AppointmentForm doctors={doctors} />
    </div>
  );
}
