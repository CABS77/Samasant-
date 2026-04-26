# Document d'exigences — Gestion des médecins (Admin)

## Introduction

Cette fonctionnalité ajoute une interface d'administration permettant de gérer les médecins de l'application SamaSanté AI. Actuellement, les médecins sont codés en dur dans `src/services/doctors.ts` comme données de fallback. L'objectif est de remplacer cette approche par un stockage local via un fichier JSON, accompagné d'une interface CRUD complète accessible à `/admin`. Le système de prise de rendez-vous existant consommera ces données gérées localement, sans dépendance à Supabase pour les médecins.

## Glossaire

- **Admin_Interface** : Page web accessible à la route `/admin` permettant de gérer les médecins via des opérations CRUD
- **Doctor_Store** : Fichier JSON local (`data/doctors.json`) servant de source de données persistante pour la liste des médecins
- **Doctor** : Entité représentant un médecin avec les champs : id, name, specialty, location, bio, available, rating, reviews (conforme au type `Doctor` défini dans `src/types/doctor.ts`)
- **API_Routes** : Endpoints Next.js App Router (route handlers) exposant les opérations CRUD sur le Doctor_Store
- **Appointment_System** : Système existant de prise de rendez-vous qui consomme la liste des médecins via `getDoctors()`

## Exigences

### Exigence 1 : Stockage local des médecins

**User Story :** En tant qu'administrateur, je veux que les médecins soient stockés dans un fichier JSON local, afin de ne pas dépendre de Supabase pour la gestion des médecins.

#### Critères d'acceptation

1. THE Doctor_Store SHALL persister les données des médecins dans un fichier JSON situé à `data/doctors.json` à la racine du projet
2. WHEN l'application démarre et que le fichier `data/doctors.json` n'existe pas, THE Doctor_Store SHALL créer le fichier avec les six médecins de fallback actuels comme données initiales
3. THE Doctor_Store SHALL stocker chaque médecin avec tous les champs du type `Doctor` : id (string), name (string), specialty (string), location (string optionnel), bio (string optionnel), available (tableau de strings), rating (number optionnel), reviews (number optionnel)
4. WHEN un médecin est ajouté au Doctor_Store, THE Doctor_Store SHALL générer un identifiant unique pour le nouveau médecin
5. WHEN le fichier `data/doctors.json` contient un JSON invalide, THE Doctor_Store SHALL retourner les données de fallback et journaliser l'erreur dans la console

### Exigence 2 : API CRUD pour les médecins

**User Story :** En tant qu'administrateur, je veux disposer d'endpoints API pour créer, lire, modifier et supprimer des médecins, afin de pouvoir gérer la liste depuis l'interface admin.

#### Critères d'acceptation

1. THE API_Routes SHALL exposer un endpoint GET `/api/doctors` retournant la liste complète des médecins depuis le Doctor_Store
2. THE API_Routes SHALL exposer un endpoint POST `/api/doctors` acceptant un objet Doctor (sans id) et retournant le médecin créé avec son id généré
3. THE API_Routes SHALL exposer un endpoint PUT `/api/doctors/[id]` acceptant un objet Doctor partiel et retournant le médecin mis à jour
4. THE API_Routes SHALL exposer un endpoint DELETE `/api/doctors/[id]` supprimant le médecin correspondant et retournant un statut de confirmation
5. WHEN un endpoint POST ou PUT reçoit des données invalides (name vide, specialty vide, available non-tableau), THEN THE API_Routes SHALL retourner un code HTTP 400 avec un message d'erreur descriptif
6. WHEN un endpoint PUT ou DELETE reçoit un id inexistant, THEN THE API_Routes SHALL retourner un code HTTP 404 avec un message indiquant que le médecin est introuvable
7. WHEN une erreur d'écriture survient sur le fichier JSON, THEN THE API_Routes SHALL retourner un code HTTP 500 avec un message d'erreur approprié

### Exigence 3 : Validation des données médecin

**User Story :** En tant qu'administrateur, je veux que les données saisies soient validées, afin de garantir la cohérence et l'intégrité des informations des médecins.

#### Critères d'acceptation

1. WHEN un médecin est créé ou modifié, THE API_Routes SHALL valider que le champ `name` est une chaîne non vide d'au moins 2 caractères
2. WHEN un médecin est créé ou modifié, THE API_Routes SHALL valider que le champ `specialty` est une chaîne non vide
3. WHEN un médecin est créé ou modifié, THE API_Routes SHALL valider que le champ `available` est un tableau contenant uniquement des valeurs parmi : "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"
4. WHEN un champ `rating` est fourni, THE API_Routes SHALL valider que la valeur est un nombre compris entre 0 et 5 inclus
5. WHEN un champ `reviews` est fourni, THE API_Routes SHALL valider que la valeur est un entier positif ou zéro
6. FOR ALL médecins valides, la sérialisation en JSON puis la désérialisation SHALL produire un objet équivalent à l'original (propriété round-trip)

### Exigence 4 : Interface d'administration — Liste des médecins

**User Story :** En tant qu'administrateur, je veux voir la liste de tous les médecins sur la page admin, afin de pouvoir consulter et gérer l'annuaire.

