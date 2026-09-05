import { FlashList, type ListRenderItemInfo } from '@shopify/flash-list';
import { useCallback } from 'react';
import { RefreshControl } from 'react-native';

import { ListFooterLoader } from '@/components/common/ListFooterLoader';

import type { ChatListItem, Message } from '../model/message';
import { DayDivider } from './DayDivider';
import { MessageBubble } from './MessageBubble';

export interface MessageListProps {
  items: ChatListItem[];
  isRefetching: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onRefresh: () => void;
  onRetryMessage: (message: Message) => void;
  ListEmptyComponent?: React.ReactElement;
}

export function MessageList({
  items,
  isRefetching,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onRefresh,
  onRetryMessage,
  ListEmptyComponent,
}: MessageListProps) {
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ChatListItem>) => {
      if (item.kind === 'divider') return <DayDivider iso={item.iso} />;
      return (
        <MessageBubble
          message={item.message}
          isGroupStart={item.isGroupStart}
          isGroupEnd={item.isGroupEnd}
          onRetry={onRetryMessage}
        />
      );
    },
    [onRetryMessage],
  );

  return (
    <FlashList
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemType={getItemType}
      contentContainerStyle={{ paddingVertical: 8 }}
      maintainVisibleContentPosition={{
        startRenderingFromBottom: true,
        autoscrollToBottomThreshold: 0.2,
      }}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.4}
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
      ListEmptyComponent={ListEmptyComponent}
      ListFooterComponent={
        <ListFooterLoader isFetching={isFetchingNextPage} hasMore={hasNextPage} />
      }
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}
    />
  );
}

const keyExtractor = (item: ChatListItem) => item.key;
const getItemType = (item: ChatListItem) => item.kind;
