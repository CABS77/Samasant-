
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
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-primary/5 via-background to-background text-foreground font-open-sans">

        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto space-y-6 max-w-6xl w-full mx-auto">
          <AIChatSection />

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-xl rounded-2xl bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="font-poppins-bold text-xl sm:text-2xl text-primary">
                  {t("traditionalRemedies_safara")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RemedyDisplay />
              </CardContent>
            </Card>

            <Card className="shadow-xl rounded-2xl bg-card/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="font-poppins-bold text-xl sm:text-2xl text-primary">
                  {t("emergencyAlertSystem_xabar")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EmergencyAlert />
              </CardContent>
            </Card>
          </div>
        </main>

        <footer className="p-4 border-t border-border mt-auto bg-card/70 backdrop-blur text-center text-xs text-muted-foreground space-y-1">
          <div>{t('medical_disclaimer')}</div>
          <div>{t("footer_text", { currentYear: currentYear, appName: t("appName_sama") })}</div>
        </footer>
      </div>
  );
}

