import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ApolloService } from '~/services/apollo-service';
import { useEventBus } from './event-bus';
import { useCharactersStore } from './characters-store';
import { useInternalStore } from './internal-store';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: number;
  duration?: number;
}

interface AppState {
  // UI State
  isOnline: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
  
  // Cache state
  lastCacheReset: number | null;
  
  // Actions
  setOnlineStatus: (isOnline: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Cache management
  clearAllCaches: () => void;
  resetAllStores: () => void;
  
  // Global error handler
  handleGlobalError: (error: Error, context?: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      theme: 'light',
      notifications: [],
      lastCacheReset: null,

      setOnlineStatus: (isOnline) => {
        set({ isOnline });
        
        if (isOnline) {
          get().addNotification({
            type: 'success',
            message: 'Connection restored',
            duration: 3000,
          });
        } else {
          get().addNotification({
            type: 'warning',
            message: 'Connection lost - working offline',
            duration: 5000,
          });
        }
      },

      setTheme: (theme) => {
        set({ theme });
        
        // Apply theme to document
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme);
        }
      },

      addNotification: (notification) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newNotification: Notification = {
          ...notification,
          id,
          timestamp: Date.now(),
        };
        
        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }));

        // Auto-remove notification after duration
        if (notification.duration) {
          setTimeout(() => {
            get().removeNotification(id);
          }, notification.duration);
        }
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      clearAllCaches: () => {
        // Clear Apollo cache
        ApolloService.clearCache();
        
        // Reset timestamp
        set({ lastCacheReset: Date.now() });
        
        // Emit event
        useEventBus.getState().emit('CACHE_CLEARED');
        
        get().addNotification({
          type: 'info',
          message: 'All caches cleared',
          duration: 3000,
        });
      },

      resetAllStores: () => {
        // Reset all Zustand stores
        useCharactersStore.getState().reset();
        useInternalStore.getState().reset();
        
        // Clear Apollo cache
        ApolloService.resetStore();
        
        set({
          notifications: [],
          lastCacheReset: Date.now(),
        });
        
        useEventBus.getState().clear();
        
        get().addNotification({
          type: 'info',
          message: 'Application state reset',
          duration: 3000,
        });
      },

      handleGlobalError: (error, context = 'Unknown') => {
        console.error(`Global error in ${context}:`, error);
        
        get().addNotification({
          type: 'error',
          message: `Error in ${context}: ${error.message}`,
          duration: 5000,
        });
        
        useEventBus.getState().emit('ERROR_OCCURRED', {
          source: context,
          error: error.message,
          stack: error.stack,
        });
      },
    }),
    {
      name: 'app-store',
      partialize: (state) => ({
        theme: state.theme,
        lastCacheReset: state.lastCacheReset,
      }),
      skipHydration: true,
    }
  )
);

// Selector hooks
export const useOnlineStatus = () => useAppStore((state) => state.isOnline);
export const useTheme = () => useAppStore((state) => state.theme);
export const useNotifications = () => useAppStore((state) => state.notifications);