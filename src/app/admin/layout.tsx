import type { Metadata } from 'next';
export const metadata: Metadata = {'title': 'Administration', 'description': 'Espace d’administration protégé.', 'alternates': {'canonical': '/admin'}, 'openGraph': {'url': '/admin'}, 'robots': {'index': false, 'follow': false}};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
