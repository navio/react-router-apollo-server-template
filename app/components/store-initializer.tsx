import { useEffect } from 'react';
import { useAppStore } from '~/store/app-store';

export function StoreInitializer() {
  const { setOnlineStatus, setTheme } = useAppStore();

  useEffect(() => {
    // Initialize online status
    if (typeof navigator !== 'undefined') {
      setOnlineStatus(navigator.onLine);
      
      const handleOnline = () => setOnlineStatus(true);
      const handleOffline = () => setOnlineStatus(false);
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [setOnlineStatus]);

  useEffect(() => {
    // Rehydrate persisted store on client
    if (typeof window !== 'undefined') {
      useAppStore.persist.rehydrate();
    }
  }, []);

  return null;
}