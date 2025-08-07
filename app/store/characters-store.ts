import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { ApolloService, type Character } from '~/services/apollo-service';
import type { LoadingState, PaginatedData } from './types';
import { useEventBus } from './event-bus';

interface CharactersState extends LoadingState {
  // Data
  characters: PaginatedData<Character>;
  selectedCharacter: Character | null;
  
  // Actions
  fetchCharacters: (page?: number) => Promise<void>;
  fetchCharacter: (id: string) => Promise<void>;
  selectCharacter: (character: Character | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  isLoading: false,
  error: null,
  characters: {
    items: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  },
  selectedCharacter: null,
};

export const useCharactersStore = create<CharactersState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    fetchCharacters: async (page = 1) => {
      set({ isLoading: true, error: null });
      
      try {
        const data = await ApolloService.fetchCharacters(page);
        
        set({
          isLoading: false,
          characters: {
            items: data.characters.results,
            pagination: {
              currentPage: page,
              totalPages: data.characters.info.pages,
              hasNext: data.characters.info.next !== null,
              hasPrev: data.characters.info.prev !== null,
            },
          },
        });

        // Emit event for other components
        useEventBus.getState().emit('DATA_UPDATED', {
          type: 'characters',
          count: data.characters.results.length,
        });
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch characters';
        set({ 
          isLoading: false, 
          error: errorMessage 
        });

        useEventBus.getState().emit('ERROR_OCCURRED', {
          source: 'characters',
          error: errorMessage,
        });
      }
    },

    fetchCharacter: async (id: string) => {
      set({ isLoading: true, error: null });
      
      try {
        const character = await ApolloService.fetchCharacter(id);
        
        set({
          isLoading: false,
          selectedCharacter: character,
        });

        useEventBus.getState().emit('CHARACTER_SELECTED', character);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch character';
        set({ 
          isLoading: false, 
          error: errorMessage 
        });

        useEventBus.getState().emit('ERROR_OCCURRED', {
          source: 'character',
          error: errorMessage,
        });
      }
    },

    selectCharacter: (character) => {
      set({ selectedCharacter: character });
      if (character) {
        useEventBus.getState().emit('CHARACTER_SELECTED', character);
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
export const useCharacters = () => useCharactersStore((state) => state.characters);
export const useSelectedCharacter = () => useCharactersStore((state) => state.selectedCharacter);
export const useCharactersLoading = () => useCharactersStore((state) => state.isLoading);
export const useCharactersError = () => useCharactersStore((state) => state.error);