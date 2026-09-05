import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ThemePreference = 'system' | 'light' | 'dark';

export interface PreferencesState {
  displayName: string;
  themePreference: ThemePreference;
  enterToSend: boolean;
}

const initialState: PreferencesState = {
  displayName: 'Fitri San',
  themePreference: 'system',
  enterToSend: false,
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    themePreferenceChanged(state, action: PayloadAction<ThemePreference>) {
      state.themePreference = action.payload;
    },
    enterToSendToggled(state) {
      state.enterToSend = !state.enterToSend;
    },
  },
});

export const { themePreferenceChanged, enterToSendToggled } = preferencesSlice.actions;

export default preferencesSlice.reducer;
