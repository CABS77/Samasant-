'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X, Home, MessageCircle, CalendarDays, ArrowUpRight } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { LanguageSelector } from './language-selector';
import { Brand } from './brand';

export function Navbar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => setMobileOpen(false), [pathname]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileOpen(false); };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, []);
  const links = [
    { href: '/', label: t('nav_home'), icon: Home },
    { href: '/app', label: t('design_nav_assistant'), icon: MessageCircle },
    { href: '/appointments', label: t('nav_appointments'), icon: CalendarDays },
  ];
  const active = (href: string) => href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
  return <>
    <header className="site-header">
      <div className="site-container flex h-20 items-center justify-between gap-3">
        <Link href="/" aria-label="SamaSanté — Accueil" className="shrink-0"><Brand className="max-[380px]:gap-1.5 [&>span:last-child]:max-[380px]:text-lg" /></Link>
        <nav aria-label={t('nav_label')} className="hidden items-center gap-7 lg:flex">
          {links.map(({ href, label }) => <Link key={href} href={href} aria-current={active(href) ? 'page' : undefined} className={`nav-link ${active(href) ? 'nav-link-active' : ''}`}>{label}</Link>)}
        </nav>
        <div className="flex items-center gap-1.5 sm:gap-2"><LanguageSelector /><ThemeToggle />
          <Link href="/app#chat" className="action-link action-primary ml-2 hidden !min-h-11 !px-4 !text-xs xl:inline-flex">{t('design_nav_start')}<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link>
          <button type="button" onClick={() => setMobileOpen(!mobileOpen)} aria-expanded={mobileOpen} aria-controls="mobile-navigation" aria-label={t(mobileOpen ? 'design_menu_close' : 'design_menu_open')} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-muted lg:hidden">{mobileOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}</button>
        </div>
      </div>
      {mobileOpen && <nav id="mobile-navigation" aria-label={t('nav_label')} className="site-container grid gap-1 border-t py-3 lg:hidden">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setMobileOpen(false)} aria-current={active(href) ? 'page' : undefined} className={`flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm ${active(href) ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground'}`}><Icon aria-hidden="true" className="h-4 w-4" />{label}</Link>)}</nav>}
    </header>
    <nav aria-label={t('nav_mobile_label')} className="mobile-tab-bar safe-area-bottom md:hidden"><div className="flex h-16 items-center justify-around">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={active(href) ? 'page' : undefined} className={`flex min-h-12 min-w-20 flex-col items-center justify-center gap-1 rounded-xl px-3 text-[11px] ${active(href) ? 'font-semibold text-primary' : 'text-muted-foreground'}`}><Icon aria-hidden="true" className="h-5 w-5" strokeWidth={active(href) ? 2.2 : 1.7} />{label}</Link>)}</div></nav>
  </>;
}
