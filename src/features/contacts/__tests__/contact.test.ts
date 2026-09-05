import type { UserDto } from '@/lib/api/dto';

import {
  buildConversationPreview,
  EMPTY_PREVIEW_TEXT,
  toContact,
  toInitials,
} from '../model/contact';

const dto: UserDto = {
  id: 7,
  name: 'Grace Harris',
  username: 'graceh',
  email: 'grace.harris@example.com',
  avatar: 'https://i.pravatar.cc/150?img=7',
  phone: '+1-202-555-0707',
  website: 'https://graceharris.dev',
  address: { street: '99 Walnut Rd', city: 'Portland', zipcode: '97205' },
};

describe('toContact', () => {
  it('projects the wire shape onto the domain model', () => {
    expect(toContact(dto)).toEqual({
      id: 7,
      name: 'Grace Harris',
      username: 'graceh',
      phone: '+1-202-555-0707',
      avatarUrl: 'https://i.pravatar.cc/150?img=7',
      city: 'Portland',
      initials: 'GH',
    });
  });

  it('survives a missing address', () => {
    expect(toContact({ ...dto, address: undefined as never }).city).toBe('');
  });
});

describe('toInitials', () => {
  it.each([
    ['Grace Harris', 'GH'],
    ['Cher', 'CH'],
    ['Mary Jane Watson', 'MW'],
    ['   ', '?'],
  ])('maps %s to %s', (input, expected) => {
    expect(toInitials(input)).toBe(expected);
  });
});

describe('buildConversationPreview', () => {
  it('prompts the user when nothing has been sent yet', () => {
    expect(buildConversationPreview(undefined)).toEqual({
      text: EMPTY_PREVIEW_TEXT,
      isEmpty: true,
    });
  });

  it('shows the last sent message once one exists', () => {
    expect(
      buildConversationPreview({
        text: 'On my way',
        createdAt: '2026-01-01T12:00:00Z',
        status: 'sent',
      }),
    ).toEqual({
      text: 'On my way',
      timestamp: '2026-01-01T12:00:00Z',
      status: 'sent',
      isEmpty: false,
    });
  });

  it('carries no timestamp for an untouched conversation', () => {
    expect(buildConversationPreview(undefined).timestamp).toBeUndefined();
  });

  it('carries no status for an untouched conversation', () => {
    expect(buildConversationPreview(undefined).status).toBeUndefined();
  });

  it.each(['sending', 'sent', 'failed'] as const)('passes through a %s status', (status) => {
    const preview = buildConversationPreview({
      text: 'hello',
      createdAt: '2026-01-01T12:00:00Z',
      status,
    });
    expect(preview.status).toBe(status);
  });
});
