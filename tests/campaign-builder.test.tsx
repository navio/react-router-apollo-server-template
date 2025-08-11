/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import CampaignBuilder from '../app/features/campaign-builder/pages/campaign-builder'
import { CREATE_CAMPAIGN } from '../app/features/campaign-builder/services/campaign-service'

// Mock React Router
jest.mock('react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  useApolloClient: () => ({
    mutate: jest.fn(),
    query: jest.fn(),
  }),
}))

const mocks = [
  {
    request: {
      query: CREATE_CAMPAIGN,
      variables: {
        input: {
          name: 'Test Campaign',
          budget: 100,
          startDate: '2024-01-01T00:00:00.000Z',
          endDate: '2024-01-02T00:00:00.000Z',
        },
      },
    },
    result: {
      data: {
        createCampaign: {
          success: true,
          campaign: {
            id: '1',
            name: 'Test Campaign',
            budget: 100,
            startDate: '2024-01-01T00:00:00.000Z',
            endDate: '2024-01-02T00:00:00.000Z',
            status: 'draft',
            createdAt: '2024-01-01T00:00:00.000Z',
          },
        },
      },
    },
  },
]

describe('Campaign Builder', () => {
  it('renders campaign builder form', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <CampaignBuilder />
      </MockedProvider>
    )

    expect(screen.getByText('Campaign Builder')).toBeInTheDocument()
    expect(screen.getByLabelText(/campaign name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/budget/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument()
  })

  it('shows validation errors for invalid input', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <CampaignBuilder />
      </MockedProvider>
    )

    const nameInput = screen.getByLabelText(/campaign name/i)

    // Test name too short
    fireEvent.change(nameInput, { target: { value: 'ab' } })
    fireEvent.blur(nameInput)

    await waitFor(() => {
      expect(screen.getByText(/must be at least 3 characters/i)).toBeInTheDocument()
    })

    // Test name too long
    fireEvent.change(nameInput, { target: { value: 'this name is too long for validation' } })
    fireEvent.blur(nameInput)

    await waitFor(() => {
      expect(screen.getByText(/must not exceed 15 characters/i)).toBeInTheDocument()
    })
  })

  it('shows validation errors for invalid budget', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <CampaignBuilder />
      </MockedProvider>
    )

    const budgetInput = screen.getByLabelText(/budget/i)

    // Test budget too low
    fireEvent.change(budgetInput, { target: { value: '5' } })
    fireEvent.blur(budgetInput)

    await waitFor(() => {
      expect(screen.getByText(/must be at least \$10/i)).toBeInTheDocument()
    })

    // Test budget too high
    fireEvent.change(budgetInput, { target: { value: '2000' } })
    fireEvent.blur(budgetInput)

    await waitFor(() => {
      expect(screen.getByText(/cannot exceed \$1000/i)).toBeInTheDocument()
    })
  })

  it('validates date relationships', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <CampaignBuilder />
      </MockedProvider>
    )

    const nameInput = screen.getByLabelText(/campaign name/i)
    const budgetInput = screen.getByLabelText(/budget/i)
    const startDateInput = screen.getByLabelText(/start date/i)
    const endDateInput = screen.getByLabelText(/end date/i)
    const submitButton = screen.getByText(/create campaign/i)

    // Fill required fields first
    fireEvent.change(nameInput, { target: { value: 'Test Campaign' } })
    fireEvent.change(budgetInput, { target: { value: '100' } })

    // Set end date before start date
    fireEvent.change(startDateInput, { target: { value: '2024-01-02' } })
    fireEvent.change(endDateInput, { target: { value: '2024-01-01' } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/end date must be after start date/i)).toBeInTheDocument()
    })
  })

  it('validates campaign duration', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <CampaignBuilder />
      </MockedProvider>
    )

    const nameInput = screen.getByLabelText(/campaign name/i)
    const budgetInput = screen.getByLabelText(/budget/i)
    const startDateInput = screen.getByLabelText(/start date/i)
    const endDateInput = screen.getByLabelText(/end date/i)
    const submitButton = screen.getByText(/create campaign/i)

    // Fill required fields first
    fireEvent.change(nameInput, { target: { value: 'Test Campaign' } })
    fireEvent.change(budgetInput, { target: { value: '100' } })

    // Set duration longer than 30 days
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } })
    fireEvent.change(endDateInput, { target: { value: '2024-03-01' } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/cannot exceed 30 days/i)).toBeInTheDocument()
    })
  })

  it('clears form when clear button is clicked', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <CampaignBuilder />
      </MockedProvider>
    )

    const nameInput = screen.getByLabelText(/campaign name/i) as HTMLInputElement
    const budgetInput = screen.getByLabelText(/budget/i) as HTMLInputElement
    const clearButton = screen.getByText(/clear form/i)

    // Fill form
    fireEvent.change(nameInput, { target: { value: 'Test Campaign' } })
    fireEvent.change(budgetInput, { target: { value: '100' } })

    expect(nameInput.value).toBe('Test Campaign')
    expect(budgetInput.value).toBe('100')

    // Clear form
    fireEvent.click(clearButton)

    expect(nameInput.value).toBe('')
    expect(budgetInput.value).toBe('')
  })
})
