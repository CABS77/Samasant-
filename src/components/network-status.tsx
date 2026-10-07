'use client';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function NetworkStatus() {
  const [online, setOnline] = useState(true);
  const { t } = useTranslation();
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
  }, []);
  return online ? null : <p role="status" className="bg-amber-100 px-4 py-3 text-center text-sm text-amber-950">{t('offline_notice')}</p>;
}
