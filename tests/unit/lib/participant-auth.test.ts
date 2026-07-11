import { describe, expect, it } from 'vitest';
import {
  clearParticipantAccess,
  getParticipantAccessSnapshot,
  hasParticipantAccess,
  storeApiSession,
} from '../../../src/lib/participantAuth';

describe('participant auth storage functions', () => {
  it('rejects stale demo participant access snapshots', () => {
    window.localStorage.setItem(
      'verityui_participant_access',
      JSON.stringify({
        provider: 'demo',
        email: 'buyer@test.local',
        participantRole: 'Buyer',
        entityName: 'Acme Buyer',
      })
    );

    expect(hasParticipantAccess()).toBe(false);
    expect(getParticipantAccessSnapshot()).toBeNull();
    expect(window.localStorage.getItem('verityui_participant_access')).toBeNull();
  });

  it('rejects tokenless API participant access snapshots', () => {
    window.localStorage.setItem(
      'verityui_participant_access',
      JSON.stringify({
        provider: 'api',
        email: 'buyer@test.local',
        participantRole: 'Buyer',
      })
    );

    expect(hasParticipantAccess()).toBe(false);
    expect(getParticipantAccessSnapshot()).toBeNull();
  });

  it('stores API sessions and normalizes party type metadata', () => {
    storeApiSession({
      user: {
        id: 'user_123',
        email: 'investor@test.local',
        userMetadata: {
          party_type: 'INVESTOR',
          organization_name: 'Northstar Capital',
        },
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresAt: '2026-06-01T12:00:00.000Z',
    });

    expect(getParticipantAccessSnapshot()).toEqual({
      provider: 'api',
      email: 'investor@test.local',
      participantRole: 'Investor',
      entityName: 'Northstar Capital',
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresAt: '2026-06-01T12:00:00.000Z',
    });
  });

  it('lets explicit API session options override metadata', () => {
    storeApiSession(
      {
        user: {
          id: 'user_456',
          email: 'supplier@test.local',
          userMetadata: {
            participantRole: 'Buyer',
            entityName: 'Metadata Buyer',
          },
        },
        accessToken: 'access-token',
      },
      undefined,
      {
        participantRole: 'Supplier',
        entityName: 'Explicit Supplier',
      }
    );

    expect(getParticipantAccessSnapshot()).toMatchObject({
      email: 'supplier@test.local',
      participantRole: 'Supplier',
      entityName: 'Explicit Supplier',
    });
  });

  it('ignores corrupt storage and clears participant access', () => {
    window.localStorage.setItem('verityui_participant_access', '{bad json');

    expect(getParticipantAccessSnapshot()).toBeNull();

    storeApiSession({
      user: { id: 'supplier-user', email: 'supplier@test.local', userMetadata: { participantRole: 'Supplier' } },
      accessToken: 'access-token',
    });
    clearParticipantAccess();

    expect(hasParticipantAccess()).toBe(false);
  });
});
