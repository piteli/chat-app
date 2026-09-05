import type { PostDto } from '@/lib/api/dto';

import { buildChatListItems, toMessage } from '../model/message';
import { mergeMessages } from '../hooks/useChatThread';

const post = (id: number, overrides: Partial<PostDto> = {}): PostDto => ({
  id,
  userId: 5,
  title: `title ${id}`,
  body: `body ${id}`,
  tags: [],
  category: 'General',
  createdAt: '2026-01-0'.concat(String(id), 'T10:00:00Z'),
  ...overrides,
});

describe('toMessage', () => {
  it('alternates direction so a thread reads as a conversation', () => {
    expect(toMessage(post(1)).direction).toBe('incoming');
    expect(toMessage(post(2)).direction).toBe('outgoing');
  });

  it('falls back to the title when the body is blank', () => {
    expect(toMessage(post(1, { body: '   ' })).text).toBe('title 1');
  });

  it('namespaces server ids so they cannot collide with client ids', () => {
    expect(toMessage(post(3)).id).toBe('srv:3');
  });
});

describe('buildChatListItems', () => {
  it('inserts one divider per calendar day', () => {
    const items = buildChatListItems([
      toMessage(post(1, { createdAt: '2026-01-01T10:00:00Z' })),
      toMessage(post(2, { createdAt: '2026-01-01T11:00:00Z' })),
      toMessage(post(3, { createdAt: '2026-01-02T09:00:00Z' })),
    ]);

    expect(items.filter((item) => item.kind === 'divider')).toHaveLength(2);
    expect(items).toHaveLength(5);
  });

  it('marks the first and last bubble of each run by the same author', () => {
    const items = buildChatListItems([
      toMessage(post(1, { createdAt: '2026-01-01T10:00:00Z' })),
      toMessage(post(3, { createdAt: '2026-01-01T10:01:00Z' })),
      toMessage(post(2, { createdAt: '2026-01-01T10:02:00Z' })),
    ]);

    const messages = items.filter((item) => item.kind === 'message');
    expect(messages.map((item) => [item.isGroupStart, item.isGroupEnd])).toEqual([
      [true, false],
      [false, true],
      [true, true],
    ]);
  });
});

describe('mergeMessages', () => {
  const optimistic = {
    id: 'msg_1',
    clientId: 'msg_1',
    conversationId: 5,
    direction: 'outgoing' as const,
    text: 'hi',
    createdAt: '2026-01-05T10:00:00Z',
    status: 'sending' as const,
  };

  it('appends outbox entries the server does not know about', () => {
    const merged = mergeMessages([toMessage(post(1))], [optimistic]);
    expect(merged.map((message) => message.id)).toEqual(['srv:1', 'msg_1']);
  });

  it('does not duplicate a message present in both sources', () => {
    const merged = mergeMessages([{ ...optimistic, status: 'sent' }], [optimistic]);
    expect(merged).toHaveLength(1);
    expect(merged[0].status).toBe('sent');
  });

  it('always returns chronological order', () => {
    const merged = mergeMessages(
      [toMessage(post(2, { createdAt: '2026-01-09T10:00:00Z' })), toMessage(post(1))],
      [optimistic],
    );
    expect(merged.map((message) => message.createdAt)).toEqual([
      '2026-01-01T10:00:00Z',
      '2026-01-05T10:00:00Z',
      '2026-01-09T10:00:00Z',
    ]);
  });
});
