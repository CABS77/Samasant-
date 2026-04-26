'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, MessageCircle, Leaf, MapPin, AlertTriangle, Shield, Globe, Clock, ChevronRight } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      {/* ─── HERO ─── */}
      <header className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-premium" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.15),transparent)]" />

        <div className="relative container mx-auto px-4 md:px-8 pt-16 pb-20 md:pt-24 md:pb-32">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Text */}
            <motion.div
              className="w-full lg:w-1/2 space-y-8"
              initial="hidden"
              animate="visible"
            >
              <motion.div
                custom={0}
                variants={fadeUp}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 text-sm text-white/90 border border-white/15"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                Pré-diagnostic instantané · Français & Wolof
              </motion.div>

              <motion.h1
                custom={1}
                variants={fadeUp}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-white tracking-tight"
              >
                La santé numérique
                <br />
                <span className="text-white/80">pour le Sénégal.</span>
              </motion.h1>

              <motion.p
                custom={2}
                variants={fadeUp}
                className="text-lg text-white/75 leading-relaxed max-w-lg"
              >
                Discutez avec notre IA médicale, trouvez des remèdes validés et accédez à la
                télémédecine en toute confiance.
              </motion.p>

              <motion.div custom={3} variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/app"
                  className="group inline-flex items-center justify-center gap-2 bg-white text-emerald-700 font-semibold px-7 py-3.5 rounded-xl shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  Lancer l'application
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <a
                  href="mailto:contact@samasante.com"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-7 py-3.5 rounded-xl hover:bg-white/15 transition-all duration-300"
                >
                  Nous contacter
                </a>
              </motion.div>

              <motion.div
                custom={4}
                variants={fadeUp}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4"
              >
                {[
                  { value: '+1 200', label: 'Consultations' },
                  { value: '8 s', label: 'Temps de réponse' },
                  { value: 'FR & WOL', label: 'Langues' },
                  { value: '30+', label: 'Médecins' },
                ].map(({ value, label }) => (
                  <div
                    key={label}
                    className="bg-white/8 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10"
                  >
                    <div className="text-xl font-bold text-white">{value}</div>
                    <div className="text-xs text-white/50 mt-0.5">{label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Hero visual */}
            <motion.div
              className="w-full lg:w-1/2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <div className="relative max-w-lg mx-auto">
                <div className="absolute -inset-8 bg-white/10 blur-3xl rounded-full" />
                <div className="relative bg-white/5 backdrop-blur-md rounded-3xl border border-white/15 shadow-2xl p-5 md:p-7">
                  <img
                    src="/assets/hero.png"
                    alt="Interface SamaSanté"
                    className="w-full h-auto rounded-2xl"
                  />
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-white/10 border border-white/10 rounded-xl p-3">
                      <p className="text-white/60 text-xs">Suivi patient</p>
                      <p className="font-semibold text-white">Alertes temps réel</p>
                    </div>
                    <div className="bg-white/10 border border-white/10 rounded-xl p-3">
                      <p className="text-white/60 text-xs">Prévention</p>
                      <p className="font-semibold text-white">Guides vérifiés</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Curved bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full">
            <path d="M0 60V30C360 0 1080 0 1440 30V60H0Z" className="fill-background" />
          </svg>
        </div>
      </header>

      <main id="main-content" className="space-y-0">
        {/* ─── FEATURES ─── */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
                Fonctionnalités
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Tout ce dont vous avez besoin
              </h2>
              <p className="text-muted-foreground mt-4 leading-relaxed">
                Du pré-diagnostic à la prise en charge, une expérience complète pensée pour le terrain.
              </p>
            </div>

            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: MessageCircle, title: 'Chat IA bilingue', desc: 'Pré-diagnostic guidé en wolof et en français pour plus d\'inclusivité.', color: 'text-primary bg-primary/10' },
                { icon: Leaf, title: 'Remèdes validés', desc: 'Fiches pratiques vérifiées par des professionnels de santé locaux.', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' },
                { icon: MapPin, title: 'Géolocalisation', desc: 'Cartographie des centres et dispensaires partenaires à proximité.', color: 'text-blue-600 dark:text-blue-400 bg-blue-500/10' },
                { icon: AlertTriangle, title: "Alerte d'urgence", desc: 'Escalade rapide vers un médecin et SMS d\'alerte en cas de besoin.', color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10' },
              ].map(({ icon: Icon, title, desc, color }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="group relative bg-card rounded-2xl p-6 border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className={`h-11 w-11 rounded-xl ${color} flex items-center justify-center mb-4`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">{title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section className="py-20 md:py-28 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
                Parcours patient
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Comment ça marche ?
              </h2>
              <p className="text-muted-foreground mt-4 leading-relaxed">
                Un accompagnement clair, de la première question à la consultation experte.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { step: '01', title: 'Conversation guidée', desc: 'L\'IA pose les bonnes questions et détecte les signaux d\'alerte en moins de 2 minutes.' },
                { step: '02', title: 'Synthèse claire', desc: 'Résumé des symptômes, recommandations immédiates et points de vigilance.' },
                { step: '03', title: 'Aiguillage rapide', desc: 'Connexion vers un médecin partenaire ou un centre proche en un clic.' },
                { step: '04', title: 'Suivi & prévention', desc: 'Conseils personnalisés, rappels et contenus d\'éducation adaptés.' },
              ].map(({ step, title, desc }, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="relative bg-card rounded-2xl p-6 border border-border/50"
                >
                  <span className="text-5xl font-black text-primary/10 absolute top-4 right-5">
                    {step}
                  </span>
                  <div className="relative">
                    <h4 className="font-semibold text-lg mb-2">{title}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TRUST / GUARANTEES ─── */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                  Qualité & conformité
                </p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Un accompagnement professionnel, sécurisé.
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  SamaSanté est conçu avec des équipes médicales locales et respecte les bonnes
                  pratiques de confidentialité.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {[
                    { icon: Shield, text: 'Validation médicale trimestrielle' },
                    { icon: Shield, text: 'Stockage chiffré des données' },
                    { icon: Globe, text: 'Mode faible connectivité' },
                    { icon: Globe, text: 'Support multilingue renforcé' },
                  ].map(({ icon: Icon, text }) => (
                    <div
                      key={text}
                      className="flex items-center gap-3 bg-card border border-border/50 rounded-xl px-4 py-3"
                    >
                      <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                      <p className="text-sm">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-sm">
                <h3 className="text-2xl font-bold mb-6">Des résultats mesurables</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: '92%', label: 'se sentent mieux orientés' },
                    { value: '3 min', label: 'pour un plan d\'action' },
                    { value: '100%', label: 'données sécurisées' },
                    { value: '24/7', label: 'disponibilité IA' },
                  ].map(({ value, label }) => (
                    <div key={label} className="bg-muted/50 rounded-xl p-4">
                      <div className="text-2xl font-bold text-primary">{value}</div>
                      <p className="text-muted-foreground text-xs mt-1">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FOUNDERS ─── */}
        <section className="py-20 md:py-28 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
                Leadership
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Nos fondateurs
              </h2>
              <p className="text-muted-foreground mt-4">
                Une équipe engagée pour rendre la santé plus accessible.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
              {[
                {
                  name: 'Cheikh Ahmadou Bamba Sall',
                  role: 'Fondateur',
                  desc: 'Direction produit & partenariats médicaux',
                  img: '/assets/cheikh-sall.jpeg',
                  linkedin: 'https://www.linkedin.com/in/ahmed-sall/',
                },
                {
                  name: 'Salif Jordan Marigo',
                  role: 'Co-fondateur',
                  desc: 'Opérations & intégration terrain',
                  img: '/assets/salif-marigo.jpeg',
                  linkedin: 'https://www.linkedin.com/in/salif-jordan-marigo-3004b7108/',
                },
              ].map(({ name, role, desc, img, linkedin }) => (
                <div
                  key={name}
                  className="text-center bg-card rounded-2xl p-8 border border-border/50 hover:shadow-lg transition-shadow duration-300"
                >
                  <a href={linkedin} target="_blank" rel="noopener noreferrer" className="inline-block group">
                    <img
                      src={img}
                      alt={name}
                      className="mx-auto w-28 h-28 rounded-full mb-5 ring-4 ring-primary/10 group-hover:ring-primary/30 transition-all object-cover"
                    />
                  </a>
                  <h4 className="text-lg font-semibold">{name}</h4>
                  <p className="text-primary text-sm font-medium">{role}</p>
                  <p className="text-muted-foreground text-sm mt-2">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── USE CASES ─── */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
                Cas d&apos;usage
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Pensé pour les besoins réels
              </h2>
            </div>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto">
              {[
                {
                  src: '/assets/avatar-fatou.png',
                  name: 'Fatou',
                  role: 'Agricultrice, Tambacounda',
                  text: "Utilise l'appli hors-ligne pour soigner la toux de son fils et reçoit une alerte si la fièvre persiste.",
                },
                {
                  src: '/assets/avatar-modou.png',
                  name: 'Modou',
                  role: 'Agent de santé, Thiès',
                  text: 'Oriente les patients vers les cliniques partenaires et met à jour les remèdes.',
                },
              ].map(({ src, name, role, text }) => (
                <div
                  key={name}
                  className="flex gap-4 bg-card p-6 rounded-2xl border border-border/50"
                >
                  <img src={src} alt={name} className="w-12 h-12 rounded-full flex-shrink-0 object-cover" />
                  <div>
                    <h5 className="font-semibold">{name}</h5>
                    <p className="text-xs text-muted-foreground mb-2">{role}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-premium" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_110%,rgba(255,255,255,0.1),transparent)]" />

          <div className="relative container mx-auto px-4 py-20 md:py-24 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Prêt·e à essayer SamaSanté AI ?
            </h2>
            <p className="text-white/70 max-w-xl mx-auto mt-4 leading-relaxed">
              Lancez votre pré-diagnostic en quelques secondes. 7 requêtes gratuites par jour.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-8">
              <Link
                href="/app"
                className="group inline-flex items-center gap-2 bg-white text-emerald-700 px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                Commencer maintenant
                <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="mailto:contact@samasante.com"
                className="text-white/80 hover:text-white underline underline-offset-4 text-sm transition-colors"
              >
                Parler à l'équipe
              </a>
            </div>
          </div>
        </section>

        {/* ─── FOOTER ─── */}
        <footer className="py-12 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary text-primary-foreground font-poppins-bold text-xs">
                  SS
                </span>
                <span className="font-poppins-bold text-sm">SamaSanté AI</span>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">CGU</a>
                <a href="#" className="hover:text-foreground transition-colors">Confidentialité</a>
                <a href="mailto:contact@samasante.com" className="hover:text-foreground transition-colors">Contact</a>
              </div>

              <div className="flex items-center gap-1">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="px-4 py-2.5 rounded-l-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-48"
                />
                <button className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-r-xl text-sm font-medium transition-colors">
                  S'inscrire
                </button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border/50 text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} SamaSanté AI. Tous droits réservés.
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
