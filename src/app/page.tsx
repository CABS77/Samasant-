import type { Metadata } from 'next';
import { LandingContent } from '@/components/landing-content';
export const metadata: Metadata = { alternates: { canonical: '/' }, openGraph: { url: '/' } };
export default function LandingPage() { return <LandingContent />; }
