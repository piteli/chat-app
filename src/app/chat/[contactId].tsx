import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { Box } from '@/components/ui/box';
import { MessageCircleIcon } from '@/components/ui/icon';
import { KeyboardAvoidingView } from '@/components/ui/keyboard-avoiding-view';
import { Spinner } from '@/components/ui/spinner';
import { ChatHeaderTitle } from '@/features/chat/components/ChatHeaderTitle';
import { MessageComposer } from '@/features/chat/components/MessageComposer';
import { MessageList } from '@/features/chat/components/MessageList';
import { useChatThread } from '@/features/chat/hooks/useChatThread';
import { useSendMessageAction } from '@/features/chat/hooks/useSendMessageAction';
import { useContactQuery } from '@/features/contacts/api/contacts.queries';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsContactBlocked } from '@/store/selectors';
import { blockToggled } from '@/store/slices/blockedContacts.slice';

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { contactId: rawContactId } = useLocalSearchParams<{ contactId: string }>();
  const contactId = Number(rawContactId);

  const contactQuery = useContactQuery(contactId);
  const contact = contactQuery.data;

  const isBlocked = useAppSelector((state) => selectIsContactBlocked(state, contactId));
  const enterToSend = useAppSelector((state) => state.preferences.enterToSend);
  const dispatch = useAppDispatch();

  const thread = useChatThread(contactId);
  const { send, retry } = useSendMessageAction(contactId);

  const openProfile = useCallback(
    () => router.push(`/profile/${contactId}`),
    [router, contactId],
  );

  const handleUnblock = useCallback(
    () => dispatch(blockToggled(contactId)),
    [dispatch, contactId],
  );

  if (!Number.isFinite(contactId)) {
    return (
      <>
        <Stack.Screen options={{ title: 'Chat' }} />
        <ErrorState
          error={new Error('invalid route')}
          title="Conversation not found"
          onRetry={router.back}
        />
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <ChatHeaderTitle contact={contact} isBlocked={isBlocked} onPress={openProfile} />
          ),
          headerTitleAlign: 'left',
        }}
      />

      <KeyboardAvoidingView
        className="flex-1 bg-background"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 44}>
        <Box className="flex-1">
          {thread.isLoading ? (
            <Box className="flex-1 items-center justify-center">
              <Spinner size="large" />
            </Box>
          ) : thread.isError && thread.messageCount === 0 ? (
            <ErrorState
              error={thread.error}
              onRetry={thread.refetch}
              title="Couldn't load this conversation"
            />
          ) : (
            <MessageList
              items={thread.items}
              isRefetching={thread.isRefetching}
              hasNextPage={thread.hasNextPage}
              isFetchingNextPage={thread.isFetchingNextPage}
              onLoadMore={thread.loadMore}
              onRefresh={thread.refetch}
              onRetryMessage={retry}
              ListEmptyComponent={
                <EmptyState
                  icon={MessageCircleIcon}
                  title="No messages yet"
                  description={`Say hello to ${contact?.name ?? 'your contact'} — your first message will appear here.`}
                />
              }
            />
          )}
        </Box>

        <Box style={{ paddingBottom: insets.bottom }}>
          <MessageComposer
            onSend={send}
            isBlocked={isBlocked}
            contactName={contact?.name ?? 'this contact'}
            onUnblock={handleUnblock}
            enterToSend={enterToSend}
          />
        </Box>
      </KeyboardAvoidingView>
    </>
  );
}
