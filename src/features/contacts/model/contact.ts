import type { UserDto } from '@/lib/api/dto';

export interface Contact {
  id: number;
  name: string;
  username: string;
  phone: string;
  avatarUrl: string;
  city: string;
  initials: string;
}

export function toContact(dto: UserDto): Contact {
  return {
    id: dto.id,
    name: dto.name,
    username: dto.username,
    phone: dto.phone,
    avatarUrl: dto.avatar,
    city: dto.address?.city ?? '',
    initials: toInitials(dto.name),
  };
}

export function toInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export const EMPTY_PREVIEW_TEXT = 'Tap here to message';

export type PreviewStatus = 'sending' | 'sent' | 'failed';

export interface ConversationPreview {
  text: string;
  timestamp?: string;
  status?: PreviewStatus;
  isEmpty: boolean;
}

const EMPTY_PREVIEW: ConversationPreview = { text: EMPTY_PREVIEW_TEXT, isEmpty: true };

export function buildConversationPreview(lastSent?: LastSentMessage): ConversationPreview {
  if (!lastSent) return EMPTY_PREVIEW;
  return {
    text: lastSent.text,
    timestamp: lastSent.createdAt,
    status: lastSent.status,
    isEmpty: false,
  };
}

export interface LastSentMessage {
  text: string;
  createdAt: string;
  status: PreviewStatus;
}
