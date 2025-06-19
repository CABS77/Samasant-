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
import { TimePicker } from '@/components/time-picker';


interface Props {
  doctors: Doctor[];
  selectedDoctor: string;
  onSelectDoctor: (id: string) => void;
}

export function AppointmentForm({ doctors, selectedDoctor, onSelectDoctor }: Props) {
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState('');
  const [motif, setMotif] = useState('');
  const [mode, setMode] = useState<'clinic' | 'video'>('clinic');
  const today = new Date();
  const disabledDates = [
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
  ];


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !date || !time) return;
    const [hours, minutes] = time.split(':').map(Number);
    const dateTime = new Date(date);
    dateTime.setHours(hours);
    dateTime.setMinutes(minutes);
    const timestamp = { seconds: Math.floor(dateTime.getTime() / 1000), nanoseconds: 0 };
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
        onChange={(e) => onSelectDoctor(e.target.value)}
        className="w-full border rounded-md p-2"
      >
        <option value="">Choisissez un médecin</option>
        {doctors.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name} - {d.specialty}
          </option>
        ))}
      </select>
      <DatePicker date={date} onChange={setDate} disabledDates={disabledDates} />
      {date && (
        <>
          <p className="text-sm text-gray-600">Jour sélectionné: {date.toLocaleDateString()}</p>
          <TimePicker value={time} onChange={setTime} />
        </>
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
