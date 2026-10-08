'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ArrowUpRight, MessageCircle, Leaf, CalendarDays, Languages, HeartHandshake, Smartphone, ShieldCheck, Check } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

export function LandingContent() {
  const { t } = useTranslation();
  const services = [
    { icon: MessageCircle, title: 'design_service_chat', text: 'home_chat_desc', href: '/app#chat', action: 'design_chat_action', color: 'sage' },
    { icon: CalendarDays, title: 'design_service_doctors', text: 'home_booking_desc', href: '/appointments', action: 'design_doctors_action', color: 'peach' },
    { icon: Leaf, title: 'home_catalog_title', text: 'home_catalog_desc', href: '/app#remedies', action: 'design_catalog_action', color: 'sand' },
  ];
  return <main id="main-content" tabIndex={-1}>
    <section className="landing-hero">
      <div className="site-container grid items-center gap-10 py-10 lg:grid-cols-[1.08fr_1fr] lg:gap-14 lg:py-16">
        <div className="hero-copy">
          <p className="eyebrow"><span className="h-2 w-2 rounded-full bg-primary" />{t('design_hero_eyebrow')}</p>
          <h1 className="display-heading mt-6">{t('design_hero_title')}<br /><em>{t('design_hero_emphasis')}</em></h1>
          <p className="mt-6 max-w-md text-base leading-[1.85] text-muted-foreground md:text-lg">{t('design_hero_intro')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="action-link action-primary" href="/app#chat">{t('design_chat_action')}<ArrowUpRight aria-hidden="true" className="h-5 w-5" /></Link>
            <Link className="action-link action-outline" href="/appointments">{t('design_doctors_action')}<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
          </div>
          <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck aria-hidden="true" className="h-4 w-4 text-primary" />{t('design_hero_note')}</p>
        </div>
        <div className="hero-visual">
          <div className="hero-art"><Image src="/assets/samasante-care.webp" width={1024} height={1280} sizes="(max-width: 1023px) 90vw, 520px" priority alt={t('design_hero_alt')} className="h-full w-full object-cover" /></div>
          <div className="hero-language"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary"><Languages aria-hidden="true" className="h-4 w-4" /></span><span>Français & Wolof</span></div>
          <div className="hero-caption"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><HeartHandshake aria-hidden="true" className="h-5 w-5" /></span><div><p className="text-sm font-semibold">{t('design_hero_caption')}</p><p className="mt-1 text-xs text-muted-foreground">{t('design_hero_caption_detail')}</p></div><span aria-hidden="true" className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><Check className="h-4 w-4" /></span></div>
        </div>
      </div>
      <div className="site-container"><div className="hero-principles">
        {[
          { icon: Languages, label: 'design_principle_language' },
          { icon: Smartphone, label: 'design_principle_mobile' },
          { icon: HeartHandshake, label: 'design_principle_human' },
        ].map(({ icon: Icon, label }) => <p key={label} className="flex items-center gap-2.5 text-sm"><Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />{t(label)}</p>)}
      </div></div>
    </section>

    <section id="services" className="site-container section-spacing">
      <div className="section-intro"><div><p className="eyebrow">{t('design_services_eyebrow')}</p><h2 className="section-heading mt-3">{t('design_services_title')}</h2></div><p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{t('design_services_intro')}</p></div>
      <div className="mt-9 grid gap-4 md:grid-cols-3">
        {services.map(({ icon: Icon, title, text, href, action, color }, index) => <Link key={title} href={href} className={`service-card service-${color} group`}>
          <div className="flex items-center justify-between"><span className="service-icon"><Icon aria-hidden="true" className="h-6 w-6" strokeWidth={1.7} /></span><span className="text-xs font-medium text-muted-foreground">0{index + 1}</span></div>
          <h3 className="mt-7 text-xl font-semibold tracking-tight">{t(title)}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(text)}</p>
          <span className="mt-auto flex items-center justify-between border-t border-foreground/10 pt-5 text-sm font-semibold">{t(action)}<ArrowUpRight aria-hidden="true" className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
        </Link>)}
      </div>
    </section>

    <section className="language-section">
      <div className="site-container grid items-center gap-10 py-14 md:grid-cols-[1fr_1.1fr] md:gap-16 md:py-20">
        <div className="language-art" aria-hidden="true"><div className="language-word">Salaam.</div><div className="language-word language-word-second">Bonjour.</div><div className="language-word-small"><Languages className="h-5 w-5" />Français · Wolof</div><span className="language-spark">✳</span></div>
        <div><p className="eyebrow">{t('design_language_eyebrow')}</p><h2 className="section-heading mt-4">{t('design_language_title')}</h2><p className="mt-5 max-w-lg text-sm leading-[1.9] text-muted-foreground">{t('design_language_intro')}</p><Link className="mt-7 inline-flex min-h-11 items-center gap-3 text-sm font-semibold text-primary" href="/app#chat">{t('design_language_action')}<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link></div>
      </div>
    </section>

    <section className="site-container section-spacing">
      <div className="section-intro"><div><p className="eyebrow">{t('design_steps_eyebrow')}</p><h2 className="section-heading mt-3">{t('design_steps_title')}</h2></div><Link href="/appointments" className="action-link action-outline">{t('design_steps_action')}<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link></div>
      <ol className="mt-10 grid gap-8 md:grid-cols-3">
        {[1,2,3].map(number => <li key={number} className="journey-step"><span className="step-number">0{number}</span><h3 className="mt-5 text-lg font-semibold">{t(`design_step_${number}_title`)}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(`design_step_${number}_text`)}</p></li>)}
      </ol>
    </section>

    <section className="site-container pb-16 md:pb-24">
      <div className="trust-panel grid gap-8 p-7 md:grid-cols-[auto_1fr] md:p-10"><ShieldCheck aria-hidden="true" className="h-10 w-10 text-primary" /><div><h2 className="text-2xl font-semibold tracking-tight">{t('design_trust_title')}</h2><p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">{t('medical_disclaimer')}</p><p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">{t('design_trust_limits')}</p><Link href="/confidentialite" className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary">{t('design_trust_action')}<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link></div></div>
    </section>

    <section className="site-container grid gap-8 border-t py-16 md:grid-cols-[0.85fr_1.15fr] md:gap-20 md:py-20">
      <div><p className="eyebrow">{t('design_faq_eyebrow')}</p><h2 className="section-heading mt-4">{t('design_faq_title')}</h2><p className="mt-5 text-sm text-muted-foreground">{t('design_faq_contact')}</p><a href="mailto:cheikh@samasante.tech" className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary">{t('home_contact')}<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></a></div>
      <Accordion type="single" collapsible>{[1,2,3,4].map(number => <AccordionItem key={number} value={`faq-${number}`}><AccordionTrigger className="py-5 text-left text-base">{t(`design_faq_${number}_question`)}</AccordionTrigger><AccordionContent className="text-sm leading-relaxed text-muted-foreground">{t(`design_faq_${number}_answer`)}</AccordionContent></AccordionItem>)}</Accordion>
    </section>

    <section className="site-container border-t py-10"><div className="flex flex-wrap items-center justify-between gap-6"><p className="text-sm text-muted-foreground">{t('design_team_intro')}</p><div className="flex flex-wrap gap-6">{[
      { name: 'Cheikh Ahmadou Bamba Sall', role: 'home_founder', image: '/assets/cheikh-sall.jpeg', url: 'https://www.linkedin.com/in/cheikh-sall/' },
      { name: 'Salif Jordan Marigo', role: 'home_cofounder', image: '/assets/salif-marigo.jpeg', url: 'https://www.linkedin.com/in/salif-jordan-marigo-3004b7108/' },
    ].map(person => <a key={person.name} href={person.url} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-3"><Image src={person.image} alt="" width={44} height={44} className="h-11 w-11 rounded-full object-cover" /><div><p className="text-xs font-semibold">{person.name}<ArrowUpRight aria-hidden="true" className="ml-1 inline h-3 w-3" /></p><p className="mt-1 text-xs text-muted-foreground">{t(person.role)}</p></div></a>)}</div></div></section>
  </main>;
}
