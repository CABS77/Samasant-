import type { Metadata } from 'next';
export const metadata: Metadata = {'title': 'Application', 'description': 'Conversation, catalogue et recherche de centres au Sénégal.', 'alternates': {'canonical': '/app'}, 'openGraph': {'url': '/app'}};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
