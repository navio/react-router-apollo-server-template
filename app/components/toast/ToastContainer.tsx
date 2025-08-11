import { useMessageStore } from '../../shared/stores/message-store'
import { Toast } from './Toast'

/**
 * Toast Container Component
 *
 * Renders all active toast messages in a fixed position container.
 * Manages the display, positioning, and dismissal of multiple toasts.
 *
 * Features:
 * - Fixed positioning at top-right of viewport
 * - Responsive design (adjusts on mobile)
 * - Automatic stacking of multiple toasts
 * - Portal-like behavior without requiring React portals
 */

export function ToastContainer() {
  const { messages, removeMessage } = useMessageStore()

  // Don't render container if no messages
  if (messages.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full sm:max-w-md">
      {messages.map((message) => (
        <Toast key={message.id} message={message} onDismiss={removeMessage} />
      ))}
    </div>
  )
}
