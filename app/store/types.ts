// Common state patterns for all stores
export interface LoadingState {
  isLoading: boolean
  error: string | null
}

export interface PaginatedData<T> {
  items: T[]
  pagination: {
    currentPage: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Event system types
export type EventType = 'CHARACTER_SELECTED' | 'DATA_UPDATED' | 'ERROR_OCCURRED' | 'CACHE_CLEARED'

export interface Event<T = any> {
  type: EventType
  payload?: T
  timestamp: number
}

export interface EventListener<T = any> {
  (event: Event<T>): void
}

// Store subscription callback
export interface StoreSubscription {
  (): void
  unsubscribe: () => void
}
