import { HStack } from '@/components/ui/hstack';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { VStack } from '@/components/ui/vstack';

import { CONTACT_ROW_HEIGHT } from './ContactListItem';

export function ContactListSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <VStack accessibilityLabel="Loading conversations">
      {Array.from({ length: rows }, (_, index) => (
        <HStack
          key={index}
          className="items-center gap-3 px-4 py-3"
          style={{ height: CONTACT_ROW_HEIGHT }}>
          <Skeleton className="h-14 w-14 rounded-full" />
          <VStack className="flex-1 gap-2">
            <SkeletonText _lines={1} className="h-3.5 w-2/5" />
            <SkeletonText _lines={1} className="h-3 w-4/5" />
          </VStack>
        </HStack>
      ))}
    </VStack>
  );
}
