
import type {Metadata, Viewport} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import {Poppins, Open_Sans} from 'next/font/google';
import { AppProviders } from '@/components/app-providers';
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const poppins = Poppins({
  weight: '700',
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
});

const APP_NAME = "SamaSanté AI";
const APP_DESCRIPTION = "Votre assistant santé IA au Sénégal. Obtenez des évaluations de santé, découvrez des remèdes traditionnels et des conseils en Franco-Wolof. SamaSanté AI, pour une santé accessible à tous.";
const APP_URL = "https://samasante.ai"; // Remplacez par votre URL de production

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} - Assistant Santé IA au Sénégal`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: ["santé Sénégal", "médecine traditionnelle", "IA santé", "diagnostic IA", "Franco-Wolof", "remèdes naturels", "SamaSanté", "assistant médical IA", "conseils santé Sénégal", "safara"],
  applicationName: APP_NAME,
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: 'default',
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
  openGraph: {
    type: 'website',
    url: APP_URL,
    title: {
        default: `${APP_NAME} - Assistant Santé IA Franco-Wolof`,
        template: `%s | ${APP_NAME}`,
    },
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
    images: [
      {
        url: `/og-image.png`, // URL relative si l'image est dans /public
        width: 1200,
        height: 630,
        alt: `Logo de ${APP_NAME}`,
      },
    ],
    locale: 'fr_SN', // Spécifier la locale Franco-Wolof/Sénégal
  },
  twitter: {
    card: 'summary_large_image',
    title: {
        default: `${APP_NAME} - Votre Guide Santé IA au Sénégal`,
        template: `%s | ${APP_NAME}`,
    },
    description: APP_DESCRIPTION,
    images: [`/twitter-image.png`], // URL relative
    // creator: "@votrenomtwitter", // Si vous avez un compte Twitter
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/', // URL canonique de la page d'accueil
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3CB371' },
    { media: '(prefers-color-scheme: dark)', color: '#1A202C' },
  ],
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": APP_NAME,
    "url": APP_URL,
    "description": APP_DESCRIPTION,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${APP_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${openSans.variable} antialiased`}>
        <AppProviders>
          {children}
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
