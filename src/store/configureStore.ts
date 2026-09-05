import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  createMigrate,
  persistReducer,
  type MigrationManifest,
  type PersistedState,
} from 'redux-persist';

import blockedContactsReducer from './slices/blockedContacts.slice';
import outboxReducer from './slices/outbox.slice';
import preferencesReducer from './slices/preferences.slice';

const rootReducer = combineReducers({
  blockedContacts: blockedContactsReducer,
  outbox: outboxReducer,
  preferences: preferencesReducer,
});

export const migrations: MigrationManifest = {
  2: (state) => {
    const persisted = state as (PersistedState & { preferences?: Record<string, unknown> }) | undefined;
    if (!persisted?.preferences) return persisted;
    const preferences = { ...persisted.preferences };
    delete preferences.readReceipts;
    return { ...persisted, preferences };
  },
};

const persistedReducer = persistReducer(
  {
    key: 'respondio:root',
    version: 2,
    migrate: createMigrate(migrations),
    storage: AsyncStorage,
    whitelist: ['blockedContacts', 'outbox', 'preferences'],
  },
  rootReducer,
);

export function createStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: persistedReducer,
    preloadedState: preloadedState as never,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  });
}

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof createStore>;
export type AppDispatch = AppStore['dispatch'];
