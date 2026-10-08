# Refonte UI/UX — 8 octobre 2026

La page d’accueil remplace le montage de téléphone et les icônes de boutiques par une illustration originale d’échange entre une médecin et une patiente dans un cadre sénégalais. Le visuel représente une scène illustrative, aucun praticien ou partenaire réel. Les appels à l’action ouvrent les services existants.

## Identité et navigation

- Palette ivoire, vert profond et terre cuite ; titres éditoriaux en Georgia, texte en polices système, sans nouvelle requête de police externe.
- Marque avec symbole de cœur, composants et espacements cohérents, thèmes clair et sombre, respect de la réduction des animations.
- Navigation active distincte entre `/app` et `/appointments`, menu mobile refermable avec Échap et accès mobile aux trois pages principales.
- Accueil : présentation des trois parcours, langues, étapes de réservation, limites du service, FAQ accessible et équipe.
- Pied de page partagé avec accès à la confidentialité, aux conditions et au contact ; présentation cohérente des pages légales, de l’administration, du mode hors ligne et de l’image de partage.

## Parcours

L’application répartit la conversation, le catalogue, la recherche de cliniques et l’assistance en quatre onglets. Les liens avec fragments, le retour arrière et la navigation au clavier sont pris en charge. Un espace est chargé à sa première visite, puis reste monté afin de conserver la conversation et les saisies en mémoire durant la navigation. Rien n’est ajouté au stockage persistant des conversations.

La dictée est une option dépliable avec consentement explicite. Le message reste limité à 1 000 caractères et les contrôles d’âge, quotas et erreurs conservent leur fonctionnement. Aucun accès au micro ni envoi IA ne résulte de la sélection d’un onglet.

L’annuaire propose des filtres, leur réinitialisation, des profils avec initiales et une indication de sélection. Le choix d’un praticien déplace le focus vers le formulaire et le révèle sur mobile. La connexion par e-mail, l’état d’indisponibilité, les références réelles et l’attente de confirmation restent explicites. L’administration conserve l’authentification individuelle, la MFA et les restrictions des API.

Les nouveaux textes d’interface sont présents en français et en wolof. Les conseils du catalogue et les prompts médicaux ne sont pas modifiés.

## Asset

`public/assets/samasante-care.webp` : 1 024 × 1 280 pixels, 128 270 octets. Illustration créée pour cette refonte avec le générateur d’images ; conversion WebP pour limiter le téléchargement, dimensionnement responsive par Next Image. L’original est conservé hors du dépôt dans `/workspace/generated_images`.

## Vérification

Le contrôle de livraison existant exécute lint, TypeScript, tests, contrôles PostgreSQL, audit des dépendances de production et build. Le contrôle navigateur vérifie les protections, six pages et tous les panneaux à cinq largeurs, les deux thèmes, les liens directs, le clavier, le retour arrière, la conservation en mémoire, le consentement vocal, les filtres et le focus du formulaire. Les tests utilisent un serveur local isolé et des fixtures ; ils ne contactent aucun patient ou fournisseur et n’envoient aucun SMS.

Captures et résultats locaux : `/workspace/audits/samasante-redesign-2026-10-08`. La publication GitHub et le statut du déploiement sont documentés séparément une fois observés.
