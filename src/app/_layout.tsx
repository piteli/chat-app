import '@/global.css';

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AppProviders } from '@/providers/AppProviders';

export { ErrorBoundary } from 'expo-router';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  return (
    <AppProviders>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerBackButtonDisplayMode: 'minimal',
          animation: 'slide_from_right',
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="chat/[contactId]" options={{ title: 'Chat' }} />
        <Stack.Screen name="profile/[contactId]" options={{ title: 'Profile' }} />
      </Stack>
    </AppProviders>
  );
}
