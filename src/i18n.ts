
'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';


// Import translations directly
import frTranslation from './locales/fr/translation.json';
import woTranslation from './locales/wo/translation.json';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next

  .init({
    debug: false,
    fallbackLng: 'fr', // Default to French
    lng: 'fr', // Stable SSR language; preference is applied after hydration.
    resources: {
      wo: { translation: woTranslation },
      fr: {
        translation: frTranslation,
      },
    },
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    react: {
      useSuspense: false, // Important for Next.js App Router to avoid issues
    },
  });

export default i18n;
