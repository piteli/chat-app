import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';

export interface ListFooterLoaderProps {
  isFetching: boolean;
  hasMore: boolean;
  endLabel?: string;
}

export function ListFooterLoader({ isFetching, hasMore, endLabel }: ListFooterLoaderProps) {
  if (isFetching) {
    return (
      <HStack className="items-center justify-center gap-2 py-6">
        <Spinner size="small" />
        <Text className="text-xs text-muted-foreground">Loading more…</Text>
      </HStack>
    );
  }

  if (!hasMore && endLabel) {
    return (
      <HStack className="items-center justify-center py-6">
        <Text className="text-xs text-muted-foreground">{endLabel}</Text>
      </HStack>
    );
  }

  return null;
}
