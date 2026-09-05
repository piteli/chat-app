import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Message } from '@/features/chat/model/message';

const MAX_PER_CONVERSATION = 200;

export interface OutboxState {
  byConversation: Record<number, Message[]>;
}

const initialState: OutboxState = { byConversation: {} };

const outboxSlice = createSlice({
  name: 'outbox',
  initialState,
  reducers: {
    messageQueued(state, action: PayloadAction<Message>) {
      const message = action.payload;
      const thread = (state.byConversation[message.conversationId] ??= []);
      thread.push(message);
      if (thread.length > MAX_PER_CONVERSATION) {
        thread.splice(0, thread.length - MAX_PER_CONVERSATION);
      }
    },

    messageSent(
      state,
      action: PayloadAction<{ conversationId: number; clientId: string; serverId: number; createdAt: string }>,
    ) {
      const { conversationId, clientId, serverId, createdAt } = action.payload;
      const message = state.byConversation[conversationId]?.find((m) => m.clientId === clientId);
      if (!message) return;
      message.serverId = serverId;
      message.createdAt = createdAt;
      message.status = 'sent';
    },

    messageFailed(state, action: PayloadAction<{ conversationId: number; clientId: string }>) {
      const { conversationId, clientId } = action.payload;
      const message = state.byConversation[conversationId]?.find((m) => m.clientId === clientId);
      if (message) message.status = 'failed';
    },

    messageRetried(state, action: PayloadAction<{ conversationId: number; clientId: string }>) {
      const { conversationId, clientId } = action.payload;
      const message = state.byConversation[conversationId]?.find((m) => m.clientId === clientId);
      if (message) message.status = 'sending';
    },

    messageDiscarded(state, action: PayloadAction<{ conversationId: number; clientId: string }>) {
      const { conversationId, clientId } = action.payload;
      const thread = state.byConversation[conversationId];
      if (!thread) return;
      state.byConversation[conversationId] = thread.filter((m) => m.clientId !== clientId);
    },

  },
});

export const { messageQueued, messageSent, messageFailed, messageRetried, messageDiscarded } =
  outboxSlice.actions;

export default outboxSlice.reducer;
