import type { ReactNode } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}

export function ScreenHeader({ title, subtitle, right }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <Box
      className="border-b border-border bg-background px-4 pb-3"
      style={{ paddingTop: insets.top + 8 }}>
      <HStack className="items-end justify-between">
        <Box>
          <Heading size="xl" className="text-foreground">
            {title}
          </Heading>
          {subtitle ? <Text className="text-xs text-muted-foreground">{subtitle}</Text> : null}
        </Box>
        {right}
      </HStack>
    </Box>
  );
}
