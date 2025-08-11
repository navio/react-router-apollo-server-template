import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface HealthData {
  status: string
  message: string
  timestamp: string
}

interface InternalData {
  id: string
  message: string
  timestamp: string
}

interface InternalState {
  health: HealthData | null
  internalData: InternalData[]
  healthLoading: boolean
  dataLoading: boolean
  createLoading: boolean
  error: string | null
  setHealth: (health: HealthData | null) => void
  setInternalData: (data: InternalData[]) => void
  setHealthLoading: (loading: boolean) => void
  setDataLoading: (loading: boolean) => void
  setCreateLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useInternalStore = create<InternalState>()(
  subscribeWithSelector((set) => ({
    health: null,
    internalData: [],
    healthLoading: false,
    dataLoading: false,
    createLoading: false,
    error: null,
    setHealth: (health: HealthData | null) => set({ health, error: null }),
    setInternalData: (internalData: InternalData[]) => set({ internalData, error: null }),
    setHealthLoading: (healthLoading: boolean) => set({ healthLoading }),
    setDataLoading: (dataLoading: boolean) => set({ dataLoading }),
    setCreateLoading: (createLoading: boolean) => set({ createLoading }),
    setError: (error: string | null) =>
      set({ error, healthLoading: false, dataLoading: false, createLoading: false }),
    clearError: () => set({ error: null }),
  }))
)

// Individual hooks for convenience
export const useHealth = () => useInternalStore((state) => state.health)
export const useInternalData = () => useInternalStore((state) => state.internalData)
export const useHealthLoading = () => useInternalStore((state) => state.healthLoading)
export const useDataLoading = () => useInternalStore((state) => state.dataLoading)
export const useCreateLoading = () => useInternalStore((state) => state.createLoading)
export const useInternalError = () => useInternalStore((state) => state.error)
