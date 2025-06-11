import { collection, addDoc, doc, getDoc, updateDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { RendezVous } from '@/types/firestore';

const COLLECTION_NAME = 'rendezVous';

export async function createAppointment(data: RendezVous): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
  return docRef.id;
}

export async function getAppointment(id: string): Promise<RendezVous | null> {
  const snap = await getDoc(doc(db, COLLECTION_NAME, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as RendezVous) };
}

export async function updateAppointment(id: string, data: Partial<RendezVous>): Promise<void> {
  await updateDoc(doc(db, COLLECTION_NAME, id), data);
}

export async function deleteAppointment(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
}

export async function getAppointmentsForUser(userId: string): Promise<RendezVous[]> {
  const q = query(collection(db, COLLECTION_NAME), where('jefandikukat_id', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as RendezVous) }));
}
