/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useCharactersStore, useInternalStore, useAppStore, useEventBus } from '../app/store';
import { ApolloService } from '../app/services/apollo-service';

// Mock the Apollo service
jest.mock('../app/services/apollo-service', () => ({
  ApolloService: {
    fetchCharacters: jest.fn(),
    fetchCharacter: jest.fn(),
    fetchHealthCheck: jest.fn(),
    fetchInternalData: jest.fn(),
    createInternalData: jest.fn(),
  },
}));

const mockApolloService = ApolloService as jest.Mocked<typeof ApolloService>;

describe('Zustand Store Integration', () => {
  beforeEach(() => {
    // Reset all stores before each test
    useCharactersStore.getState().reset();
    useInternalStore.getState().reset();
    useEventBus.getState().clear();
    jest.clearAllMocks();
  });

  describe('Characters Store', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useCharactersStore());
      
      expect(result.current.characters.items).toEqual([]);
      expect(result.current.selectedCharacter).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should fetch characters and update state', async () => {
      const mockData = {
        characters: {
          results: [
            { id: '1', name: 'Rick', status: 'Alive', species: 'Human', gender: 'Male', image: 'test.jpg', origin: { name: 'Earth' }, location: { name: 'Earth' } }
          ],
          info: { pages: 1, next: null, prev: null, count: 1 }
        }
      };

      mockApolloService.fetchCharacters.mockResolvedValueOnce(mockData);

      const { result } = renderHook(() => useCharactersStore());

      await act(async () => {
        await result.current.fetchCharacters(1);
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.characters.items).toHaveLength(1);
      expect(result.current.characters.items[0].name).toBe('Rick');
      expect(result.current.error).toBeNull();
    });

    it('should handle fetch errors', async () => {
      mockApolloService.fetchCharacters.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useCharactersStore());

      await act(async () => {
        await result.current.fetchCharacters(1);
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Network error');
      expect(result.current.characters.items).toEqual([]);
    });
  });

  describe('Internal Store', () => {
    it('should fetch health check', async () => {
      const mockHealth = {
        status: 'healthy',
        message: 'All good',
        timestamp: '2024-01-01T00:00:00Z',
        version: '1.0.0'
      };

      mockApolloService.fetchHealthCheck.mockResolvedValueOnce(mockHealth);

      const { result } = renderHook(() => useInternalStore());

      await act(async () => {
        await result.current.fetchHealth();
      });

      expect(result.current.health).toEqual(mockHealth);
      expect(result.current.healthLoading).toBe(false);
    });

    it('should create internal data', async () => {
      const newItem = {
        id: '3',
        name: 'test-item',
        value: 'test-value',
        createdAt: '2024-01-01T00:00:00Z'
      };

      mockApolloService.createInternalData.mockResolvedValueOnce(newItem);

      const { result } = renderHook(() => useInternalStore());

      await act(async () => {
        await result.current.createInternalData({ name: 'test-item', value: 'test-value' });
      });

      expect(result.current.internalData).toContainEqual(newItem);
      expect(result.current.createLoading).toBe(false);
    });
  });

  describe('Event Bus', () => {
    it('should emit and receive events', () => {
      const { result } = renderHook(() => useEventBus());
      const mockListener = jest.fn();

      act(() => {
        result.current.on('DATA_UPDATED', mockListener);
        result.current.emit('DATA_UPDATED', { type: 'test', data: 'test-data' });
      });

      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'DATA_UPDATED',
          payload: { type: 'test', data: 'test-data' },
          timestamp: expect.any(Number)
        })
      );
    });

    it('should track event history', () => {
      const { result } = renderHook(() => useEventBus());

      act(() => {
        result.current.emit('DATA_UPDATED', { test: 'data' });
        result.current.emit('ERROR_OCCURRED', { error: 'test error' });
      });

      const history = result.current.getHistory();
      expect(history).toHaveLength(2);
      expect(history[0].type).toBe('DATA_UPDATED');
      expect(history[1].type).toBe('ERROR_OCCURRED');
    });
  });

  describe('App Store', () => {
    it('should manage notifications', () => {
      const { result } = renderHook(() => useAppStore());

      // Clear any existing notifications first
      act(() => {
        result.current.clearNotifications();
      });

      act(() => {
        result.current.addNotification({
          type: 'success',
          message: 'Test notification',
          duration: 1000
        });
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].message).toBe('Test notification');
      expect(result.current.notifications[0].type).toBe('success');
    });

    it('should handle global errors', () => {
      const { result } = renderHook(() => useAppStore());
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Clear any existing notifications first
      act(() => {
        result.current.clearNotifications();
      });

      act(() => {
        result.current.handleGlobalError(new Error('Test error'), 'Test context');
      });

      expect(consoleSpy).toHaveBeenCalledWith('Global error in Test context:', expect.any(Error));
      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].type).toBe('error');
      expect(result.current.notifications[0].message).toContain('Test error');

      consoleSpy.mockRestore();
    });
  });
});