"use client";

import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from 'react-i18next';
import { MessageCircle, Leaf, AlertTriangle } from 'lucide-react';

const RemedyDisplay = dynamic(() => import('@/components/remedy-display').then(mod => mod.RemedyDisplay), {
  loading: () => <Skeleton className="h-64 w-full rounded-xl" />,
  ssr: false
});

const EmergencyAlert = dynamic(() => import('@/components/emergency-alert').then(mod => mod.EmergencyAlert), {
  loading: () => <Skeleton className="h-48 w-full rounded-xl" />,
  ssr: false
});

const AIChatSection = dynamic(() => import('@/components/ai-chat-section').then(mod => mod.AIChatSection), {
  loading: () => <Skeleton className="h-[300px] w-full rounded-xl" />,
  ssr: false
});

export default function Home() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-premium text-white">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {t('appName_sama')}
          </h1>
          <p className="text-white/70 mt-2 max-w-lg">
            Votre assistant santé IA. Décrivez vos symptômes, découvrez des remèdes traditionnels et accédez aux soins.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl -mt-4 space-y-6">
        {/* Chat IA */}
        <Card className="border border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
              {t("aiChat_waxtaan_title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AIChatSection />
          </CardContent>
        </Card>

        {/* Remèdes + Urgence côte à côte */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Remèdes — prend plus de place */}
          <Card className="lg:col-span-3 border border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Leaf className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                {t("traditionalRemedies_safara")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RemedyDisplay />
            </CardContent>
          </Card>

          {/* Urgence */}
          <Card className="lg:col-span-2 border border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                {t("emergencyAlertSystem_xabar")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EmergencyAlert />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-border/50">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground space-y-1">
          <p>{t('medical_disclaimer')}</p>
          <p>{t("footer_text", { currentYear, appName: t("appName_sama") })}</p>
        </div>
      </footer>
    </div>
  );
}
