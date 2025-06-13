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
    <div className="p-4 space-y-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold font-poppins-bold">Disponibilités des médecins</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {doctors.map((d) => (
          <div key={d.id} className="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition">
            <strong>{d.name}</strong> ({d.specialty})
            <div className="text-sm mt-1">{d.available.join(', ')}</div>
          </div>
        ))}
      </div>
      <AppointmentForm doctors={doctors} />
    </div>
  );
}
