"use client";

import { useTranslation } from 'react-i18next';
import AppointmentBooking from '@/components/appointment-booking';
import { CalendarDays, Clock, Video, Stethoscope } from 'lucide-react';

export default function AppointmentsPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-premium text-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {t('appointments_book_link')}
          </h1>
          <p className="text-white/70 mt-2 max-w-lg">
            Consultez nos médecins partenaires en clinique ou en vidéo. Choisissez votre créneau en quelques clics.
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            {[
              { icon: Stethoscope, label: '15+ spécialistes' },
              { icon: CalendarDays, label: 'Disponible 7j/7' },
              { icon: Clock, label: 'Créneaux de 30 min' },
              { icon: Video, label: 'Vidéo ou clinique' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 text-sm border border-white/10">
                <Icon className="h-4 w-4 text-white/80" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl -mt-4">
        <AppointmentBooking />
      </div>
    </div>
  );
}
