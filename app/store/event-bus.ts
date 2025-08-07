import { create } from 'zustand';
import type { Event, EventType, EventListener } from './types';

interface EventBusState {
  listeners: Map<EventType, Set<EventListener>>;
  history: Event[];
  // Actions
  emit: <T>(type: EventType, payload?: T) => void;
  on: <T>(type: EventType, listener: EventListener<T>) => () => void;
  off: <T>(type: EventType, listener: EventListener<T>) => void;
  clear: () => void;
  getHistory: (type?: EventType) => Event[];
}

export const useEventBus = create<EventBusState>((set, get) => ({
  listeners: new Map(),
  history: [],

  emit: <T>(type: EventType, payload?: T) => {
    const event: Event<T> = {
      type,
      payload,
      timestamp: Date.now(),
    };

    set((state) => ({
      history: [...state.history.slice(-99), event], // Keep last 100 events
    }));

    const listeners = get().listeners.get(type);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(event);
        } catch (error) {
          console.error(`Event listener error for ${type}:`, error);
        }
      });
    }
  },

  on: <T>(type: EventType, listener: EventListener<T>) => {
    const { listeners } = get();
    
    if (!listeners.has(type)) {
      listeners.set(type, new Set());
    }
    
    listeners.get(type)!.add(listener);
    
    set({ listeners: new Map(listeners) });
    
    // Return unsubscribe function
    return () => {
      get().off(type, listener);
    };
  },

  off: <T>(type: EventType, listener: EventListener<T>) => {
    const { listeners } = get();
    const typeListeners = listeners.get(type);
    
    if (typeListeners) {
      typeListeners.delete(listener);
      if (typeListeners.size === 0) {
        listeners.delete(type);
      }
      set({ listeners: new Map(listeners) });
    }
  },

  clear: () => {
    set({
      listeners: new Map(),
      history: [],
    });
  },

  getHistory: (type?: EventType) => {
    const { history } = get();
    if (type) {
      return history.filter((event) => event.type === type);
    }
    return history;
  },
}));