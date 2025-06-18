"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function MobileLanding() {
  const features = [
    { icon: "/assets/icon-chat.svg", title: "Chat IA bilingue", desc: "Pré-diagnostic en wolof & français" },
    { icon: "/assets/icon-remedy.svg", title: "Remèdes validés", desc: "Fiches par des professionnels" },
    { icon: "/assets/icon-map.svg", title: "Géolocalisation", desc: "Clinics & centres proches" },
    { icon: "/assets/icon-alert.svg", title: "Alerte d'urgence", desc: "Envoi de SMS aux médecins" },
  ];

  return (
    <div className="font-inter antialiased">
      {/* Hero */}
      <header className="bg-gradient-to-r from-green-400 to-orange-500 text-white py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4">
          <h1 className="text-2xl font-bold">SamaSanté</h1>
        </div>
        <div className="max-w-5xl mx-auto flex flex-col-reverse md:flex-row items-center px-4 mt-8">
          <div className="md:w-1/2 text-center md:text-left space-y-4">
            <h2 className="text-4xl font-extrabold">Bienvenue sur SamaSanté</h2>
            <p className="text-lg">Découvrez l’application de santé et télémédecine pour tous au Sénégal.</p>
            <div className="space-y-2 md:space-y-0 md:space-x-3">
              <Link href="/app" className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded text-white font-medium inline-block">Accéder à l’application</Link>
              <Link href="#" className="bg-white text-gray-800 px-5 py-3 rounded font-medium inline-block">Android</Link>
              <Link href="#" className="bg-white text-gray-800 px-5 py-3 rounded font-medium inline-block">iOS</Link>
            </div>
            <p className="mt-2 text-sm">Commencez votre pré-diagnostic en quelques secondes.</p>
          </div>
          <motion.div className="md:w-1/2" initial={{ opacity:0, x:50 }} whileInView={{ opacity:1, x:0 }} transition={{ duration:0.6 }}>
            <img src="/assets/hero.svg" alt="Aperçu app" className="mx-auto w-64 md:w-auto" />
          </motion.div>
        </div>
      </header>

      {/* Fonctionnalités */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-5xl mx-auto px-4">
          <h3 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">Fonctionnalités principales</h3>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {features.map(({ icon, title, desc }) => (
              <motion.div key={title} className="flex items-start bg-white dark:bg-gray-700 rounded-lg p-6 shadow hover:shadow-lg transition" whileHover={{ scale: 1.02 }}>
                <img src={icon} alt={title} className="w-8 h-8 mr-4" />
                <div>
                  <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{title}</h4>
                  <p className="text-gray-600 dark:text-gray-300">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cas d’usage */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4">
          <h3 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">Cas d’usage</h3>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
            <motion.div className="flex bg-gray-100 dark:bg-gray-700 p-6 rounded-lg shadow" whileHover={{ scale: 1.02 }}>
              <img src="/assets/avatar-fatou.svg" alt="Fatou" className="w-12 h-12 rounded-full mr-4" />
              <div>
                <h5 className="font-semibold text-gray-900 dark:text-gray-100">Fatou</h5>
                <p className="text-gray-700 dark:text-gray-300">Utilise l’appli hors-ligne pour soigner la toux de son fils et reçoit une alerte si la fièvre persiste.</p>
              </div>
            </motion.div>
            <motion.div className="flex bg-gray-100 dark:bg-gray-700 p-6 rounded-lg shadow" whileHover={{ scale: 1.02 }}>
              <img src="/assets/avatar-modou.svg" alt="Modou" className="w-12 h-12 rounded-full mr-4" />
              <div>
                <h5 className="font-semibold text-gray-900 dark:text-gray-100">Modou</h5>
                <p className="text-gray-700 dark:text-gray-300">Oriente les patients vers les cliniques partenaires et met à jour les remèdes.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-12 bg-green-100 dark:bg-green-800 text-center">
        <div className="max-w-5xl mx-auto px-4">
          <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Prêt·e à essayer SamaSanté ?</h3>
          <Link href="/app" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium inline-block">Commencer le pré-diagnostic</Link>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">Limité à 7 requêtes/jour pour un usage équitable.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-200 dark:bg-gray-800">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="space-x-4 text-gray-700 dark:text-gray-300">
            <Link href="#">CGU</Link>
            <Link href="#">Politique de confidentialité</Link>
            <Link href="#">Contact / support</Link>
          </div>
          <div className="space-x-4 text-gray-700 dark:text-gray-300">
            <Link href="#" aria-label="Twitter">🐦</Link>
            <Link href="#" aria-label="Facebook">📘</Link>
            <Link href="#" aria-label="Email">✉️</Link>
          </div>
          <form className="flex">
            <label htmlFor="newsletter" className="sr-only">Email</label>
            <input id="newsletter" type="email" placeholder="Votre email" className="px-4 py-2 rounded-l-lg border border-gray-300 focus:outline-none" />
            <button className="px-4 py-2 bg-green-600 text-white rounded-r-lg">S’inscrire</button>
          </form>
        </div>
      </footer>
    </div>
  );
}

