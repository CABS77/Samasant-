'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
export default function LandingPage() {
  return (
    <div className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-50">
      {/* Hero Section */}
      <header className="bg-gradient-to-br from-green-500 via-emerald-500 to-orange-400 dark:from-green-800 dark:via-emerald-700 dark:to-orange-600 text-white">
        <div className="container mx-auto px-4 md:px-10 py-10 md:py-16 space-y-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur rounded-full px-4 py-2 text-sm font-semibold">
                SamaSanté AI
              </div>
              <span className="hidden sm:inline-flex text-white/80 text-sm">
                Télémédecine · Prévention · Remèdes validés
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-sm">
              <span className="rounded-full bg-white/20 px-3 py-1">Assistance 7/7</span>
              <span className="rounded-full bg-white/20 px-3 py-1">Données protégées</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Text & CTA */}
            <div className="w-full lg:w-1/2 space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-4 py-2 text-sm">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                Pré-diagnostic instantané • Français & Wolof • 7 requêtes/jour
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                La santé numérique pensée pour les communautés du Sénégal.
              </h1>
              <p className="text-lg text-white/90 leading-relaxed">
                Discutez avec notre IA médicale, trouvez des remèdes validés par des professionnels
                et accédez à la télémédecine en toute confiance. Une expérience pensée pour les
                familles, les patients et les soignants de terrain.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/app"
                  className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 font-semibold px-6 py-3 rounded-lg shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition"
                >
                  🚀 Lancer l’application web
                </Link>
                <a
                  href="https://play.google.com/store/apps/details?id=com.samasante"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-white/15 border border-white/30 text-white px-6 py-3 rounded-lg hover:bg-white/25 transition"
                >
                  📱 Bientôt sur Android
                </a>
                <a
                  href="https://apps.apple.com/app/id123456789"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-white/15 border border-white/30 text-white px-6 py-3 rounded-lg hover:bg-white/25 transition"
                >
                   Bientôt sur iOS
                </a>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-sm">
                {[
                  { label: 'Consultations testées', value: '+1 200' },
                  { label: 'Temps moyen de réponse', value: '8 s' },
                  { label: 'Couverture linguistique', value: 'FR & WOL' },
                  { label: 'Télémédecins partenaires', value: '30+' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/15 rounded-xl px-4 py-3 border border-white/30">
                    <div className="text-xs text-white/70 uppercase tracking-wide">{label}</div>
                    <div className="text-lg font-bold">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              className="w-full lg:w-1/2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative max-w-xl mx-auto">
                <div className="absolute -inset-4 bg-white/20 blur-3xl rounded-full" />
                <div className="relative bg-white/10 backdrop-blur rounded-3xl border border-white/30 shadow-2xl p-4 md:p-6">
                  <img
                    src="/assets/hero.png"
                    alt="Interface SamaSanté"
                    className="mx-auto w-full h-auto rounded-2xl"
                  />
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-white/15 border border-white/30 rounded-xl p-3">
                      <p className="text-white/80">Suivi patient</p>
                      <p className="font-semibold">Alertes en temps réel</p>
                    </div>
                    <div className="bg-white/15 border border-white/30 rounded-xl p-3">
                      <p className="text-white/80">Prévention</p>
                      <p className="font-semibold">Guides locaux vérifiés</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>
      <main id="main-content" className="space-y-16 md:space-y-24">

      {/* Fonctionnalités Principales */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">
                Valeur ajoutée
              </p>
              <h3 className="text-3xl font-bold">Fonctionnalités principales 🌟</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-2xl">
                Une expérience complète pour passer du pré-diagnostic à la prise en charge,
                partout où vous êtes.
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm bg-white dark:bg-gray-900 border border-emerald-100 dark:border-emerald-800 px-4 py-2 rounded-full shadow-sm">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Certification interne qualité & validation médicale continue.
            </div>
          </div>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { src: '/assets/icon-chat.png', title: 'Chat IA bilingue', desc: 'Pré-diagnostic guidé en wolof et en français pour plus d’inclusivité.' },
              { src: '/assets/icon-remedy.png', title: 'Remèdes validés', desc: 'Fiches pratiques vérifiées par des professionnels locaux.' },
              { src: '/assets/icon-map.png', title: 'Géolocalisation', desc: 'Cartographie des centres et dispensaires partenaires à proximité.' },
              { src: '/assets/icon-alert.png', title: "Alerte d'urgence", desc: 'Escalade rapide vers un médecin et SMS d’alerte en cas de besoin.' },
            ].map(({ src, title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:-translate-y-1 hover:shadow-lg transition"
              >
                <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                  <img src={src} alt={title} className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg">{title}</h4>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 space-y-10">
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">
                Parcours patient
              </p>
              <h3 className="text-3xl font-bold">Comment ça marche ?</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-2xl">
                Un accompagnement clair, de la première question à la consultation experte.
              </p>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Données sécurisées et consentement éclairé pour chaque étape.
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: '1. Conversation guidée', desc: 'L’IA pose les bonnes questions et détecte les signaux d’alerte en moins de 2 minutes.' },
              { title: '2. Synthèse claire', desc: 'Résumé des symptômes, recommandations immédiates et points de vigilance.' },
              { title: '3. Aiguillage rapide', desc: 'Connexion vers un médecin partenaire ou un centre proche en un clic.' },
              { title: '4. Suivi & prévention', desc: 'Conseils personnalisés, rappels et contenus d’éducation adaptés à votre région.' },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 space-y-2">
                <h4 className="font-semibold text-lg">{title}</h4>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Garanties */}
      <section className="py-16">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">
              Qualité & conformité
            </p>
            <h3 className="text-3xl font-bold">Un accompagnement professionnel, sécurisé.</h3>
            <p className="text-gray-600 dark:text-gray-300">
              SamaSanté est conçu avec des équipes médicales locales et respecte les bonnes
              pratiques de confidentialité. Nous priorisons la compréhension culturelle et
              l’accessibilité pour maximiser l’impact terrain.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                'Validation médicale trimestrielle des protocoles.',
                'Stockage chiffré des données de santé sensibles.',
                'Mode faible connectivité pour zones rurales.',
                'Support multilingue et accessibilité renforcée.',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3">
                  <span className="mt-1 text-emerald-600 dark:text-emerald-300">✔︎</span>
                  <p className="text-gray-700 dark:text-gray-200">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-8 shadow-lg space-y-6">
            <h4 className="text-2xl font-semibold">Des résultats mesurables</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { value: '92%', label: 'des utilisateurs se sentent mieux orientés après 1 session.' },
                { value: '3 min', label: 'durée moyenne pour obtenir un plan d’action clair.' },
                { value: '100%', label: 'des données transitent via des canaux sécurisés.' },
                { value: '24/7', label: 'disponibilité de l’IA et des contenus éducatifs.' },
              ].map(({ value, label }) => (
                <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">{value}</div>
                  <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">{label}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Les statistiques proviennent de nos premiers pilotes utilisateurs et sont mises à jour
              à chaque itération produit.
            </p>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-16 bg-gray-100 dark:bg-gray-900/60">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">
                Leadership
              </p>
              <h3 className="text-3xl font-bold">Nos fondateurs</h3>
              <p className="text-gray-700 dark:text-gray-200 mt-2">
                Une équipe engagée pour rendre la santé plus accessible, avec une expertise locale et
                internationale.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-sm">
              Membres actifs du réseau d’innovation en santé digitale en Afrique de l’Ouest.
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="text-center bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
              <a
                href="https://www.linkedin.com/in/ahmed-sall/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <img
                  src="/assets/cheikh-sall.jpeg"
                  alt="Cheikh Ahmadou Bamba Sall"
                  className="mx-auto w-32 h-32 rounded-full mb-4"
                />
              </a>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white leading-tight">
                Cheikh Ahmadou Bamba Sall{' '}
              </h4>
              <p className="text-gray-600 dark:text-gray-300">Fondateur</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                Direction produit & partenariats médicaux
              </p>
              <a
                href="https://www.linkedin.com/in/ahmed-sall/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2"
              >
                <img
                  src="/assets/linkedin-logo.png"
                  alt="LinkedIn"
                  className="w-12 h-12 inline-block"
                />
              </a>
            </div>
            <div className="text-center bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
              <a
                href="https://www.linkedin.com/in/salif-jordan-marigo-3004b7108/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <img
                  src="/assets/salif-marigo.jpeg"
                  alt="Salif Jordan Marigo"
                  className="mx-auto w-32 h-32 rounded-full mb-4"
                />
              </a>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                Salif Jordan Marigo{' '}
              </h4>
              <p className="text-gray-600 dark:text-gray-300">Co-fondateur</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                Opérations & intégration terrain
              </p>
              <a
                href="https://www.linkedin.com/in/salif-jordan-marigo-3004b7108/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2"
              >
                <img
                  src="/assets/linkedin-logo.png"
                  alt="LinkedIn"
                  className="w-12 h-12 inline-block"
                />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Cas d’usage */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">
                Cas d’usage 🔍
              </p>
              <h3 className="text-3xl font-bold">Pensé pour les besoins réels</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Des parcours différents, une même exigence de clarté et de réactivité.
              </p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-200 px-4 py-2 rounded-full text-sm">
              Disponible en ligne et hors ligne selon votre connectivité.
            </div>
          </div>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
            {[
              {
                src: '/assets/avatar-fatou.png',
                name: 'Fatou',
                text: "Utilise l’appli hors-ligne pour soigner la toux de son fils et reçoit une alerte si la fièvre persiste."
              },
              {
                src: '/assets/avatar-modou.png',
                name: 'Modou',
                text: 'Oriente les patients vers les cliniques partenaires et met à jour les remèdes.'
              },
            ].map(({ src, name, text }) => (
              <div
                key={name}
                className="flex bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <img src={src} alt={name} className="w-12 h-12 rounded-full mr-4" />
                <div className="space-y-2">
                  <h5 className="font-semibold text-gray-900 dark:text-white">{name}</h5>
                  <p className="text-gray-700 dark:text-gray-200 leading-relaxed">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-12 bg-gradient-to-r from-emerald-600 to-orange-500 text-center text-white">
        <div className="container mx-auto px-4 space-y-4">
          <h3 className="text-2xl md:text-3xl font-bold">
            Prêt·e à essayer SamaSanté AI&nbsp;?
          </h3>
          <p className="text-white/90 max-w-2xl mx-auto">
            Lancez votre pré-diagnostic en quelques secondes et obtenez des recommandations
            personnalisées. Limité à 7 requêtes par jour pour garantir un accompagnement équitable.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href="/app"
              className="bg-white text-emerald-700 px-8 py-3 rounded-lg font-semibold shadow-lg hover:-translate-y-0.5 transition"
            >
              Commencer maintenant
            </Link>
            <a
              href="mailto:contact@samasante.com"
              className="text-white/90 underline underline-offset-4"
            >
              Parler à un membre de l’équipe
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-gray-200 dark:bg-gray-900 border-t border-gray-300 dark:border-gray-800">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-x-4 text-gray-700 dark:text-gray-400 text-sm">
            <a href="#">CGU</a>
            <a href="#">Politique de confidentialité</a>
            <a href="#">Contact / support</a>
          </div>
          <div className="flex space-x-4 text-gray-700 dark:text-gray-400 text-lg">
            <a href="#" aria-label="Twitter">🐦</a>
            <a href="#" aria-label="Facebook">📘</a>
            <a href="#" aria-label="Email">✉️</a>
          </div>
          <div className="flex">
            <input
              type="email"
              placeholder="Votre email professionnel"
              className="px-4 py-2 rounded-l-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800"
            />
            <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-r-lg transition">
              S’inscrire
            </button>
          </div>
        </div>
      </footer>
      </main>
    </div>
  )
}
