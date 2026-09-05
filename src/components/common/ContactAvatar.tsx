import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet } from 'react-native';

import { Avatar, AvatarFallbackText } from '@/components/ui/avatar';

export interface ContactAvatarProps {
  name: string;
  initials: string;
  uri?: string;
  className?: string;
  recyclingKey?: string;
}

export const ContactAvatar = memo(function ContactAvatar({
  name,
  initials,
  uri,
  className = 'h-12 w-12',
  recyclingKey,
}: ContactAvatarProps) {
  return (
    <Avatar className={className}>
      <AvatarFallbackText className="text-sm">{initials || name}</AvatarFallbackText>
      {uri ? (
        <Image
          source={{ uri }}
          style={[StyleSheet.absoluteFill, styles.rounded]}
          contentFit="cover"
          transition={120}
          cachePolicy="memory-disk"
          recyclingKey={recyclingKey ?? uri}
          accessibilityLabel={`${name} profile photo`}
        />
      ) : null}
    </Avatar>
  );
});

const styles = StyleSheet.create({
  rounded: { borderRadius: 999 },
});
