import { Children, type ReactNode } from 'react';

import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

export interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  const rows = Children.toArray(children).filter(Boolean);

  return (
    <VStack className="gap-2">
      <Text className="px-5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </Text>
      <Card className="mx-4 gap-0 rounded-2xl bg-background p-0">
        {rows.map((row, index) => (
          <VStack key={index}>
            {index > 0 ? <Divider className="ml-16" /> : null}
            {row}
          </VStack>
        ))}
      </Card>
    </VStack>
  );
}
