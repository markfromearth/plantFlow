import { collection, doc, getDocs, getDoc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Equipment, EquipmentStatus } from './models';

const COLLECTION_NAME = 'equipment';

export async function listEquipment(): Promise<Equipment[]> {
  const equipmentCol = collection(db, COLLECTION_NAME);
  const equipmentSnapshot = await getDocs(equipmentCol);
  return equipmentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Equipment));
}

export async function getEquipment(id: string): Promise<Equipment | null> {
  const equipmentDoc = doc(db, COLLECTION_NAME, id);
  const equipmentSnapshot = await getDoc(equipmentDoc);
  if (!equipmentSnapshot.exists()) {
    return null;
  }
  return { id: equipmentSnapshot.id, ...equipmentSnapshot.data() } as Equipment;
}

export async function addEquipment(payload: Omit<Equipment, 'id'>): Promise<Equipment> {
  const equipmentCol = collection(db, COLLECTION_NAME);
  const docRef = await addDoc(equipmentCol, payload);
  return { id: docRef.id, ...payload };
}

export async function updateEquipmentStatus(id: string, status: EquipmentStatus): Promise<void> {
  const equipmentDoc = doc(db, COLLECTION_NAME, id);
  await updateDoc(equipmentDoc, { status });
}
