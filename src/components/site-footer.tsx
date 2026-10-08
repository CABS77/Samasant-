'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Brand } from './brand';

export function SiteFooter() {
  const { t } = useTranslation();
  return <footer className="site-footer">
    <div className="site-container grid gap-8 py-10 md:grid-cols-[1.5fr_1fr_1fr] md:py-14">
      <div><Link href="/" aria-label="SamaSanté — Accueil"><Brand /></Link><p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">{t('design_footer_description')}</p></div>
      <nav aria-label={t('design_footer_explore')} className="space-y-3 text-sm">
        <p className="mb-4 font-semibold">{t('design_footer_explore')}</p>
        <Link className="footer-link" href="/app#chat">{t('design_service_chat')}</Link>
        <Link className="footer-link" href="/appointments">{t('design_service_doctors')}</Link>
        <Link className="footer-link" href="/app#remedies">{t('home_catalog_title')}</Link>
      </nav>
      <nav aria-label={t('design_footer_information')} className="space-y-3 text-sm">
        <p className="mb-4 font-semibold">{t('design_footer_information')}</p>
        <Link className="footer-link" href="/confidentialite">{t('privacy')}</Link>
        <Link className="footer-link" href="/cgu">{t('terms')}</Link>
        <a className="footer-link flex items-center gap-1" href="mailto:cheikh@samasante.tech">{t('contact')}<ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" /></a>
      </nav>
    </div>
    <div className="site-container flex flex-wrap items-center justify-between gap-3 border-t py-5 text-xs text-muted-foreground">
      <p>© {new Date().getFullYear()} SamaSanté AI</p><p>{t('design_footer_note')}</p>
    </div>
  </footer>;
}
