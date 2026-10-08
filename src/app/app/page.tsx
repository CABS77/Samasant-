'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Leaf, MapPin, HeartHandshake, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClinicLocator } from '@/components/clinic-locator';

const RemedyDisplay = dynamic(() => import('@/components/remedy-display').then(mod => mod.RemedyDisplay), { loading: () => <Skeleton className="h-64 w-full rounded-xl" />, ssr: false });
const EmergencyAlert = dynamic(() => import('@/components/emergency-alert').then(mod => mod.EmergencyAlert), { loading: () => <Skeleton className="h-48 w-full rounded-xl" />, ssr: false });
const AIChatSection = dynamic(() => import('@/components/ai-chat-section').then(mod => mod.AIChatSection), { loading: () => <Skeleton className="h-[300px] w-full rounded-xl" />, ssr: false });
const sections = [
  { id: 'chat', icon: MessageCircle, label: 'design_tab_chat', title: 'design_chat_title', description: 'design_chat_intro' },
  { id: 'remedies', icon: Leaf, label: 'design_tab_catalog', title: 'home_catalog_title', description: 'home_catalog_desc' },
  { id: 'clinics', icon: MapPin, label: 'design_tab_clinics', title: 'clinic_search_title', description: 'clinic_search_notice' },
  { id: 'assistance', icon: HeartHandshake, label: 'design_tab_assistance', title: 'design_assistance_title', description: 'design_assistance_intro' },
];

export default function AppPage() {
  const { t } = useTranslation();
  const [section, setSection] = useState('chat');
  const [visited, setVisited] = useState(['chat']);
  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash.slice(1);
      const id = sections.some(item => item.id === hash) ? hash : 'chat';
      setSection(id); setVisited(previous => previous.includes(id) ? previous : [...previous, id]);
    };
    sync(); window.addEventListener('hashchange', sync); window.addEventListener('popstate', sync);
    return () => { window.removeEventListener('hashchange', sync); window.removeEventListener('popstate', sync); };
  }, []);
  const select = (id: string) => {
    setSection(id); setVisited(previous => previous.includes(id) ? previous : [...previous, id]);
    window.history.pushState(null, '', `#${id}`);
  };
  return <main id="main-content" tabIndex={-1}>
    <div className="site-container page-heading"><p className="eyebrow">{t('design_app_eyebrow')}</p><h1 className="mt-4">{t('design_app_title')}</h1><p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">{t('app_description')}</p></div>
    <div className="site-container pb-14">
      <Tabs value={section} onValueChange={select} className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-8" activationMode="manual">
        <aside className="workspace-sidebar">
          <TabsList aria-label={t('design_workspace_label')} className="grid h-auto w-full grid-cols-4 gap-1 rounded-2xl border bg-card p-2 lg:grid-cols-1 lg:gap-1.5 lg:border-0 lg:bg-transparent lg:p-0">
            {sections.map(({ id, icon: Icon, label }) => <TabsTrigger key={id} value={id} className="workspace-tab"><Icon aria-hidden="true" className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />{t(label)}</TabsTrigger>)}
          </TabsList>
          <div className="mt-7 hidden rounded-2xl border p-5 lg:block"><ShieldCheck aria-hidden="true" className="h-5 w-5 text-primary" /><p className="mt-3 text-sm font-semibold">{t('design_sidebar_title')}</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t('design_sidebar_text')}</p><Link href="/confidentialite" className="mt-4 inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-primary">{t('privacy')}<ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" /></Link></div>
        </aside>
        <div className="min-w-0">
          {sections.map(({ id, icon: Icon, title, description }) => <TabsContent key={id} value={id} forceMount className="workspace-panel mt-0 data-[state=inactive]:hidden">
            <div className="panel-heading"><span className="panel-icon"><Icon aria-hidden="true" className="h-5 w-5" /></span><div><h2 className="text-lg font-semibold tracking-tight">{t(title)}</h2><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t(description)}</p></div></div>
            {visited.includes(id) && <>{id === 'chat' && <AIChatSection />}{id === 'remedies' && <RemedyDisplay />}{id === 'clinics' && <ClinicLocator showHeading={false} />}{id === 'assistance' && <EmergencyAlert />}</>}
          </TabsContent>)}
          <Link href="/appointments" className="mt-5 flex min-h-16 items-center justify-between gap-4 rounded-2xl border bg-secondary/50 p-5 text-sm"><span><span className="block font-semibold">{t('design_app_booking_title')}</span><span className="mt-1 block text-xs text-muted-foreground">{t('design_app_booking_text')}</span></span><ArrowUpRight aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" /></Link>
        </div>
      </Tabs>
    </div>
  </main>;
}
