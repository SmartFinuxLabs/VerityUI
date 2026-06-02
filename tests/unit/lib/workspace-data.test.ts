import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ApiAuthSession } from '../../../src/lib/apiClient';
import { storeApiSession, storeDemoAccess } from '../../../src/lib/participantAuth';
import {
  getBuyerWorkspaceInitialState,
  isDemoWorkspaceDataMode,
  loadBuyerWorkspaceState,
  loadInvestorWorkspaceState,
  loadSupplierWorkspaceState,
} from '../../../src/lib/workspaceData';
import { INITIAL_INVOICES as BUYER_INVOICES } from '../../../src/buyer/data';
import { INITIAL_INVOICES as SUPPLIER_INVOICES } from '../../../src/supplier/data';
import { initialInvoices as INVESTOR_INVOICES } from '../../../src/investor/data';

function mockFetchJson(status: number, body: unknown) {
  const ok = status >= 200 && status < 300;

  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: vi.fn().mockResolvedValue(body),
  });
}

describe('workspace data services', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses demo workspace data when runtime access is demo', () => {
    storeDemoAccess('demo@test.local', { participantRole: 'Buyer' });

    expect(isDemoWorkspaceDataMode()).toBe(true);
    expect(getBuyerWorkspaceInitialState().invoices[0].id).toBe(BUYER_INVOICES[0].id);
  });

  it('uses demo workspace data when VITE_RUN_MODE is demo even with a stored API session', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_RUN_MODE', 'demo');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const participantAuth = await import('../../../src/lib/participantAuth');
    const workspaceData = await import('../../../src/lib/workspaceData');

    participantAuth.storeApiSession({
      user: { id: 'user_demo_override', email: 'buyer@test.local', userMetadata: { participantRole: 'Buyer' } },
      accessToken: 'stale-api-token',
    } satisfies ApiAuthSession);

    const state = await workspaceData.loadBuyerWorkspaceState();

    expect(state.invoices).toEqual(BUYER_INVOICES);
    expect(state.fundingRequests).toEqual(expect.any(Array));
    expect(state.liquidity).toEqual(expect.any(Object));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('loads buyer workspace state from VerityAPI in API mode', async () => {
    storeApiSession({
      user: { id: 'user_1', email: 'buyer@test.local', userMetadata: { participantRole: 'Buyer' } },
      accessToken: 'access-token',
    });
    const apiInvoice = { ...BUYER_INVOICES[0], id: 'API-BUYER-001' };
    const fetchMock = mockFetchJson(200, {
      data: {
        invoices: [apiInvoice],
        fundingRequests: [],
        liquidity: {
          availableLiquidity: 1,
          walletAddress: '0xapi',
          walletName: 'API Vault',
          isConnected: true,
        },
      },
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(loadBuyerWorkspaceState()).resolves.toMatchObject({
      invoices: [{ id: 'API-BUYER-001' }],
      fundingRequests: [],
      liquidity: { walletName: 'API Vault' },
    });
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

  it('loads supplier workspace state from VerityAPI without demo fallback', async () => {
    storeApiSession({
      user: { id: 'user_2', email: 'supplier@test.local', userMetadata: { participantRole: 'Supplier' } },
      accessToken: 'supplier-token',
    });
    vi.stubGlobal(
      'fetch',
      mockFetchJson(200, {
        data: {
          invoices: [],
          registeredBuyers: [{ buyerId: 'buyer-org-1', buyerName: 'Northstar Buyer LLC', buyerStatus: 'ACTIVE' }],
          availableLiquidity: 0,
          escrowValue: 0,
          onChainCredit: 0,
          walletConnected: false,
          walletAddress: null,
        },
      })
    );

    const state = await loadSupplierWorkspaceState();

    expect(state.invoices).toEqual([]);
    expect(state.registeredBuyers).toEqual([
      { buyerId: 'buyer-org-1', buyerName: 'Northstar Buyer LLC', buyerStatus: 'ACTIVE' },
    ]);
    expect(state.invoices).not.toEqual(SUPPLIER_INVOICES);
    expect(state.walletConnected).toBe(false);
  });

  it('loads investor workspace state from VerityAPI without demo fallback', async () => {
    storeApiSession({
      user: { id: 'user_3', email: 'investor@test.local', userMetadata: { participantRole: 'Investor' } },
      accessToken: 'investor-token',
    });
    vi.stubGlobal(
      'fetch',
      mockFetchJson(200, {
        data: {
          invoices: [],
          settlements: [],
          ledgerRows: [],
          totalCommitted: 0,
          activeInvestments: 0,
          availableCapital: 0,
          projectedYield: 0,
          ytdEarned: 0,
        },
      })
    );

    const state = await loadInvestorWorkspaceState();

    expect(state.invoices).toEqual([]);
    expect(state.invoices).not.toEqual(INVESTOR_INVOICES);
    expect(state.availableCapital).toBe(0);
  });
});
