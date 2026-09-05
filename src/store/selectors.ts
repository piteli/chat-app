import { createSelector } from '@reduxjs/toolkit';

import type { Message } from '@/features/chat/model/message';
import type { RootState } from './configureStore';

const EMPTY_THREAD: Message[] = [];

export const selectBlockedIds = (state: RootState) => state.blockedContacts.byId;

export const selectIsContactBlocked = (state: RootState, contactId: number) =>
  Boolean(state.blockedContacts.byId[contactId]);

export const selectOutboxForConversation = (state: RootState, conversationId: number): Message[] =>
  state.outbox.byConversation[conversationId] ?? EMPTY_THREAD;

export const selectLastSentMessages = createSelector(
  (state: RootState) => state.outbox.byConversation,
  (byConversation) => {
    const latest: Record<number, Message> = {};
    for (const [conversationId, messages] of Object.entries(byConversation)) {
      const last = messages[messages.length - 1];
      if (last) latest[Number(conversationId)] = last;
    }
    return latest;
  },
);

export const selectPreferences = (state: RootState) => state.preferences;
