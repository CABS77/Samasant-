"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { AppointmentForm } from '@/components/appointment-form';
import DoctorCard from '@/components/doctor-card';
import { DoctorSearch } from '@/components/doctor-search';
import type { Doctor } from '@/types/doctor';
import { fetchDoctorsServer } from '@/app/actions/doctors';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';

export default function AppointmentBooking() {
  const { t } = useTranslation();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filtered, setFiltered] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState('');

  const handleFilter = useCallback((docs: Doctor[]) => {
    setFiltered(docs);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchDoctorsServer()
      .then((docs) => {
        setDoctors(docs);
        setFiltered(docs);
      })
      .catch((err) => console.error('Error fetching doctors', err))
      .finally(() => setLoading(false));
  }, []);

  const selectedDoctorData = doctors.find((d) => d.id === selectedDoctor);

  return (
    <div className="space-y-8">
      {/* Search */}
      <DoctorSearch doctors={doctors} onFilter={handleFilter} />

      {/* Doctors grid */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">
            {t('doctor_availability_title')}
          </h2>
          <span className="text-sm text-muted-foreground">
            ({filtered.length} médecin{filtered.length > 1 ? 's' : ''})
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-2xl border border-border/50">
            <p className="text-muted-foreground">Aucun médecin trouvé. Essayez d&apos;autres critères.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((d) => (
              <DoctorCard
                key={d.id}
                doctor={d}
                onSelect={(id) => setSelectedDoctor(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Appointment form */}
      <div className="bg-card rounded-2xl border border-border/50 p-6 md:p-8">
        <h2 className="text-xl font-semibold mb-6">
          {selectedDoctorData
            ? `Réserver avec ${selectedDoctorData.name}`
            : 'Réserver un rendez-vous'}
        </h2>
        <AppointmentForm
          doctors={doctors}
          selectedDoctor={selectedDoctor}
          onSelectDoctor={setSelectedDoctor}
        />
      </div>
    </div>
  );
}
