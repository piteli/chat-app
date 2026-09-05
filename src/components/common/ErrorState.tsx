import { AlertCircleIcon, Icon } from '@/components/ui/icon';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { toUserMessage } from '@/lib/api/errors';

export interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  title?: string;
}

export function ErrorState({ error, onRetry, title = 'Something went wrong' }: ErrorStateProps) {
  return (
    <VStack className="flex-1 items-center justify-center gap-3 px-10 py-16">
      <Box className="h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <Icon as={AlertCircleIcon} className="h-7 w-7 text-destructive" />
      </Box>
      <Heading size="sm" className="text-center text-foreground">
        {title}
      </Heading>
      <Text className="text-center text-sm text-muted-foreground">{toUserMessage(error)}</Text>
      {onRetry ? (
        <Button size="sm" onPress={onRetry} className="mt-2">
          <ButtonText>Try again</ButtonText>
        </Button>
      ) : null}
    </VStack>
  );
}
