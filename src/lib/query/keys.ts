export const queryKeys = {
  contacts: {
    all: ['contacts'] as const,
    lists: () => [...queryKeys.contacts.all, 'list'] as const,
    list: (params: { search?: string } = {}) => [...queryKeys.contacts.lists(), params] as const,
    details: () => [...queryKeys.contacts.all, 'detail'] as const,
    detail: (contactId: number) => [...queryKeys.contacts.details(), contactId] as const,
  },
  messages: {
    all: ['messages'] as const,
    threads: () => [...queryKeys.messages.all, 'thread'] as const,
    thread: (contactId: number) => [...queryKeys.messages.threads(), contactId] as const,
  },
} as const;

export type QueryKeys = typeof queryKeys;
