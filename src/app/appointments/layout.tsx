import type { Metadata } from 'next';
export const metadata: Metadata = {'title': 'Demandes de rendez-vous', 'description': 'Demandez un rendez-vous en clinique et suivez sa confirmation.', 'alternates': {'canonical': '/appointments'}, 'openGraph': {'url': '/appointments'}};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
