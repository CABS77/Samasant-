"use client";

import * as React from 'react';
import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarDays, ChevronDown, ChevronUp } from 'lucide-react';

interface DatePickerProps {
  date: Date | undefined;
  onChange: (date: Date | undefined) => void;
  disabledDates?: Date[];
}

export function DatePicker({ date, onChange, disabledDates }: DatePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      {/* Bouton toggle */}
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between text-left font-normal"
        onClick={() => setOpen(!open)}
      >
        <span className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          {date ? format(date, 'EEEE d MMMM yyyy', { locale: fr }) : 'Sélectionner une date'}
        </span>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </Button>

      {/* Calendrier inline */}
      {open && (
        <div className="rounded-xl border border-border/50 bg-card p-1 shadow-sm">
          <Calendar
            mode="single"
            selected={date}
            disabled={disabledDates}
            onSelect={(d) => {
              onChange(d);
              if (d) setOpen(false);
            }}
            captionLayout="dropdown-buttons"
            fromYear={new Date().getFullYear()}
            toYear={new Date().getFullYear() + 1}
            className="rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
