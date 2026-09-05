import { FlashList, type ListRenderItemInfo } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { RefreshControl } from 'react-native';

import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { ListFooterLoader } from '@/components/common/ListFooterLoader';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { Box } from '@/components/ui/box';
import { MessageCircleIcon } from '@/components/ui/icon';
import { useContactsInfiniteQuery } from '@/features/contacts/api/contacts.queries';
import { ContactListItem, CONTACT_ROW_HEIGHT } from '@/features/contacts/components/ContactListItem';
import { ContactListSkeleton } from '@/features/contacts/components/ContactListSkeleton';
import { buildConversationPreview, type Contact } from '@/features/contacts/model/contact';
import { useAppSelector } from '@/store/hooks';
import { selectBlockedIds, selectLastSentMessages } from '@/store/selectors';

export default function ChatsScreen() {
  const router = useRouter();
  const blockedIds = useAppSelector(selectBlockedIds);
  const lastSentMessages = useAppSelector(selectLastSentMessages);
  const {
    contacts,
    total,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    loadMore,
  } = useContactsInfiniteQuery();

  const previews = useMemo(
    () =>
      new Map(
        contacts.map((contact) => [
          contact.id,
          buildConversationPreview(lastSentMessages[contact.id]),
        ]),
      ),
    [contacts, lastSentMessages],
  );

  const openChat = useCallback(
    (contactId: number) => router.push(`/chat/${contactId}`),
    [router],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Contact>) => (
      <ContactListItem
        contact={item}
        preview={previews.get(item.id) ?? buildConversationPreview(lastSentMessages[item.id])}
        isBlocked={Boolean(blockedIds[item.id])}
        onPress={openChat}
      />
    ),
    [previews, lastSentMessages, blockedIds, openChat],
  );

  return (
    <Box className="flex-1 bg-background">
      <ScreenHeader
        title="Chats"
        subtitle={total > 0 ? `${contacts.length} of ${total} conversations` : undefined}
      />

      {isLoading ? (
        <ContactListSkeleton />
      ) : isError && contacts.length === 0 ? (
        <ErrorState error={error} onRetry={refetch} title="Couldn't load your chats" />
      ) : (
        <FlashList
          data={contacts}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          drawDistance={CONTACT_ROW_HEIGHT * 6}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          ListEmptyComponent={
            <EmptyState
              icon={MessageCircleIcon}
              title="No conversations yet"
              description="When someone messages you, the conversation will show up here."
              actionLabel="Refresh"
              onAction={refetch}
            />
          }
          ListFooterComponent={
            <ListFooterLoader
              isFetching={isFetchingNextPage}
              hasMore={hasNextPage}
              endLabel="You're all caught up"
            />
          }
        />
      )}
    </Box>
  );
}

const keyExtractor = (contact: Contact) => String(contact.id);
