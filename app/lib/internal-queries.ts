import { gql } from '@apollo/client';

export const GET_HEALTH_CHECK = gql`
  query GetHealthCheck {
    health {
      status
      message
      timestamp
      version
    }
  }
`;

export const GET_INTERNAL_DATA = gql`
  query GetInternalData {
    internalData {
      id
      name
      value
      createdAt
    }
  }
`;

export const CREATE_INTERNAL_DATA = gql`
  mutation CreateInternalData($name: String!, $value: String!) {
    createInternalData(name: $name, value: $value) {
      id
      name
      value
      createdAt
    }
  }
`;