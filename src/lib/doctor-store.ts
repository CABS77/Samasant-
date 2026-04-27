import type { Doctor } from '@/types/doctor';

/**
 * Doctor Store — Stockage en mémoire avec persistance optionnelle sur disque.
 * 
 * Sur Vercel (filesystem read-only), les données vivent en mémoire.
 * En local, les données sont aussi persistées dans data/doctors.json.
 * Les modifications sur Vercel sont perdues au redéploiement.
 */

const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'dr-1',
    name: 'Dr. Aminata Diallo',
    specialty: 'Généraliste',
    location: 'Dakar',
    bio: "Médecin généraliste avec 12 ans d'expérience. Spécialisée dans la médecine familiale et la prévention.",
    available: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'],
    rating: 4.8,
    reviews: 124,
  },
  {
    id: 'dr-2',
    name: 'Dr. Ousmane Ndiaye',
    specialty: 'Cardiologie',
    location: 'Dakar',
    bio: "Cardiologue certifié, ancien chef de service à l'Hôpital Principal de Dakar.",
    available: ['Lun', 'Mer', 'Ven'],
    rating: 4.9,
    reviews: 89,
  },
  {
    id: 'dr-3',
    name: 'Dr. Fatou Sow',
    specialty: 'Pédiatrie',
    location: 'Thiès',
    bio: 'Pédiatre passionnée par la santé infantile. Consultations en français et wolof.',
    available: ['Mar', 'Jeu', 'Sam'],
    rating: 4.7,
    reviews: 156,
  },
  {
    id: 'dr-4',
    name: 'Dr. Ibrahima Fall',
    specialty: 'Dermatologie',
    location: 'Dakar',
    bio: 'Dermatologue spécialisé dans les affections cutanées tropicales.',
    available: ['Lun', 'Mar', 'Jeu'],
    rating: 4.6,
    reviews: 67,
  },
  {
    id: 'dr-5',
    name: 'Dr. Mariama Ba',
    specialty: 'Gynécologie',
    location: 'Saint-Louis',
    bio: 'Gynécologue-obstétricienne avec une approche bienveillante et culturellement adaptée.',
    available: ['Mer', 'Ven', 'Sam'],
    rating: 4.9,
    reviews: 203,
  },
  {
    id: 'dr-6',
    name: 'Dr. Moussa Diop',
    specialty: 'Généraliste',
    location: 'Kaolack',
    bio: 'Médecin de terrain, engagé pour la santé rurale. Consultations vidéo disponibles.',
    available: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
    rating: 4.5,
    reviews: 98,
  },
];

// Store en mémoire — initialisé avec les données par défaut
let doctorsStore: Doctor[] = [...INITIAL_DOCTORS];
let initialized = false;

/**
 * Tente de charger les données depuis le disque (local uniquement).
 * Sur Vercel, utilise les données en mémoire.
 */
function initFromDisk(): void {
  if (initialized) return;
  initialized = true;

  try {
    // Dynamic import pour éviter les erreurs sur les plateformes sans fs
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'data', 'doctors.json');

    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data) && data.length > 0) {
        doctorsStore = data;
      }
    }
  } catch {
    // Sur Vercel ou si le fichier n'existe pas, on garde les données en mémoire
  }
}

/**
 * Tente de persister les données sur disque (local uniquement).
 */
function persistToDisk(): void {
  try {
    const fs = require('fs');
    const path = require('path');
    const dir = path.join(process.cwd(), 'data');
    const filePath = path.join(dir, 'doctors.json');

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(doctorsStore, null, 2), 'utf-8');
  } catch {
    // Sur Vercel, l'écriture échoue silencieusement — les données restent en mémoire
  }
}

function generateId(): string {
  return `dr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export async function getAllDoctors(): Promise<Doctor[]> {
  initFromDisk();
  return [...doctorsStore];
}

export async function getDoctorById(id: string): Promise<Doctor | undefined> {
  initFromDisk();
  return doctorsStore.find((d) => d.id === id);
}

export async function createDoctor(data: Omit<Doctor, 'id'>): Promise<Doctor> {
  initFromDisk();
  const newDoctor: Doctor = {
    ...data,
    id: generateId(),
  };
  doctorsStore.push(newDoctor);
  persistToDisk();
  return newDoctor;
}

export async function updateDoctor(
  id: string,
  data: Partial<Omit<Doctor, 'id'>>
): Promise<Doctor> {
  initFromDisk();
  const index = doctorsStore.findIndex((d) => d.id === id);
  if (index === -1) {
    throw new Error('Médecin introuvable');
  }
  const updated: Doctor = { ...doctorsStore[index], ...data };
  doctorsStore[index] = updated;
  persistToDisk();
  return updated;
}

export async function deleteDoctor(id: string): Promise<boolean> {
  initFromDisk();
  const index = doctorsStore.findIndex((d) => d.id === id);
  if (index === -1) {
    throw new Error('Médecin introuvable');
  }
  doctorsStore.splice(index, 1);
  persistToDisk();
  return true;
}
