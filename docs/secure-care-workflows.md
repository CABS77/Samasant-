# Administration, alertes et rendez-vous

Les mutations de médecins exigent une session administrateur sur les routes REST et sur les Server Actions. Un indicateur dans `sessionStorage` ne donne aucun droit. Il n’existe plus de mot de passe par défaut. Les alertes n’utilisent aucun numéro fictif. Une demande de rendez-vous n’est affichée comme enregistrée qu’après une réponse valide de la base ; elle reste en attente jusqu’à sa confirmation dans l’administration.

## Configuration serveur

- `ADMIN_PASSWORD` : valeur aléatoire d’au moins 16 caractères.
- `ADMIN_SESSION_SECRET` : secret aléatoire d’au moins 32 caractères, indépendant du mot de passe.
- `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` : projet Supabase utilisé pour Auth et les lectures des patients.
- `SUPABASE_SERVICE_ROLE_KEY` : clé du même projet, **exclusivement côté serveur**. Les routes la lisent après la vérification de l’identité. Ne pas la mettre dans le navigateur ou dans un nom commençant par `NEXT_PUBLIC_`.
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` : compte et expéditeur autorisés pour les destinataires sénégalais.
- `EMERGENCY_CLINICS_JSON` : tableau JSON de partenaires vérifiés ayant accepté de recevoir les alertes, avec `id`, `name`, `phoneNumber` au format international E.164, `latitude` et `longitude`. La configuration entière est validée. Au maximum trois numéros distincts dans un rayon de 10 km reçoivent la demande. Aucun destinataire issu de Mapbox n’est automatiquement ajouté à ce répertoire.

Les cookies d’administration sont signés, HttpOnly, SameSite strict, Secure en production, avec une durée d’une heure. Changer l’une des deux valeurs administrateur invalide les sessions existantes. La déconnexion efface le cookie du navigateur ; une copie volée reste valide jusqu’à son expiration ou à une rotation. La limitation des tentatives de mot de passe est locale à chaque instance : ajouter une limitation partagée à la périphérie en production. L’identification par `x-forwarded-for` suppose un proxy de confiance qui réécrit cet en-tête.

## Activer les réservations

1. Appliquer [la migration de l’annuaire](../supabase/migrations/202610070000_doctor_directory.sql), puis [la migration des rendez-vous](../supabase/migrations/202610070001_appointment_requests.sql) au projet Supabase. Elles créent `doctor_directory` et `appointment_requests` sans modifier les anciennes tables. Le compte qui les exécute doit avoir les droits de création de table, d’index et de politique RLS.
2. Activer l’authentification par e-mail dans Supabase Auth. Définir l’URL du site et autoriser les URL de retour `/appointments` sur le domaine de production et les domaines de prévisualisation utilisés. Paramétrer l’envoi des liens de connexion dans Supabase.
3. Configurer les variables ci-dessus dans l’hébergement, puis reconstruire l’application : les variables publiques sont intégrées lors du build.
4. Créer les praticiens validés depuis `/admin`. Sur un déploiement configuré, l’annuaire est partagé et durable dans Supabase, et la migration n’ajoute aucune fiche fictive. En local sans Supabase, l’annuaire de démonstration reste disponible avec persistance sur disque ; sur Vercel sans base configurée, les accès à l’annuaire échouent explicitement. Les identifiants de médecins sont conservés en texte ; les rendez-vous existants gardent leur référence si un médecin est supprimé. Ce changement ne vérifie pas l’identité professionnelle des praticiens : elle doit être contrôlée avant leur ajout.
5. Tester une demande avec un compte patient, contrôler sa ligne en base, puis la confirmer ou l’annuler dans `/admin`. Le patient retrouve son état dans « Mes demandes » avec le bouton d’actualisation.

Le serveur vérifie le jeton avec Supabase Auth et détermine l’identité du patient lui-même. Les champs inattendus, les dates passées, les créneaux hors des horaires de 8 h à 11 h 30 et de 14 h à 17 h 30, les jours non disponibles et les consultations vidéo sont refusés. Les horaires suivent `Africa/Dakar` (UTC toute l’année), dans une limite de 366 jours. Les patients ne peuvent lire que leurs propres lignes grâce à RLS et n’ont aucun droit direct d’insertion, de modification ou de suppression. La clinique gère les états via des routes exigeant la session administrateur.

Un index unique protège un créneau médecin/date tant que la demande est en attente ou confirmée. Une annulation le libère. Une référence de requête permet de rejouer une demande après une réponse réseau perdue sans créer de doublon. Une référence déjà utilisée avec un autre contenu est refusée. Les confirmations ne peuvent partir que de l’état en attente, et une demande annulée ne peut pas être réactivée par cette API.

Il n’existe pas de SMS de confirmation de rendez-vous ni de service vidéo opérationnel dans ce changement : l’interface ne les promet plus. Les demandes n’ont pas d’expiration automatique ; la clinique doit traiter ou annuler les demandes en attente. L’administration affiche au plus 100 demandes, par date croissante, et le suivi patient les 50 plus récentes.

## Interpréter les alertes

- Configuration absente, partenaires introuvables ou erreur de fournisseur : aucun SMS n’est annoncé comme livré.
- `accepted`, `queued`, `scheduled`, `sending` ou `sent` chez Twilio : **accepté par le prestataire, livraison non confirmée**.
- `delivered` avec un identifiant Twilio valide : SMS livré ; cela ne prouve pas qu’une clinique a lu le message ou accepté la prise en charge.
- Certains envois échouent : résultat partiel avec nombre d’échecs.

L’appel d’envoi expire après dix secondes par clinique. Aucun symptôme, téléphone ou corps de réponse fournisseur n’est journalisé par le service SMS. Le parcours de priorité conserve son modèle IA préexistant : ce changement ne valide pas sa qualité médicale. Les mises à jour Twilio après l’envoi nécessitent un futur webhook signé ou un suivi du fournisseur ; sans celui-ci, les SMS restent honnêtement en attente dans l’écran. Une limitation partagée des alertes publiques et un processus clinique de traitement restent nécessaires à une mise en service. L’écran rappelle d’appeler le 1515 et de ne pas attendre la prise en charge.

## Vérification locale

```sh
npx vitest run tests/admin-auth.test.ts tests/doctor-store.test.ts tests/appointment-api.test.ts tests/appointments.test.ts tests/sms.test.ts tests/emergency-notifications.test.ts tests/care-workflows-ui.test.tsx
npx tsc --noEmit --incremental false
npm run build
```

Ces tests utilisent des comptes et numéros de test, des réponses simulées de fournisseurs et un stockage isolé. Ils ne contactent pas de patient, n’envoient pas de SMS et ne prouvent pas la configuration d’un projet Supabase ou Twilio en production.

Le script SQL de vérification exécute la migration sur PostgreSQL via PGlite, en base jetable, avec des rôles comparables à ceux de Supabase :

```sh
npm install --prefix /tmp/samasante-sql-check --ignore-scripts @electric-sql/pglite@0.3.14
NODE_PATH=/tmp/samasante-sql-check/node_modules node scripts/verify-appointment-schema.cjs
```
