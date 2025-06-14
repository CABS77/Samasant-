"use client";

import { AppointmentForm } from '@/components/appointment-form';
import DoctorCard from '@/components/doctor-card';
import { DoctorSearch } from '@/components/doctor-search';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const doctors = [
  {
    id: 'd1',
    name: 'Dr Ndiaye',
    specialty: 'Cardiologie',
    location: 'Dakar',
    bio: '15 ans d\'expérience en cardiologie',
    available: ['09:00', '11:00'],
    rating: 4.8,
    reviews: 120,
  },
  {
    id: 'd2',
    name: 'Dr Faye',
    specialty: 'Dermatologie',
    location: 'Thiès',
    bio: 'Spécialiste des maladies de la peau',
    available: ['14:00', '16:00'],
    rating: 4.5,
    reviews: 98,
  },
  {
    id: 'd3',
    name: 'Dr Diop',
    specialty: 'Pédiatrie',
    location: 'Saint-Louis',
    bio: 'Parle français et anglais',
    available: ['10:00', '12:00'],
    rating: 4.3,
    reviews: 75,
  },
  {
    id: 'd4',
    name: 'Dr Sarr',
    specialty: 'Généraliste',
    location: 'Dakar',
    bio: 'Médecin de famille depuis 20 ans',
    available: ['13:00', '15:00'],
    rating: 4.2,
    reviews: 88,
  },
  {
    id: 'd5',
    name: 'Dr Ba',
    specialty: 'Gynécologie',
    location: 'Ziguinchor',
    bio: 'Spécialiste en santé maternelle',
    available: ['16:00', '18:00'],
    rating: 4.6,
    reviews: 110,
  },
];

export default function AppointmentsPage() {
  const { t } = useTranslation();
  const [filtered, setFiltered] = useState(doctors);

  return (
    <div className="p-4 space-y-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold font-poppins-bold">
        {t('appointments_book_link')}
      </h1>
      <DoctorSearch doctors={doctors} onFilter={setFiltered} />
      <h2 className="text-xl font-semibold">
        {t('doctor_availability_title')}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {filtered.map((d) => (
          <DoctorCard key={d.id} doctor={d} />
        ))}
      </div>
      <AppointmentForm doctors={doctors} />
    </div>
  );
}
