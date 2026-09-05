import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { useCallback } from 'react';

import { FIRST_PAGE, getNextOffsetParam, type Paginated } from '@/lib/api/pagination';
import { queryKeys } from '@/lib/query/keys';
import { createClientId } from '@/lib/utils/id';
import { useAppDispatch } from '@/store/hooks';
import { messageFailed, messageQueued, messageSent } from '@/store/slices/outbox.slice';

import { byCreatedAtAsc, toMessage, type Message } from '../model/message';
import { createMessage, fetchThreadPage } from './messages.api';

type ThreadData = InfiniteData<Paginated<Message>, unknown>;

export function useThreadQuery(contactId: number) {
  const query = useInfiniteQuery({
    queryKey: queryKeys.messages.thread(contactId),
    enabled: Number.isFinite(contactId),
    queryFn: async ({ pageParam, signal }) => {
      const page = await fetchThreadPage(contactId, pageParam, signal);
      return { ...page, results: page.results.map(toMessage) } satisfies Paginated<Message>;
    },
    initialPageParam: FIRST_PAGE,
    getNextPageParam: getNextOffsetParam<Message>,
  });

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return { ...query, loadMore };
}

export interface SendMessageVariables {
  text: string;
  clientId?: string;
}

export function useSendMessage(contactId: number) {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const queryKey = queryKeys.messages.thread(contactId);

  return useMutation({
    mutationKey: ['sendMessage', contactId],
    mutationFn: ({ text }: SendMessageVariables) => createMessage({ contactId, text }),

    onMutate: async ({ text, clientId }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ThreadData>(queryKey);

      const optimistic: Message = {
        id: clientId ?? createClientId('msg'),
        clientId: clientId ?? undefined,
        conversationId: contactId,
        direction: 'outgoing',
        text,
        createdAt: new Date().toISOString(),
        status: 'sending',
      };
      optimistic.clientId = optimistic.id;

      queryClient.setQueryData<ThreadData>(queryKey, (data) => appendMessage(data, optimistic));
      dispatch(messageQueued(optimistic));

      return { previous, optimistic };
    },

    onSuccess: (created, _variables, context) => {
      if (!context) return;
      const { optimistic } = context;

      queryClient.setQueryData<ThreadData>(queryKey, (data) =>
        patchMessage(data, optimistic.id, (message) => ({
          ...message,
          serverId: created.id,
          createdAt: created.createdAt ?? message.createdAt,
          status: 'sent',
        })),
      );

      dispatch(
        messageSent({
          conversationId: contactId,
          clientId: optimistic.id,
          serverId: created.id,
          createdAt: created.createdAt ?? optimistic.createdAt,
        }),
      );
    },

    onError: (_error, _variables, context) => {
      if (!context) return;
      queryClient.setQueryData<ThreadData>(queryKey, context.previous);
      dispatch(messageFailed({ conversationId: contactId, clientId: context.optimistic.id }));
    },

  });
}

function appendMessage(data: ThreadData | undefined, message: Message): ThreadData {
  if (!data || data.pages.length === 0) {
    return {
      pages: [{ total: 1, limit: FIRST_PAGE.limit, offset: 0, results: [message] }],
      pageParams: [FIRST_PAGE],
    };
  }

  const pages = data.pages.slice();
  const lastIndex = pages.length - 1;
  const lastPage = pages[lastIndex];
  pages[lastIndex] = {
    ...lastPage,
    total: lastPage.total + 1,
    results: [...lastPage.results, message].sort(byCreatedAtAsc),
  };

  return { ...data, pages };
}

function patchMessage(
  data: ThreadData | undefined,
  messageId: string,
  update: (message: Message) => Message,
): ThreadData | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => {
      if (!page.results.some((message) => message.id === messageId)) return page;
      return {
        ...page,
        results: page.results.map((message) => (message.id === messageId ? update(message) : message)),
      };
    }),
  };
}
