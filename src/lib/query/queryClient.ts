import { QueryClient, focusManager, onlineManager } from '@tanstack/react-query';
import { AppState, type AppStateStatus, Platform } from 'react-native';

import { ApiError } from '@/lib/api/errors';

const MAX_RETRIES = 2;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 15 * 60_000,
        retry: (failureCount, error) => {
          if (error instanceof ApiError && !error.isRetryable) return false;
          return failureCount < MAX_RETRIES;
        },
        retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 8_000),
        refetchOnReconnect: true,
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

export function bindAppStateToFocusManager(): () => void {
  const onAppStateChange = (status: AppStateStatus) => {
    if (Platform.OS === 'web') return;
    focusManager.setFocused(status === 'active');
  };

  const subscription = AppState.addEventListener('change', onAppStateChange);
  return () => subscription.remove();
}

export { onlineManager };
