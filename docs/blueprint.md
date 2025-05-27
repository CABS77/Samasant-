# **App Name**: SamaSanté AI

## Core Features:

- AI Chat: AI-powered pre-diagnostic chat in Wolof, French, and Pulaar using DeepSeek R1 and a set of business rules, providing initial health assessments.
- Remedy Display: Display validated traditional remedies with schematic images sourced from a PostgreSQL database. Provide filtering by symptom and language.
- Clinic Locator: Integrate a map using Mapbox for offline access, displaying nearby clinics and healthcare facilities. Allow persona Modou to update the remedies with information from traditional practitioners.
- Emergency Alert System: Implement an emergency prioritization tool to identify critical cases and send SMS alerts to nearby clinics, focusing on conditions like suspected malaria. This tool should incorporate reasoning to determine when to send the alerts.

## Style Guidelines:

- Primary colors: Vert (#3CB371), Jaune (#FFD700), Rouge (#E74C3C) inspired by the Senegalese flag.
- Accent color: A complementary orange to provide highlights for user interface elements.
- Titles: Poppins Bold for clear readability on small screens.
- Body: Open Sans with adjustable font size for accessibility.
- Use Adinkra symbols for suggestion chips to connect with local culture.
- Mobile-first design with clear sectioning for easy navigation.

## Original User Request:
Développement de l'Application SamaSanté
1. Contexte & Vision
Problème :

Au Sénégal, 45% de la population rurale n'a pas accès à des soins de santé de qualité (OMS 2023).

Automédication risquée (+68% en 5 ans) et méfiance envers la médecine moderne dans certaines zones.

Solution :
Une application mobile alliant IA, médecine traditionnelle validée et télémédecine, conçue pour :

Offrir un pré-diagnostic accessible en wolof/français/pulaar.

Réduire les faux diagnostics via une base de remèdes naturels vérifiés (médecins + guérisseurs).

Démocratiser l'accès aux spécialistes via visio-consultations hors des villes.

2. Spécifications Techniques
Stack :

Frontend : Flutter (compatible Android 8+ / iOS 12+, taille <15Mo).

Backend : Node.js + Supabase (hébergement local au Sénégal possible).

IA :

NLP customisé pour wolof (ex : "Dangaa ma xam ne..." = "Je ne comprends pas...").

Fallback vers un arbre de décision si échec de compréhension.

Hors ligne : Cache des fiches santé/remèdes (stockage léger <50Mo).

Sécurité :

Chiffrement AES-256 des conversations santé.

Authentification biométrique optionnelle.

3. Design & Expérience Utilisateur
Maquette Homepage (Mobile-First) :

Couleurs : Vert (#3CB371), Jaune (#FFD700), Rouge (#E74C3C) → inspirées du drapeau.

Typographie :

Titres : "Poppins Bold" (lisible sur petits écrans).

Corps : "Open Sans" avec taille réglable.

Sections :

Header : Logo SamaSanté + icône "fleur de baobab".

Chat IA :

Placeholder : "Tape ou parle en wolof : ‘Sama bop moy méti...’".

Boutons : Micro (voix), Galerie (photos de symptômes).

Suggestions :

8 "chips" scrollables avec icônes Adinkra :

Fièvre → 🔥 + proverbe wolof "Tabax day feebar..." ("La prévention guérit").

Cartes :

🩺 Télémédecine → Lien direct vers Jitsi.

🌿 Remèdes → Filtres par symptôme/langue.

📍 Cliniques → Carte offline (Mapbox).

Accessibilité :

Mode daltonien (contraste vérifié).

Option audio pour les fiches santé (voix synthétique wolof).

4. Fonctionnalités Clés (MVP)
Fonction	Détail Technique	Spécificité Culturelle
Chat IA	DeepSeek R1 + règles métier	Réponses en wolof avec proverbes
Remèdes	Base PostgreSQL + images schématiques	Dessins pour éviter les erreurs d'identification
Télémédecine	Intégration Twilio	Paiement par Orange Money
Urgences	Algorithme de priorisation	Alerte SMS aux cliniques en cas de paludisme suspecté
5. Cas d'Usage & Personas
Persona 1 :

Fatou, 35 ans, agricultrice à Tambacounda :

Utilise l'appli en mode offline pour soigner la toux de son fils (remède : gingembre + miel validé par Dr. Sow).

Reçoit une alerte IA pour une consultation si fièvre persiste.

Persona 2 :

Modou, agent de santé à Thiès :

Utilise la cartographie pour orienter les patients vers les cliniques partenaires.

Met à jour la base de remèdes avec les tradipraticiens.

6. Contraintes & Résolutions
Risque	Solution
Connexion instable	Mode SMS/USSD en backup
Conflits médecine moderne/traditionnelle	Afficher : "L’avis de votre médecin est prioritaire"
Dialectes locaux non couverts	Recrutement de linguistes wolof/pulaar
7. Roadmap (6 Mois)
M1-M2 :

Prototype IA (100 phrases wolof testées).

Partenariats avec 5 cliniques à Dakar.

M3-M4 :

Tests utilisateurs avec guérisseurs à Kaolack.

Intégration paiement mobile.

M5-M6 :

Lancement bêta (500 utilisateurs ciblés).

8. Métriques de Succès
Technique :

≤ 2s de réponse du chat IA en 2G.

95% des remèdes validés par des experts.

Utilisateur :

70% de consultations complétées en wolof.

40% de réduction des visites inutiles à l’hôpital.

9. Éthique & Culture
Ne Pas Faire :

Commercialiser les données de santé.

Remplacer un diagnostic médical complet.

À Valoriser :

Les savoirs traditionnels (ex : créditer les guérisseurs sources).

L’inclusion des femmes (50% des testeurs/trices).

Pourquoi ce Prompt Est Efficace :

Prêt à l'emploi pour les équipes tech/design.

Anticipe les pièges (langue, connexion, conflits culturels).

Aligne médecine moderne et traditionnelle.

Prochaines Étapes :

Prioriser les fonctionnalités avec des médecins locaux.

Prototyper l’IA avec des datasets wolof
  