import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import { type ReactNode, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { useAppSelector } from '@/store/hooks';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const preference = useAppSelector((state) => state.preferences.themePreference);
  const systemScheme = useColorScheme();

  const resolved = useMemo<'light' | 'dark'>(() => {
    if (preference === 'system') return systemScheme === 'dark' ? 'dark' : 'light';
    return preference;
  }, [preference, systemScheme]);

  const navigationTheme = useMemo(() => {
    const base = resolved === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: resolved === 'dark' ? '#609CFF' : '#1967D2',
        background: resolved === 'dark' ? '#0D0D0F' : '#F6F7F9',
        card: resolved === 'dark' ? '#0A0A0A' : '#FFFFFF',
        border: resolved === 'dark' ? '#2E2E2E' : '#E5E5E5',
        text: resolved === 'dark' ? '#FAFAFA' : '#0A0A0A',
      },
    };
  }, [resolved]);

  return (
    <GluestackUIProvider mode={resolved}>
      <NavigationThemeProvider value={navigationTheme}>{children}</NavigationThemeProvider>
    </GluestackUIProvider>
  );
}
