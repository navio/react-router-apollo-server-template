export const typeDefs = `#graphql
  type HealthCheck {
    status: String!
    message: String!
    timestamp: String!
    version: String!
  }

  type InternalData {
    id: ID!
    name: String!
    value: String!
    createdAt: String!
  }

  type Query {
    health: HealthCheck!
    internalData: [InternalData!]!
  }

  type Mutation {
    createInternalData(name: String!, value: String!): InternalData!
  }
`;