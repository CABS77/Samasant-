'use client';
import { useTranslation } from 'react-i18next';
import { Phone } from 'lucide-react';

/** Human help stays visible regardless of AI, quotas, location and authentication. */
export function EmergencyHelp() {
  const { t } = useTranslation();
  return <aside aria-label={t('emergency_help')} className="emergency-strip">
    <div className="site-container flex flex-wrap items-center justify-between gap-x-5 gap-y-1 py-1.5">
      <p className="max-w-3xl text-xs leading-relaxed">{t('emergency_help_description')}</p>
      <a href="tel:1515" className="inline-flex min-h-11 shrink-0 items-center gap-2 text-xs font-bold underline decoration-current/40 underline-offset-4"><Phone aria-hidden="true" className="h-3.5 w-3.5" />{t('call_samu')}</a>
    </div>
  </aside>;
}
