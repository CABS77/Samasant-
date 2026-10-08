import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Confidentialité', alternates: { canonical: '/confidentialite' }, openGraph: { url: '/confidentialite' } };
export default function PrivacyPage() {
  return <main id="main-content" tabIndex={-1} className="legal-content mx-auto max-w-3xl space-y-6 px-4">
    <Link href="/" className="inline-flex min-h-11 items-center text-sm text-primary">← Retour à l’accueil</Link>
    <h1 className="text-3xl font-bold">Vos données et leur utilisation</h1>
    <p className="text-sm text-muted-foreground">Notice de cette version — 7 octobre 2026</p>
    <section className="space-y-2"><h2 className="text-xl font-semibold">Conversation et intelligence artificielle</h2>
      <p>Le message que vous choisissez d’envoyer est transmis au fournisseur IA actif, DeepSeek ou Anthropic (Claude), pour générer une réponse. Évitez les noms, adresses, numéros et détails qui ne sont pas nécessaires à votre question.</p>
      <p>Cette version ne crée pas de dossier de conversation dans la base de l’application. Les réponses restent en mémoire sur l’écran ; vous pouvez les effacer. Les fournisseurs ont leurs propres règles de conservation et peuvent traiter les données à l’étranger.</p>
      <p><a className="underline" href="https://cdn.deepseek.com/policies/en-US/deepseek-privacy-policy.html" rel="noopener noreferrer">Politique DeepSeek</a> · <a className="underline" href="https://www.anthropic.com/legal/privacy" rel="noopener noreferrer">Politique Anthropic</a></p>
    </section>
    <section className="space-y-2"><h2 className="text-xl font-semibold">Demandes de rendez-vous</h2>
      <p>L’e-mail permet votre connexion avec Supabase Auth. Les demandes enregistrent le praticien, le créneau, le motif, le téléphone, leur état et une référence. Vous pouvez consulter vos demandes ; l’administration autorisée les traite pour la clinique. Une demande enregistrée attend une confirmation distincte.</p>
      <p>Dans « Mes demandes », vous pouvez exporter vos demandes et les supprimer. Leur suppression libère les créneaux, y compris les rendez-vous confirmés ; votre compte de connexion reste actif. Pour une demande concernant ce compte ou les autres traitements, écrivez au contact ci-dessous.</p>
      <p>Les données sont conservées pour le suivi de la demande jusqu’à votre suppression ou la durée définie par l’opérateur. Le délai et la zone d’hébergement du projet en service doivent être précisés par l’opérateur avant toute collecte auprès de patients.</p>
    </section>
    <section className="space-y-2"><h2 className="text-xl font-semibold">Position, téléphone et alertes</h2>
      <p>La position n’est demandée que lorsque vous choisissez de l’utiliser. La recherche manuelle reste possible. Une recherche de lieu peut être transmise à Mapbox ; aucun établissement n’est supposé partenaire à partir de ce résultat.</p>
      <p>L’envoi d’une demande d’assistance exige votre accord avant de transmettre le message, le téléphone de contact et la zone choisie à des cliniques partenaires configurées, via Twilio. Le suivi technique conserve une référence et un état de livraison. Un SMS livré ne confirme aucune prise en charge.</p>
    </section>
    <section className="space-y-2"><h2 className="text-xl font-semibold">Appareil, voix et traces techniques</h2>
      <p>La connexion utilise des jetons de session et des cookies nécessaires. Le choix de langue, la confirmation d’âge et un compteur local sont mémorisés dans votre navigateur. Déconnectez-vous sur un appareil partagé et effacez la conversation de l’écran.</p>
      <p>La dictée et la lecture vocale sont facultatives. Selon le navigateur, elles peuvent utiliser un service externe. Vous pouvez toujours saisir ou lire du texte.</p>
      <p>Les traces applicatives de cette version ne doivent contenir ni symptômes, ni messages, ni téléphones. Les compteurs anti-abus utilisent un identifiant calculé à partir de la connexion réseau plutôt que son adresse en clair. Les statistiques Vercel Analytics et Speed Insights ont été retirées de cette version.</p>
    </section>
    <section className="space-y-2"><h2 className="text-xl font-semibold">Contact et droits</h2>
      <p>Éditeur indiqué dans les conditions : Cheikh Sall, entrepreneur individuel, SIREN 947 529 046, Chevilly-Larue, France.</p>
      <p>Contact : <a className="underline" href="mailto:cheikh@samasante.tech">cheikh@samasante.tech</a>. Décrivez votre demande d’accès, de rectification, d’effacement ou votre question sur les prestataires, sans envoyer d’informations de santé inutiles par e-mail.</p>
      <p>Les formalités, responsabilités des partenaires et conditions de traitement des données de santé nécessitent une vérification juridique et opérationnelle avant un pilote réel.</p>
    </section>
    <Link href="/cgu" className="inline-block underline">Conditions d’utilisation</Link>
  </main>;
}
