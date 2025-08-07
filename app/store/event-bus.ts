import { create } from 'zustand';
interface EventBusState {
  emit: (event: string, payload: any) => void;
  subscribe: (event: string, callback: (payload: any) => void) => () => void;
  listeners: Record<string, Array<(payload: any) => void>>;
}

export const useEventBus = create<EventBusState>((set, get) => ({
  listeners: {},

  emit: (event: string, payload: any) => {
    const { listeners } = get();
    const eventListeners = listeners[event] || [];
    eventListeners.forEach(callback => callback(payload));
  },

  subscribe: (event: string, callback: (payload: any) => void) => {
    const { listeners } = get();
    const eventListeners = listeners[event] || [];
    eventListeners.push(callback);
    
    set({ 
      listeners: { 
        ...listeners, 
        [event]: eventListeners 
      } 
    });

    // Return unsubscribe function
    return () => {
      const { listeners: currentListeners } = get();
      const currentEventListeners = currentListeners[event] || [];
      const updatedListeners = currentEventListeners.filter(cb => cb !== callback);
      
      set({
        listeners: {
          ...currentListeners,
          [event]: updatedListeners
        }
      });
    };
  }
}));