#### Critères d'acceptation

1. THE Admin_Interface SHALL être accessible à la route `/admin`
2. WHEN la page `/admin` est chargée, THE Admin_Interface SHALL afficher la liste de tous les médecins avec leur nom, spécialité, localisation et note
3. THE Admin_Interface SHALL afficher un bouton "Ajouter un médecin" visible en haut de la liste
4. THE Admin_Interface SHALL afficher pour chaque médecin des boutons "Modifier" et "Supprimer"
5. WHILE les données des médecins sont en cours de chargement, THE Admin_Interface SHALL afficher un indicateur de chargement (skeleton)
6. IF le chargement des médecins échoue, THEN THE Admin_Interface SHALL afficher un message d'erreur avec un bouton pour réessayer

### Exigence 5 : Interface d'administration — Ajout d'un médecin

**User Story :** En tant qu'administrateur, je veux pouvoir ajouter un nouveau médecin via un formulaire, afin d'enrichir l'annuaire.

#### Critères d'acceptation

1. WHEN l'administrateur clique sur "Ajouter un médecin", THE Admin_Interface SHALL afficher un formulaire dans une modale avec les champs : nom, spécialité, localisation, biographie, jours disponibles, note, nombre d'avis
2. WHEN l'administrateur soumet le formulaire avec des données valides, THE Admin_Interface SHALL envoyer une requête POST à l'API et ajouter le médecin à la liste affichée
3. WHEN l'ajout est réussi, THE Admin_Interface SHALL fermer la modale et afficher une notification de succès
4. WHEN l'administrateur soumet le formulaire avec des données invalides, THE Admin_Interface SHALL afficher les messages d'erreur de validation sous les champs concernés sans fermer la modale
5. WHEN l'ajout échoue côté serveur, THEN THE Admin_Interface SHALL afficher une notification d'erreur

### Exigence 6 : Interface d'administration — Modification d'un médecin

**User Story :** En tant qu'administrateur, je veux pouvoir modifier les informations d'un médecin existant, afin de maintenir l'annuaire à jour.

#### Critères d'acceptation

1. WHEN l'administrateur clique sur "Modifier" pour un médecin, THE Admin_Interface SHALL afficher le formulaire pré-rempli avec les données actuelles du médecin dans une modale
2. WHEN l'administrateur soumet les modifications avec des données valides, THE Admin_Interface SHALL envoyer une requête PUT à l'API et mettre à jour l'affichage du médecin dans la liste
3. WHEN la modification est réussie, THE Admin_Interface SHALL fermer la modale et afficher une notification de succès
4. WHEN l'administrateur soumet des modifications invalides, THE Admin_Interface SHALL afficher les messages d'erreur de validation sans fermer la modale

### Exigence 7 : Interface d'administration — Suppression d'un médecin

**User Story :** En tant qu'administrateur, je veux pouvoir supprimer un médecin de l'annuaire, afin de retirer les médecins qui ne sont plus disponibles.

#### Critères d'acceptation

1. WHEN l'administrateur clique sur "Supprimer" pour un médecin, THE Admin_Interface SHALL afficher une boîte de dialogue de confirmation demandant de valider la suppression
2. WHEN l'administrateur confirme la suppression, THE Admin_Interface SHALL envoyer une requête DELETE à l'API et retirer le médecin de la liste affichée
3. WHEN la suppression est réussie, THE Admin_Interface SHALL afficher une notification de succès
4. WHEN l'administrateur annule la suppression, THE Admin_Interface SHALL fermer la boîte de dialogue sans effectuer de modification
5. WHEN la suppression échoue côté serveur, THEN THE Admin_Interface SHALL afficher une notification d'erreur

### Exigence 8 : Intégration avec le système de rendez-vous existant

**User Story :** En tant qu'utilisateur, je veux que la page de rendez-vous affiche les médecins gérés localement, afin de toujours voir la liste à jour.

#### Critères d'acceptation

1. THE Appointment_System SHALL charger les médecins depuis l'endpoint GET `/api/doctors` au lieu de la fonction `getDoctors()` actuelle qui dépend de Supabase
2. WHEN l'API `/api/doctors` retourne une liste vide, THE Appointment_System SHALL afficher un message indiquant qu'aucun médecin n'est disponible
3. IF l'appel à l'API `/api/doctors` échoue, THEN THE Appointment_System SHALL afficher les données de fallback codées en dur comme comportement de secours
4. THE Appointment_System SHALL continuer à utiliser les composants existants `DoctorCard`, `DoctorSearch` et `AppointmentForm` sans modification de leurs interfaces

### Exigence 9 : Navigation vers l'administration

**User Story :** En tant qu'administrateur, je veux accéder facilement à la page d'administration depuis la barre de navigation, afin de gérer les médecins rapidement.

#### Critères d'acceptation

1. THE Navbar SHALL inclure un lien "Admin" pointant vers la route `/admin`
2. THE Navbar SHALL afficher le lien "Admin" avec un style visuel distinct (icône ou badge) pour le différencier des liens de navigation standard
3. WHILE l'utilisateur se trouve sur la page `/admin`, THE Navbar SHALL mettre en surbrillance le lien "Admin" comme lien actif
