import { apolloClient } from '~/lib/apollo';
import { GET_CHARACTERS, GET_CHARACTER } from './queries';
import type { Character, CharactersResponse } from '../types';

export class RickAndMortyAPI {
  static async fetchCharacters(page: number = 1): Promise<CharactersResponse> {
    const result = await apolloClient.query({
      query: GET_CHARACTERS,
      variables: { page },
      fetchPolicy: 'cache-first',
    });
    return result.data;
  }

  static async fetchCharacter(id: string): Promise<Character> {
    const result = await apolloClient.query({
      query: GET_CHARACTER,
      variables: { id },
      fetchPolicy: 'cache-first',
    });
    return result.data.character;
  }

  static clearCache() {
    apolloClient.cache.evict({ fieldName: 'characters' });
    apolloClient.cache.evict({ fieldName: 'character' });
    apolloClient.cache.gc();
  }
}