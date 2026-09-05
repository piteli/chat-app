import { Tabs } from 'expo-router/js-tabs';

import { Icon, MessageCircleIcon, SettingsIcon } from '@/components/ui/icon';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1967D2',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color, size }) => (
            <Icon as={MessageCircleIcon} style={{ width: size, height: size, color }} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Icon as={SettingsIcon} style={{ width: size, height: size, color }} />
          ),
        }}
      />
    </Tabs>
  );
}
