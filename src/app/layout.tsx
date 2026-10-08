import { SkipLink } from '@/components/skip-link';
import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import './globals.css';
import { AppProviders } from '@/components/app-providers';
import { Navbar } from '@/components/navbar';
import { Toaster } from '@/components/ui/toaster';
import { EmergencyHelp } from '@/components/emergency-help';
import { NetworkStatus } from '@/components/network-status';
import { SiteFooter } from '@/components/site-footer';

const APP_URL = 'https://www.samasante.tech';
const description = 'SamaSanté : information en français et wolof, annuaire et demandes de rendez-vous en clinique au Sénégal.';
export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: { default: 'SamaSanté — Information et accès aux soins', template: '%s | SamaSanté' },
  description, applicationName: 'SamaSanté', manifest: '/manifest.json',
  appleWebApp: { capable: true, title: 'SamaSanté', statusBarStyle: 'default' },
  formatDetection: { telephone: false },
  openGraph: { type: 'website', siteName: 'SamaSanté', locale: 'fr_SN', description,
    images: [{ url: '/og', width: 1200, height: 630, alt: 'SamaSanté — Information et accès aux soins' }] },
  twitter: { card: 'summary_large_image', images: ['/og'], description },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#204e40' };
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get('x-nonce') || undefined;
  return <html lang="fr" suppressHydrationWarning><head>
    <script nonce={nonce} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      '@context': 'https://schema.org', '@type': 'WebSite', name: 'SamaSanté', url: APP_URL, description,
    }) }} />
  </head><body className="antialiased">

    <AppProviders nonce={nonce}>
      <SkipLink /><Navbar /><EmergencyHelp /><NetworkStatus />{children}<SiteFooter /><Toaster />
    </AppProviders>
  </body></html>;
}
