"use client";

import { AppointmentForm } from '@/components/appointment-form';
import DoctorCard from '@/components/doctor-card';

const doctors = [
  {
    id: 'd1',
    name: 'Dr Ndiaye',
    specialty: 'Cardiologie',
    bio: '15 ans d\'expérience en cardiologie',
    available: ['09:00', '11:00'],
    rating: 4.8,
    reviews: 120,
  },
  {
    id: 'd2',
    name: 'Dr Faye',
    specialty: 'Dermatologie',
    bio: 'Spécialiste des maladies de la peau',
    available: ['14:00', '16:00'],
    rating: 4.5,
    reviews: 98,
  },
  {
    id: 'd3',
    name: 'Dr Diop',
    specialty: 'Pédiatrie',
    bio: 'Parle français et anglais',
    available: ['10:00', '12:00'],
    rating: 4.3,
    reviews: 75,
  },
  {
    id: 'd4',
    name: 'Dr Sarr',
    specialty: 'Généraliste',
    bio: 'Médecin de famille depuis 20 ans',
    available: ['13:00', '15:00'],
    rating: 4.2,
    reviews: 88,
  },
  {
    id: 'd5',
    name: 'Dr Ba',
    specialty: 'Gynécologie',
    bio: 'Spécialiste en santé maternelle',
    available: ['16:00', '18:00'],
    rating: 4.6,
    reviews: 110,
  },
];

export default function AppointmentsPage() {
  return (
    <div className="p-4 space-y-8 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold font-poppins-bold">Disponibilités des médecins</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {doctors.map((d) => (
          <DoctorCard key={d.id} doctor={d} />
        ))}
      </div>
      <AppointmentForm doctors={doctors} />
    </div>
  );
}
