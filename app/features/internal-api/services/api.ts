import { apolloClient } from '~/lib/apollo';
import { GET_HEALTH_CHECK, GET_INTERNAL_DATA, CREATE_INTERNAL_DATA } from './queries';
import type { HealthCheck, InternalDataItem } from '../types';

export class InternalAPI {
  static async fetchHealthCheck(): Promise<HealthCheck> {
    const result = await apolloClient.query({
      query: GET_HEALTH_CHECK,
      fetchPolicy: 'cache-first',
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

  static async createInternalData(name: string, value: string): Promise<InternalDataItem> {
    const result = await apolloClient.mutate({
      mutation: CREATE_INTERNAL_DATA,
      variables: { name, value },
      refetchQueries: [{ query: GET_INTERNAL_DATA }],
    });
    return result.data.createInternalData;
  }

  static clearCache() {
    apolloClient.cache.evict({ fieldName: 'health' });
    apolloClient.cache.evict({ fieldName: 'internalData' });
    apolloClient.cache.gc();
  }
}