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

  type Campaign {
    id: ID!
    name: String!
    budget: Float!
    startDate: String!
    endDate: String!
    status: String!
    createdAt: String!
  }

  input CampaignInput {
    name: String!
    budget: Float!
    startDate: String!
    endDate: String!
  }

  type CampaignValidationError {
    field: String!
    message: String!
  }

  type CampaignResult {
    success: Boolean!
    campaign: Campaign
    errors: [CampaignValidationError!]
  }

  type Query {
    health: HealthCheck!
    internalData: [InternalData!]!
    campaigns: [Campaign!]!
    campaign(id: ID!): Campaign
  }

  type Mutation {
    createInternalData(name: String!, value: String!): InternalData!
    createCampaign(input: CampaignInput!): CampaignResult!
    updateCampaign(id: ID!, input: CampaignInput!): CampaignResult!
    deleteCampaign(id: ID!): Boolean!
  }
`
