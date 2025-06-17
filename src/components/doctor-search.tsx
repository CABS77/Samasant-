"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import type { Doctor } from "@/types/doctor";

interface Props {
  doctors: Doctor[];
  onFilter: (docs: Doctor[]) => void;
}

export function DoctorSearch({ doctors, onFilter }: Props) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Doctor[]>([]);
  const [specialty, setSpecialty] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const specialties = useMemo(
    () => Array.from(new Set(doctors.map((d) => d.specialty))).sort(),
    [doctors]
  );

  useEffect(() => {
    let filtered = doctors;
    if (specialty) {
      filtered = filtered.filter((d) => d.specialty === specialty);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((d) => {
        const hay = `${d.name} ${d.specialty} ${d.location ?? ""}`.toLowerCase();
        return hay.includes(q);
      });
      setSuggestions(filtered.slice(0, 6));
    } else {
      setSuggestions([]);
    }
    onFilter(filtered);
  }, [query, doctors, specialty, onFilter]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setSuggestions([]);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const handleSelect = (doc: Doctor) => {
    setQuery(`${doc.name} — ${doc.specialty}`);
    setSpecialty(doc.specialty);
    setSuggestions([]);
    onFilter([doc]);
  };

  return (
    <div className="my-4 flex items-start gap-2 max-w-lg">
      <div ref={containerRef} className="relative flex-1">
        <Input
          placeholder="Rechercher un médecin (nom, spécialité, lieu…)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {suggestions.length > 0 && (
          <ul className="absolute left-0 right-0 z-10 bg-white border border-gray-200 max-h-56 overflow-y-auto">
            {suggestions.map((doc) => (
              <li
                key={doc.id}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSelect(doc)}
              >
                {doc.name} — {doc.specialty}
              </li>
            ))}
          </ul>
        )}
      </div>
      <Select value={specialty} onValueChange={setSpecialty}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder={t('doctor_filter_specialty_all')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">{t('doctor_filter_specialty_all')}</SelectItem>
          {specialties.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
