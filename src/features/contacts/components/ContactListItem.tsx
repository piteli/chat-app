import { memo, useCallback } from 'react';

import { ContactAvatar } from '@/components/common/ContactAvatar';
import { HStack } from '@/components/ui/hstack';
import { AlertCircleIcon, CheckIcon, ClockIcon, Icon, SlashIcon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { formatListTimestamp } from '@/lib/format/date';

import type { Contact, ConversationPreview, PreviewStatus } from '../model/contact';

export const CONTACT_ROW_HEIGHT = 76;

export interface ContactListItemProps {
  contact: Contact;
  preview: ConversationPreview;
  isBlocked: boolean;
  onPress: (contactId: number) => void;
}

export const ContactListItem = memo(function ContactListItem({
  contact,
  preview,
  isBlocked,
  onPress,
}: ContactListItemProps) {
  const handlePress = useCallback(() => onPress(contact.id), [onPress, contact.id]);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Open conversation with ${contact.name}`}
      className="active:bg-muted/60">
      <HStack className="items-center gap-3 px-4 py-3" style={{ height: CONTACT_ROW_HEIGHT }}>
        <ContactAvatar
          name={contact.name}
          initials={contact.initials}
          uri={contact.avatarUrl}
          className="h-14 w-14"
        />

        <VStack className="flex-1 gap-0.5">
          <HStack className="items-center gap-1.5">
            <Text
              numberOfLines={1}
              className="flex-1 text-base font-semibold text-foreground">
              {contact.name}
            </Text>
            {preview.timestamp ? (
              <Text className="text-xs text-muted-foreground">
                {formatListTimestamp(preview.timestamp)}
              </Text>
            ) : null}
          </HStack>

          <HStack className="items-center gap-1.5">
            {isBlocked ? (
              <Icon as={SlashIcon} className="h-3.5 w-3.5 text-muted-foreground" />
            ) : preview.status ? (
              <PreviewStatusGlyph status={preview.status} />
            ) : null}
            <Text
              numberOfLines={1}
              className={[
                'flex-1 text-sm text-muted-foreground',
                preview.isEmpty && !isBlocked ? 'italic' : '',
              ].join(' ')}>
              {isBlocked ? 'You blocked this contact' : preview.text}
            </Text>
          </HStack>
        </VStack>
      </HStack>
    </Pressable>
  );
});

function PreviewStatusGlyph({ status }: { status: PreviewStatus }) {
  if (status === 'sending') {
    return <Icon as={ClockIcon} className="h-3.5 w-3.5 text-muted-foreground" />;
  }
  if (status === 'failed') {
    return <Icon as={AlertCircleIcon} className="h-3.5 w-3.5 text-destructive" />;
  }
  return <Icon as={CheckIcon} className="h-3.5 w-3.5 text-muted-foreground" />;
}
