"use client";
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { BrightnessSlider } from '@/components/brightness-slider';
import { useTranslation } from 'react-i18next';

export function Navbar() {
  const { t } = useTranslation();
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="font-poppins-bold text-primary text-lg">
          {t('appName_sama')}
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/" className="hover:text-primary">
            {t('nav_home')}
          </Link>
          <Link href="/app" className="hover:text-primary">
            {t('nav_app')}
          </Link>
          <Link href="/appointments" className="hover:text-primary">
            {t('nav_appointments')}
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden sm:block">
            <BrightnessSlider />
          </div>
        </div>
      </div>
    </header>
  );
}
