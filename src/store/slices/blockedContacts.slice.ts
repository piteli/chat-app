import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface BlockedContactsState {
  byId: Record<number, true>;
}

const initialState: BlockedContactsState = { byId: {} };

const blockedContactsSlice = createSlice({
  name: 'blockedContacts',
  initialState,
  reducers: {
    blockToggled(state, action: PayloadAction<number>) {
      if (state.byId[action.payload]) delete state.byId[action.payload];
      else state.byId[action.payload] = true;
    },
  },
});

export const { blockToggled } = blockedContactsSlice.actions;

export default blockedContactsSlice.reducer;
