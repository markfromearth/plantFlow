import { useState, useCallback, useEffect } from 'react';
import { googleSignIn, initAuth, logout } from '../authService';
import { User } from 'firebase/auth';

export function useOAuthToken() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setUser(user);
        setToken(token);
        setNeedsAuth(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const requestToken = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setToken(result.accessToken);
        setUser(result.user);
        setNeedsAuth(false);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    setToken(null);
    setUser(null);
    setNeedsAuth(true);
  }, []);

  return { token, user, needsAuth, error, isLoading, requestToken, logout: handleLogout };
}
