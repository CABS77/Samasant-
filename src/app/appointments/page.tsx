"use client";

import { AppointmentForm } from '@/components/appointment-form';

const doctors = [
  { id: 'd1', name: 'Dr Ndiaye', available: ['09:00', '11:00'] },
  { id: 'd2', name: 'Dr Faye', available: ['14:00', '16:00'] },
];

export default function AppointmentsPage() {
  return (
    <div className="p-4 space-y-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold">Disponibilités des médecins</h2>
      <ul className="space-y-2">
        {doctors.map((d) => (
          <li key={d.id} className="border p-2 rounded">
            <strong>{d.name}</strong>: {d.available.join(', ')}
          </li>
        ))}
      </ul>
      <AppointmentForm doctors={doctors} />
    </div>
  );
}
