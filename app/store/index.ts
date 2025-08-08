// Export all stores and their hooks
export * from './app-store';
export * from '../features/rick-and-morty/stores/characters-store';
export * from '../features/health/stores/internal-store';
export * from './event-bus';
export * from './types';

// Re-export common hooks for convenience
export {
  useCharacters,
  useSelectedCharacter,
  useCharactersLoading,
  useCharactersError,
  useCharactersStore,
} from '../features/rick-and-morty/stores/characters-store';

export {
  useHealth,
  useInternalData,
  useHealthLoading,
  useDataLoading,
  useCreateLoading,
  useInternalError,
  useInternalStore,
} from '../features/health/stores/internal-store';

export {
  useOnlineStatus,
  useTheme,
  useNotifications,
  useAppStore,
} from './app-store';

export { useEventBus } from './event-bus';