"use client";

import { useState } from 'react';
import { createAppointment } from '@/services/appointments';
import type { RendezVous } from '@/types/firestore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface Doctor {
  id: string;
  name: string;
}

interface Props {
  doctors: Doctor[];
}

export function AppointmentForm({ doctors }: Props) {
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [motif, setMotif] = useState('');
  const [mode, setMode] = useState<'clinic' | 'video'>('clinic');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !date) return;
    const timestamp = { seconds: Math.floor(date.getTime() / 1000), nanoseconds: 0 };
    const data: RendezVous = {
      jefandikukat_id: 'demo-user',
      doktoor_id: selectedDoctor,
      dat: timestamp,
      estatu: 'planifie',
      motif,
      notes_jefandikukat: mode,
    };
    await createAppointment(data);
    setMotif('');
    alert('Rendez-vous enregistré');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <select
        value={selectedDoctor}
        onChange={(e) => setSelectedDoctor(e.target.value)}
        className="w-full border rounded-md p-2"
      >
        <option value="">Choisissez un médecin</option>
        {doctors.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>
      <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md" />
      <Input
        value={motif}
        onChange={(e) => setMotif(e.target.value)}
        placeholder="Motif"
      />
      <RadioGroup value={mode} onValueChange={(v) => setMode(v as 'clinic' | 'video')} className="flex gap-4">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="clinic" id="clinic" />
          <label htmlFor="clinic">En clinique</label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="video" id="video" />
          <label htmlFor="video">En vidéo</label>
        </div>
      </RadioGroup>
      <Button type="submit">Réserver</Button>
    </form>
  );
}
