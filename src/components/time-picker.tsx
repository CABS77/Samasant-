"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
}

const MORNING_SLOTS = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
const AFTERNOON_SLOTS = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];

export function TimePicker({ value, onChange }: TimePickerProps) {
  const [period, setPeriod] = useState<'morning' | 'afternoon'>('morning');
  const slots = period === 'morning' ? MORNING_SLOTS : AFTERNOON_SLOTS;

  return (
    <div className="space-y-3">
      {/* Period toggle */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={period === 'morning' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setPeriod('morning')}
          className="flex-1"
        >
          ☀️ Matin
        </Button>
        <Button
          type="button"
          variant={period === 'afternoon' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setPeriod('afternoon')}
          className="flex-1"
        >
          🌤️ Après-midi
        </Button>
      </div>

      {/* Time slots grid */}
      <div className="grid grid-cols-4 gap-2">
        {slots.map((slot) => (
          <button
            key={slot}
            type="button"
            onClick={() => onChange(slot)}
            className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all border-2 ${
              value === slot
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border hover:border-primary/30 hover:bg-muted/50 text-foreground'
            }`}
          >
            {slot}
          </button>
        ))}
      </div>

      {value && (
        <p className="text-sm text-primary font-medium text-center">
          ⏰ Créneau sélectionné : {value}
        </p>
      )}
    </div>
  );
}
