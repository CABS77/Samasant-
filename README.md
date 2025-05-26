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
- Firebase CLI (`npm install -g firebase-tools`)
- Un compte Firebase

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
L’application sera disponible sur [http://localhost:3000](http://localhost:3000)

---

## 6. Structure du projet

```
src/
  app/
    page.tsx        # Point d’entrée principal (NextJS)
  components/       # Composants réutilisables
  services/         # Services d’API, IA, Firebase, etc.
  assets/           # Images, icônes
  ...
```

---

## 7. Contribution

Les contributions sont les bienvenues !

1. Forkez le projet
2. Créez une branche (`git checkout -b feature/NouvelleFonctionnalite`)
3. Commitez vos modifications (`git commit -am 'Ajout d'une nouvelle fonctionnalité'`)
4. Poussez la branche (`git push origin feature/NouvelleFonctionnalite`)
5. Ouvrez une Pull Request

---

## 8. Déploiement Firebase

1. Connectez-vous à Firebase avec votre compte :
    ```bash
    firebase login
    ```
2. Initialisez Firebase dans le projet :
    ```bash
    firebase init
    ```
3. Déployez :
    ```bash
    firebase deploy
    ```

*Pensez à configurer vos variables d’environnement dans Firebase si nécessaire.*

---

## 9. Roadmap

- [ ] Authentification utilisateur (numéro de téléphone, email)
- [ ] Amélioration du chatbot IA
- [ ] Intégration complète audio/vidéo pour la télémédecine
- [ ] Ajout de fiches remèdes et articles de santé
- [ ] Mode hors-ligne et cache géolocalisation
- [ ] Internationalisation (français, wolof…)

---

## 10. Licence

Ce projet est sous licence MIT.

---

## 11. Contact

Pour toute question ou suggestion :  
[Issues GitHub](https://github.com/CABS77/Samasant-/issues)

---

*Merci de contribuer à améliorer la santé pour tous avec SamaSanté !*
