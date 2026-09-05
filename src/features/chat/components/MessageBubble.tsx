import { memo, useCallback } from 'react';

import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { AlertCircleIcon, CheckIcon, ClockIcon, Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { formatMessageTime } from '@/lib/format/date';

import type { Message } from '../model/message';

export interface MessageBubbleProps {
  message: Message;
  isGroupStart: boolean;
  isGroupEnd: boolean;
  onRetry?: (message: Message) => void;
}

export const MessageBubble = memo(function MessageBubble({
  message,
  isGroupStart,
  isGroupEnd,
  onRetry,
}: MessageBubbleProps) {
  const isOutgoing = message.direction === 'outgoing';
  const isFailed = message.status === 'failed';

  const handleRetry = useCallback(() => onRetry?.(message), [onRetry, message]);

  const bubble = (
    <Box
      className={[
        'max-w-[80%] px-3.5 py-2',
        isOutgoing ? 'bg-bubble-out' : 'bg-bubble-in border border-border',
        isFailed ? 'border border-destructive' : '',
        cornerClasses(isOutgoing, isGroupStart, isGroupEnd),
      ].join(' ')}>
      <Text
        className={[
          'text-[15px] leading-5',
          isOutgoing ? 'text-bubble-out-foreground' : 'text-bubble-in-foreground',
        ].join(' ')}>
        {message.text}
      </Text>

      <HStack className="mt-1 items-center justify-end gap-1">
        <Text
          className={[
            'text-[10px]',
            isOutgoing ? 'text-bubble-out-foreground/70' : 'text-muted-foreground',
          ].join(' ')}>
          {formatMessageTime(message.createdAt)}
        </Text>
        {isOutgoing ? <StatusGlyph status={message.status} /> : null}
      </HStack>
    </Box>
  );

  return (
    <HStack
      className={[
        'px-3',
        isGroupEnd ? 'mb-2' : 'mb-0.5',
        isOutgoing ? 'justify-end' : 'justify-start',
      ].join(' ')}>
      {isFailed && onRetry ? (
        <Pressable
          onPress={handleRetry}
          accessibilityRole="button"
          accessibilityLabel="Message failed to send. Tap to retry."
          className="items-end active:opacity-70">
          {bubble}
          <Text className="mt-0.5 text-[10px] text-destructive">Not delivered · Tap to retry</Text>
        </Pressable>
      ) : (
        bubble
      )}
    </HStack>
  );
});

function StatusGlyph({ status }: { status: Message['status'] }) {
  if (status === 'sending') {
    return <Icon as={ClockIcon} className="h-3 w-3 text-bubble-out-foreground/70" />;
  }
  if (status === 'failed') {
    return <Icon as={AlertCircleIcon} className="h-3 w-3 text-destructive" />;
  }
  return <Icon as={CheckIcon} className="h-3 w-3 text-bubble-out-foreground/70" />;
}

function cornerClasses(isOutgoing: boolean, isGroupStart: boolean, isGroupEnd: boolean): string {
  const base = 'rounded-2xl';
  if (isGroupStart && isGroupEnd) return base;
  if (isOutgoing) {
    if (isGroupStart) return `${base} rounded-br-md`;
    if (isGroupEnd) return `${base} rounded-tr-md`;
    return `${base} rounded-r-md`;
  }
  if (isGroupStart) return `${base} rounded-bl-md`;
  if (isGroupEnd) return `${base} rounded-tl-md`;
  return `${base} rounded-l-md`;
}
