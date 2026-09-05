import type { PostDto } from '@/lib/api/dto';
import { toDayKey } from '@/lib/format/date';

export type MessageDirection = 'incoming' | 'outgoing';

export type MessageStatus = 'sending' | 'sent' | 'failed';

export interface Message {
  id: string;
  clientId?: string;
  serverId?: number;
  conversationId: number;
  direction: MessageDirection;
  text: string;
  createdAt: string;
  status: MessageStatus;
}

export function toMessage(dto: PostDto): Message {
  return {
    id: `srv:${dto.id}`,
    serverId: dto.id,
    conversationId: dto.userId,
    direction: dto.id % 2 === 0 ? 'outgoing' : 'incoming',
    text: dto.body?.trim() || dto.title,
    createdAt: dto.createdAt ?? new Date().toISOString(),
    status: 'sent',
  };
}

export function byCreatedAtAsc(a: Message, b: Message): number {
  const delta = Date.parse(a.createdAt) - Date.parse(b.createdAt);
  return delta !== 0 ? delta : a.id.localeCompare(b.id);
}

export type ChatListItem =
  | { kind: 'message'; key: string; message: Message; isGroupStart: boolean; isGroupEnd: boolean }
  | { kind: 'divider'; key: string; iso: string };

export function buildChatListItems(messages: Message[]): ChatListItem[] {
  const items: ChatListItem[] = [];
  let previousDayKey: string | null = null;

  for (let i = 0; i < messages.length; i += 1) {
    const message = messages[i];
    const dayKey = toDayKey(message.createdAt);

    if (dayKey !== previousDayKey) {
      items.push({ kind: 'divider', key: `divider:${dayKey}`, iso: message.createdAt });
      previousDayKey = dayKey;
    }

    const previous = messages[i - 1];
    const next = messages[i + 1];
    const isGroupStart =
      !previous || previous.direction !== message.direction || toDayKey(previous.createdAt) !== dayKey;
    const isGroupEnd =
      !next || next.direction !== message.direction || toDayKey(next.createdAt) !== dayKey;

    items.push({ kind: 'message', key: message.id, message, isGroupStart, isGroupEnd });
  }

  return items;
}
