import { useState, useCallback, useEffect } from 'react';

export function useOAuthToken(scopes: string[]) {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // In production/preview environments, be careful with origin checks if necessary
      // For now, accepting messages from the parent window
      if (event.data?.type === 'OAUTH_TOKEN_RESPONSE') {
        setIsLoading(false);
        if (event.data.error) {
          setError(event.data.error);
        } else if (event.data.token) {
          setToken(event.data.token);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const requestToken = useCallback(() => {
    setIsLoading(true);
    setError(null);
    window.parent.postMessage({ type: 'REQUEST_OAUTH_TOKEN', scopes }, '*');
  }, [scopes]);

  return { token, error, isLoading, requestToken };
}
