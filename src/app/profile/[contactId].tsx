import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Linking, ScrollView } from 'react-native';

import { ContactAvatar } from '@/components/common/ContactAvatar';
import { ErrorState } from '@/components/common/ErrorState';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import {
  AtSignIcon,
  GlobeIcon,
  Icon,
  MessageCircleIcon,
  PhoneIcon,
  SlashIcon,
} from '@/components/ui/icon';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useContactQuery } from '@/features/contacts/api/contacts.queries';
import { ProfileInfoRow } from '@/features/contacts/components/ProfileInfoRow';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsContactBlocked } from '@/store/selectors';
import { blockToggled } from '@/store/slices/blockedContacts.slice';

export default function ProfileScreen() {
  const router = useRouter();
  const { contactId: rawContactId } = useLocalSearchParams<{ contactId: string }>();
  const contactId = Number(rawContactId);

  const dispatch = useAppDispatch();
  const isBlocked = useAppSelector((state) => selectIsContactBlocked(state, contactId));
  const { data: contact, isLoading, isError, error, refetch } = useContactQuery(contactId);

  const toggleBlock = useCallback(() => dispatch(blockToggled(contactId)), [dispatch, contactId]);

  const openChat = useCallback(
    () => router.dismissTo(`/chat/${contactId}`),
    [router, contactId],
  );

  const call = useCallback(() => {
    if (contact?.phone) void Linking.openURL(`tel:${contact.phone.replace(/[^\d+]/g, '')}`);
  }, [contact]);

  if (!Number.isFinite(contactId)) {
    return (
      <>
        <Stack.Screen options={{ title: 'Profile' }} />
        <ErrorState
          error={new Error('invalid route')}
          title="Profile not found"
          onRetry={router.back}
        />
      </>
    );
  }

  if (isError && !contact) {
    return (
      <>
        <Stack.Screen options={{ title: 'Profile' }} />
        <ErrorState error={error} onRetry={refetch} title="Couldn't load this profile" />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: contact?.name ?? 'Profile' }} />

      <ScrollView
        className="flex-1 bg-surface"
        contentContainerStyle={{ paddingBottom: 32 }}
        contentInsetAdjustmentBehavior="automatic">
        <VStack className="items-center gap-3 bg-background px-6 pb-6 pt-8">
          {isLoading && !contact ? (
            <>
              <Skeleton className="h-28 w-28 rounded-full" />
              <SkeletonText _lines={1} className="h-5 w-40" />
              <SkeletonText _lines={1} className="h-3.5 w-24" />
            </>
          ) : (
            <>
              <ContactAvatar
                name={contact?.name ?? ''}
                initials={contact?.initials ?? '?'}
                uri={contact?.avatarUrl}
                className="h-28 w-28"
              />
              <VStack className="items-center gap-1">
                <Heading size="xl" className="text-center text-foreground">
                  {contact?.name}
                </Heading>
                <Text className="text-sm text-muted-foreground">@{contact?.username}</Text>
                {contact?.city ? (
                  <Text className="text-xs text-muted-foreground">{contact.city}</Text>
                ) : null}
              </VStack>

              {isBlocked ? (
                <HStack className="items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1">
                  <Icon as={SlashIcon} className="h-3.5 w-3.5 text-destructive" />
                  <Text className="text-xs font-medium text-destructive">Blocked</Text>
                </HStack>
              ) : null}

              <Button
                onPress={openChat}
                isDisabled={isBlocked}
                className="mt-2 rounded-full bg-brand px-6 data-[disabled=true]:bg-muted">
                <Icon as={MessageCircleIcon} className="mr-2 h-4 w-4 text-brand-foreground" />
                <ButtonText className="text-brand-foreground">Message</ButtonText>
              </Button>
            </>
          )}
        </VStack>

        <Card className="mx-4 mt-4 gap-0 rounded-2xl bg-background p-0">
          {isLoading && !contact ? (
            <VStack className="gap-4 p-4">
              <SkeletonText _lines={2} className="h-3" />
              <SkeletonText _lines={2} className="h-3" />
            </VStack>
          ) : (
            <>
              <ProfileInfoRow
                icon={PhoneIcon}
                label="Phone"
                value={contact?.phone ?? '—'}
                onPress={contact?.phone ? call : undefined}
              />
              <Divider className="ml-16" />
              <ProfileInfoRow icon={AtSignIcon} label="Username" value={contact?.username ?? '—'} />
              {contact?.city ? (
                <>
                  <Divider className="ml-16" />
                  <ProfileInfoRow icon={GlobeIcon} label="Location" value={contact.city} />
                </>
              ) : null}
            </>
          )}
        </Card>

        <Card className="mx-4 mt-4 rounded-2xl bg-background p-0">
          <HStack className="items-center gap-3 px-4 py-3">
            <Box className="h-9 w-9 items-center justify-center rounded-full bg-destructive/10">
              <Icon as={SlashIcon} className="h-4 w-4 text-destructive" />
            </Box>
            <VStack className="flex-1 gap-0.5">
              <Text className="text-[15px] text-foreground">
                {isBlocked ? 'Unblock contact' : 'Block contact'}
              </Text>
              <Text className="text-xs text-muted-foreground">
                {isBlocked
                  ? 'You can message this contact again.'
                  : 'You will not be able to send them messages.'}
              </Text>
            </VStack>
            <Button
              size="sm"
              variant={isBlocked ? 'outline' : 'destructive'}
              onPress={toggleBlock}
              accessibilityLabel={isBlocked ? 'Unblock contact' : 'Block contact'}>
              <ButtonText>{isBlocked ? 'Unblock' : 'Block'}</ButtonText>
            </Button>
          </HStack>
        </Card>
      </ScrollView>
    </>
  );
}
