"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const [hours, setHours] = React.useState(() => {
    const [h] = value.split(':');
    return parseInt(h || '0', 10);
  });
  const [minutes, setMinutes] = React.useState(() => {
    const [, m] = value.split(':');
    return parseInt(m || '0', 10);
  });

  const pad = (n: number) => String(n).padStart(2, '0');

  const incHours = () => setHours((h) => Math.min(23, h + 1));
  const decHours = () => setHours((h) => Math.max(0, h - 1));
  const incMinutes = () => setMinutes((m) => (m + 1) % 60);
  const decMinutes = () => setMinutes((m) => (m - 1 + 60) % 60);

  React.useEffect(() => {
    onChange(`${pad(hours)}:${pad(minutes)}`);
  }, [hours, minutes, onChange]);

  return (
    <div className="flex items-center justify-center gap-6 p-4">
      <div className="flex flex-col items-center">
        <label>Heure</label>
        <Button type="button" variant="outline" size="icon" onClick={incHours}>
          <span className="text-xl">+</span>
        </Button>
        <Input
          type="text"
          value={pad(hours)}
          readOnly
          className="w-12 text-center font-semibold text-xl"
        />
        <Button type="button" variant="outline" size="icon" onClick={decHours}>
          <span className="text-xl">-</span>
        </Button>
      </div>

      <div className="flex flex-col items-center">
        <label>Minutes</label>
        <Button type="button" variant="outline" size="icon" onClick={incMinutes}>
          <span className="text-xl">+</span>
        </Button>
        <Input
          type="text"
          value={pad(minutes)}
          readOnly
          className="w-12 text-center font-semibold text-xl"
        />
        <Button type="button" variant="outline" size="icon" onClick={decMinutes}>
          <span className="text-xl">-</span>
        </Button>
      </div>
    </div>
  );
}
