import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import type { UserDto } from '@/lib/api/dto';
import { FIRST_PAGE, flattenPages, getNextOffsetParam, type Paginated } from '@/lib/api/pagination';
import { queryKeys } from '@/lib/query/keys';

import { toContact, type Contact } from '../model/contact';
import { fetchContact, fetchContactsPage } from './contacts.api';

export function useContactsInfiniteQuery() {
  const query = useInfiniteQuery({
    queryKey: queryKeys.contacts.list(),
    queryFn: ({ pageParam, signal }) => fetchContactsPage(pageParam, signal),
    initialPageParam: FIRST_PAGE,
    getNextPageParam: getNextOffsetParam<UserDto>,
    select: (data) => ({
      contacts: flattenPages(data.pages, (user) => user.id).map(toContact),
      total: data.pages[0]?.total ?? 0,
    }),
  });

  const contacts = query.data?.contacts ?? EMPTY_CONTACTS;

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return { ...query, contacts, total: query.data?.total ?? 0, loadMore };
}

const EMPTY_CONTACTS: Contact[] = [];

export function useContactQuery(contactId: number) {
  const queryClient = useQueryClient();

  const initialContact = useMemo(
    () => findContactInListCache(queryClient, contactId),
    [queryClient, contactId],
  );

  return useQuery({
    queryKey: queryKeys.contacts.detail(contactId),
    queryFn: ({ signal }) => fetchContact(contactId, signal),
    select: toContact,
    enabled: Number.isFinite(contactId),
    initialData: initialContact,
    initialDataUpdatedAt: initialContact ? () => Date.now() - 30_000 : undefined,
  });
}

function findContactInListCache(
  queryClient: ReturnType<typeof useQueryClient>,
  contactId: number,
): UserDto | undefined {
  const caches = queryClient.getQueriesData<{ pages: Paginated<UserDto>[] }>({
    queryKey: queryKeys.contacts.lists(),
  });

  for (const [, data] of caches) {
    for (const page of data?.pages ?? []) {
      const match = page.results.find((user) => user.id === contactId);
      if (match) return match;
    }
  }
  return undefined;
}
