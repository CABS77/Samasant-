# Suivi de l’audit — mis à jour le 8 octobre 2026

Ce chantier applique les recommandations techniques restantes de l’audit, en complément des protections d’administration, alertes et réservations déjà présentes. **A03, validation des contenus médicaux, est exclu à la demande de l’utilisateur** : les textes du catalogue et les prompts médicaux n’ont pas été réécrits ni certifiés. Une interface techniquement corrigée ne constitue pas un service médical validé.

Le code est préparé sur `codex/secure-care-workflows`. Les états ci-dessous décrivent le dépôt et les contrôles locaux. Les services externes et les engagements humains ne sont pas déclarés actifs sans preuve.

| Référence | Résultat livré | Activation ou vérification extérieure restante |
|---|---|---|
| A01 | Routes REST et Server Actions médecins protégées ; tests négatifs anonymes et patients | Déployer le code testé |
| A02 | Identités individuelles autorisées, MFA TOTP, cookie signé, expiration, révocation serveur, limitation partagée ; mutations administratives attribuées atomiquement à l’opérateur ; journal privé consultable | Appliquer la nouvelle migration et configurer les UUID/comptes opérateurs ; l’historique antérieur reste sans attribution |
| A03 | **Exclu** | Aucun travail de validation médicale effectué |
| A04 | Queue chiffrée et idempotente, revendication atomique, callback Twilio signé, référence privée de suivi, accusé opérateur ; états accepté/livré/inconnu distincts | Fournisseur, expéditeur et partenaires vérifiés ; recette avec numéros autorisés et opérateur ; dispatch continu selon volume |
| A05 | Appel humain toujours visible, indépendant de l’IA, du réseau applicatif, de l’identité, du quota et de la position ; aucun message automatique n’exclut une urgence | Protocole clinique et signaux validés par référent compétent, hors validation médicale exclue |
| A06 | Next 15.5.27 et SDK actualisés, dépendances inutiles retirées, CSP à nonce, configuration unique ; zéro alerte critique/élevée de production au contrôle | Suivre les deux avis modérés indirects décrits ci-dessous et les mises à jour compatibles |
| A07 | Demandes persistées, identité vérifiée, créneaux contrôlés, collision et idempotence en base, confirmation/annulation opérateur | Projet Auth/base, médecins réels, capacité et procédure de réponse des cliniques |
| A08 | Migrations reproductibles, annuaire partagé, RLS multi-patients, journaux et conservation ; aucun seed en production | Appliquer les migrations au projet cible après sauvegarde |
| A09 | Compteur PostgreSQL commun à toutes les actions IA, quotas réseau, budget global, login/SMS, identité HMAC | Base et secrets serveur réels ; choix du budget selon coût observé |
| A10 | Transport proxy/CA, mapping de modèles/tokens vérifié, timeout, circuit et erreurs expurgées ; appel DeepSeek réel sans donnée médicale réussi | Vérifier le fournisseur Claude choisi si utilisé ; évaluation clinique des réponses non réalisée |
| A11 | Notice exacte des traitements techniques, export/suppression par identité, pas de santé/téléphone dans les journaux applicatifs ajoutés, cache privé purgé, nettoyage configuré | Identité juridique, région, durées, sauvegardes, démarches et information juridiquement validées par responsable réel |
| A12 | Unicode et ponctuation naturelle acceptés ; limites testées ; textes traités comme données | Tester les formulations des utilisateurs du pilote |
| A13 | Grilles/filtres, labels, clavier, focus, main/skip link, contrastes et réduction d’animation ; cinq pages sans débordement à quatre largeurs, axe sans défaut sérieux/critique | Lecteurs d’écran et appareils réels, états avec comptes/fournisseurs effectivement configurés |
| A14 | UI principale FR/Wolof, préférence persistée, voix choisie et facultative, arrêt micro, secours texte, localisation explicite/manuelle | Relecture humaine Wolof, compréhension terrain, disponibilité des voix navigateur ; documents juridiques et administration restent principalement en français |
| A15 | Cache uniquement public/assets, secours pour navigation hors ligne non visitée, purge des caches privés/anciens et raccourcis réels | Vérifier mise à jour des PWA déjà installées sur appareils cibles |
| A16 | Suppression du gros vendor imposé et des fontes distantes, providers réduits, catalogue paginé côté serveur ; JS partagé environ 103 kB contre 333 kB dans l’audit | LCP/INP/CLS et volume sur réseaux/appareils réels ; le build ne mesure pas les Core Web Vitals terrain |
| A17 | Tests obsolètes réparés, régressions ; `build:verified` imposé par Vercel et la CI : lint/types/tests/SQL/audit avant build ; navigateur dans le pipeline | Rendre le job requis et protéger la branche GitHub ; imposer le résultat navigateur lors de la promotion Vercel |
| A18 | Métadonnées/canoniques par page, OG réel, sitemap, admin noindex, liens réels, suppression chiffres/avis inventés et promesses vidéo/SMS | Justifier les profils ajoutés en production et l’identité de l’exploitant |
| E01 | Dossier pilote, fiche partenaires, métriques sans données personnelles et critères d’arrêt | Partenaires, responsables, entretiens, supervision et mesures terrain réels |
| E02 | Fiche visio, prérequis et critères techniques ; interface sans promesse de service actif | Prestataire, cadre, protocole et décision issus du pilote |
| E03 | Fiche offre/paiement, idempotence/webhooks/rapprochement/remboursements à exiger | Offre validée, contrats et prestataire choisi ; aucun débit réel ajouté |
| E04 | Fiche suivi chronique/aidants, autorisations et isolation requises | Protocole, mandat, partenaires et périmètre décidés ; aucun traitement automatique ajouté |
| E05 | Readiness base, journaux techniques expurgés, maintenance protégée, exercice SQL jetable de restauration, procédure incidents/sauvegardes/rollback | Surveillance et sauvegardes cloud à activer, RTO/RPO à décider, exercice production isolé et promotion/rollback hébergeur à vérifier |

