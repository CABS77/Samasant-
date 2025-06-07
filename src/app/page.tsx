"use client";
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Facebook,
  Twitter,
  Mail,
  MessageCircle,
  Leaf,
  MapPin,
  AlarmCheck,
} from 'lucide-react';

export default function LandingPage() {
  const { t } = useTranslation();
  return (
    <main className="min-h-screen flex flex-col items-center bg-background text-foreground">
      <header className="w-full flex justify-center py-10 px-4">
        <Card className="max-w-xl w-full text-center space-y-4 bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 text-white shadow-xl animate-fade-in">
          <CardHeader>
            <CardTitle className="text-2xl font-poppins-bold flex items-center justify-center gap-2">
              <span role="img" aria-label="stethoscope">🩺</span>
              {t('welcome_title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <img src="/assets/hero.png" alt={t('placeholder_image_alt')} className="mx-auto w-full h-auto" />
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
      </header>

      <section className="w-full flex justify-center px-4 py-6" aria-labelledby="features-title">
        <Card className="max-w-3xl w-full bg-card shadow-xl animate-fade-in">
          <CardHeader>
            <CardTitle id="features-title" className="text-xl font-poppins-bold text-primary">
              {t('features_title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm sm:text-base">
              <li className="flex items-start gap-2">
                <MessageCircle className="w-5 h-5 text-green-600" />
                <span>
                  {t('features_chat')} <span role="img" aria-label="chat">💬</span>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Leaf className="w-5 h-5 text-green-600" />
                <span>
                  {t('features_remedies')} <span role="img" aria-label="leaf">🌿</span>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                <span>
                  {t('features_geolocation')} <span role="img" aria-label="location">📍</span>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <AlarmCheck className="w-5 h-5 text-green-600" />
                <span>
                  {t('features_emergency')} <span role="img" aria-label="emergency">🚨</span>
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="w-full flex justify-center px-4 py-6" aria-labelledby="usecases-title">
        <Card className="max-w-3xl w-full bg-card shadow-xl animate-fade-in">
          <CardHeader>
            <CardTitle id="usecases-title" className="text-xl font-poppins-bold text-primary">
              {t('usecases_title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm sm:text-base">
            <p>
              <span role="img" aria-label="mother and child" className="mr-1">👩‍👦</span>
              {t('usecase_fatou')}
            </p>
            <p>
              <span role="img" aria-label="health worker" className="mr-1">🧑‍⚕️</span>
              {t('usecase_modou')}
            </p>
          </CardContent>
        </Card>
      </section>

      <footer className="w-full bg-card text-sm text-muted-foreground border-t border-border mt-6">
        <div className="max-w-3xl mx-auto p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <nav className="flex space-x-4" aria-label="Legal">
            <Link href="/cgu" className="hover:underline focus:outline-none focus:ring-2 focus:ring-ring">
              {t('footer_terms')}
            </Link>
            <Link href="/privacy" className="hover:underline focus:outline-none focus:ring-2 focus:ring-ring">
              {t('footer_privacy')}
            </Link>
            <Link href="/contact" className="hover:underline focus:outline-none focus:ring-2 focus:ring-ring">
              {t('footer_contact')}
            </Link>
          </nav>
          <div className="flex space-x-4 text-primary" aria-label={t('footer_follow')}>
            <a href="#" aria-label="Facebook" className="hover:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="mailto:support@samasante.sn" aria-label="Email" className="hover:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
