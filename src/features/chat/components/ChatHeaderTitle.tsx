import { ContactAvatar } from '@/components/common/ContactAvatar';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';

import type { Contact } from '@/features/contacts/model/contact';

export interface ChatHeaderTitleProps {
  contact?: Contact;
  isBlocked: boolean;
  onPress: () => void;
}

export function ChatHeaderTitle({ contact, isBlocked, onPress }: ChatHeaderTitleProps) {
  if (!contact) {
    return (
      <HStack className="items-center gap-2.5">
        <Skeleton className="h-9 w-9 rounded-full" />
        <SkeletonText _lines={1} className="h-3.5 w-28" />
      </HStack>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View ${contact.name}'s profile`}
      className="active:opacity-60">
      <HStack className="items-center gap-2.5">
        <ContactAvatar
          name={contact.name}
          initials={contact.initials}
          uri={contact.avatarUrl}
          className="h-9 w-9"
        />
        <VStack>
          <Text numberOfLines={1} className="text-base font-semibold text-foreground">
            {contact.name}
          </Text>
          <Text className="text-[11px] text-muted-foreground">
            {isBlocked ? 'Blocked' : `@${contact.username}`}
          </Text>
        </VStack>
      </HStack>
    </Pressable>
  );
}
