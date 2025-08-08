import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface Character {
  id: string;
  name: string;
  status: string;
  species: string;
  gender: string;
  origin: {
    name: string;
  };
  location: {
    name: string;
  };
  image: string;
  episode: string[];
}

interface CharactersState {
  characters: Character[];
  selectedCharacter: Character | null;
  loading: boolean;
  error: string | null;
  setCharacters: (characters: Character[]) => void;
  setSelectedCharacter: (character: Character | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useCharactersStore = create<CharactersState>()(
  subscribeWithSelector(
    (set) => ({
      characters: [],
      selectedCharacter: null,
      loading: false,
      error: null,
      setCharacters: (characters: Character[]) => set({ characters, error: null }),
      setSelectedCharacter: (character: Character | null) => set({ selectedCharacter: character }),
      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error, loading: false }),
      clearError: () => set({ error: null }),
    })
  )
);

// Individual hooks for convenience
export const useCharacters = () => useCharactersStore((state) => state.characters);
export const useSelectedCharacter = () => useCharactersStore((state) => state.selectedCharacter);
export const useCharactersLoading = () => useCharactersStore((state) => state.loading);
export const useCharactersError = () => useCharactersStore((state) => state.error);