"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface Props {
  slots: string[];
  selected: string;
  onChange: (value: string) => void;
  disabled?: string[];
}

export function TimeSlotPicker({
  slots,
  selected,
  onChange,
  disabled = [],
}: Props) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {slots.map((slot) => (
        <Button
          key={slot}
          type="button"
          variant={slot === selected ? "default" : "outline"}
          disabled={disabled.includes(slot)}
          onClick={() => onChange(slot)}
          className={slot === selected ? "font-semibold" : ""}
        >
          {slot}
        </Button>
      ))}
    </div>
  );
}
