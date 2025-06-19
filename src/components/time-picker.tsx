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
  const [is12HourFormat, setIs12HourFormat] = React.useState(false);

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

  const toggleTimeFormat = () => {
    setIs12HourFormat((prev) => !prev);
  };

  const formatTime = (t: string) => {
    if (is12HourFormat) {
      const [h, m] = t.split(":");
      const hours = Number(h);
      const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
      const period = hours < 12 ? "AM" : "PM";
      return `${String(formattedHours).padStart(2, "0")}:${m} ${period}`;
    }
    return t;
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex gap-6 mb-4">
        <Button variant="outline" onClick={() => handlePresetTime("08:00")}>08:00</Button>
        <Button variant="outline" onClick={() => handlePresetTime("09:00")}>09:00</Button>
        <Button variant="outline" onClick={() => handlePresetTime("12:00")}>12:00</Button>
        <Button variant="outline" onClick={() => handlePresetTime("14:00")}>14:00</Button>
      </div>

      <div className="mb-4">
        <Input
          type="text"
          value={formatTime(time)}
          onChange={handleTimeChange}
          placeholder="HH:MM"
          className="w-24 text-center text-xl font-semibold"
        />
      </div>

      {/* Toggle Time Format */}
      <Button variant="outline" onClick={toggleTimeFormat}>
        {is12HourFormat ? "12h Format" : "24h Format"}
      </Button>
    </div>
  );
}
