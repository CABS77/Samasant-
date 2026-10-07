# Exploitation et incidents

## Livraison

Le workflow `Required application checks` exécute lint, typage, tests, migrations/RLS, audit des dépendances de production, build et navigateur. Aucun échec n’est ignoré. La configuration GitHub doit rendre le job requis sur `main` et interdire les contournements ; ce réglage distant n’est pas créé par le fichier YAML. Vercel doit attendre cette vérification avant promotion. La branche contient les changements, elle n’atteste pas de leur déploiement.

Les migrations sont additives et doivent précéder le build déployé. Créer une sauvegarde avant toute migration. Utiliser un projet de recette et des comptes de test ; appliquer ensuite les migrations au projet identifié et observer `/api/healthz`, puis les parcours protégés. Ne pas changer simultanément la politique de conservation et les règles métier de réservation.

## Surveillance

| Signal | Interprétation | Réaction |
|---|---|---|
| `/api/healthz` 503 | Base/configuration/schéma indisponible | Contrôler migrations, clés, réseau et incident Supabase |
| `/api/healthz` 200 | Schéma base présent, pas une preuve de disponibilité clinique ou fournisseur | Vérifier séparément les parcours de recette |
| Journal IA `service/provider/outcome/durationMs` | Latence/échec technique sans texte médical | Alerter sur taux d’échec ou latence anormale ; vérifier fournisseur/budget |
| 429 IA | Quota réseau ou budget global épuisé | Ne pas multiplier les clés ; vérifier coût et besoin avant ajustement |
| SMS `queued/processing` récent | Travail sans résultat définitif | Actualiser avec la référence ; suivre le worker/opérateur |
| SMS `unknown` | Résultat transport ambigu | Vérifier dans Twilio par référence, ne pas relancer automatiquement |
| SMS `accepted` | Fournisseur a accepté ; livraison encore inconnue | Vérifier callback et état fournisseur, ne pas annoncer un soin |
| Maintenance 401/503 | Secret, durée, base ou worker non configuré | Corriger la configuration et rejouer avec autorisation |

Configurer un moniteur externe de `/api/healthz` et les alertes de logs dans l’hébergeur choisi. Le code n’inscrit aucun destinataire à des alertes et ne crée pas de compte de supervision. Éviter les captures de corps de requêtes/réponses dans les traces, APM, exports de logs et tickets. Les journaux de modifications stockent entité, identifiant, action et date ; les sessions identifient l’opérateur. Les mutations de médecins/rendez-vous ne portent pas encore toutes un acteur individuel dans le journal SQL : ne pas présenter ce journal minimal comme une piste d’audit réglementaire complète.

## Conservation

Choisir explicitement `APPOINTMENT_RETENTION_DAYS` avec le responsable des données. Le cron Vercel à 03h UTC appelle une route protégée par `CRON_SECRET` ; il ne fonctionne qu’après déploiement et configuration. La maintenance supprime les demandes dont la date du rendez-vous dépasse la durée choisie, les alertes SMS de plus de 7 jours, les sessions expirées depuis 7 jours, les compteurs expirés et les événements minimaux de plus d’un an. Les sauvegardes possèdent leur propre rétention à documenter. La notice doit être adaptée aux décisions effectives de l’exploitant.

## Sauvegarde et restauration

1. Identifier projet, région, tables, Auth, Storage éventuel et rôles ; noter sans copier de secrets les objectifs RPO/RTO décidés et l’opérateur responsable.
2. Activer/vérifier les sauvegardes et le PITR disponibles dans l’offre Supabase. Une sauvegarde SQL seule ne couvre pas automatiquement les utilisateurs Auth, fichiers et secrets de l’hébergement.
3. Restaurer dans **un projet isolé**, jamais directement sur la production pour un exercice. Bloquer les envois Twilio et e-mail ; utiliser uniquement des fixtures ou données correctement protégées.
4. Vérifier comptes/lignes, schéma, politiques RLS, nombre de médecins et demandes, références, collisions, lecture de deux identités, révocation et état des notifications. Ne pas renvoyer d’anciennes alertes restaurées.
5. Mesurer la durée et enregistrer résultat, date, version de sauvegarde, périmètre couvert et anomalies. Détruire l’environnement d’exercice selon la politique choisie.

`npm run verify:db` exerce une sauvegarde/restauration **jetable**, pas les sauvegardes cloud réelles. Le premier exercice cloud reste à réaliser avec accès au projet et responsable identifié.

## Retour arrière

Conserver le précédent déploiement validé. En cas de régression, désactiver la promotion et revenir à cette version depuis Vercel. Les nouvelles tables peuvent rester en place ; ne pas les supprimer pour revenir au code. Une version antérieure aux protections d’administration ne doit pas être réactivée sur un site exposé. Ne pas restaurer une ancienne base sans rapprocher les demandes créées depuis la sauvegarde ; cela peut perdre des réservations ou libérer des créneaux à tort. Faire traiter les demandes urgentes par le canal humain pendant l’incident.

## Fiche d’incident

Enregistrer : identifiant, heure UTC de début/détection, service touché, impact quantifié sans données de santé, version déployée, responsable, état de recours humain, actions et heure de rétablissement, vérification des rendez-vous/alertes, cause et correctif. Les communications aux patients et autorités relèvent des personnes habilitées ; aucun envoi externe automatique n’est réalisé par cette procédure.
