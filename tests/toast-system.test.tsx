import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import { Toast, ToastContainer, useMessageStore } from '../app/components/toast';
import type { Message } from '../app/components/toast';

// Test component to interact with the toast system
function TestToastSystem() {
  const { showSuccess, showError, showWarning, showInfo, clearMessages } = useMessageStore();

  return (
    <div>
      <button onClick={() => showSuccess('Success!', 'Operation completed successfully')}>
        Show Success
      </button>
      <button onClick={() => showError('Error!', 'Something went wrong')}>
        Show Error
      </button>
      <button onClick={() => showWarning('Warning!', 'Please be careful')}>
        Show Warning
      </button>
      <button onClick={() => showInfo('Info', 'Here is some information')}>
        Show Info
      </button>
      <button onClick={() => clearMessages()}>
        Clear All
      </button>
      <ToastContainer />
    </div>
  );
}

// Mock message for individual Toast component tests
const mockSuccessMessage: Message = {
  id: 'test-1',
  type: 'success',
  title: 'Test Success',
  description: 'This is a test success message',
  duration: 5000,
  dismissible: true,
  createdAt: Date.now(),
};

describe('Toast System', () => {
  beforeEach(() => {
    // Clear all messages before each test
    useMessageStore.getState().clearMessages();
  });

  describe('Toast Component', () => {
    it('renders toast message correctly', () => {
      const onDismiss = jest.fn();
      
      render(<Toast message={mockSuccessMessage} onDismiss={onDismiss} />);

      expect(screen.getByText('Test Success')).toBeInTheDocument();
      expect(screen.getByText('This is a test success message')).toBeInTheDocument();
    });

    it('calls onDismiss when dismiss button is clicked', () => {
      const onDismiss = jest.fn();
      
      render(<Toast message={mockSuccessMessage} onDismiss={onDismiss} />);

      const dismissButton = screen.getByLabelText('Dismiss notification');
      fireEvent.click(dismissButton);

      // Should call onDismiss after animation delay
      setTimeout(() => {
        expect(onDismiss).toHaveBeenCalledWith('test-1');
      }, 350);
    });

    it('renders different message types with appropriate styling', () => {
      const errorMessage: Message = {
        ...mockSuccessMessage,
        id: 'test-error',
        type: 'error',
        title: 'Error Message',
      };

      const { rerender } = render(<Toast message={mockSuccessMessage} onDismiss={() => {}} />);
      
      // Success message should have green styling
      expect(screen.getByText('Test Success')).toHaveClass('text-green-800');
      
      rerender(<Toast message={errorMessage} onDismiss={() => {}} />);
      
      // Error message should have red styling
      expect(screen.getByText('Error Message')).toHaveClass('text-red-800');
    });
  });

  describe('Message Store', () => {
    it('adds messages to store', () => {
      render(<TestToastSystem />);

      const successButton = screen.getByText('Show Success');
      fireEvent.click(successButton);

      expect(screen.getByText('Success!')).toBeInTheDocument();
      expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
    });

    it('shows multiple message types', () => {
      render(<TestToastSystem />);

      fireEvent.click(screen.getByText('Show Success'));
      fireEvent.click(screen.getByText('Show Error'));
      fireEvent.click(screen.getByText('Show Warning'));

      expect(screen.getByText('Success!')).toBeInTheDocument();
      expect(screen.getByText('Error!')).toBeInTheDocument();
      expect(screen.getByText('Warning!')).toBeInTheDocument();
    });

    it('clears all messages when requested', () => {
      render(<TestToastSystem />);

      // Add multiple messages
      fireEvent.click(screen.getByText('Show Success'));
      fireEvent.click(screen.getByText('Show Error'));

      expect(screen.getByText('Success!')).toBeInTheDocument();
      expect(screen.getByText('Error!')).toBeInTheDocument();

      // Clear all messages
      fireEvent.click(screen.getByText('Clear All'));

      expect(screen.queryByText('Success!')).not.toBeInTheDocument();
      expect(screen.queryByText('Error!')).not.toBeInTheDocument();
    });

    it('auto-dismisses messages with duration', async () => {
      // Mock timers for testing auto-dismiss
      jest.useFakeTimers();

      render(<TestToastSystem />);

      // Show a success message (default 5 second duration)
      fireEvent.click(screen.getByText('Show Success'));
      expect(screen.getByText('Success!')).toBeInTheDocument();

      // Fast-forward time by 5 seconds
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Message should be auto-dismissed
      await waitFor(() => {
        expect(screen.queryByText('Success!')).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe('ToastContainer', () => {
    it('renders nothing when no messages exist', () => {
      const { container } = render(<ToastContainer />);
      expect(container.firstChild).toBeNull();
    });

    it('renders messages in proper container', () => {
      render(<TestToastSystem />);

      fireEvent.click(screen.getByText('Show Success'));

      // Should have proper positioning classes
      const container = screen.getByText('Success!').closest('.fixed');
      expect(container).toHaveClass('top-4', 'right-4', 'z-50');
    });
  });
});