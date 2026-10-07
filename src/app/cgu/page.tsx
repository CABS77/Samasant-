import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  alternates: { canonical: '/cgu' },
  openGraph: { url: '/cgu' },
  title: "Conditions générales d'utilisation – SamaSanté AI",
  description: "Conditions d'utilisation de SamaSanté AI, assistant santé IA réservé aux adultes.",
};

const sections: { title: string; body: string[] }[] = [
  {
    title: '1. Objet du service',
    body: [
      "SamaSanté AI est un assistant en ligne qui aide à décrire des symptômes en français ou en wolof, propose une première orientation non diagnostique, des conseils traditionnels et oriente vers des médecins ou centres de santé partenaires.",
    ],
  },
  {
    title: '2. Service réservé aux adultes',
    body: [
      "L'utilisation de SamaSanté AI est réservée aux personnes âgées de 18 ans ou plus. Une confirmation d'âge est demandée avant le premier pré-diagnostic.",
      "Un parent ou un adulte responsable peut utiliser le service pour décrire les symptômes d'un enfant : c'est alors l'adulte qui est l'utilisateur du service. Les personnes de moins de 18 ans ne doivent pas utiliser SamaSanté AI directement.",
    ],
  },
  {
    title: "3. Ce n'est pas un avis médical",
    body: [
      "Les réponses de SamaSanté AI ne constituent ni un diagnostic, ni une prescription, ni un avis médical. Elles ne remplacent pas une consultation avec un professionnel de santé.",
      "En cas d'urgence ou de signes graves (difficulté à respirer, douleur thoracique, perte de connaissance, fièvre élevée persistante, saignement important…), rendez-vous immédiatement dans le centre de santé le plus proche ou appelez le SAMU (1515 au Sénégal).",
    ],
  },
  {
    title: '4. Utilisation de l’intelligence artificielle',
    body: [
      "Les réponses sont générées par un système d'intelligence artificielle. Elles peuvent être incomplètes ou inexactes. Vos messages sont transmis au prestataire d’IA pour produire la réponse ; ses propres traitements sont décrits dans sa politique. Consultez notre notice de confidentialité.",
      "Évitez d'indiquer dans vos messages des informations permettant de vous identifier (nom, adresse, numéro de téléphone).",
    ],
  },
  {
    title: "5. Limites d'utilisation",
    body: [
      "Pour un usage équitable, le nombre de pré-diagnostics est limité à 7 par jour, avec un plafond partagé par connexion réseau pour limiter les abus.",
    ],
  },
  {
    title: '6. Éditeur et contact',
    body: [
      'SamaSanté AI est édité par Cheikh Sall, entrepreneur individuel (SIREN 947 529 046), Chevilly-Larue, France.',
      'Contact : cheikh@samasante.tech',
    ],
  },
];

export default function CguPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Retour à l&apos;accueil
        </Link>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Conditions générales d&apos;utilisation</h1>
        <p className="mt-2 text-sm text-muted-foreground">Dernière mise à jour : 7 octobre 2026</p>

        <Link href="/confidentialite" className="mt-4 inline-block underline">Notice de confidentialité</Link>
        <div className="mt-8 space-y-8">
          {sections.map((section) => (
            <section key={section.title} id={section.title.split('.')[0]}>
              <h2 className="text-lg font-semibold">{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
