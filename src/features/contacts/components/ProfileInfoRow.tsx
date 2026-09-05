import type { ComponentProps } from 'react';

import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

export interface ProfileInfoRowProps {
  icon: ComponentProps<typeof Icon>['as'];
  label: string;
  value: string;
  onPress?: () => void;
}

export function ProfileInfoRow({ icon, label, value, onPress }: ProfileInfoRowProps) {
  const content = (
    <HStack className="items-center gap-3 px-4 py-3">
      <Box className="h-9 w-9 items-center justify-center rounded-full bg-muted">
        <Icon as={icon} className="h-4 w-4 text-muted-foreground" />
      </Box>
      <VStack className="flex-1 gap-0.5">
        <Text className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</Text>
        <Text
          numberOfLines={1}
          className={`text-[15px] ${onPress ? 'text-brand' : 'text-foreground'}`}>
          {value}
        </Text>
      </VStack>
    </HStack>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      className="active:bg-muted/60">
      {content}
    </Pressable>
  );
}
