'use client';
import { useTranslation } from 'react-i18next';

/** Human help stays visible regardless of AI, quotas, location and authentication. */
export function EmergencyHelp() {
  const { t } = useTranslation();
  return <aside aria-label={t('emergency_help')} className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
    <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
      <p>{t('emergency_help_description')}</p>
      <a href="tel:1515" className="inline-flex min-h-11 items-center rounded-lg bg-red-800 px-4 font-semibold text-white underline underline-offset-2">{t('call_samu')}</a>
    </div>
  </aside>;
}
