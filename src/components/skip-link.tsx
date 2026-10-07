'use client';
import { useTranslation } from 'react-i18next';
export function SkipLink() {
  const { t } = useTranslation();
  return <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded focus:bg-white focus:px-4 focus:py-3 focus:text-black">{t('skip_content')}</a>;
}
