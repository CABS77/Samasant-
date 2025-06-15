"use client";

import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import type { Doctor } from "@/types/doctor";

interface Props {
  doctors: Doctor[];
  onFilter: (docs: Doctor[]) => void;
}

export function DoctorSearch({ doctors, onFilter }: Props) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Doctor[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setSuggestions([]);
      onFilter(doctors);
      return;
    }
    const matches = doctors.filter((d) => {
      const hay = `${d.name} ${d.specialty} ${d.location ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
    setSuggestions(matches.slice(0, 6));
    onFilter(matches);
  }, [query, doctors, onFilter]);

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
    setSuggestions([]);
    onFilter([doc]);
  };

  return (
    <div ref={containerRef} className="relative my-4 max-w-lg">
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
  );
}
