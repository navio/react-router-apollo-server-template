import { create } from 'zustand'

/**
 * Global Message Store
 *
 * Centralized system for displaying toast notifications, alerts, and messages
 * throughout the application.
 *
 * Architecture Decisions:
 * - Auto-dismiss functionality with configurable timeout
 * - Support for different message types (success, error, warning, info)
 * - Unique IDs to prevent duplicate messages
 * - Queue system for multiple simultaneous messages
 * - Clean separation from component logic
 */

export interface Message {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  description?: string
  duration?: number // Auto-dismiss duration in ms (0 = no auto-dismiss)
  dismissible?: boolean
  createdAt: number
}

interface MessageState {
  messages: Message[]

  // Actions
  addMessage: (message: Omit<Message, 'id' | 'createdAt'>) => string
  removeMessage: (id: string) => void
  clearMessages: () => void

  // Convenience methods for different message types
  showSuccess: (title: string, description?: string, options?: Partial<Message>) => string
  showError: (title: string, description?: string, options?: Partial<Message>) => string
  showWarning: (title: string, description?: string, options?: Partial<Message>) => string
  showInfo: (title: string, description?: string, options?: Partial<Message>) => string
}

// Generate unique IDs for messages
const generateId = () => `message_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],

  addMessage: (messageData) => {
    const id = generateId()
    const message: Message = {
      ...messageData,
      id,
      createdAt: Date.now(),
      duration: messageData.duration ?? 5000, // Default 5 second auto-dismiss
      dismissible: messageData.dismissible ?? true,
    }

    set((state) => ({
      messages: [...state.messages, message],
    }))

    // Auto-dismiss if duration is set
    if (message.duration && message.duration > 0) {
      setTimeout(() => {
        get().removeMessage(id)
      }, message.duration)
    }

    return id
  },

  removeMessage: (id) => {
    set((state) => ({
      messages: state.messages.filter((message) => message.id !== id),
    }))
  },

  clearMessages: () => {
    set({ messages: [] })
  },

  // Convenience methods
  showSuccess: (title, description, options = {}) => {
    return get().addMessage({
      type: 'success',
      title,
      description,
      ...options,
    })
  },

  showError: (title, description, options = {}) => {
    return get().addMessage({
      type: 'error',
      title,
      description,
      duration: 0, // Errors don't auto-dismiss by default
      ...options,
    })
  },

  showWarning: (title, description, options = {}) => {
    return get().addMessage({
      type: 'warning',
      title,
      description,
      ...options,
    })
  },

  showInfo: (title, description, options = {}) => {
    return get().addMessage({
      type: 'info',
      title,
      description,
      ...options,
    })
  },
}))
