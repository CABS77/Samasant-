"use client";
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const { t } = useTranslation();
  return (
    <main className="min-h-screen flex flex-col items-center py-10 px-4 bg-background text-foreground space-y-8">
      <Card className="max-w-xl w-full text-center space-y-4 bg-card shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-poppins-bold text-primary">
            {t('welcome_title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm sm:text-base">
            {t('welcome_description')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <Link href="/app">
              <Button>{t('openApp_button')}</Button>
            </Link>
            <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer">
              <Button variant="outline">{t('downloadAndroid_button')}</Button>
            </a>
            <a href="https://www.apple.com/app-store/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline">{t('downloadIos_button')}</Button>
            </a>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-3xl w-full bg-card shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-poppins-bold text-primary">
            {t('features_title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm sm:text-base">
            <li>{t('features_chat')}</li>
            <li>{t('features_remedies')}</li>
            <li>{t('features_geolocation')}</li>
            <li>{t('features_emergency')}</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="max-w-3xl w-full bg-card shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-poppins-bold text-primary">
            {t('usecases_title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm sm:text-base">
          <p>{t('usecase_fatou')}</p>
          <p>{t('usecase_modou')}</p>
        </CardContent>
      </Card>
    </main>
  );
}
