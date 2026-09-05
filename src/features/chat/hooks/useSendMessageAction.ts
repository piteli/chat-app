import { useCallback } from 'react';

import { useAppDispatch } from '@/store/hooks';
import { messageDiscarded, messageRetried } from '@/store/slices/outbox.slice';

import { useSendMessage } from '../api/messages.queries';
import type { Message } from '../model/message';

export function useSendMessageAction(contactId: number) {
  const dispatch = useAppDispatch();
  const mutation = useSendMessage(contactId);

  const send = useCallback(
    (rawText: string) => {
      const text = rawText.trim();
      if (!text) return false;
      mutation.mutate({ text });
      return true;
    },
    [mutation],
  );

  const retry = useCallback(
    (message: Message) => {
      const clientId = message.clientId ?? message.id;
      dispatch(messageRetried({ conversationId: contactId, clientId }));
      dispatch(messageDiscarded({ conversationId: contactId, clientId }));
      mutation.mutate({ text: message.text });
    },
    [contactId, dispatch, mutation],
  );

  const discard = useCallback(
    (message: Message) => {
      dispatch(messageDiscarded({ conversationId: contactId, clientId: message.clientId ?? message.id }));
    },
    [contactId, dispatch],
  );

  return { send, retry, discard, isSending: mutation.isPending, error: mutation.error };
}
