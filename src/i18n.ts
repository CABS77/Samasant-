
'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations directly
import frTranslation from './locales/fr/translation.json';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(LanguageDetector) // detect user language
  .init({
    debug: process.env.NODE_ENV === 'development',
    fallbackLng: 'fr', // Default to French
    lng: 'fr', // Explicitly set language to French, as we are French-only for now
    resources: {
      fr: {
        translation: frTranslation,
      },
    },
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    detection: {
      // Configuration for language detection, though we are forcing 'fr'
      order: ['cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['cookie', 'localStorage'],
    },
    react: {
      useSuspense: false, // Important for Next.js App Router to avoid issues
    },
  });

export default i18n;
