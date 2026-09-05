import type { ComponentProps } from 'react';

import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

export interface EmptyStateProps {
  icon: ComponentProps<typeof Icon>['as'];
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <VStack className="flex-1 items-center justify-center gap-3 px-10 py-16">
      <Box className="h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Icon as={icon} className="h-7 w-7 text-muted-foreground" />
      </Box>
      <Heading size="sm" className="text-center text-foreground">
        {title}
      </Heading>
      <Text className="text-center text-sm text-muted-foreground">{description}</Text>
      {actionLabel && onAction ? (
        <Button variant="outline" size="sm" onPress={onAction} className="mt-2">
          <ButtonText>{actionLabel}</ButtonText>
        </Button>
      ) : null}
    </VStack>
  );
}
