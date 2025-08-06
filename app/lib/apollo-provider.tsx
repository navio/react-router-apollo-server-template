import { ApolloProvider } from '@apollo/client';
import { ReactNode } from 'react';
import { createApolloClient } from './apollo';

interface Props {
  children: ReactNode;
  initialState?: any;
}

export function AppApolloProvider({ children, initialState }: Props) {
  const client = createApolloClient(initialState);
  
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}