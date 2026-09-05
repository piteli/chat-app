import type { UserDto } from '@/lib/api/dto';
import { request } from '@/lib/api/http';
import type { PageParam, Paginated } from '@/lib/api/pagination';

export function fetchContactsPage(
  { offset, limit }: PageParam,
  signal?: AbortSignal,
): Promise<Paginated<UserDto>> {
  return request<Paginated<UserDto>>('/users', { query: { offset, limit }, signal });
}

export function fetchContact(contactId: number, signal?: AbortSignal): Promise<UserDto> {
  return request<UserDto>(`/users/${contactId}`, { signal });
}
