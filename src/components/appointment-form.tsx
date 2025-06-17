"use client";

import React, { useState } from 'react';
import { createAppointment } from '@/services/appointments';
import type { RendezVous } from '@/types/firestore';
import type { Doctor } from '@/types/doctor';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/date-picker';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Icons } from '@/components/icons';


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
            {d.name} - {d.specialty}
          </option>
        ))}
      </select>
      <DatePicker date={date} onChange={setDate} />
      {date && (
        <p className="text-sm text-gray-600">Jour sélectionné: {date.toLocaleDateString()}</p>
      )}
      <Input
        value={motif}
        onChange={(e) => setMotif(e.target.value)}
        placeholder="Motif"
      />
      <RadioGroup value={mode} onValueChange={(v) => setMode(v as 'clinic' | 'video')} className="flex gap-4">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="clinic" id="clinic" />
          <label htmlFor="clinic" className="flex items-center gap-1">
            <Icons.stethoscope className="w-4 h-4" /> En clinique
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="video" id="video" />
          <label htmlFor="video" className="flex items-center gap-1">
            <Icons.video className="w-4 h-4" /> En vidéo
          </label>
        </div>
      </RadioGroup>
      <Button
        type="submit"
        className="bg-gradient-to-r from-green-500 to-green-600 shadow-md hover:shadow-lg"
      >
        Réserver
      </Button>
    </form>
  );
}
