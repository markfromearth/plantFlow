import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function uploadEquipmentImage(file: File): Promise<string> {
  const storage = getStorage();
  const uuid = typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2, 15);
    
  const storageRef = ref(storage, `equipment/${uuid}`);
  await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
}
