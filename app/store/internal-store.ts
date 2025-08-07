import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { ApolloService, type HealthCheck, type InternalDataItem, type CreateDataInput } from '~/services/apollo-service';
import type { LoadingState } from './types';
import { useEventBus } from './event-bus';

interface InternalState extends LoadingState {
  // Data
  health: HealthCheck | null;
  internalData: InternalDataItem[];
  
  // Loading states for different operations
  healthLoading: boolean;
  dataLoading: boolean;
  createLoading: boolean;
  
  // Actions
  fetchHealth: () => Promise<void>;
  fetchInternalData: () => Promise<void>;
  createInternalData: (input: CreateDataInput) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  isLoading: false,
  error: null,
  health: null,
  internalData: [],
  healthLoading: false,
  dataLoading: false,
  createLoading: false,
};

export const useInternalStore = create<InternalState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    fetchHealth: async () => {
      set({ healthLoading: true, error: null });
      
      try {
        const health = await ApolloService.fetchHealthCheck();
        
        set({
          healthLoading: false,
          health,
        });

        useEventBus.getState().emit('DATA_UPDATED', {
          type: 'health',
          status: health.status,
        });
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch health status';
        set({ 
          healthLoading: false, 
          error: errorMessage 
        });

        useEventBus.getState().emit('ERROR_OCCURRED', {
          source: 'health',
          error: errorMessage,
        });
      }
    },

    fetchInternalData: async () => {
      set({ dataLoading: true, error: null });
      
      try {
        const internalData = await ApolloService.fetchInternalData();
        
        set({
          dataLoading: false,
          internalData,
        });

        useEventBus.getState().emit('DATA_UPDATED', {
          type: 'internal-data',
          count: internalData.length,
        });
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch internal data';
        set({ 
          dataLoading: false, 
          error: errorMessage 
        });

        useEventBus.getState().emit('ERROR_OCCURRED', {
          source: 'internal-data',
          error: errorMessage,
        });
      }
    },

    createInternalData: async (input: CreateDataInput) => {
      set({ createLoading: true, error: null });
      
      try {
        const newItem = await ApolloService.createInternalData(input);
        
        // Optimistically update the local state
        set((state) => ({
          createLoading: false,
          internalData: [...state.internalData, newItem],
        }));

        useEventBus.getState().emit('DATA_UPDATED', {
          type: 'internal-data-created',
          item: newItem,
        });
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create internal data';
        set({ 
          createLoading: false, 
          error: errorMessage 
        });

        useEventBus.getState().emit('ERROR_OCCURRED', {
          source: 'create-internal-data',
          error: errorMessage,
        });
      }
    },

    clearError: () => {
      set({ error: null });
    },

    reset: () => {
      set(initialState);
    },
  }))
);

// Selector hooks for better performance
export const useHealth = () => useInternalStore((state) => state.health);
export const useInternalData = () => useInternalStore((state) => state.internalData);
export const useHealthLoading = () => useInternalStore((state) => state.healthLoading);
export const useDataLoading = () => useInternalStore((state) => state.dataLoading);
export const useCreateLoading = () => useInternalStore((state) => state.createLoading);
export const useInternalError = () => useInternalStore((state) => state.error);