/**
 * @fileOverview TypeScript interfaces for Firestore data structures.
 */

export interface Timestamp {
  seconds: number;
  nanoseconds: number;
}

export interface Utilisateur {
  id?: string; // Document ID, usually same as auth uid
  tur: string; // nom / name
  email: string; // email
  nomero_telefon?: string; // numéro de téléphone / phone number
  istorik_sante?: string; // historique de santé / health history
  sossée_ci: Timestamp; // créé le / created at
  langue_preferee?: 'fr' | 'en' | 'wo'; // langue préférée / preferred language
  role?: 'user' | 'admin' | 'modou'; // For role-based access control
}

export interface ArticleSante {
  id?: string;
  titr: string; // titre / title
  kontaan: string; // contenu / content
  kategori: string; // catégorie / category
  dat_publication: Timestamp; // date de publication / publication date
  auteur_id?: string; // Author's user ID
}

export interface RemedeTraditionnel {
  id?: string;
  tur: string; // nom / name
  deskripsion: { // description (multilingual)
    fr: string;
    en: string;
    wo: string;
  };
  ndaw_ga_mu_faj?: string[]; // symptômes que ça traite / symptoms it treats (array of strings)
  jefandikoo: { // utilisation / usage (multilingual)
    fr: string;
    en: string;
    wo: string;
  };
  prekosyon: { // précautions / precautions (multilingual)
    fr: string;
    en: string;
    wo: string;
  };
  imageUrl?: string; // URL de l'image / Image URL
  valide_par_doktoor?: boolean; // Validé par un médecin / Validated by doctor
  source_tradipraticien?: string; // Source tradipraticien / Traditional practitioner source
}

export interface MessageChat {
  jefandikukat_id: string; // utilisateur_id / user_id (or 'AI')
  text: string;
  timestamp: Timestamp;
}

export interface HistoriqueChat {
  id?: string;
  jefandikukat_id: string; // utilisateur_id / user_id
  timestamp_debut: Timestamp; // timestamp of chat start
  timestamp_fin?: Timestamp; // timestamp of chat end
  mesaas: MessageChat[]; // messages / messages
  langue: 'fr' | 'en' | 'wo' | 'pulaar'; // Language of the chat
}

export interface RendezVous {
  id?: string;
  jefandikukat_id: string; // utilisateur_id / user_id
  doktoor_id: string; // medecin_id / doctor_id
  dat: Timestamp; // date
  estatu: 'planifie' | 'termine' | 'annule'; // statut / status (planned, completed, cancelled)
  motif?: string; // Reason for appointment
  notes_doktoor?: string; // Doctor's notes
  notes_jefandikukat?: string; // User's notes
}
