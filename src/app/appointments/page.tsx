"use client";

import { useTranslation } from 'react-i18next';
import AppointmentBooking from '@/components/appointment-booking';

export default function AppointmentsPage() {
  const { t } = useTranslation();
  return (
    <div className="p-4 space-y-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold font-poppins-bold">
        {t('appointments_book_link')}
      </h1>
      <AppointmentBooking />
    </div>
  );
}
