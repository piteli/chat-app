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

  // Optimistic entries the mutation wrote into the query cache keep their clientId,
  // so identity matching happens there. A serverId only identifies a message when it
  // came back from the server on its own: the API reuses one id for every created
  // post, so trusting it on echoes would fold every sent message into a single bubble.
  const knownClientIds = new Set<string>();
  const unclaimedServerIds = new Map<number, number>();

  for (const message of serverMessages) {
    knownClientIds.add(message.id);
    if (message.clientId) {
      knownClientIds.add(message.clientId);
    } else if (message.serverId !== undefined) {
      unclaimedServerIds.set(message.serverId, (unclaimedServerIds.get(message.serverId) ?? 0) + 1);
    }
  }

  const merged = serverMessages.slice();
  for (const message of outbox) {
    if (knownClientIds.has(message.clientId ?? message.id)) continue;

    // One server message can only be the echo of one outbox entry, so claim it.
    const unclaimed = message.serverId !== undefined ? unclaimedServerIds.get(message.serverId) : undefined;
    if (unclaimed) {
      unclaimedServerIds.set(message.serverId as number, unclaimed - 1);
      continue;
    }

    merged.push(message);
  }

  return merged.sort(byCreatedAtAsc);
}
