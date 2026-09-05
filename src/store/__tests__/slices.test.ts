import blockedContacts, { blockToggled } from '../slices/blockedContacts.slice';
import outbox, {
  messageDiscarded,
  messageFailed,
  messageQueued,
  messageSent,
} from '../slices/outbox.slice';
import type { Message } from '@/features/chat/model/message';

import type { RootState } from '../configureStore';
import { selectLastSentMessages } from '../selectors';

const pending: Message = {
  id: 'msg_1',
  clientId: 'msg_1',
  conversationId: 5,
  direction: 'outgoing',
  text: 'hello',
  createdAt: '2026-01-01T10:00:00Z',
  status: 'sending',
};

describe('blockedContacts slice', () => {
  it('blocks and unblocks a contact', () => {
    let state = blockedContacts(undefined, blockToggled(3));
    expect(state.byId[3]).toBe(true);
    state = blockedContacts(state, blockToggled(3));
    expect(state.byId[3]).toBeUndefined();
  });

  it('toggles idempotently', () => {
    const blocked = blockedContacts(undefined, blockToggled(9));
    const unblocked = blockedContacts(blocked, blockToggled(9));
    expect(Object.keys(unblocked.byId)).toHaveLength(0);
  });
});

describe('outbox slice', () => {
  it('queues a message under its conversation', () => {
    const state = outbox(undefined, messageQueued(pending));
    expect(state.byConversation[5]).toHaveLength(1);
    expect(state.byConversation[5][0].status).toBe('sending');
  });

  it('reconciles a queued message with the server response', () => {
    let state = outbox(undefined, messageQueued(pending));
    state = outbox(
      state,
      messageSent({
        conversationId: 5,
        clientId: 'msg_1',
        serverId: 101,
        createdAt: '2026-01-01T10:00:05Z',
      }),
    );

    expect(state.byConversation[5][0]).toMatchObject({
      serverId: 101,
      status: 'sent',
      createdAt: '2026-01-01T10:00:05Z',
    });
  });

  it('marks a message failed so the UI can offer a retry', () => {
    let state = outbox(undefined, messageQueued(pending));
    state = outbox(state, messageFailed({ conversationId: 5, clientId: 'msg_1' }));
    expect(state.byConversation[5][0].status).toBe('failed');
  });

  it('discards a message by client id', () => {
    let state = outbox(undefined, messageQueued(pending));
    state = outbox(state, messageDiscarded({ conversationId: 5, clientId: 'msg_1' }));
    expect(state.byConversation[5]).toHaveLength(0);
  });

  it('ignores reconciliation for an unknown client id', () => {
    const state = outbox(undefined, messageFailed({ conversationId: 5, clientId: 'nope' }));
    expect(state.byConversation[5]).toBeUndefined();
  });
});

describe('selectLastSentMessages', () => {
  const state = (byConversation: Record<number, Message[]>) =>
    ({ outbox: { byConversation } }) as RootState;

  it('has no entry for a conversation nothing was sent to', () => {
    expect(selectLastSentMessages(state({}))[5]).toBeUndefined();
  });

  it('picks the newest message so the list preview follows the last send', () => {
    const older: Message = { ...pending, id: 'msg_1', clientId: 'msg_1', text: 'first' };
    const newer: Message = { ...pending, id: 'msg_2', clientId: 'msg_2', text: 'second' };

    expect(selectLastSentMessages(state({ 5: [older, newer] }))[5].text).toBe('second');
  });
});