## Preuves de vérification

Une installation propre avec `npm ci` a été effectuée le 7 octobre. Les commandes reproductibles sont indiquées dans [secure-care-workflows.md](./secure-care-workflows.md). Les résultats initiaux sont dans `/workspace/audits/samasante-fixes-2026-10-07` et ceux de cette continuation dans `/workspace/audits/samasante-follow-up-2026-10-08`.

- Suite applicative : **143 tests**, incluant les fournisseurs réellement résolus par Genkit avec SDK simulés, rôles/MFA/révocation, quotas, export/suppression, callback signé, chiffrement, rendez-vous, journal privé et arrêt du déploiement si un contrôle échoue.
- PostgreSQL/PGlite : **102 contrôles**, incluant RLS, anti-collision, idempotence, consommation atomique du budget, queue, statuts monotones, privilèges, attribution individuelle, annulation d’une mutation si le journal échoue, conservation et restauration jetable.
- Navigateur Chromium, build de production isolé : **10 groupes de contrôles**, dont cinq pages à 320/360/390/768 px, axe clair/sombre, préférence Wolof, clavier, CSP/SEO, services non configurés et hors ligne.
- Typage et build de production vérifiés ; lint sans erreur, avec avertissements de typage dans d’anciens tests et une image dans un composant de carte non monté.
- Audit `npm audit --omit=dev` : **0 critique, 0 élevée, 28 modérées** au contrôle. Il s’agit du nombre de paquets affectés, pas de 28 failles distinctes.
- Appel réel DeepSeek de transport : réponse texte obtenue via le proxy, sans donnée médicale (35 tokens d’entrée, 15 de sortie). Cela ne valide aucune réponse clinique.

## Dépendances modérées restantes

Les paquets indirects Genkit/Google/OpenTelemetry/UUID portent deux avis : [W3C Baggage, allocation non bornée](https://github.com/advisories/GHSA-8988-4f7v-96qf) et [UUID, bornes de tampon fourni](https://github.com/advisories/GHSA-w5hq-g745-h8pq). L’application ne propage pas les en-têtes `baggage` entrants ni ne fournit un tampon contrôlé par l’utilisateur aux versions UUID concernées ; les identifiants applicatifs utilisent `node:crypto.randomUUID`. Les exports Google et instrumentations automatiques concernés ne sont pas configurés dans l’application. Cela réduit l’exposition observée sans supprimer les paquets signalés. Leur résolution reste à suivre dans des versions compatibles de Genkit ; ne pas forcer aveuglément toutes les bibliothèques de télémétrie sur une version majeure incompatible. La CI bloque les alertes critiques et élevées et conserve le rapport des modérées.

## État distant

Le jeton Vercel est lié à l’environnement, mais les lectures de compte/projets ont retourné `403 Not authorized` ; aucune mise à jour du projet ou publication de ces correctifs n’est attestée. Le jeton de gestion Supabase demandé dans le brouillon n’a pas de liaison enregistrée, et les variables du projet ne sont pas disponibles dans la session. La politique réseau active ne comprend pas encore les destinations supplémentaires du brouillon.

Ces blocages ont été vérifiés à nouveau le 8 octobre : Vercel refuse encore les lectures de compte, projets et équipes, y compris avec le périmètre `ahmed1339`. Aucun correctif n’a été appliqué à une base distante. La nouvelle migration et les contrôles de build sont prêts dans le dépôt.

Le brouillon de configuration et les scripts sont préparés ; **enregistrer un brouillon n’applique pas les variables et ne publie pas l’environnement**. Le code, les migrations et les procédures sont livrables indépendamment de ce blocage. Aucun compte, partenaire, destinataire clinique, durée légale, contrat ou déploiement n’a été inventé.
