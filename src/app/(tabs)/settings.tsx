import { useMemo } from 'react';
import { ScrollView } from 'react-native';

import { ContactAvatar } from '@/components/common/ContactAvatar';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { GlobeIcon, InfoIcon, MoonIcon, SunIcon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { SettingsRow } from '@/features/settings/components/SettingsRow';
import { SettingsSection } from '@/features/settings/components/SettingsSection';
import { getAppInfo } from '@/features/settings/model/appInfo';
import { API_BASE_URL } from '@/lib/api/config';
import { toInitials } from '@/features/contacts/model/contact';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectPreferences } from '@/store/selectors';
import { themePreferenceChanged, type ThemePreference } from '@/store/slices/preferences.slice';

export default function SettingsScreen() {
  const dispatch = useAppDispatch();
  const preferences = useAppSelector(selectPreferences);

  const appInfo = useMemo(() => getAppInfo(API_BASE_URL), []);

  return (
    <Box className="flex-1 bg-surface">
      <ScreenHeader title="Settings" />

      <ScrollView contentContainerStyle={{ paddingVertical: 16, gap: 20, paddingBottom: 48 }}>
        <HStack className="mx-4 items-center gap-3 rounded-2xl bg-background p-4">
          <ContactAvatar
            name={preferences.displayName}
            initials={toInitials(preferences.displayName)}
            className="h-14 w-14"
          />
          <VStack className="flex-1 gap-0.5">
            <Heading size="md" className="text-foreground">
              {preferences.displayName}
            </Heading>
            <Text className="text-xs text-muted-foreground">
              {appInfo.name} · v{appInfo.version}
            </Text>
          </VStack>
        </HStack>

        <SettingsSection title="Appearance">
          <SettingsRow
            icon={preferences.themePreference === 'dark' ? MoonIcon : SunIcon}
            title="Theme"
            subtitle="Applies to the whole app instantly."
            accessory={
              <ThemeSegmentedControl
                value={preferences.themePreference}
                onChange={(next) => dispatch(themePreferenceChanged(next))}
              />
            }
          />
        </SettingsSection>

        <SettingsSection title="About">
          <SettingsRow icon={InfoIcon} title="Version" accessory={<ValueLabel value={appInfo.version} />} />
          <SettingsRow icon={InfoIcon} title="Build" accessory={<ValueLabel value={appInfo.buildProfile} />} />
          <SettingsRow icon={InfoIcon} title="Runtime" accessory={<ValueLabel value={appInfo.runtime} />} />
          <SettingsRow
            icon={GlobeIcon}
            title="API"
            subtitle={appInfo.apiBaseUrl}
          />
        </SettingsSection>
      </ScrollView>
    </Box>
  );
}

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'Auto' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

function ThemeSegmentedControl({
  value,
  onChange,
}: {
  value: ThemePreference;
  onChange: (next: ThemePreference) => void;
}) {
  return (
    <HStack className="rounded-full bg-muted p-0.5">
      {THEME_OPTIONS.map((option) => {
        const isSelected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${option.label} theme`}
            className={`rounded-full px-3 py-1.5 ${isSelected ? 'bg-background' : ''}`}>
            <Text
              className={`text-xs ${
                isSelected ? 'font-semibold text-foreground' : 'text-muted-foreground'
              }`}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </HStack>
  );
}

function ValueLabel({ value }: { value: string }) {
  return <Text className="text-sm text-muted-foreground">{value}</Text>;
}
