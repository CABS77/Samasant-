# Administration, alertes et rendez-vous

Les mutations REST et Server Actions exigent une session serveur. Un indicateur client ne donne aucun droit. Les réservations restent des **demandes** tant qu’un opérateur autorisé ne les confirme pas. Un SMS accepté, livré et un accusé humain constituent trois états distincts ; aucun ne garantit un soin.

## Configuration

Utiliser [.env.example](../.env.example), sans commettre les valeurs réelles. Les clés serveur ne doivent jamais avoir de préfixe `NEXT_PUBLIC_`.

| Paramètre | Usage |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Projet Auth et lecture des seules demandes du patient |
| `SUPABASE_SERVICE_ROLE_KEY` | Accès serveur privilégié, après vérification de l’identité |
| `ADMIN_USER_IDS` | UUID des comptes individuels Supabase autorisés, séparés par virgules |
| `ADMIN_SESSION_SECRET` | Secret aléatoire d’au moins 32 caractères |
| `ADMIN_PASSWORD` | Développement local uniquement, au moins 16 caractères ; ignoré en production |
| `AI_QUOTA_SECRET` | Secret HMAC pour pseudonymiser les adresses réseau ; utilise le secret de session si absent |
| `AI_DAILY_BUDGET_REQUESTS` | Budget partagé de requêtes IA, défaut 1000, plafond 10000 |
| `AI_PROVIDER`, clés du fournisseur | Claude ou DeepSeek ; pas de repli automatique vers un autre fournisseur en cas de panne |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` | Compte/expéditeur autorisés ; destinataires vérifiés |
| `EMERGENCY_CLINICS_JSON` | Partenaires consentants : id, nom, téléphone E.164, latitude et longitude |
| `SMS_OUTBOX_KEY` | Clé AES-GCM de 32 octets aléatoires, en 64 caractères hexadécimaux |
| `TWILIO_STATUS_CALLBACK_URL` | URL HTTPS exacte `/api/notifications/twilio`, sur le domaine déployé |
| `MAPBOX_TOKEN`, `NEXT_PUBLIC_MAPBOX_TOKEN` | Recherche manuelle serveur et annuaire géographique client, optionnels |
| `CRON_SECRET` | Secret d’au moins 32 caractères pour la maintenance |
| `APPOINTMENT_RETENTION_DAYS` | Choix explicite entre 30 et 365 jours ; la maintenance refuse une configuration absente |

Les secrets HMAC/AES et de vérification Twilio doivent être les véritables valeurs serveur dans l’hébergement. Un secret réseau injecté par le proxy cloud peut être un substitut utilisable pour une requête sortante, pas une clé cryptographique. Ne pas utiliser ce substitut pour signer des cookies, chiffrer la queue ou vérifier un webhook.

## Mise en service

1. Sauvegarder le projet cible, puis appliquer **toutes** les migrations dans `supabase/migrations`, dans l’ordre. Elles sont additives ; aucune ancienne table n’est supprimée, aucun médecin fictif n’est ajouté en production.
2. Activer les liens de connexion par e-mail et le MFA TOTP Supabase. Autoriser les URL de retour `/appointments` et `/admin` pour le domaine concerné. Configurer un expéditeur d’e-mail réellement opérationnel.
3. Créer les comptes individuels, vérifier leurs identités et placer leurs UUID dans `ADMIN_USER_IDS`. Le rôle ne vient jamais des métadonnées modifiables par le patient. `/admin` propose l’enrôlement TOTP ; seul un jeton vérifié par Auth au niveau `aal2` ouvre la session.
4. Configurer les variables dans l’hébergement et reconstruire. Les variables publiques sont intégrées au build.
5. Ajouter uniquement des praticiens et partenaires vérifiés. Tester avec des identités et numéros de test autorisés, sans donnée réelle de santé.
6. Contrôler la demande persistée, la collision de créneau, les lectures de deux patients, confirmation/annulation et l’export/suppression. Tester séparément l’acceptation Twilio, le webhook signé et l’accusé humain dans l’administration.

Les cookies administrateurs sont signés, HttpOnly, Secure, SameSite strict et expirent après une heure. Chaque session individuelle possède une ligne révocable en base, vérifiée à chaque mutation. La déconnexion révoque cette ligne avant d’effacer le cookie. Retirer l’UUID de l’allowlist ou changer le secret invalide également l’accès. En cas de panne de la base, les opérations protégées échouent.

## Réservations

Auth vérifie le jeton côté serveur ; l’identité du patient ne provient jamais du corps JSON. Les dates passées, jours indisponibles, heures hors 8h–11h30 et 14h–17h30, champs inconnus et demandes vidéo sont refusés. Les créneaux suivent `Africa/Dakar`, avec un horizon de 366 jours. Un index unique protège chaque créneau actif ; une annulation le libère. La clé de requête permet une reprise sans doublon et refuse un contenu différent.

Les patients lisent uniquement leurs propres lignes via RLS et n’écrivent pas directement dans la base. L’export et la suppression utilisent l’identité vérifiée, une réponse non mise en cache et une confirmation explicite pour la suppression. Supprimer ses demandes annule également les réservations confirmées et libère les créneaux. Le compte de connexion reste actif.

L’annuaire local est marqué comme démonstration. Une panne ne crée aucun praticien de repli. Sur Vercel sans base, l’annuaire et les réservations affichent leur indisponibilité. Aucun SMS de confirmation ou service vidéo n’est promis. Les demandes en attente doivent être traitées par l’équipe : leur expiration automatique n’est pas un mécanisme de gestion d’agenda.

## Alertes

Le lien d’appel au 1515 reste accessible sans IA, quota, localisation ou connexion. La localisation est facultative, demandée explicitement ; la saisie d’un lieu utilise un fournisseur réel. L’analyse automatique ne permet jamais d’exclure une urgence.

Les messages de la queue sont chiffrés AES-GCM et idempotents. Trois partenaires distincts au maximum, dans un rayon de 10 km, sont sélectionnés. Aucun contact de Mapbox ne devient automatiquement partenaire. Le numéro du patient ne devient jamais destinataire de l’alerte.

Un travail est revendiqué atomiquement avant l’appel Twilio. Un échec réseau peut cacher un envoi réellement accepté : il devient `unknown` et n’est pas renvoyé automatiquement. Un envoi accepté devient `accepted`, sans annonce de livraison. Le webhook valide la signature Twilio, le compte et l’identifiant du message ; un ancien statut ne rétrograde jamais une livraison. Le corps chiffré est effacé après traitement. La référence privée de suivi transmet son jeton uniquement dans un POST, pas dans une URL.

Une actualisation avec la référence valide peut reprendre un travail encore en queue pendant dix minutes. La maintenance marque les travaux trop anciens comme échoués ou inconnus, sans envoi tardif d’alerte. Le cron quotidien n’est **pas** un service de dispatch continu ; un pilote exige un opérateur et, selon le volume, un worker supervisé plus fréquent. L’accusé humain dans `/admin` prouve une réception par un opérateur autorisé, pas par le médecin destinataire ni une prise en charge.

## IA et quotas

Toutes les Server Actions IA utilisent le même compteur PostgreSQL que la conversation : 7 requêtes par réseau et jour, avec un budget global. Les tentatives de connexion (5/15 min) et alertes (3/h) sont également partagées. Les adresses sont pseudonymisées par HMAC ; supprimer le stockage local ou changer un identifiant d’appareil ne remet pas le compteur serveur à zéro. Sur Vercel, seul l’en-tête réécrit par sa périphérie est utilisé ; un autre hébergement doit réécrire les en-têtes dans un proxy de confiance.

Les requêtes fournisseur ont un délai de 15 secondes, aucun retry automatique SDK, un plafond de 2048 tokens et un circuit après trois échecs pendant 30 secondes. Le budget compte les tentatives et borne la dépense ; il ne constitue pas un plafond monétaire garanti. Les prix réels et le modèle Claude configuré doivent être vérifiés chez le fournisseur.

## Vérification

```sh
npm ci
npm run quality
npm run verify:db
npm audit --omit=dev --audit-level=high
npm run build
npx playwright install chromium
npm run verify:browser
```

Les tests utilisent des données jetables et des fournisseurs simulés. Les contrôles SQL exécutent réellement PostgreSQL via PGlite et restaurent une base de test. Les contrôles navigateur lancent le build de production isolé, sans accès à un patient ou envoi de SMS. Ils ne prouvent pas la configuration de Supabase, Vercel, Twilio ni une restauration de production.
