import { collection, doc, getDocs, getDoc, addDoc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { Booking, BookingStatus } from './models';

const COLLECTION_NAME = 'bookings';

export async function listBookings(status?: BookingStatus): Promise<Booking[]> {
  const bookingsCol = collection(db, COLLECTION_NAME);
  let q = query(bookingsCol, orderBy('createdAt', 'desc'));
  
  if (status) {
    q = query(bookingsCol, where('status', '==', status), orderBy('createdAt', 'desc'));
  }
  
  const bookingsSnapshot = await getDocs(q);
  return bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
}

export async function getBooking(id: string): Promise<Booking | null> {
  const bookingDoc = doc(db, COLLECTION_NAME, id);
  const bookingSnapshot = await getDoc(bookingDoc);
  if (!bookingSnapshot.exists()) {
    return null;
  }
  return { id: bookingSnapshot.id, ...bookingSnapshot.data() } as Booking;
}

export async function createBooking(payload: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
  const bookingsCol = collection(db, COLLECTION_NAME);
  const createdAt = new Date().toISOString();
  const bookingData = { ...payload, createdAt };
  const docRef = await addDoc(bookingsCol, bookingData);
  return { id: docRef.id, ...bookingData } as Booking;
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<void> {
  const bookingDoc = doc(db, COLLECTION_NAME, id);
  await updateDoc(bookingDoc, { status });
}
