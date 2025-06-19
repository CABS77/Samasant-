"use client";

import * as React from 'react';
import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Icons } from '@/components/icons';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

interface DatePickerProps {
  date: Date | undefined;
  onChange: (date: Date | undefined) => void;
  disabledDates?: Date[];
}

export function DatePicker({ date, onChange, disabledDates }: DatePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal gap-2"
        >
          <Icons.calendar className="h-4 w-4" />
          {date ? format(date, 'PPP', { locale: fr }) : 'Sélectionner une date'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          disabled={disabledDates}
          onSelect={(d) => {
            onChange(d);
            if (d) setOpen(false);
          }}
          captionLayout="dropdown-buttons"
          fromYear={new Date().getFullYear() - 5}
          toYear={new Date().getFullYear() + 5}
          className="rounded-md"
        />
      </PopoverContent>
    </Popover>
  );
}
