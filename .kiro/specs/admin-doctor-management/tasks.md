# Tâches d'implémentation — Gestion des médecins (Admin)

## Tâche 1 : Validation Zod et schémas Doctor

- [x] 1.1 Créer `src/lib/doctor-validation.ts` avec les schémas `doctorCreateSchema` et `doctorUpdateSchema` utilisant Zod, incluant les règles : name ≥ 2 caractères, specialty non vide, available parmi ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"], rating optionnel [0,5], reviews optionnel entier ≥ 0
- [x] 1.2 Exporter les types `DoctorCreateInput` et `DoctorUpdateInput` inférés depuis les schémas Zod
- [ ] 1.3 Écrire les tests property-based pour la Propriété 2 (acceptation des données valides) et la Propriété 3 (rejet des données invalides) dans `src/lib/__tests__/doctor-validation.test.ts` en utilisant fast-check avec minimum 100 itérations chacun

## Tâche 2 : Doctor Store — couche de données JSON

- [x] 2.1 Créer `src/lib/doctor-store.ts` avec les fonctions `getAllDoctors()`, `getDoctorById()`, `createDoctor()`, `updateDoctor()`, `deleteDoctor()` qui lisent/écrivent dans `data/doctors.json`
- [x] 2.2 Implémenter la logique d'initialisation : si `data/doctors.json` n'existe pas, créer le fichier avec les 6 médecins de fallback depuis `src/services/doctors.ts`
- [x] 2.3 Implémenter la gestion d'erreur : si le fichier contient du JSON invalide, retourner les données de fallback et journaliser l'erreur
- [x] 2.4 Implémenter la génération d'identifiants uniques pour `createDoctor()` (format : `dr-{crypto.randomUUID()}`)
- [ ] 2.5 Écrire les tests property-based pour la Propriété 1 (round-trip sérialisation) et la Propriété 4 (unicité des IDs) dans `src/lib/__tests__/doctor-store.test.ts` en utilisant fast-check avec minimum 100 itérations chacun
- [ ] 2.6 Écrire les tests unitaires pour les cas limites : fichier inexistant → création fallback, fichier JSON invalide → fallback

## Tâche 3 : API Routes CRUD

- [x] 3.1 Créer `src/app/api/doctors/route.ts` avec le handler GET (retourne `getAllDoctors()`) et POST (valide avec `doctorCreateSchema`, appelle `createDoctor()`, retourne 201)
- [x] 3.2 Créer `src/app/api/doctors/[id]/route.ts` avec le handler PUT (valide avec `doctorUpdateSchema`, appelle `updateDoctor()`) et DELETE (appelle `deleteDoctor()`)
- [x] 3.3 Implémenter les réponses d'erreur : 400 pour données invalides (avec détails Zod), 404 pour id inexistant, 500 pour erreur d'écriture fichier
- [ ] 3.4 Écrire les tests d'intégration pour les 4 endpoints dans `src/app/api/doctors/__tests__/doctors-api.test.ts`

## Tâche 4 : Mise à jour du service doctors existant

- [x] 4.1 Modifier `src/services/doctors.ts` pour que `getDoctors()` appelle `fetch('/api/doctors')` au lieu de Supabase, avec fallback sur les données codées en dur en cas d'erreur
- [ ] 4.2 Écrire un test unitaire vérifiant que `getDoctors()` appelle `/api/doctors` et retourne le fallback en cas d'erreur réseau

## Tâche 5 : Composants UI admin — Formulaire et Dialog

- [x] 5.1 Créer `src/components/doctor-form-modal.tsx` : modale Dialog avec formulaire (nom, spécialité, localisation, bio, jours disponibles via checkboxes, note, avis), validation côté client avec Zod, mode création et édition (pré-remplissage)
- [x] 5.2 Créer `src/components/doctor-delete-dialog.tsx` : AlertDialog de confirmation avec nom du médecin, boutons Annuler/Supprimer
- [ ] 5.3 Écrire les tests de composants pour le formulaire modale (ouverture, pré-remplissage, validation, soumission) et le dialog de suppression (ouverture, confirmation, annulation)

## Tâche 6 : Page admin `/admin`

- [x] 6.1 Créer `src/app/admin/page.tsx` avec la liste des médecins dans un Table (nom, spécialité, localisation, note, actions), bouton "Ajouter un médecin" en haut, skeleton pendant le chargement, message d'erreur avec bouton réessayer
- [x] 6.2 Intégrer `DoctorFormModal` pour l'ajout et la modification, `DoctorDeleteDialog` pour la suppression, avec appels fetch vers les API routes et notifications toast
- [x] 6.3 Ajouter les clés de traduction admin dans `src/locales/fr/translation.json` (nav_admin, admin_title, admin_add_doctor, admin_edit, admin_delete, admin_confirm_delete, admin_success_add, admin_success_edit, admin_success_delete, admin_error)

## Tâche 7 : Navigation — Lien Admin dans la Navbar

- [x] 7.1 Modifier `src/components/navbar.tsx` pour ajouter le lien "Admin" avec icône `Settings` de lucide-react dans le tableau `links`, pointant vers `/admin`, avec le style actif existant via `isActive()`
- [x] 7.2 Ajouter la clé de traduction `nav_admin` dans `src/locales/fr/translation.json`

## Tâche 8 : Fichier de données initial

- [x] 8.1 Créer `data/doctors.json` avec les 6 médecins de fallback actuels de `src/services/doctors.ts`
- [x] 8.2 Ajouter `data/doctors.json` au `.gitignore` (les données locales ne doivent pas être versionnées en production) et créer `data/doctors.example.json` comme référence
