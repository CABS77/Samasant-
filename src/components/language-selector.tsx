'use client';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function LanguageSelector() {
  const { i18n, t } = useTranslation();
  useEffect(() => {
    const saved = localStorage.getItem('samasante.language');
    if (saved === 'fr' || saved === 'wo') void i18n.changeLanguage(saved);
  }, [i18n]);
  useEffect(() => { document.documentElement.lang = i18n.language === 'wo' ? 'wo' : 'fr'; }, [i18n.language]);
  return <label className="text-sm">
    <span className="sr-only">{t('choose_language')}</span>
    <select aria-label={t('choose_language')} value={i18n.language === 'wo' ? 'wo' : 'fr'}
      className="min-h-11 max-w-28 rounded-lg border bg-background px-2 text-foreground"
      onChange={event => { localStorage.setItem('samasante.language', event.target.value); void i18n.changeLanguage(event.target.value); }}>
      <option value="fr">Français</option><option value="wo">Wolof</option>
    </select>
  </label>;
}
