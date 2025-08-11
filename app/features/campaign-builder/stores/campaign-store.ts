import { create } from 'zustand'
import { CampaignFormData } from '../../../shared/campaign-schema'

/**
 * Campaign Builder State Management
 *
 * Uses Zustand for lightweight, type-safe state management.
 *
 * Architecture Decisions:
 * - Zustand over Redux for simplicity and performance
 * - Separate form state from entity state
 * - Centralized error handling for consistent UX
 * - CRUD operations for campaign management
 */

// Campaign entity with additional metadata
export interface Campaign extends CampaignFormData {
  id: string
  createdAt: Date
  status: 'draft' | 'active' | 'paused' | 'completed'
}

interface CampaignState {
  campaigns: Campaign[]
  currentCampaign: Partial<CampaignFormData> | null
  isSubmitting: boolean
  submitError: string | null

  setCurrentCampaign: (campaign: Partial<CampaignFormData>) => void
  clearCurrentCampaign: () => void
  setSubmitting: (isSubmitting: boolean) => void
  setSubmitError: (error: string | null) => void
  addCampaign: (campaign: Campaign) => void
  updateCampaign: (id: string, updates: Partial<Campaign>) => void
  deleteCampaign: (id: string) => void
  getCampaignById: (id: string) => Campaign | undefined
}

export const useCampaignStore = create<CampaignState>((set, get) => ({
  campaigns: [],
  currentCampaign: null,
  isSubmitting: false,
  submitError: null,

  setCurrentCampaign: (campaign) => set({ currentCampaign: campaign }),

  clearCurrentCampaign: () => set({ currentCampaign: null }),

  setSubmitting: (isSubmitting) => set({ isSubmitting }),

  setSubmitError: (error) => set({ submitError: error }),

  addCampaign: (campaign) =>
    set((state) => ({
      campaigns: [...state.campaigns, campaign],
    })),

  updateCampaign: (id, updates) =>
    set((state) => ({
      campaigns: state.campaigns.map((campaign) =>
        campaign.id === id ? { ...campaign, ...updates } : campaign
      ),
    })),

  deleteCampaign: (id) =>
    set((state) => ({
      campaigns: state.campaigns.filter((campaign) => campaign.id !== id),
    })),

  getCampaignById: (id) => {
    const state = get()
    return state.campaigns.find((campaign) => campaign.id === id)
  },
}))
