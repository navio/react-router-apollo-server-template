import { z } from 'zod';

/**
 * Campaign Builder Validation Schemas
 * 
 * This file defines multiple Zod schemas for different use cases:
 * 1. baseCampaignSchema - Core validation with typed Date objects (for server-side)
 * 2. campaignFieldSchema - Real-time field validation (no transformations)
 * 3. campaignSubmissionSchema - Form submission with string-to-type transformations
 * 4. serverCampaignSchema - Server-side validation with profanity filtering
 * 
 * Architecture Decision: Multiple schemas instead of one
 * - Allows different validation behavior for different contexts
 * - Real-time validation doesn't break user experience with transformations
 * - Server validation includes additional business rules (profanity check)
 * - Submission schema handles form data transformations cleanly
 */

// Base schema for validated campaign data (used server-side with Date objects)
export const baseCampaignSchema = z.object({
  name: z
    .string()
    .min(3, 'Campaign name must be at least 3 characters')
    .max(15, 'Campaign name must not exceed 15 characters')
    .regex(/^[a-zA-Z0-9\s]+$/, 'Campaign name can only contain letters, numbers, and spaces')
    .trim(),
  budget: z
    .number()
    .min(10, 'Budget must be at least $10')
    .max(1000, 'Budget cannot exceed $1000'),
  startDate: z.date(),
  endDate: z.date(),
}).refine(
  (data) => data.endDate > data.startDate,
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
).refine(
  (data) => {
    const diffTime = Math.abs(data.endDate.getTime() - data.startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  },
  {
    message: 'Campaign duration cannot exceed 30 days',
    path: ['endDate'],
  }
);

/**
 * Real-time field validation schema
 * Used by React Hook Form for immediate validation feedback
 * 
 * Design Decision: No transformations in field validation
 * - Avoids breaking user input during typing
 * - Allows validation of string values as user types
 * - Cross-field validation handled separately to avoid circular dependencies
 */
export const campaignFieldSchema = z.object({
  name: z
    .string()
    .min(3, 'Campaign name must be at least 3 characters')
    .max(15, 'Campaign name must not exceed 15 characters')
    .regex(/^[a-zA-Z0-9\s]*$/, 'Campaign name can only contain letters, numbers, and spaces'),
  budget: z
    .string()
    .min(1, 'Budget is required')
    .refine((val) => !isNaN(parseFloat(val)), 'Budget must be a valid number')
    .refine((val) => parseFloat(val) >= 10, 'Budget must be at least $10')
    .refine((val) => parseFloat(val) <= 1000, 'Budget cannot exceed $1000'),
  startDate: z
    .string()
    .min(1, 'Start date is required')
    .refine((val) => !isNaN(new Date(val).getTime()), 'Invalid start date'),
  endDate: z
    .string()
    .min(1, 'End date is required')
    .refine((val) => !isNaN(new Date(val).getTime()), 'Invalid end date'),
});

/**
 * Form submission schema with transformations
 * Converts form string inputs to appropriate types for processing
 * 
 * Design Decision: Transformations only at submission time
 * - Maintains clean separation between validation and transformation
 * - Ensures type safety when sending data to server
 * - Handles the string->number/Date conversions from HTML form inputs
 */
export const campaignSubmissionSchema = z.object({
  name: z
    .string()
    .min(3, 'Campaign name must be at least 3 characters')
    .max(15, 'Campaign name must not exceed 15 characters')
    .regex(/^[a-zA-Z0-9\s]+$/, 'Campaign name can only contain letters, numbers, and spaces')
    .trim(),
  budget: z
    .string()
    .min(1, 'Budget is required')
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val), 'Budget must be a valid number')
    .refine((val) => val >= 10, 'Budget must be at least $10')
    .refine((val) => val <= 1000, 'Budget cannot exceed $1000'),
  startDate: z
    .string()
    .min(1, 'Start date is required')
    .transform((val) => new Date(val))
    .refine((date) => !isNaN(date.getTime()), 'Invalid start date'),
  endDate: z
    .string()
    .min(1, 'End date is required')
    .transform((val) => new Date(val))
    .refine((date) => !isNaN(date.getTime()), 'Invalid end date'),
});

/**
 * Complete form validation schema with cross-field validation
 * Used for final form submission validation on client-side
 */
export const campaignInputSchema = campaignSubmissionSchema.refine(
  (data) => data.endDate > data.startDate,
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
).refine(
  (data) => {
    const diffTime = Math.abs(data.endDate.getTime() - data.startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  },
  {
    message: 'Campaign duration cannot exceed 30 days',
    path: ['endDate'],
  }
);

/**
 * Server-side validation schema with business rules
 * Extends base validation with additional security/business constraints
 * 
 * Design Decision: Server-side profanity filtering
 * - Prevents inappropriate campaign names from being stored
 * - Could be extended with external profanity detection services
 * - Maintains data quality and brand protection
 */
export const serverCampaignSchema = baseCampaignSchema.refine(
  (data) => {
    const invalidWords = [
      'spam', 'scam', 'fake', 'fraud', 'phishing', 'malware', 'virus',
      'hack', 'illegal', 'stolen', 'pirated', 'xxx', 'porn', 'adult',
      'casino', 'gambling', 'bet', 'lottery', 'winner', 'congratulations',
      'urgent', 'limited', 'exclusive', 'guaranteed', 'risk-free',
      'miracle', 'amazing', 'incredible', 'unbelievable'
    ];
    
    const lowerCaseName = data.name.toLowerCase();
    return !invalidWords.some(word => lowerCaseName.includes(word));
  },
  {
    message: 'Campaign name contains prohibited words',
    path: ['name'],
  }
);

// Type exports for TypeScript integration
export type CampaignFormData = z.infer<typeof baseCampaignSchema>;
export type ServerCampaignData = z.infer<typeof serverCampaignSchema>;

/**
 * Raw form input interface (before validation/transformation)
 * Represents the actual HTML form data as received from user input
 */
export interface CampaignFormInput {
  name: string;
  budget: string;      // String because HTML input type="number" returns string
  startDate: string;   // String because HTML input type="date" returns string
  endDate: string;     // String because HTML input type="date" returns string
}