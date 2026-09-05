import { memo } from 'react';

import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { formatDayDivider } from '@/lib/format/date';

export const DayDivider = memo(function DayDivider({ iso }: { iso: string }) {
  return (
    <Box className="items-center py-3">
      <Box className="rounded-full bg-muted px-3 py-1">
        <Text className="text-[11px] font-medium text-muted-foreground">
          {formatDayDivider(iso)}
        </Text>
      </Box>
    </Box>
  );
});
