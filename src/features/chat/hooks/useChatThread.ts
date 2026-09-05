import { useMemo } from 'react';

import { flattenPages } from '@/lib/api/pagination';
import { useAppSelector } from '@/store/hooks';
import { selectOutboxForConversation } from '@/store/selectors';

import { useThreadQuery } from '../api/messages.queries';
import { buildChatListItems, byCreatedAtAsc, type ChatListItem, type Message } from '../model/message';

export interface ChatThread {
  items: ChatListItem[];
  messageCount: number;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isRefetching: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  loadMore: () => void;
  refetch: () => void;
}

export function useChatThread(contactId: number): ChatThread {
  const query = useThreadQuery(contactId);
  const outbox = useAppSelector((state) => selectOutboxForConversation(state, contactId));

  const serverMessages = useMemo(
    () => flattenPages(query.data?.pages, (message) => message.id),
    [query.data?.pages],
  );

  const messages = useMemo(() => mergeMessages(serverMessages, outbox), [serverMessages, outbox]);
  const items = useMemo(() => buildChatListItems(messages), [messages]);

  return {
    items,
    messageCount: messages.length,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isRefetching: query.isRefetching,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    loadMore: query.loadMore,
    refetch: query.refetch,
  };
}

export function mergeMessages(serverMessages: Message[], outbox: Message[]): Message[] {
  if (outbox.length === 0) return [...serverMessages].sort(byCreatedAtAsc);

  const known = new Set<string>();
  for (const message of serverMessages) {
    known.add(message.id);
    if (message.clientId) known.add(message.clientId);
    if (message.serverId !== undefined) known.add(`srv:${message.serverId}`);
  }

  const merged = serverMessages.slice();
  for (const message of outbox) {
    const clientId = message.clientId ?? message.id;
    if (known.has(clientId)) continue;
    if (message.serverId !== undefined && known.has(`srv:${message.serverId}`)) continue;
    merged.push(message);
  }

  return merged.sort(byCreatedAtAsc);
}
