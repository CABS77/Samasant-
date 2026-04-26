
'use client';

import React from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { ThemeProvider } from '@/components/theme-provider';
import { ServiceWorkerProvider } from '@/components/service-worker-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// ThemeProviderProps might not be needed if we are defining props inline for ThemeProvider
// import type { ThemeProviderProps } from "next-themes/dist/types";

interface AppProvidersProps {
  children: React.ReactNode;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      retry: 2,
    },
  },
});

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider
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
    </QueryClientProvider>
  );
}
