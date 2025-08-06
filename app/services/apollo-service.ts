import { apolloClient } from '~/lib/apollo';
import { GET_CHARACTERS, GET_CHARACTER } from '~/lib/queries';
import { GET_HEALTH_CHECK, GET_INTERNAL_DATA, CREATE_INTERNAL_DATA } from '~/lib/internal-queries';
import type { FetchResult } from '@apollo/client';

// Types
export interface Character {
  id: string;
  name: string;
  status: string;
  species: string;
  type?: string;
  gender: string;
  image: string;
  origin: {
    name: string;
    dimension?: string;
  };
  location: {
    name: string;
    dimension?: string;
  };
  episode?: Array<{
    id: string;
    name: string;
    air_date?: string;
    episode?: string;
  }>;
}

export interface CharactersResponse {
  characters: {
    results: Character[];
    info: {
      count: number;
      pages: number;
      next: number | null;
      prev: number | null;
    };
  };
}

export interface HealthCheck {
  status: string;
  message: string;
  timestamp: string;
  version: string;
}

export interface InternalDataItem {
  id: string;
  name: string;
  value: string;
  createdAt: string;
}

export interface InternalDataResponse {
  internalData: InternalDataItem[];
}

export interface HealthResponse {
  health: HealthCheck;
}

export interface CreateDataInput {
  name: string;
  value: string;
}

// Apollo Service - Abstraction layer for all GraphQL operations
export class ApolloService {
  // External API methods (Rick and Morty)
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

  // Internal API methods
  static async fetchHealthCheck(): Promise<HealthCheck> {
    const result = await apolloClient.query({
      query: GET_HEALTH_CHECK,
      fetchPolicy: 'network-only', // Always get fresh health status
    });
    return result.data.health;
  }

  static async fetchInternalData(): Promise<InternalDataItem[]> {
    const result = await apolloClient.query({
      query: GET_INTERNAL_DATA,
      fetchPolicy: 'cache-first',
    });
    return result.data.internalData;
  }

  static async createInternalData(input: CreateDataInput): Promise<InternalDataItem> {
    const result: FetchResult<{ createInternalData: InternalDataItem }> = await apolloClient.mutate({
      mutation: CREATE_INTERNAL_DATA,
      variables: input,
      // Automatically update the cache
      refetchQueries: [{ query: GET_INTERNAL_DATA }],
      awaitRefetchQueries: true,
    });
    
    if (!result.data) {
      throw new Error('Failed to create internal data');
    }
    
    return result.data.createInternalData;
  }

  // Cache management
  static clearCache() {
    apolloClient.clearStore();
  }

  static resetStore() {
    apolloClient.resetStore();
  }
}