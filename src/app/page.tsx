'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div className={darkMode ? 'dark' : ''}>
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-green-300 to-orange-500 dark:from-green-800 dark:to-orange-700 text-white">
        <div className="container mx-auto flex flex-col md:flex-row items-center py-12 px-4 gap-8">
          {/* Text & CTA */}
          <div className="w-full md:w-1/2 space-y-6 text-center md:text-left px-6 md:px-16">
            <h2 className="text-4xl font-extrabold">Bienvenue sur SamaSanté AI</h2>
            <p className="text-lg">
              Découvrez votre application de santé, qui vous permet de discuter avec notre{' '}
              <span className="font-bold text-white animate-pulse">
                IA
              </span>{' '}
              pour un pré-diagnostic express — réponses en{' '}
              <span className="font-bold text-white animate-pulse">
                français
              </span>{' '}
              &{' '}
              <span className="font-bold text-white animate-pulse">
                Wolof
              </span>.
            </p>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mx-auto md:mx-0">
              <p className="text-gray-800 dark:text-gray-200 mb-6">
                Commencez votre pré-diagnostic en quelques secondes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link
                  href="/app"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  🚀 Accéder à l’application
                </Link>
                <a
                  href="https://play.google.com/store/apps/details?id=com.samasante"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-gray-800 px-6 py-3 rounded shadow hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  📱 Télécharger sur Android
                </a>
                <a
                  href="https://apps.apple.com/app/id123456789"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-gray-800 px-6 py-3 rounded shadow hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  🍎 Télécharger sur iOS
                </a>
              </div>
            </div>
          </div>
          <motion.div
            className="md:w-1/2 mb-8 md:mb-0 px-4 md:px-16"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <img
              src="/assets/hero.png"
              alt="Mockup mobile"
              className="mx-auto max-w-full h-auto border-0"
            />
          </motion.div>
        </div>
      </header>
      <main id="main-content">

      {/* Fonctionnalités Principales */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">
            Fonctionnalités principales 🌟
          </h3>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {[
              { src: '/assets/icon-chat.png',   title: 'Chat IA bilingue',    desc: 'Pré-diagnostic en wolof & français' },
              { src: '/assets/icon-remedy.png', title: 'Remèdes validés',      desc: 'Fiches par des professionnels' },
              { src: '/assets/icon-map.png',    title: 'Géolocalisation',      desc: 'Clinics & centres proches' },
              { src: '/assets/icon-alert.png',  title: "Alerte d'urgence",     desc: 'Envoi de SMS aux médecins' },
            ].map(({ src, title, desc }) => (
              <div
                key={title}
                className="flex items-start bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition"
              >
                <img src={src} alt={title} className="w-8 h-8 mr-4" />
                <div>
                  <h4 className="font-semibold text-lg text-gray-900 dark:text-white">{title}</h4>
                  <p className="text-gray-600 dark:text-gray-300">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-16 bg-gray-100 dark:bg-gray-700">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Nos fondateurs</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="text-center">
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
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                Cheikh Ahmadou Bamba Sall
              </h4>
              <p className="text-gray-600 dark:text-gray-300">Fondateur</p>
            </div>
            <div className="text-center">
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
                Salif Jordan Marigo
              </h4>
              <p className="text-gray-600 dark:text-gray-300">Co-fondateur</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cas d’usage */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">
            Cas d’usage 🔍
          </h3>
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
                className="flex bg-gray-100 dark:bg-gray-700 p-6 rounded-lg shadow hover:shadow-lg transition"
              >
                <img src={src} alt={name} className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <h5 className="font-semibold text-gray-900 dark:text-white">{name}</h5>
                  <p className="text-gray-700 dark:text-gray-200">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-12 bg-green-100 dark:bg-green-900 text-center">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Prêt·e à essayer SamaSanté AI&nbsp;?
          </h3>
          <Link
            href="/app"
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Commencer le pré-diagnostic
          </Link>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Limité à 7 requêtes/jour pour un usage équitable.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-200 dark:bg-gray-800">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-x-4 text-gray-700 dark:text-gray-400 text-sm">
            <a href="#">CGU</a>
            <a href="#">Politique de confidentialité</a>
            <a href="#">Contact / support</a>
          </div>
          <div className="flex space-x-4 text-gray-700 dark:text-gray-400">
            <a href="#" aria-label="Twitter">🐦</a>
            <a href="#" aria-label="Facebook">📘</a>
            <a href="#" aria-label="Email">✉️</a>
          </div>
          <div className="flex">
            <input
              type="email"
              placeholder="Votre email"
              className="px-4 py-2 rounded-l-lg border border-gray-300 dark:border-gray-600 focus:outline-none"
            />
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-r-lg transition">
              S’inscrire
            </button>
          </div>
        </div>
      </footer>
      </main>
    </div>
  )
}
