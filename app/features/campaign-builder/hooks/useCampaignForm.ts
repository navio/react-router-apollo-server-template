import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCampaignStore } from '../stores/campaign-store';
import { campaignFieldSchema, campaignSubmissionSchema, CampaignFormInput, CampaignFormData } from '../../../shared/campaign-schema';
import { z } from 'zod';
import { useState, useCallback } from 'react';

/**
 * Custom hook for Campaign Builder form management
 * 
 * Provides a comprehensive form solution with:
 * - Real-time validation using React Hook Form + Zod
 * - Separate field validation and submission validation
 * - Cross-field validation for complex business rules
 * - Integration with Zustand state management
 * - Error handling for both client and server-side validation
 * 
 * Architecture Decision: Separation of concerns
 * - Real-time validation uses simple field schema (no transformations)
 * - Submission validation includes data transformations
 * - Cross-field validation handled separately to avoid circular dependencies
 * - Server error handling maps backend errors to form fields
 */
export const useCampaignForm = () => {
  const {
    isSubmitting,
    submitError,
    setCurrentCampaign,
    clearCurrentCampaign,
    setSubmitting,
    setSubmitError,
  } = useCampaignStore();

  // Track cross-field validation errors separately from field-level errors
  const [crossFieldErrors, setCrossFieldErrors] = useState<Record<string, string>>({});

  // Configure React Hook Form with real-time validation
  const form = useForm<CampaignFormInput>({
    resolver: zodResolver(campaignFieldSchema), // Use field schema for real-time validation
    defaultValues: {
      name: '',
      budget: '',
      startDate: '',
      endDate: '',
    },
    mode: 'onChange',                           // Validate on every change for immediate feedback
    reValidateMode: 'onChange',                 // Re-validate on every change after first submission
    criteriaMode: 'all',                        // Show all validation errors for each field
  });

  /**
   * Transform raw form data to typed campaign data
   * Uses submission schema with transformations (string -> number/Date)
   */
  const transformFormData = (data: CampaignFormInput): CampaignFormData => {
    const transformed = campaignSubmissionSchema.parse(data);
    return {
      name: transformed.name,
      budget: transformed.budget,
      startDate: transformed.startDate,
      endDate: transformed.endDate,
    };
  };

  // Validate cross-field constraints before submission
  const validateCrossFields = useCallback((data: CampaignFormInput): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    try {
      // Parse with transformations first
      const transformedData = campaignSubmissionSchema.parse(data);
      
      // Check cross-field validation manually
      if (transformedData.endDate <= transformedData.startDate) {
        errors.endDate = 'End date must be after start date';
      }
      
      const diffTime = Math.abs(transformedData.endDate.getTime() - transformedData.startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 30) {
        errors.endDate = 'Campaign duration cannot exceed 30 days';
      }
      
      return errors;
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.issues.forEach((issue) => {
          const fieldName = issue.path[0]?.toString() || 'general';
          errors[fieldName] = issue.message;
        });
      }
      return errors;
    }
  }, []);

  // Handle backend validation errors and map them to form fields
  const handleBackendErrors = useCallback((backendErrors: { field: string; message: string }[]) => {
    backendErrors.forEach((error) => {
      if (error.field && error.field !== 'general') {
        // Set individual field errors
        form.setError(error.field as keyof CampaignFormInput, {
          message: error.message,
        });
      } else {
        // Handle general errors
        setSubmitError(error.message);
      }
    });
  }, [form, setSubmitError]);

  const updateCurrentCampaign = (data: CampaignFormInput) => {
    try {
      const transformedData = transformFormData(data);
      setCurrentCampaign(transformedData);
      setSubmitError(null);
      
      // Clear previous cross-field errors
      setCrossFieldErrors({});
    } catch (error) {
      console.error('Error updating current campaign:', error);
    }
  };

  const clearForm = () => {
    form.reset();
    clearCurrentCampaign();
    setSubmitError(null);
    setCrossFieldErrors({});
  };

  // Pre-submit validation function
  const validateBeforeSubmit = useCallback((data: CampaignFormInput): boolean => {
    const crossErrors = validateCrossFields(data);
    setCrossFieldErrors(crossErrors);
    
    // Return true if no cross-field errors
    return Object.keys(crossErrors).length === 0;
  }, [validateCrossFields]);

  return {
    form,
    isSubmitting,
    submitError,
    crossFieldErrors,
    transformFormData,
    updateCurrentCampaign,
    clearForm,
    setSubmitting,
    setSubmitError,
    validateBeforeSubmit,
    handleBackendErrors,
  };
};