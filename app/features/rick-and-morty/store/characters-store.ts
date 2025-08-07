import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { RickAndMortyAPI } from '../services/api';
import type { Character, PaginatedCharacters } from '../types';
import type { LoadingState } from '~/store/types';
import { useEventBus } from '~/store/event-bus';

interface RickAndMortyState extends LoadingState {
  // Data
  characters: PaginatedCharacters;
  currentCharacter: Character | null;
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
  currentCharacter: null,
  selectedCharacter: null,
};

export const useRickAndMortyStore = create<RickAndMortyState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    fetchCharacters: async (page = 1) => {
      set({ isLoading: true, error: null });
      
      try {
        const data = await RickAndMortyAPI.fetchCharacters(page);
        
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
          feature: 'rick-and-morty',
        });
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch characters';
        set({ 
          isLoading: false, 
          error: errorMessage 
        });

        useEventBus.getState().emit('ERROR_OCCURRED', {
          source: 'rick-and-morty-characters',
          error: errorMessage,
          feature: 'rick-and-morty',
        });
      }
    },

    fetchCharacter: async (id: string) => {
      set({ isLoading: true, error: null });
      
      try {
        const character = await RickAndMortyAPI.fetchCharacter(id);
        
        set({
          isLoading: false,
          currentCharacter: character,
          selectedCharacter: character,
        });

        useEventBus.getState().emit('CHARACTER_SELECTED', { 
          character, 
          feature: 'rick-and-morty' 
        });
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch character';
        set({ 
          isLoading: false, 
          error: errorMessage 
        });

        useEventBus.getState().emit('ERROR_OCCURRED', {
          source: 'rick-and-morty-character',
          error: errorMessage,
          feature: 'rick-and-morty',
        });
      }
    },

    selectCharacter: (character) => {
      set({ selectedCharacter: character });
      if (character) {
        useEventBus.getState().emit('CHARACTER_SELECTED', { 
          character, 
          feature: 'rick-and-morty' 
        });
      }
    },

    clearError: () => {
      set({ error: null });
    },

    reset: () => {
      set(initialState);
      RickAndMortyAPI.clearCache();
    },
  }))
);

// Selector hooks for better performance
export const useCharacters = () => useRickAndMortyStore((state) => state.characters);
export const useCurrentCharacter = () => useRickAndMortyStore((state) => state.currentCharacter);
export const useSelectedCharacter = () => useRickAndMortyStore((state) => state.selectedCharacter);
export const useCharactersLoading = () => useRickAndMortyStore((state) => state.isLoading);
export const useCharacterLoading = () => useRickAndMortyStore((state) => state.isLoading);
export const useCharactersError = () => useRickAndMortyStore((state) => state.error);
export const useCharacterError = () => useRickAndMortyStore((state) => state.error);