import { useCallback, useState } from 'react';
import { Platform } from 'react-native';

import { Box } from '@/components/ui/box';
import { Button, ButtonIcon } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { ArrowUpIcon, Icon, SlashIcon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Textarea, TextareaInput } from '@/components/ui/textarea';

export interface MessageComposerProps {
  onSend: (text: string) => boolean;
  isBlocked: boolean;
  contactName: string;
  onUnblock: () => void;
  enterToSend: boolean;
}

const MAX_LENGTH = 2_000;

export function MessageComposer({
  onSend,
  isBlocked,
  contactName,
  onUnblock,
  enterToSend,
}: MessageComposerProps) {
  const [text, setText] = useState('');
  const canSend = text.trim().length > 0;

  const handleSend = useCallback(() => {
    if (!canSend) return;
    if (onSend(text)) setText('');
  }, [canSend, onSend, text]);

  if (isBlocked) {
    return (
      <Box className="border-t border-border bg-background px-4 py-4">
        <HStack className="items-center justify-center gap-2">
          <Icon as={SlashIcon} className="h-4 w-4 text-muted-foreground" />
          <Text className="text-sm text-muted-foreground">
            You blocked {contactName}.{' '}
            <Text className="text-sm font-semibold text-brand" onPress={onUnblock}>
              Unblock
            </Text>
          </Text>
        </HStack>
      </Box>
    );
  }

  return (
    <Box className="border-t border-border bg-background px-3 py-2">
      <HStack className="items-end gap-2">
        <Textarea className="min-h-11 flex-1 rounded-3xl border-border bg-muted/60 px-1">
          <TextareaInput
            value={text}
            onChangeText={setText}
            placeholder="Message"
            maxLength={MAX_LENGTH}
            multiline
            blurOnSubmit={enterToSend}
            onSubmitEditing={enterToSend ? handleSend : undefined}
            returnKeyType={enterToSend ? 'send' : 'default'}
            className="max-h-32 py-2 text-[15px] leading-5 text-foreground"
            accessibilityLabel={`Message ${contactName}`}
            textAlignVertical={Platform.OS === 'android' ? 'center' : undefined}
          />
        </Textarea>

        <Button
          onPress={handleSend}
          isDisabled={!canSend}
          accessibilityLabel="Send message"
          className="h-11 w-11 rounded-full bg-brand p-0 data-[disabled=true]:bg-muted">
          <ButtonIcon as={ArrowUpIcon} className="h-5 w-5 text-brand-foreground" />
        </Button>
      </HStack>
    </Box>
  );
}
