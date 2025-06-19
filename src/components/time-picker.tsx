"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const [time, setTime] = React.useState(value);

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = event.target.value;
    if (/^([0-1]?[0-9]|2[0-3]):([0-5]?[0-9])$/.test(newTime)) {
      setTime(newTime);
      onChange(newTime);
    }
  };

  const handlePresetTime = (preset: string) => {
    setTime(preset);
    onChange(preset);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex gap-6">
        <Button variant="outline" onClick={() => handlePresetTime('08:00')}>
          08:00
        </Button>
        <Button variant="outline" onClick={() => handlePresetTime('09:00')}>
          09:00
        </Button>
        <Button variant="outline" onClick={() => handlePresetTime('12:00')}>
          12:00
        </Button>
        <Button variant="outline" onClick={() => handlePresetTime('14:00')}>
          14:00
        </Button>
      </div>
      <Input
        type="text"
        value={time}
        onChange={handleTimeChange}
        placeholder="HH:MM"
        className="w-24 text-center text-xl font-semibold"
      />
    </div>
  );
}
