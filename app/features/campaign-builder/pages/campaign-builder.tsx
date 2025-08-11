import { useApolloClient } from '@apollo/client'
import { Link } from 'react-router'
import { useCampaignForm } from '../hooks/useCampaignForm'
import { CampaignService } from '../services/campaign-service'
import { useCampaignStore } from '../stores/campaign-store'
import { useMessageStore } from '../../../shared/stores/message-store'

/**
 * Campaign Builder Component
 *
 * A comprehensive form for creating marketing campaigns with:
 * - Real-time validation using React Hook Form + Zod
 * - Cross-field validation for complex business rules
 * - Server-side validation with profanity filtering
 * - Success/error feedback with proper UX patterns
 * - Responsive design with Tailwind CSS
 *
 * Features:
 * - Campaign name validation (3-15 chars, alphanumeric + spaces)
 * - Budget validation ($10-$1000 range)
 * - Date validation (start < end, max 30 days duration)
 * - Form clearing and state management
 * - GraphQL integration for server communication
 */

export default function CampaignBuilder() {
  const apolloClient = useApolloClient()
  const campaignService = new CampaignService(apolloClient)

  const {
    form,
    isSubmitting,
    submitError,
    crossFieldErrors,
    transformFormData,
    clearForm,
    setSubmitting,
    setSubmitError,
    validateBeforeSubmit,
    handleBackendErrors,
  } = useCampaignForm()

  const { addCampaign } = useCampaignStore()
  const { showSuccess, showError } = useMessageStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form

  // Remove the useEffect that causes infinite loop
  // The form state management should be handled by React Hook Form directly
  // No need to sync with campaign store on every change

  /**
   * Handle form submission with comprehensive validation and error handling
   *
   * Flow:
   * 1. Validate cross-field constraints (dates, duration)
   * 2. Transform form data (string -> number/Date)
   * 3. Submit to GraphQL server
   * 4. Handle success (show toast, clear form, update store)
   * 5. Handle errors (map to form fields or show general error)
   */
  const onSubmit = async (data: any) => {
    // First validate cross-field constraints before server submission
    if (!validateBeforeSubmit(data)) {
      // Cross-field validation failed, errors are already set
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      // Transform string inputs to appropriate types
      const transformedData = transformFormData(data)

      // Submit to GraphQL server
      const result = await campaignService.createCampaign(transformedData)

      if (result.success && result.campaign) {
        addCampaign({
          id: result.campaign.id,
          name: result.campaign.name,
          budget: result.campaign.budget,
          startDate: new Date(result.campaign.startDate),
          endDate: new Date(result.campaign.endDate),
          status: result.campaign.status as 'draft' | 'active' | 'paused' | 'completed',
          createdAt: new Date(result.campaign.createdAt),
        })
        clearForm()
        setSubmitError(null) // Clear any previous errors

        // Show success toast using global message system
        showSuccess(
          'Campaign created successfully!',
          `Campaign "${result.campaign.name}" has been created and saved as a draft.`,
          { duration: 4000 }
        )
      } else if (result.errors) {
        // Handle backend validation errors - map them to form fields
        result.errors.forEach((error) => {
          if (error.field === 'general') {
            setSubmitError(error.message)
          } else {
            // Set field-specific errors
            form.setError(error.field as keyof CampaignFormInput, {
              message: error.message,
            })
          }
        })
      }
    } catch (error) {
      console.error('Campaign submission error:', error)
      // Show error toast for network/unexpected errors
      showError(
        'Campaign creation failed',
        'An unexpected error occurred. Please check your connection and try again.',
        { duration: 0 } // Don't auto-dismiss errors
      )
      setSubmitError('An unexpected error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Campaign Builder</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create and configure your marketing campaign with smart validation
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Campaign Name */}
            <div>
              <label htmlFor="name" className="form-label">
                Campaign Name *
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                className={`form-input ${errors.name || crossFieldErrors.name ? 'form-input-error' : ''}`}
                placeholder="Enter campaign name (3-15 characters)"
              />
              {errors.name && <p className="form-error">{errors.name.message}</p>}
              {crossFieldErrors.name && <p className="form-error">{crossFieldErrors.name}</p>}
            </div>

            {/* Budget */}
            <div>
              <label htmlFor="budget" className="form-label">
                Budget ($) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  {...register('budget')}
                  type="number"
                  id="budget"
                  min="10"
                  max="1000"
                  step="0.01"
                  className={`form-input pl-7 ${errors.budget || crossFieldErrors.budget ? 'form-input-error' : ''}`}
                  placeholder="10.00"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Budget must be between $10 and $1000</p>
              {errors.budget && <p className="form-error">{errors.budget.message}</p>}
              {crossFieldErrors.budget && <p className="form-error">{crossFieldErrors.budget}</p>}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="form-label">
                  Start Date *
                </label>
                <input
                  {...register('startDate')}
                  type="date"
                  id="startDate"
                  className={`form-input ${errors.startDate || crossFieldErrors.startDate ? 'form-input-error' : ''}`}
                />
                {errors.startDate && <p className="form-error">{errors.startDate.message}</p>}
                {crossFieldErrors.startDate && (
                  <p className="form-error">{crossFieldErrors.startDate}</p>
                )}
              </div>

              <div>
                <label htmlFor="endDate" className="form-label">
                  End Date *
                </label>
                <input
                  {...register('endDate')}
                  type="date"
                  id="endDate"
                  className={`form-input ${errors.endDate || crossFieldErrors.endDate ? 'form-input-error' : ''}`}
                />
                <p className="mt-1 text-xs text-gray-500">Maximum 30 days duration</p>
                {errors.endDate && <p className="form-error">{errors.endDate.message}</p>}
                {crossFieldErrors.endDate && (
                  <p className="form-error">{crossFieldErrors.endDate}</p>
                )}
              </div>
            </div>

            {/* Submit Error */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Validation Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{submitError}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-6 space-y-3 sm:space-y-0">
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                ← Back to Home
              </Link>

              <div className="flex space-x-3">
                <button type="button" onClick={clearForm} className="btn-secondary">
                  Clear Form
                </button>

                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating Campaign...
                    </>
                  ) : (
                    'Create Campaign'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
