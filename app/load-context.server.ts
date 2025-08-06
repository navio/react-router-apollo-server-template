import { createApolloClient } from "./lib/apollo";

export function getLoadContext() {
  const apolloClient = createApolloClient();
  
  return {
    apolloClient,
    apolloState: apolloClient.cache.extract(),
  };
}

export type LoadContext = ReturnType<typeof getLoadContext>;