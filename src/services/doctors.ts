import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Doctor } from '@/types/doctor';

const COLLECTION_NAME = 'doctors';

export async function getDoctors(): Promise<Doctor[]> {
  const snap = await getDocs(collection(db, COLLECTION_NAME));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Doctor) }));
}
