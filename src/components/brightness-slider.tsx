"use client"

import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";

export function BrightnessSlider() {
  const [value, setValue] = useState<number[]>([100]);

  useEffect(() => {
    const brightness = value[0] / 100;
    document.documentElement.style.setProperty("--brightness", brightness.toString());
  }, [value]);

  return (
    <div className="flex items-center space-x-2 w-40">
      <span className="text-xs text-muted-foreground">Luminosité</span>
      <Slider min={50} max={150} step={10} value={value} onValueChange={setValue} />
    </div>
  );
}
