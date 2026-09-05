import type { CreatePostDto, PostDto } from '@/lib/api/dto';
import { request } from '@/lib/api/http';
import type { PageParam, Paginated } from '@/lib/api/pagination';

export function fetchThreadPage(
  contactId: number,
  { offset, limit }: PageParam,
  signal?: AbortSignal,
): Promise<Paginated<PostDto>> {
  return request<Paginated<PostDto>>('/posts', {
    query: { userId: contactId, offset, limit },
    signal,
  });
}

export interface SendMessageRequest {
  contactId: number;
  text: string;
}

export function createMessage({ contactId, text }: SendMessageRequest): Promise<PostDto> {
  const body: CreatePostDto = {
    userId: contactId,
    title: text.slice(0, 60),
    body: text,
    category: 'Chat',
    tags: ['chat'],
  };
  return request<PostDto>('/posts', { method: 'POST', body });
}
