"use client";

import { AppointmentForm } from '@/components/appointment-form';
import DoctorCard from '@/components/doctor-card';

const doctors = [
  { id: 'd1', name: 'Dr Ndiaye', specialty: 'Cardiologie', available: ['09:00', '11:00'] },
  { id: 'd2', name: 'Dr Faye', specialty: 'Dermatologie', available: ['14:00', '16:00'] },
  { id: 'd3', name: 'Dr Diop', specialty: 'Pédiatrie', available: ['10:00', '12:00'] },
  { id: 'd4', name: 'Dr Sarr', specialty: 'Généraliste', available: ['13:00', '15:00'] },
  { id: 'd5', name: 'Dr Ba', specialty: 'Gynécologie', available: ['16:00', '18:00'] },
];

export default function AppointmentsPage() {
  return (
    <div className="p-4 space-y-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold font-poppins-bold">Disponibilités des médecins</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {doctors.map((d) => (
          <DoctorCard key={d.id} doctor={d} />
        ))}
      </div>
      <AppointmentForm doctors={doctors} />
    </div>
  );
}
