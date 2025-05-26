
"use client";
import type { InitialHealthAssessmentOutput, RemedyDetailSchema } from "@/ai/flows/initial-health-assessment";
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {initialHealthAssessment} from "@/ai/flows/initial-health-assessment";
import { toast } from "@/hooks/use-toast";
import frTranslationsData from '@/locales/fr/translation.json'; // Import direct pour frTranslations
import { Mic, MicOff, Volume2, VolumeX, Share2, Loader2, Info } from 'lucide-react';
import {ThemeToggle} from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from 'react-i18next';

// Lazy load components
const RemedyDisplay = dynamic(() => import('@/components/remedy-display').then(mod => mod.RemedyDisplay), {
  loading: () => <Skeleton className="h-64 w-full rounded-lg" />,
  ssr: false
});

const EmergencyAlert = dynamic(() => import('@/components/emergency-alert').then(mod => mod.EmergencyAlert), {
  loading: () => <Skeleton className="h-48 w-full rounded-lg" />,
  ssr: false
});

const AIChatSection = dynamic(() => import('@/components/ai-chat-section').then(mod => mod.AIChatSection), {
  loading: () => <Skeleton className="h-[400px] w-full rounded-lg" />,
  ssr: false
});

// Utiliser frTranslationsData comme fallback si i18n n'est pas prêt ou pour des textes statiques
const frTranslations = frTranslationsData;


export default function Home() {
  const { t, i18n } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
      <div className="flex flex-col min-h-screen bg-background text-foreground font-open-sans">
        <header className="p-3 sm:p-4 border-b border-border flex items-center justify-between shadow-sm bg-card sticky top-0 z-10">
            <div className="flex items-center space-x-2 sm:space-x-3">
                 <svg role="img" aria-label={t("appName_sama")} className="w-8 h-8 sm:w-10 sm:h-10 text-primary flex-shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M50 0C22.3858 0 0 22.3858 0 50C0 77.6142 22.3858 100 50 100C77.6142 100 100 77.6142 100 50C100 22.3858 77.6142 0 50 0ZM50 8.33333C26.9289 8.33333 8.33333 26.9289 8.33333 50C8.33333 73.0711 26.9289 91.6667 50 91.6667C73.0711 91.6667 91.6667 73.0711 91.6667 50C91.6667 26.9289 73.0711 8.33333 50 8.33333ZM50 20.8333C36.1851 20.8333 25 30.7116 25 42.5C25 49.0917 28.6083 54.8917 34.1667 58.3333V75H41.6667V62.5H58.3333V75H65.8333V58.3333C71.3917 54.8917 75 49.0917 75 42.5C75 30.7116 63.8149 20.8333 50 20.8333ZM50 29.1667C59.2047 29.1667 66.6667 35.2378 66.6667 42.5C66.6667 45.8083 65.1917 48.7833 62.9167 51.0083L51.0083 62.9167C48.7833 65.1917 45.8083 66.6667 42.5 66.6667C35.2378 66.6667 29.1667 59.2047 29.1667 50C29.1667 42.5 35.2378 33.3333 41.6667 33.3333H50V29.1667Z" fill="currentColor"/>
                </svg>
                <h1 className="font-poppins-bold text-lg sm:text-xl text-primary whitespace-nowrap overflow-hidden">{t("appName_sama")}</h1>
            </div>
            <ThemeToggle />
        </header>

        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto bg-background space-y-6">
          <AIChatSection />

          <Card className="shadow-xl rounded-xl bg-card">
            <CardHeader>
              <CardTitle className="font-poppins-bold text-xl sm:text-2xl text-primary">{t("traditionalRemedies_safara")}</CardTitle>
            </CardHeader>
            <CardContent>
              <RemedyDisplay />
            </CardContent>
          </Card>

          <Card className="shadow-xl rounded-xl bg-card">
            <CardHeader>
              <CardTitle className="font-poppins-bold text-xl sm:text-2xl text-primary">{t("emergencyAlertSystem_xabar")}</CardTitle>
            </CardHeader>
            <CardContent>
              <EmergencyAlert />
            </CardContent>
          </Card>
        </main>

        <footer className="p-2 sm:p-4 border-t border-border mt-auto flex-shrink-0 bg-card text-center text-xs text-muted-foreground">
          {t("footer_text", { currentYear: currentYear, appName: t("appName_sama") })}
        </footer>
      </div>
  );
}

