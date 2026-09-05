import type { ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { persistor, store } from '@/store';

import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
              <ThemeProvider>{children}</ThemeProvider>
            </SafeAreaProvider>
          </GestureHandlerRootView>
        </QueryProvider>
      </PersistGate>
    </ReduxProvider>
  );
}
