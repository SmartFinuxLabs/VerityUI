import { describe, expect, it, vi } from 'vitest';
import { verityApi } from '../../../src/lib/apiClient';

function mockFetchJson(status: number, body: unknown) {
  const ok = status >= 200 && status < 300;

  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: vi.fn().mockResolvedValue(body),
  });
}

describe('verityApi client functions', () => {
  it('requests role hints with encoded email parameters', async () => {
    const fetchMock = mockFetchJson(200, { data: { participantRole: 'BUYER' } });
    vi.stubGlobal('fetch', fetchMock);

    const result = await verityApi.getRoleHint('buyer+demo@test.local');

    expect(result).toEqual({ data: { participantRole: 'BUYER' } });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/v1/auth/role-hint?email=buyer%2Bdemo%40test.local',
      expect.objectContaining({
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      })
    );
  });

  it('posts sign-in payloads as JSON', async () => {
    const fetchMock = mockFetchJson(200, { data: { session: { accessToken: 'token', user: { id: 'u1' } } } });
    vi.stubGlobal('fetch', fetchMock);

    await verityApi.signIn({ email: 'supplier@test.local', password: 'secret' });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/v1/auth/sign-in',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'supplier@test.local', password: 'secret' }),
      })
    );
  });

  it('sends bearer authorization when accepting invitations', async () => {
    const fetchMock = mockFetchJson(200, { data: { organizationId: 'org_123' } });
    vi.stubGlobal('fetch', fetchMock);

    await verityApi.acceptInvitation({
      invitationToken: 'invite/token',
      accessToken: 'access-token',
      fullName: 'Ada Buyer',
      legalName: 'Ada Buyer LLC',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/v1/organization-invitations/invite%2Ftoken/accept',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer access-token',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          fullName: 'Ada Buyer',
          legalName: 'Ada Buyer LLC',
          riskProfile: {},
        }),
      })
    );
  });

  it('throws API error messages without exposing raw response bodies', async () => {
    vi.stubGlobal('fetch', mockFetchJson(403, { message: 'Forbidden' }));

    await expect(verityApi.signIn({ email: 'blocked@test.local', password: 'wrong' })).rejects.toThrow('Forbidden');
  });

  it('requests workspace data with bearer authorization', async () => {
    const fetchMock = mockFetchJson(200, { data: { invoices: [] } });
    vi.stubGlobal('fetch', fetchMock);

    await verityApi.getBuyerWorkspaceState('access-token');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/v1/workspaces/buyer',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer access-token',
          'Content-Type': 'application/json',
        }),
      })
    );
  });
});
