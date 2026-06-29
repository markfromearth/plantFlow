import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential
} from 'firebase/auth';

import firebaseConfig from '../firebase-applet-config.json';

// --- Initialise Firebase App ---
const app = initializeApp(firebaseConfig);

// --- Auth (Google only) ---
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Optional: force account selection every time
googleProvider.setCustomParameters({ prompt: 'select_account' });

// --- Firestore ---
export const db = getFirestore(app);

// --- Google Sign-In helper ---
export async function googleSignIn(): Promise<UserCredential | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Google sign-in failed:', err.message);
    } else {
      console.error('Google sign-in failed:', String(err));
    }
    return null;
  }
}

// --- Logout ---
export async function logout(): Promise<void> {
  try {
    await auth.signOut();
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Logout failed:', err.message);
    } else {
      console.error('Logout failed:', String(err));
    }
  }
}
