import Constants from 'expo-constants';
import { Platform } from 'react-native';

export interface AppInfo {
  name: string;
  version: string;
  buildProfile: string;
  runtime: string;
  apiBaseUrl: string;
}

export function getAppInfo(apiBaseUrl: string): AppInfo {
  const config = Constants.expoConfig;
  return {
    name: config?.name ?? 'respond.io Chat',
    version: config?.version ?? '0.0.0',
    buildProfile: __DEV__ ? 'development' : 'production',
    runtime: `${Platform.OS} · Expo SDK ${(Constants.expoConfig?.sdkVersion ?? '').split('.')[0] || '57'}`,
    apiBaseUrl,
  };
}
