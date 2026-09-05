import { QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useEffect, useState } from 'react';

import { bindAppStateToFocusManager, createQueryClient } from '@/lib/query/queryClient';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  useEffect(() => bindAppStateToFocusManager(), []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
