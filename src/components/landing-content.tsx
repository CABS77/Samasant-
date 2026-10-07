'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Leaf, CalendarDays, Phone } from 'lucide-react';

export function LandingContent() {
  const { t } = useTranslation();
  const features = [
    { icon: MessageCircle, title: 'home_chat_title', text: 'home_chat_desc', href: '/app#chat' },
    { icon: Leaf, title: 'home_catalog_title', text: 'home_catalog_desc', href: '/app#remedies' },
    { icon: CalendarDays, title: 'home_booking_title', text: 'home_booking_desc', href: '/appointments' },
    { icon: Phone, title: 'home_alert_title', text: 'home_alert_desc', href: 'tel:1515' },
  ];
  return <main id="main-content" tabIndex={-1} className="min-h-screen bg-background">
    <section className="bg-emerald-950 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
        <div className="space-y-6">
          <p className="text-sm font-semibold text-emerald-100">{t('home_badge')}</p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">{t('home_title')}</h1>
          <p className="max-w-lg leading-relaxed text-emerald-50">{t('home_intro')}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/app" className="inline-flex min-h-11 items-center rounded-xl bg-white px-5 py-3 font-semibold text-emerald-950">{t('home_open')}</Link>
            <a href="mailto:cheikh@samasante.tech" className="inline-flex min-h-11 items-center rounded-xl border border-emerald-100 px-5 py-3 text-white">{t('home_contact')}</a>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <Image src="/assets/hero.png" width={640} height={480} sizes="(max-width: 768px) 100vw, 50vw" priority alt="SamaSanté" className="h-auto max-w-full rounded-2xl" />
        </div>
      </div>
    </section>
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="mb-6 text-2xl font-bold">{t('home_features')}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {features.map(({ icon: Icon, title, text, href }) => <Link key={title} href={href} className="rounded-2xl border bg-card p-6 hover:border-primary">
          <Icon aria-hidden className="mb-3 h-6 w-6 text-primary" />
          <h3 className="text-lg font-semibold">{t(title)}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(text)}</p>
        </Link>)}
      </div>
    </section>
    <section className="border-y bg-muted/50"><div className="mx-auto max-w-6xl px-4 py-10">
      <h2 className="text-2xl font-bold">{t('home_limits_title')}</h2>
      <p className="mt-3 max-w-3xl leading-relaxed">{t('home_limits_text')}</p>
      <Link href="/confidentialite" className="mt-4 inline-block underline underline-offset-4">{t('privacy')}</Link>
    </div></section>
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h2 className="mb-6 text-2xl font-bold">{t('home_founders')}</h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {[
          { name: 'Cheikh Ahmadou Bamba Sall', role: 'home_founder', image: '/assets/cheikh-sall.jpeg', url: 'https://www.linkedin.com/in/cheikh-sall/' },
          { name: 'Salif Jordan Marigo', role: 'home_cofounder', image: '/assets/salif-marigo.jpeg', url: 'https://www.linkedin.com/in/salif-jordan-marigo-3004b7108/' },
        ].map(person => <article key={person.name} className="rounded-2xl border p-6">
          <Image src={person.image} alt={person.name} width={112} height={112} className="mb-4 h-28 w-28 rounded-full object-cover" />
          <h3 className="font-semibold">{person.name}</h3><p className="text-sm text-muted-foreground">{t(person.role)}</p>
          <a href={person.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block underline">LinkedIn — {person.name}</a>
        </article>)}
      </div>
    </section>
    <footer className="border-t px-4 py-8 text-sm"><div className="mx-auto flex max-w-6xl flex-wrap gap-6">
      <Link href="/cgu" className="underline">{t('terms')}</Link><Link href="/confidentialite" className="underline">{t('privacy')}</Link>
      <a href="mailto:cheikh@samasante.tech" className="underline">{t('contact')}</a>
      <p>© {new Date().getFullYear()} SamaSanté AI</p>
    </div></footer>
  </main>;
}
