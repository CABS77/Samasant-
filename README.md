# SamaSanté

Application d’information et d’orientation en français et wolof, avec conversation IA, catalogue traditionnel, recherche géographique et demandes de rendez-vous persistées. Une demande attend la confirmation de l’opérateur ; un SMS accepté ne prouve ni sa livraison ni une prise en charge. Le catalogue et les réponses IA n’ont pas été validés médicalement par ce chantier.

Node.js 22.14+ est requis. Installer avec `npm ci`, puis utiliser `.env.example` et `npm run dev` pour le développement. Sans base, l’annuaire local est une démonstration explicite et les réservations sont indisponibles. L’administration de production utilise des comptes individuels Supabase avec MFA et sessions révocables.

- [Installation et parcours protégés](docs/secure-care-workflows.md)
- [Exploitation, incidents et restauration](docs/operations.md)
- [Pilote et pistes d’évolution](docs/pilot-and-evolution.md)
- [Suivi des recommandations de l’audit](docs/audit-follow-up.md)

Pour vérifier une livraison : `npm run quality`, `npm run verify:db`, `npm audit --omit=dev --audit-level=high`, `npm run build`, puis `npm run verify:browser` après installation de Chromium par Playwright. La CI exécute ces contrôles. Les fournisseurs, e-mails et SMS des tests sont simulés ; leur configuration réelle doit être vérifiée dans l’hébergement.
