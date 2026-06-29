import { collection, doc, getDocs, getDoc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Equipment, EquipmentStatus } from './types';

const TENANT_ID = 'plantflow-os';

export async function listEquipment(): Promise<Equipment[]> {
  const equipmentCol = collection(db, `tenants/${TENANT_ID}/inventory`);
  const equipmentSnapshot = await getDocs(equipmentCol);
  return equipmentSnapshot.docs.map(doc => ({ machine_id: doc.id, ...doc.data() } as Equipment));
}

export async function getEquipment(id: string): Promise<Equipment | null> {
  const equipmentDoc = doc(db, `tenants/${TENANT_ID}/inventory/${id}`);
  const equipmentSnapshot = await getDoc(equipmentDoc);
  if (!equipmentSnapshot.exists()) return null;
  return { machine_id: equipmentSnapshot.id, ...equipmentSnapshot.data() } as Equipment;
}

export async function addEquipment(payload: Omit<Equipment, 'machine_id'>): Promise<Equipment> {
  const equipmentCol = collection(db, `tenants/${TENANT_ID}/inventory`);
  const docRef = await addDoc(equipmentCol, payload);
  return { machine_id: docRef.id, ...payload } as Equipment;
}

export async function updateEquipmentStatus(id: string, availability_status: EquipmentStatus): Promise<void> {
  const equipmentDoc = doc(db, `tenants/${TENANT_ID}/inventory/${id}`);
  await updateDoc(equipmentDoc, { availability_status });
}
