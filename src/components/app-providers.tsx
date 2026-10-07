
'use client';

import React from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { ThemeProvider } from '@/components/theme-provider';
import { ServiceWorkerProvider } from '@/components/service-worker-provider';

// ThemeProviderProps might not be needed if we are defining props inline for ThemeProvider
// import type { ThemeProviderProps } from "next-themes/dist/types";

interface AppProvidersProps {
  children: React.ReactNode;
  nonce?: string;
}

export function AppProviders({ children, nonce }: AppProvidersProps) {
  return (

      <I18nextProvider i18n={i18n}>
        <ThemeProvider
          nonce={nonce}
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ServiceWorkerProvider>
            {children}
          </ServiceWorkerProvider>
        </ThemeProvider>
      </I18nextProvider>

  );
}
