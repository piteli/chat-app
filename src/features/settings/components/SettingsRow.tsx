import type { ComponentProps, ReactNode } from 'react';

import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

export interface SettingsRowProps {
  icon: ComponentProps<typeof Icon>['as'];
  title: string;
  subtitle?: string;
  accessory?: ReactNode;
  onPress?: () => void;
  destructive?: boolean;
}

export function SettingsRow({
  icon,
  title,
  subtitle,
  accessory,
  onPress,
  destructive = false,
}: SettingsRowProps) {
  const content = (
    <HStack className="items-center gap-3 px-4 py-3">
      <Box
        className={`h-9 w-9 items-center justify-center rounded-full ${
          destructive ? 'bg-destructive/10' : 'bg-muted'
        }`}>
        <Icon
          as={icon}
          className={`h-4 w-4 ${destructive ? 'text-destructive' : 'text-muted-foreground'}`}
        />
      </Box>

      <VStack className="flex-1 gap-0.5">
        <Text className={`text-[15px] ${destructive ? 'text-destructive' : 'text-foreground'}`}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={2} className="text-xs text-muted-foreground">
            {subtitle}
          </Text>
        ) : null}
      </VStack>

      {accessory}
    </HStack>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      className="active:bg-muted/60">
      {content}
    </Pressable>
  );
}
