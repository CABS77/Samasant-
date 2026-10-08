'use client';

import { useTranslation } from 'react-i18next';
import AppointmentBooking from '@/components/appointment-booking';

export default function AppointmentsPage() {
  const { t } = useTranslation();
  return <main id="main-content" tabIndex={-1}>
    <div className="site-container page-heading"><p className="eyebrow">{t('design_booking_eyebrow')}</p><h1 className="mt-4">{t('design_booking_title')}</h1><p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">{t('appointments_intro')}</p>
      <ol className="booking-steps mt-7 max-w-3xl">{[1,2,3].map(number => <li key={number} className="booking-step"><span aria-hidden="true">0{number}</span>{t(`design_booking_step_${number}`)}</li>)}</ol>
    </div>
    <div className="site-container pb-14"><AppointmentBooking /></div>
  </main>;
}
