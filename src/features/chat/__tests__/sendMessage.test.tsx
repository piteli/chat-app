import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';

import type { PostDto } from '@/lib/api/dto';
import { queryKeys } from '@/lib/query/keys';
import { createStore } from '@/store/configureStore';

import { useSendMessage } from '../api/messages.queries';
import { useChatThread } from '../hooks/useChatThread';
import type { Message } from '../model/message';

const CONTACT_ID = 7;


const activeClients: QueryClient[] = [];

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
  const store = createStore();

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </ReduxProvider>
    );
  }

  activeClients.push(queryClient);
  return { Wrapper, queryClient, store };
}

function seedThread(queryClient: QueryClient, messages: Message[]) {
  queryClient.setQueryData(queryKeys.messages.thread(CONTACT_ID), {
    pages: [{ total: messages.length, limit: 15, offset: 0, results: messages }],
    pageParams: [{ offset: 0, limit: 15 }],
  });
}

const existing: Message = {
  id: 'srv:1',
  serverId: 1,
  conversationId: CONTACT_ID,
  direction: 'incoming',
  text: 'Are we still on for tomorrow?',
  createdAt: '2026-01-15T09:00:00Z',
  status: 'sent',
};

function mockFetchOnce(response: Partial<PostDto> | null, ok = true) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status: ok ? 201 : 500,
    json: async () => response,
  }) as unknown as typeof fetch;
}

afterEach(() => {
  jest.restoreAllMocks();
  for (const client of activeClients.splice(0)) {
    client.unmount();
    client.clear();
  }
});

describe('useSendMessage — optimistic update', () => {
  it('shows the message immediately, then reconciles it with the server id', async () => {
    mockFetchOnce({
      id: 101,
      userId: CONTACT_ID,
      title: 'Yes, 3pm works',
      body: 'Yes, 3pm works',
      tags: ['chat'],
      category: 'Chat',
      createdAt: '2026-01-15T12:00:05Z',
    });

    const { Wrapper, queryClient, store } = makeWrapper();
    seedThread(queryClient, [existing]);

    const { result, unmount } = await renderHook(
      () => ({
        send: useSendMessage(CONTACT_ID),
        thread: useChatThread(CONTACT_ID),
      }),
      { wrapper: Wrapper },
    );

    await act(async () => {
      result.current.send.mutate({ text: 'Yes, 3pm works' });
    });

    await waitFor(() => {
      expect(messagesOf(result.current.thread)).toHaveLength(2);
    });
    expect(messagesOf(result.current.thread).at(-1)?.text).toBe('Yes, 3pm works');

    await waitFor(() => {
      expect(messagesOf(result.current.thread).at(-1)?.status).toBe('sent');
    });

    const sent = messagesOf(result.current.thread).at(-1);
    expect(sent?.serverId).toBe(101);
    expect(messagesOf(result.current.thread)).toHaveLength(2);

    const outbox = store.getState().outbox.byConversation[CONTACT_ID];
    expect(outbox).toHaveLength(1);
    expect(outbox[0].status).toBe('sent');
    expect(outbox[0].serverId).toBe(101);

    await unmount();
  });

  it('rolls the cache back and marks the outbox entry failed when the send fails', async () => {
    mockFetchOnce(null, false);

    const { Wrapper, queryClient, store } = makeWrapper();
    seedThread(queryClient, [existing]);

    const { result, unmount } = await renderHook(
      () => ({
        send: useSendMessage(CONTACT_ID),
        thread: useChatThread(CONTACT_ID),
      }),
      { wrapper: Wrapper },
    );

    await act(async () => {
      result.current.send.mutate({ text: 'This one will not land' });
    });

    await waitFor(() => {
      expect(result.current.send.isError).toBe(true);
    });

    const fromServer = messagesOf(result.current.thread).filter((m) => m.status === 'sent');
    expect(fromServer).toHaveLength(1);
    expect(fromServer[0].id).toBe('srv:1');

    const outbox = store.getState().outbox.byConversation[CONTACT_ID];
    expect(outbox).toHaveLength(1);
    expect(outbox[0].status).toBe('failed');
    expect(outbox[0].text).toBe('This one will not land');

    expect(messagesOf(result.current.thread).some((m) => m.status === 'failed')).toBe(true);

    await unmount();
  });
});

function messagesOf(thread: { items: { kind: string }[] }): Message[] {
  return thread.items
    .filter((item): item is { kind: 'message'; message: Message } => item.kind === 'message')
    .map((item) => item.message);
}
