"use client";

import { AppointmentForm } from '@/components/appointment-form';

const doctors = [
  { id: 'd1', name: 'Dr Ndiaye', specialty: 'Cardiologie', available: ['09:00', '11:00'] },
  { id: 'd2', name: 'Dr Faye', specialty: 'Dermatologie', available: ['14:00', '16:00'] },
  { id: 'd3', name: 'Dr Diop', specialty: 'Pédiatrie', available: ['10:00', '12:00'] },
  { id: 'd4', name: 'Dr Sarr', specialty: 'Généraliste', available: ['13:00', '15:00'] },
  { id: 'd5', name: 'Dr Ba', specialty: 'Gynécologie', available: ['16:00', '18:00'] },
];

export default function AppointmentsPage() {
  return (
    <div className="p-4 space-y-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold">Disponibilités des médecins</h2>
      <ul className="space-y-2">
        {doctors.map((d) => (
          <li key={d.id} className="border p-2 rounded">
            <strong>{d.name}</strong> ({d.specialty}): {d.available.join(', ')}
          </li>
        ))}
      </ul>
      <AppointmentForm doctors={doctors} />
    </div>
  );
}
