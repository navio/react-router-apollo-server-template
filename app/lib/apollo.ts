import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// External API link (Rick and Morty)
const externalLink = createHttpLink({
  uri: 'https://rickandmortyapi.com/graphql',
});

// Internal API link (Local Apollo Server - now unified with React Router)
const internalLink = createHttpLink({
  uri: typeof window === 'undefined' 
    ? 'http://localhost:3000/api/graphql'  // SSR - use the working endpoint
    : '/api/graphql',  // Client-side (legacy endpoint that works)
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
    }
  }
});

// Route requests to different endpoints based on operation name or context
const directionalLink = setContext((operation) => {
  // Check if this is an internal operation based on operation name
  const isInternalOperation = operation.operationName?.startsWith('Internal') || 
                              operation.query?.definitions?.some((def: any) => 
                                def.kind === 'OperationDefinition' && 
                                def.selectionSet?.selections?.some((sel: any) => 
                                  ['health', 'internalData', 'createInternalData'].includes(sel.name?.value)
                                )
                              );
  
  return {
    uri: isInternalOperation 
      ? (typeof window === 'undefined' ? 'http://localhost:3000/graphql' : '/graphql')
      : 'https://rickandmortyapi.com/graphql'
  };
});

export const createApolloClient = (initialState?: any) => {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: from([
      authLink,
      directionalLink,
      externalLink, // Default to Rick and Morty API, directionalLink will override for internal queries
    ]),
    cache: new InMemoryCache().restore(initialState || {}),
    connectToDevTools: typeof window !== 'undefined',
    defaultOptions: {
      watchQuery: {
        errorPolicy: 'all',
      },
      query: {
        errorPolicy: 'all',
      },
    },
  });
};

export const apolloClient = createApolloClient();