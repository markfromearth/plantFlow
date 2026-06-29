import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut
} from 'firebase/auth';

import { auth, googleProvider } from './firebase';

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Google-only auth listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      // If we already have a cached token, use it
      if (cachedAccessToken && onAuthSuccess) {
        onAuthSuccess(user, cachedAccessToken);
        return;
      }

      // Try to refresh the token from the current user
      const token = await user.getIdToken();
      cachedAccessToken = token;

      if (onAuthSuccess) onAuthSuccess(user, token);
    } else {
      // No user signed in — Google login required
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;

    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Sign in error:', err.message);
    } else {
      console.error('Sign in error:', String(err));
    }
    return null;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};
