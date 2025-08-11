import { gql } from '@apollo/client'
import { ApolloClient } from '@apollo/client'
import { CampaignFormData } from '../../../shared/campaign-schema'

/**
 * Campaign Service - GraphQL operations for campaign management
 *
 * Provides a clean interface for campaign CRUD operations using Apollo Client.
 * Handles data transformation between client types and GraphQL schema requirements.
 *
 * Architecture Decision: Service layer abstraction
 * - Isolates GraphQL operations from UI components
 * - Provides consistent error handling across all operations
 * - Handles data type conversions (Date objects to ISO strings)
 * - Enables easy testing and mocking of GraphQL operations
 */

export const CREATE_CAMPAIGN = gql`
  mutation CreateCampaign($input: CampaignInput!) {
    createCampaign(input: $input) {
      success
      campaign {
        id
        name
        budget
        startDate
        endDate
        status
        createdAt
      }
      errors {
        field
        message
      }
    }
  }
`

export const UPDATE_CAMPAIGN = gql`
  mutation UpdateCampaign($id: ID!, $input: CampaignInput!) {
    updateCampaign(id: $id, input: $input) {
      success
      campaign {
        id
        name
        budget
        startDate
        endDate
        status
        createdAt
      }
      errors {
        field
        message
      }
    }
  }
`

export const GET_CAMPAIGNS = gql`
  query GetCampaigns {
    campaigns {
      id
      name
      budget
      startDate
      endDate
      status
      createdAt
    }
  }
`

export const GET_CAMPAIGN = gql`
  query GetCampaign($id: ID!) {
    campaign(id: $id) {
      id
      name
      budget
      startDate
      endDate
      status
      createdAt
    }
  }
`

export const DELETE_CAMPAIGN = gql`
  mutation DeleteCampaign($id: ID!) {
    deleteCampaign(id: $id)
  }
`

export interface CampaignValidationError {
  field: string
  message: string
}

export interface CampaignMutationResult {
  success: boolean
  campaign?: {
    id: string
    name: string
    budget: number
    startDate: string
    endDate: string
    status: string
    createdAt: string
  }
  errors?: CampaignValidationError[]
}

export class CampaignService {
  constructor(private apolloClient: ApolloClient<any>) {}

  async createCampaign(campaignData: CampaignFormData): Promise<CampaignMutationResult> {
    try {
      const { data } = await this.apolloClient.mutate({
        mutation: CREATE_CAMPAIGN,
        variables: {
          input: {
            name: campaignData.name,
            budget: campaignData.budget,
            startDate: campaignData.startDate.toISOString(),
            endDate: campaignData.endDate.toISOString(),
          },
        },
      })

      return data.createCampaign
    } catch (error) {
      console.error('Campaign creation failed:', error)
      return {
        success: false,
        errors: [
          {
            field: 'general',
            message: 'Network error occurred while creating campaign',
          },
        ],
      }
    }
  }

  async updateCampaign(
    id: string,
    campaignData: CampaignFormData
  ): Promise<CampaignMutationResult> {
    try {
      const { data } = await this.apolloClient.mutate({
        mutation: UPDATE_CAMPAIGN,
        variables: {
          id,
          input: {
            name: campaignData.name,
            budget: campaignData.budget,
            startDate: campaignData.startDate.toISOString(),
            endDate: campaignData.endDate.toISOString(),
          },
        },
      })

      return data.updateCampaign
    } catch (error) {
      console.error('Campaign update failed:', error)
      return {
        success: false,
        errors: [
          {
            field: 'general',
            message: 'Network error occurred while updating campaign',
          },
        ],
      }
    }
  }

  async deleteCampaign(id: string): Promise<boolean> {
    try {
      const { data } = await this.apolloClient.mutate({
        mutation: DELETE_CAMPAIGN,
        variables: { id },
      })

      return data.deleteCampaign
    } catch (error) {
      console.error('Campaign deletion failed:', error)
      return false
    }
  }

  async getCampaigns() {
    try {
      const { data } = await this.apolloClient.query({
        query: GET_CAMPAIGNS,
        fetchPolicy: 'network-only',
      })

      return data.campaigns
    } catch (error) {
      console.error('Failed to fetch campaigns:', error)
      return []
    }
  }

  async getCampaign(id: string) {
    try {
      const { data } = await this.apolloClient.query({
        query: GET_CAMPAIGN,
        variables: { id },
        fetchPolicy: 'network-only',
      })

      return data.campaign
    } catch (error) {
      console.error('Failed to fetch campaign:', error)
      return null
    }
  }
}
