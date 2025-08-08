import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface AppState {
  isOnline: boolean;
  theme: 'light' | 'dark';
  notifications: string[];
  setOnlineStatus: (status: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (message: string) => void;
  clearNotifications: () => void;
}

export const useAppStore = create<AppState>()(
  subscribeWithSelector(
    (set) => ({
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      theme: 'light',
      notifications: [],
      setOnlineStatus: (status: boolean) => set({ isOnline: status }),
      setTheme: (theme: 'light' | 'dark') => set({ theme }),
      addNotification: (message: string) => 
        set((state) => ({ notifications: [...state.notifications, message] })),
      clearNotifications: () => set({ notifications: [] }),
    })
  )
);

// Individual hooks for convenience
export const useOnlineStatus = () => useAppStore((state) => state.isOnline);
export const useTheme = () => useAppStore((state) => state.theme);
export const useNotifications = () => useAppStore((state) => state.notifications);