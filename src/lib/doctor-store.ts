import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { Doctor } from '@/types/doctor';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'doctors.json');

const FALLBACK_DOCTORS: Doctor[] = [
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

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readDoctors(): Doctor[] {
  ensureDataDir();

  if (!fs.existsSync(DATA_FILE)) {
    // Initialize with fallback doctors
    fs.writeFileSync(DATA_FILE, JSON.stringify(FALLBACK_DOCTORS, null, 2), 'utf-8');
    return FALLBACK_DOCTORS;
  }

  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) {
      console.error('doctor-store: data/doctors.json does not contain an array, returning fallback');
      return FALLBACK_DOCTORS;
    }
    return data as Doctor[];
  } catch (error) {
    console.error('doctor-store: Failed to parse data/doctors.json, returning fallback', error);
    return FALLBACK_DOCTORS;
  }
}

function writeDoctors(doctors: Doctor[]): void {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(doctors, null, 2), 'utf-8');
}

export async function getAllDoctors(): Promise<Doctor[]> {
  return readDoctors();
}

export async function getDoctorById(id: string): Promise<Doctor | undefined> {
  const doctors = readDoctors();
  return doctors.find((d) => d.id === id);
}

export async function createDoctor(data: Omit<Doctor, 'id'>): Promise<Doctor> {
  const doctors = readDoctors();
  const newDoctor: Doctor = {
    ...data,
    id: `dr-${crypto.randomUUID()}`,
  };
  doctors.push(newDoctor);
  writeDoctors(doctors);
  return newDoctor;
}

export async function updateDoctor(
  id: string,
  data: Partial<Omit<Doctor, 'id'>>
): Promise<Doctor> {
  const doctors = readDoctors();
  const index = doctors.findIndex((d) => d.id === id);
  if (index === -1) {
    throw new Error('Médecin introuvable');
  }
  const updated: Doctor = { ...doctors[index], ...data };
  doctors[index] = updated;
  writeDoctors(doctors);
  return updated;
}

export async function deleteDoctor(id: string): Promise<boolean> {
  const doctors = readDoctors();
  const index = doctors.findIndex((d) => d.id === id);
  if (index === -1) {
    throw new Error('Médecin introuvable');
  }
  doctors.splice(index, 1);
  writeDoctors(doctors);
  return true;
}
