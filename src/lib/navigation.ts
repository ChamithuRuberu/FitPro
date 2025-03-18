import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function usePreventBackNavigation(isAuthenticated: boolean) {
  useEffect(() => {
    if (isAuthenticated) {
      // Push a new entry to replace the login/signup pages in history
      window.history.pushState(null, '', window.location.href);

      const handlePopState = (event: PopStateEvent) => {
        // Prevent going back by pushing another state
        window.history.pushState(null, '', window.location.href);
        event.preventDefault();
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [isAuthenticated]);
}

export function useAuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Replace the current history entry with the new URL
    // This prevents back navigation to auth pages
    router.replace(window.location.href);

    // Disable browser back/forward for this page
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [router]);
}

export function clearNavigationHistory() {
  if (typeof window !== 'undefined') {
    // Clear the current history entry
    window.history.replaceState(null, '', window.location.href);
  }
} 