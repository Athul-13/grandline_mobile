import { QueryClient } from '@tanstack/react-query';

/**
 * Create and configure QueryClient instance
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // How long data is considered fresh (won't refetch)
      staleTime: 1000 * 60 * 5, // 5 minutes

      // How long unused data stays in cache
      gcTime: 1000 * 60 * 10, // 10 minutes

      // Refetch data when window regains focus
      refetchOnWindowFocus: false, // Disabled for mobile

      // Refetch data when component mounts
      refetchOnMount: true,

      // Refetch data when network reconnects
      refetchOnReconnect: true,

      // Number of times to retry failed requests
      retry: 2,

      // Delay between retry attempts (exponential backoff)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Number of times to retry failed mutations
      retry: 1,

      // Delay between retry attempts (1 second)
      retryDelay: 1000,
    },
  },
});

