import { serverCampaignSchema } from '../../shared/campaign-schema.js';

/**
 * GraphQL Resolvers for Apollo Server
 * 
 * Provides resolvers for:
 * - Health checks and internal data (demo purposes)
 * - Campaign CRUD operations with validation
 * 
 * Architecture Decisions:
 * - In-memory storage for demo (would be database in production)
 * - Server-side Zod validation for data integrity
 * - Comprehensive error handling with detailed error messages
 * - Structured error responses that map to client-side form fields
 */

interface InternalDataItem {
  id: string;
  name: string;
  value: string;
  createdAt: string;
}

interface Campaign {
  id: string;
  name: string;
  budget: number;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
}

interface CampaignInput {
  name: string;
  budget: number;
  startDate: string;
  endDate: string;
}

interface CampaignValidationError {
  field: string;
  message: string;
}

interface CampaignResult {
  success: boolean;
  campaign?: Campaign;
  errors?: CampaignValidationError[];
}

// In-memory storage for demo purposes
// TODO: Replace with database integration (PostgreSQL/MongoDB) in production
const internalData: InternalDataItem[] = [
  {
    id: '1',
    name: 'demo-config',
    value: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'feature-flag',
    value: 'enabled',
    createdAt: new Date().toISOString(),
  },
];

// Campaign storage - in production this would be a database
const campaigns: Campaign[] = [];

export const resolvers = {
  Query: {
    health: () => ({
      status: 'healthy',
      message: 'Apollo Server is running successfully!',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    }),
    
    internalData: () => internalData,
    
    campaigns: () => campaigns,
    
    campaign: (_: any, { id }: { id: string }) => {
      return campaigns.find(campaign => campaign.id === id);
    },
  },

  Mutation: {
    createInternalData: (_: any, { name, value }: { name: string; value: string }) => {
      const newItem: InternalDataItem = {
        id: String(internalData.length + 1),
        name,
        value,
        createdAt: new Date().toISOString(),
      };
      
      internalData.push(newItem);
      return newItem;
    },

    /**
     * Create a new campaign with server-side validation
     * 
     * Flow:
     * 1. Convert string dates to Date objects for validation
     * 2. Validate using server schema (includes profanity check)
     * 3. Create and store campaign with generated ID
     * 4. Return success response or validation errors
     */
    createCampaign: (_: any, { input }: { input: CampaignInput }): CampaignResult => {
      try {
        // Log for development - remove in production
        console.log('🚀 Creating campaign with input:', JSON.stringify(input, null, 2));
        
        // Prepare data for validation (convert strings to appropriate types)
        const validationData = {
          name: input.name,
          budget: input.budget,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
        };

        // Validate with server schema (includes business rules like profanity filtering)
        const validatedData = serverCampaignSchema.parse(validationData);
        
        const newCampaign: Campaign = {
          id: String(campaigns.length + 1),
          name: validatedData.name,
          budget: validatedData.budget,
          startDate: validatedData.startDate.toISOString(),
          endDate: validatedData.endDate.toISOString(),
          status: 'draft',
          createdAt: new Date().toISOString(),
        };
        
        campaigns.push(newCampaign);
        
        return {
          success: true,
          campaign: newCampaign,
        };
      } catch (error: any) {
        // Log errors for debugging - consider using proper logging service in production
        console.error('❌ Campaign creation error:', error);
        
        // Handle Zod validation errors
        if (error.name === 'ZodError') {
          const validationErrors: CampaignValidationError[] = error.issues.map((issue: any) => ({
            field: issue.path.join('.'),
            message: issue.message,
          }));
          
          return {
            success: false,
            errors: validationErrors,
          };
        }
        
        // Handle unexpected errors
        return {
          success: false,
          errors: [{
            field: 'general',
            message: 'An unexpected error occurred. Please try again.',
          }],
        };
      }
    },

    updateCampaign: (_: any, { id, input }: { id: string; input: CampaignInput }): CampaignResult => {
      try {
        const campaignIndex = campaigns.findIndex(campaign => campaign.id === id);
        if (campaignIndex === -1) {
          return {
            success: false,
            errors: [{
              field: 'id',
              message: 'Campaign not found',
            }],
          };
        }

        const validationData = {
          name: input.name,
          budget: input.budget,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
        };

        const validatedData = serverCampaignSchema.parse(validationData);
        
        const updatedCampaign: Campaign = {
          ...campaigns[campaignIndex],
          name: validatedData.name,
          budget: validatedData.budget,
          startDate: validatedData.startDate.toISOString(),
          endDate: validatedData.endDate.toISOString(),
        };
        
        campaigns[campaignIndex] = updatedCampaign;
        
        return {
          success: true,
          campaign: updatedCampaign,
        };
      } catch (error: any) {
        if (error.name === 'ZodError') {
          const validationErrors: CampaignValidationError[] = error.issues.map((issue: any) => ({
            field: issue.path.join('.'),
            message: issue.message,
          }));
          
          return {
            success: false,
            errors: validationErrors,
          };
        }
        
        return {
          success: false,
          errors: [{
            field: 'general',
            message: 'An unexpected error occurred',
          }],
        };
      }
    },

    deleteCampaign: (_: any, { id }: { id: string }): boolean => {
      const campaignIndex = campaigns.findIndex(campaign => campaign.id === id);
      if (campaignIndex === -1) {
        return false;
      }
      
      campaigns.splice(campaignIndex, 1);
      return true;
    },
  },
};