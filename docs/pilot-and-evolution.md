# Pilote et extensions de SamaSanté

Les recommandations de croissance demandent des décisions et partenaires réels. Ces fiches rendent leur préparation exploitable ; elles n’inventent ni contrat, capacité de soins, paiement ou validation médicale. La revue des contenus médicaux est expressément exclue du chantier actuel.

## Pilote limité — E01

Pour chaque partenaire : raison sociale, personne habilitée, qualification contrôlée, zone couverte, horaires, coordonnées vérifiées, consentement aux SMS, opérateur chargé des demandes, délai attendu de réponse et canal de secours. Faire confirmer ces éléments avant d’insérer le partenaire dans la configuration. Un accusé dans l’administration est une réception par l’opérateur ; une consultation réalisée doit être mesurée séparément.

Suivre chaque semaine les demandes reçues, confirmées, annulées, rendez-vous réalisés selon retour partenaire, délai de confirmation, no-show, échecs SMS, temps de réponse opérateur, abandons et incompréhensions FR/Wolof. Utiliser le modèle [pilot-metrics.csv](./pilot-metrics.csv), sans téléphone, nom ou symptômes. Mesurer les coûts réels IA/SMS/base/support et le coût par demande traitée, pas seulement le coût par texte généré. Le code ne collecte pas de statistiques de santé ou de navigation supplémentaires.

Le lancement requiert un responsable de l’exploitation, des données et du recours clinique. Faire relire l’interface Wolof par des locuteurs, tester dictée refusée/indisponible, clavier, lecteurs d’écran et appareils/réseaux visés. La notice contient l’inventaire technique ; l’identité juridique, la région, la conservation et les démarches applicables sont à compléter avec le responsable réel. Le questionnaire et les protocoles cliniques demandent un référent compétent ; ce document ne les valide pas.

Arrêter le pilote si une demande affiche un succès sans persistance, des données d’un autre patient apparaissent, un statut de livraison est inventé, les partenaires sont indisponibles ou le recours humain échoue. Consigner les incidents et corriger avant reprise.

## Visio — E02

Décider avec un partenaire si la téléconsultation est pertinente et autorisée, puis choisir un prestataire, la responsabilité de prise en charge, les rendez-vous éligibles, consentement, identité, qualité réseau et recours en panne. Critères techniques : accès à une seule consultation autorisée, lien court et révocable, pas d’enregistrement par défaut, logs sans contenu, test de connexion interrompue et coûts observés. L’interface actuelle ne vend pas de consultation vidéo.

## Paiement — E03

Définir offre/prix, bénéficiaire, facture, prestataire mobile local, remboursements, litiges et rapprochement avant de brancher une API. Critères techniques : webhook signé, idempotence, montant et bénéficiaire calculés serveur, états en attente/payé/remboursé vérifiables, aucune confirmation fondée sur un retour navigateur. Préparer des essais dans le sandbox du prestataire choisi. Les consignes et contacts d’urgence restent accessibles sans paiement. Aucun débit réel n’est introduit.

## Suivi chronique et aidants — E04

Choisir un protocole et un praticien responsable avant de stocker une série de mesures ou de générer des rappels. Pour un aidant, obtenir une autorisation par patient, limitée et révocable ; interdire une visibilité fondée seulement sur le téléphone ou le lien familial déclaré. Critères techniques : séparation des personnes par RLS, droits minimaux, export/suppression, journal d’accès, notifications consenties sans détails médicaux inutiles. Les mineurs exigent un parcours distinct décidé par les responsables ; la conversation actuelle conserve son contrôle d’âge.

## Décision d’extension

Enregistrer pour chaque piste : problème observé, preuve du pilote, partenaire signataire, décision clinique/juridique attendue, fournisseur choisi, budget, critères d’acceptation, responsable, date de revue et statut. Les nouvelles fonctions dépendantes de ces choix ne sont pas présentées comme opérationnelles dans le site.
