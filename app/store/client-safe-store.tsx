import { useEffect, useState } from 'react';

// Hook to check if we're on the client side
export function useIsClient() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

// Higher-order component to wrap client-only functionality
export function ClientOnly({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const isClient = useIsClient();

  if (!isClient) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Safe store hook wrapper that prevents hydration issues
export function useSafeStore<T>(
  useStore: () => T,
  selector?: (state: T) => any
): any {
  const isClient = useIsClient();
  const storeValue = useStore();
  
  // During SSR, return safe defaults
  if (!isClient) {
    if (selector) {
      // Try to return a safe default for the selector
      try {
        return selector(storeValue);
      } catch {
        return undefined;
      }
    }
    return storeValue;
  }

  return selector ? selector(storeValue) : storeValue;
}