import { useEffect } from 'react';

/**
 * Custom hook to dynamically update document title for WCAG 2.4.2 page titling compliance.
 * @param title The title for the current view.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = `${title} | PlantFlow OS`;
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
}
