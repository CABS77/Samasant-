# SamaSanté – Application Mobile de Santé & Télémédecine

SamaSanté est une application mobile innovante dédiée à la santé et à la télémédecine, conçue pour faciliter l’accès aux soins au Sénégal, en particulier dans les zones rurales.

---

## 1. Contexte & Objectif

L’accès aux soins reste difficile pour une grande partie de la population au Sénégal, notamment en zone rurale. SamaSanté vise à :

- Offrir un pré-diagnostic via une IA conversationnelle
- Promouvoir des remèdes traditionnels validés
- Donner un accès simple à des consultations médicales à distance
- Éduquer les utilisateurs sur les maladies fréquentes dans leur région

---

## 2. Fonctionnalités principales (MVP)

### A. Chat IA Santé
- Interface simple de discussion
- Questions guidées pour identifier les symptômes
- Réponses personnalisées selon les cas
- Suggestions de remèdes naturels traditionnels (tisane de neem, gingembre, etc.)
- Escalade vers un télémédecin si nécessaire
- Limite de **7 requêtes** par appareil et par jour pour éviter les abus

### B. Suggestions de maladies/symptômes
- Liste de symptômes fréquents (paludisme, diarrhée, règles douloureuses, etc.)
- Affichage sous forme de boutons cliquables (UI type “chips”)
- Intégration dans le flux du chat pour pré-remplissage automatique

### C. Services complémentaires
- **Télémédecine** : RDV audio/vidéo avec médecins partenaires
- **Remèdes naturels** : Fiches vérifiées par des professionnels (origine, préparation, contre-indications)
- **Éducation santé** : Articles simples sur les maladies locales, prévention, hygiène

### D. Géolocalisation santé
- Carte des centres & dispensaires à proximité
- Possibilité d’utilisation hors-ligne avec cache

---

## 3. Prérequis

- Node.js >= 18.x
- npm ou yarn
- Supabase CLI (`npm install -g supabase`) *(optionnel)*
- Un projet Supabase avec URL et clé anonyme

---

## 4. Installation

```bash
git clone https://github.com/CABS77/Samasant-.git
cd Samasant-
npm install
# ou
yarn install
```

---

## 5. Lancement du projet

```bash
npm run dev
# ou
yarn dev
```

## 6. Configuration de l'IA

Créez un fichier `.env` à la racine et renseignez votre clé DeepSeek :

```bash
DEEPSEEK_API_KEY=your-deepseek-key
DEEPSEEK_MODEL=chat # ou 'reasoner'
```

Par défaut, le modèle **deepseekChat** (plus rapide) est utilisé. Définissez `DEEPSEEK_MODEL=reasoner` pour utiliser **deepseekReasoner** si vous avez besoin d'une réponse plus élaborée mais moins rapide.

### Configuration de l'IA

Copiez le fichier `.env.example` vers `.env` et renseignez la clef :

```
DEEPSEEK_API_KEY=... # clé DeepSeek R1
DEEPSEEK_MODEL=chat
```

---

## 7. Structure du projet

```
src/
  ai/                # Logique IA et flux
  app/
    page.tsx        # Point d’entrée principal (NextJS)
  components/       # Composants réutilisables
  hooks/            # Hooks personnalisés
  lib/              # Fonctions utilitaires
  locales/          # Fichiers de traduction
  services/         # Services d’API, IA, Supabase, etc.
  test/             # Configuration de tests
  types/            # Types TypeScript
  ...
```

---

## 8. Contribution

Les contributions sont les bienvenues !

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/NouvelleFonctionnalite`)
3. Commitez vos modifications (`git commit -am 'Ajout d'une nouvelle fonctionnalité'`)
4. Poussez la branche (`git push origin feature/NouvelleFonctionnalite`)
5. Ouvrez une Pull Request

---

## 9. Déploiement Supabase

1. Installez la CLI Supabase *(optionnel)* :
    ```bash
    npm install -g supabase
    ```
2. Renseignez les variables `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` dans `.env.local`.
3. Lancez la base en local si besoin :
    ```bash
    supabase start
    ```
4. Déployez la configuration :
    ```bash
    supabase link --project-ref your-ref
    supabase db push
    ```

*Assurez-vous que les clés Supabase sont correctement définies avant le déploiement.*

---

## 10. Roadmap

- [ ] Authentification utilisateur (numéro de téléphone, email)
- [ ] Amélioration du chatbot IA
- [ ] Intégration complète audio/vidéo pour la télémédecine
- [ ] Ajout de fiches remèdes et articles de santé
- [ ] Mode hors-ligne et cache géolocalisation
- [ ] Internationalisation (français, wolof…)

---

## 11. Licence

Ce projet est sous licence MIT.

---

## 12. Contact

Pour toute question ou suggestion :  
[Issues GitHub](https://github.com/CABS77/Samasant-/issues)

---
## Avertissement médical / Medical Disclaimer

SamaSanté AI provides informational content only and is not a substitute for consultation with a qualified healthcare professional.

---

*Merci de contribuer à améliorer la santé pour tous avec SamaSanté !*
