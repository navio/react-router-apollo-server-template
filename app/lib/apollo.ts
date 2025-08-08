import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

/**
 * Apollo Client Configuration for Hybrid GraphQL Setup
 * 
 * This app uses two GraphQL endpoints:
 * 1. External API (Rick and Morty) - for demo character data
 * 2. Internal API (Local Apollo Server) - for campaign management and health checks
 * 
 * Architecture Decision: Smart routing based on operation detection
 * - Automatically routes operations to correct endpoints
 * - Maintains clean separation between external and internal APIs
 * - Supports both SSR and client-side rendering
 */

// External API link for Rick and Morty data
const externalLink = createHttpLink({
  uri: 'https://rickandmortyapi.com/graphql',
});

// Internal API link (unused but kept for reference)
// The actual routing is handled by directionalLink below
const internalLink = createHttpLink({
  uri: typeof window === 'undefined' 
    ? 'http://localhost:3000/api/graphql'  // SSR - legacy endpoint
    : '/api/graphql',  // Client-side - legacy endpoint
});

// Authentication link (placeholder for future auth implementation)
const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      // Add authorization headers here when needed
    }
  }
});

/**
 * Smart routing link that directs operations to appropriate GraphQL endpoints
 * 
 * Design Decision: Operation-based routing
 * - Analyzes GraphQL operation names and field selections
 * - Routes campaign operations to internal server
 * - Routes character operations to external Rick and Morty API
 * - Handles both SSR and client-side contexts
 */
const directionalLink = setContext((operation) => {
  // List of operations that should be routed to internal server
  const internalOperations = [
    'health', 'internalData', 'createInternalData',
    'campaigns', 'campaign', 'createCampaign', 'updateCampaign', 'deleteCampaign'
  ];
  
  // Check if this is an internal operation
  const isInternalOperation = operation.operationName?.startsWith('Internal') || 
                              operation.query?.definitions?.some((def: any) => 
                                def.kind === 'OperationDefinition' && 
                                def.selectionSet?.selections?.some((sel: any) => 
                                  internalOperations.includes(sel.name?.value)
                                )
                              );
  
  return {
    uri: isInternalOperation 
      ? (typeof window === 'undefined' ? 'http://localhost:3000/graphql' : '/graphql')
      : 'https://rickandmortyapi.com/graphql'
  };
});

/**
 * Creates a new Apollo Client instance with hybrid endpoint routing
 * 
 * @param initialState - Optional initial cache state for SSR hydration
 * @returns Configured Apollo Client instance
 */
export const createApolloClient = (initialState?: any) => {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: from([
      authLink,        // Add authentication headers
      directionalLink, // Smart routing to internal/external APIs
      externalLink,    // Default endpoint (Rick and Morty API)
    ]),
    cache: new InMemoryCache().restore(initialState || {}),
    connectToDevTools: typeof window !== 'undefined',
    defaultOptions: {
      watchQuery: {
        errorPolicy: 'all', // Continue with partial data on errors
      },
      query: {
        errorPolicy: 'all', // Continue with partial data on errors
      },
    },
  });
};

// Singleton Apollo Client instance for the application
export const apolloClient = createApolloClient();