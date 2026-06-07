import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ApiAuthSession } from '../../../src/lib/apiClient';
import { storeDemoAccess } from '../../../src/lib/participantAuth';
import {
  getBuyerWorkspaceInitialState,
  isDemoWorkspaceDataMode,
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

async function importApiWorkspaceModules() {
  vi.stubEnv('VITE_RUN_MODE', 'api');
  vi.resetModules();

  const participantAuth = await import('../../../src/lib/participantAuth');
  const workspaceData = await import('../../../src/lib/workspaceData');

  return { participantAuth, workspaceData };
}

describe('workspace data services', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
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
    const { participantAuth, workspaceData } = await importApiWorkspaceModules();
    participantAuth.storeApiSession({
      user: { id: 'user_1', email: 'buyer@test.local', userMetadata: { participantRole: 'Buyer' } },
      accessToken: 'access-token',
    });
    const apiInvoice = {
      ...BUYER_INVOICES[0],
      id: 'API-BUYER-001',
      invoiceNumber: 'INV-API-BUYER-001',
      issueDate: '2026-06-05',
      dueDate: '2026-07-05',
    };
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

    await expect(workspaceData.loadBuyerWorkspaceState()).resolves.toMatchObject({
      invoices: [
        {
          id: 'API-BUYER-001',
          invoiceNumber: 'INV-API-BUYER-001',
          issueDate: '2026-06-05',
          dueDate: '2026-07-05',
        },
      ],
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

  it('normalizes snake-case buyer invoice display fields from VerityAPI', async () => {
    const { participantAuth, workspaceData } = await importApiWorkspaceModules();
    participantAuth.storeApiSession({
      user: { id: 'user_1', email: 'buyer@test.local', userMetadata: { participantRole: 'Buyer' } },
      accessToken: 'access-token',
    });
    vi.stubGlobal(
      'fetch',
      mockFetchJson(200, {
        data: {
          invoices: [
            {
              id: 'uuid-buyer-invoice-1',
              invoice_number: 'INV-API-BUYER-900',
              supplier_name: 'API Supplier Legal LLC',
              supplier_id: 'supplier-uuid-1',
              amount: 19000,
              currency: 'USDC',
              issue_date: '2026-06-01',
              due_date: '2026-06-30',
              maturity_date: '2026-06-30',
              status: 'PENDING',
            },
          ],
          fundingRequests: [],
          liquidity: {
            availableLiquidity: 1,
            walletAddress: '0xapi',
            walletName: 'API Vault',
            isConnected: true,
          },
        },
      })
    );

    await expect(workspaceData.loadBuyerWorkspaceState()).resolves.toMatchObject({
      invoices: [
        {
          id: 'uuid-buyer-invoice-1',
          invoiceNumber: 'INV-API-BUYER-900',
          supplierName: 'API Supplier Legal LLC',
          supplierId: 'supplier-uuid-1',
          issueDate: '2026-06-01',
          dueDate: '2026-06-30',
          maturityDate: '2026-06-30',
        },
      ],
    });
  });

  it('normalizes nested buyer supplier legal names from VerityAPI', async () => {
    const { participantAuth, workspaceData } = await importApiWorkspaceModules();
    participantAuth.storeApiSession({
      user: { id: 'user_1', email: 'buyer@test.local', userMetadata: { participantRole: 'Buyer' } },
      accessToken: 'access-token',
    });
    vi.stubGlobal(
      'fetch',
      mockFetchJson(200, {
        data: {
          invoices: [
            {
              id: 'uuid-buyer-invoice-nested-supplier',
              invoice_number: 'INV-API-BUYER-902',
              supplier_id: 'supplier-uuid-902',
              supplier: { legal_name: 'Nested Supplier Legal LLC' },
              amount: 21000,
              currency: 'USDC',
              issue_date: '2026-06-03',
              due_date: '2026-07-03',
              status: 'SUBMITTED',
            },
          ],
          fundingRequests: [],
          liquidity: {
            availableLiquidity: 1,
            walletAddress: '0xapi',
            walletName: 'API Vault',
            isConnected: true,
          },
        },
      })
    );

    await expect(workspaceData.loadBuyerWorkspaceState()).resolves.toMatchObject({
      invoices: [
        {
          id: 'uuid-buyer-invoice-nested-supplier',
          invoiceNumber: 'INV-API-BUYER-902',
          supplierName: 'Nested Supplier Legal LLC',
          supplierId: 'supplier-uuid-902',
        },
      ],
    });
  });

  it('prefers nested supplier legal names over id-like supplier name fields from VerityAPI', async () => {
    const { participantAuth, workspaceData } = await importApiWorkspaceModules();
    participantAuth.storeApiSession({
      user: { id: 'user_1', email: 'buyer@test.local', userMetadata: { participantRole: 'Buyer' } },
      accessToken: 'access-token',
    });
    vi.stubGlobal(
      'fetch',
      mockFetchJson(200, {
        data: {
          invoices: [
            {
              id: 'uuid-buyer-invoice-id-like-supplier',
              invoice_number: 'INV-API-BUYER-903',
              supplier_name: 'supplier-uuid-903',
              supplier_id: 'supplier-uuid-903',
              supplier: { legal_name: 'Resolved Supplier Legal LLC' },
              amount: 21000,
              currency: 'USDC',
              issue_date: '2026-06-03',
              due_date: '2026-07-03',
              status: 'SUBMITTED',
            },
          ],
          fundingRequests: [],
          liquidity: {
            availableLiquidity: 1,
            walletAddress: '0xapi',
            walletName: 'API Vault',
            isConnected: true,
          },
        },
      })
    );

    await expect(workspaceData.loadBuyerWorkspaceState()).resolves.toMatchObject({
      invoices: [
        {
          id: 'uuid-buyer-invoice-id-like-supplier',
          supplierName: 'Resolved Supplier Legal LLC',
          supplierId: 'supplier-uuid-903',
        },
      ],
    });
  });

  it('prefers nested supplier legal names over placeholder supplier name fields from VerityAPI', async () => {
    const { participantAuth, workspaceData } = await importApiWorkspaceModules();
    participantAuth.storeApiSession({
      user: { id: 'user_1', email: 'buyer@test.local', userMetadata: { participantRole: 'Buyer' } },
      accessToken: 'access-token',
    });
    vi.stubGlobal(
      'fetch',
      mockFetchJson(200, {
        data: {
          invoices: [
            {
              id: 'uuid-buyer-invoice-placeholder-supplier',
              invoice_number: 'INV-API-BUYER-904',
              supplier_name: 'Supplier name unavailable',
              supplier_id: 'supplier-uuid-904',
              supplier: { legal_name: 'Placeholder Resolved Supplier LLC' },
              amount: 21000,
              currency: 'USDC',
              issue_date: '2026-06-03',
              due_date: '2026-07-03',
              status: 'SUBMITTED',
            },
          ],
          fundingRequests: [],
          liquidity: {
            availableLiquidity: 1,
            walletAddress: '0xapi',
            walletName: 'API Vault',
            isConnected: true,
          },
        },
      })
    );

    await expect(workspaceData.loadBuyerWorkspaceState()).resolves.toMatchObject({
      invoices: [
        {
          id: 'uuid-buyer-invoice-placeholder-supplier',
          supplierName: 'Placeholder Resolved Supplier LLC',
          supplierId: 'supplier-uuid-904',
        },
      ],
    });
  });

  it('normalizes optional buyer factoring and payment fields from VerityAPI', async () => {
    const { participantAuth, workspaceData } = await importApiWorkspaceModules();
    participantAuth.storeApiSession({
      user: { id: 'user_1', email: 'buyer@test.local', userMetadata: { participantRole: 'Buyer' } },
      accessToken: 'access-token',
    });
    vi.stubGlobal(
      'fetch',
      mockFetchJson(200, {
        data: {
          invoices: [
            {
              id: 'uuid-buyer-invoice-2',
              invoice_number: 'INV-API-BUYER-901',
              supplier_name: 'Factored API Supplier LLC',
              supplier_id: 'supplier-uuid-2',
              amount: 44000,
              currency: 'USDC',
              issue_date: '2026-06-02',
              due_date: '2026-07-02',
              status: 'FACTORED',
              factored_amount: 43000,
              settled_at: '2026-07-03T00:00:00.000Z',
              paid_at: '2026-07-03T01:00:00.000Z',
              discount_amount: 1000,
              payment_status: 'PAID',
            },
          ],
          fundingRequests: [],
          liquidity: {
            availableLiquidity: 1,
            walletAddress: '0xapi',
            walletName: 'API Vault',
            isConnected: true,
          },
        },
      })
    );

    await expect(workspaceData.loadBuyerWorkspaceState()).resolves.toMatchObject({
      invoices: [
        {
          id: 'uuid-buyer-invoice-2',
          invoiceNumber: 'INV-API-BUYER-901',
          supplierName: 'Factored API Supplier LLC',
          supplierId: 'supplier-uuid-2',
          status: 'FACTORED',
          factoredAmount: 43000,
          settledAt: '2026-07-03T00:00:00.000Z',
          paidAt: '2026-07-03T01:00:00.000Z',
          discountAmount: 1000,
          paymentStatus: 'PAID',
        },
      ],
    });
  });

  it('loads supplier workspace state from VerityAPI without demo fallback', async () => {
    const { participantAuth, workspaceData } = await importApiWorkspaceModules();
    participantAuth.storeApiSession({
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

    const state = await workspaceData.loadSupplierWorkspaceState();

    expect(state.invoices).toEqual([]);
    expect(state.registeredBuyers).toEqual([
      { buyerId: 'buyer-org-1', buyerName: 'Northstar Buyer LLC', buyerStatus: 'ACTIVE' },
    ]);
    expect(state.invoices).not.toEqual(SUPPLIER_INVOICES);
    expect(state.walletConnected).toBe(false);
  });

  it('preserves supplier invoice numbers and invoice dates from VerityAPI', async () => {
    const { participantAuth, workspaceData } = await importApiWorkspaceModules();
    participantAuth.storeApiSession({
      user: { id: 'user_2', email: 'supplier@test.local', userMetadata: { participantRole: 'Supplier' } },
      accessToken: 'supplier-token',
    });
    vi.stubGlobal(
      'fetch',
      mockFetchJson(200, {
        data: {
          invoices: [
            {
              id: 'supplier-invoice-1',
              invoiceNumber: 'INV-API-SUP-001',
              buyer: 'Northstar Buyer LLC',
              amount: 42000,
              maturityDate: '2026-07-05',
              issueDate: '2026-06-05',
              dueDate: '2026-07-05',
              status: 'ACCEPTED',
            },
          ],
          registeredBuyers: [],
          availableLiquidity: 0,
          escrowValue: 0,
          onChainCredit: 0,
          walletConnected: false,
          walletAddress: null,
        },
      })
    );

    await expect(workspaceData.loadSupplierWorkspaceState()).resolves.toMatchObject({
      invoices: [
        {
          id: 'supplier-invoice-1',
          invoiceNumber: 'INV-API-SUP-001',
          issueDate: '2026-06-05',
          dueDate: '2026-07-05',
        },
      ],
    });
  });

  it('normalizes snake-case supplier invoice numbers from VerityAPI', async () => {
    const { participantAuth, workspaceData } = await importApiWorkspaceModules();
    participantAuth.storeApiSession({
      user: { id: 'user_2', email: 'supplier@test.local', userMetadata: { participantRole: 'Supplier' } },
      accessToken: 'supplier-token',
    });
    vi.stubGlobal(
      'fetch',
      mockFetchJson(200, {
        data: {
          invoices: [
            {
              id: 'uuid-supplier-invoice-2',
              invoice_number: 'INV-API-SNAKE-002',
              buyer: 'Northstar Buyer LLC',
              amount: 42000,
              maturityDate: '2026-07-05',
              issue_date: '2026-06-05',
              due_date: '2026-07-05',
              status: 'ACCEPTED',
            },
          ],
          registeredBuyers: [],
          availableLiquidity: 0,
          escrowValue: 0,
          onChainCredit: 0,
          walletConnected: false,
          walletAddress: null,
        },
      })
    );

    await expect(workspaceData.loadSupplierWorkspaceState()).resolves.toMatchObject({
      invoices: [
        {
          id: 'uuid-supplier-invoice-2',
          invoiceNumber: 'INV-API-SNAKE-002',
          issueDate: '2026-06-05',
          dueDate: '2026-07-05',
        },
      ],
    });
  });

  it('normalizes supplier invoice marketplace funding fields from VerityAPI', async () => {
    const { participantAuth, workspaceData } = await importApiWorkspaceModules();
    participantAuth.storeApiSession({
      user: { id: 'user_2', email: 'supplier@test.local', userMetadata: { participantRole: 'Supplier' } },
      accessToken: 'supplier-token',
    });
    vi.stubGlobal(
      'fetch',
      mockFetchJson(200, {
        data: {
          invoices: [
            {
              id: 'uuid-supplier-invoice-listed',
              invoice_number: 'INV-API-LISTED-001',
              buyer: 'Northstar Buyer LLC',
              amount: 50000,
              maturityDate: '2026-08-01',
              status: 'ACCEPTED',
              financeability_id: 'financeability-1',
              funding_offer_id: 'offer-1',
              funding_status: 'LISTED',
              offered_amount: 45000,
              advance_amount: 45000,
              yield_apr: 0.12,
              reserve_rate: 0.1,
              marketplace_submitted_at: '2026-06-10T00:00:00.000Z',
            },
          ],
          registeredBuyers: [],
          availableLiquidity: 0,
          escrowValue: 0,
          onChainCredit: 0,
          walletConnected: false,
          walletAddress: null,
        },
      })
    );

    await expect(workspaceData.loadSupplierWorkspaceState()).resolves.toMatchObject({
      invoices: [
        {
          id: 'uuid-supplier-invoice-listed',
          invoiceNumber: 'INV-API-LISTED-001',
          financeabilityId: 'financeability-1',
          fundingOfferId: 'offer-1',
          fundingStatus: 'LISTED',
          offeredAmount: 45000,
          advanceAmount: 45000,
          yieldApr: 0.12,
          reserveRate: 0.1,
          marketplaceSubmittedAt: '2026-06-10T00:00:00.000Z',
        },
      ],
    });
  });

  it('loads investor workspace state from VerityAPI without demo fallback', async () => {
    const { participantAuth, workspaceData } = await importApiWorkspaceModules();
    participantAuth.storeApiSession({
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

    const state = await workspaceData.loadInvestorWorkspaceState();

    expect(state.invoices).toEqual([]);
    expect(state.invoices).not.toEqual(INVESTOR_INVOICES);
    expect(state.availableCapital).toBe(0);
  });

  it('normalizes investor marketplace invoices from VerityAPI', async () => {
    const { participantAuth, workspaceData } = await importApiWorkspaceModules();
    participantAuth.storeApiSession({
      user: { id: 'user_3', email: 'investor@test.local', userMetadata: { participantRole: 'Investor' } },
      accessToken: 'investor-token',
    });
    vi.stubGlobal(
      'fetch',
      mockFetchJson(200, {
        data: {
          invoices: [
            {
              id: 'INV-MKT-001',
              invoice_id: 'invoice-1',
              invoice_number: 'INV-MKT-001',
              funding_offer_id: 'offer-1',
              financeability_id: 'financeability-1',
              supplier: 'Materion Corp',
              obligor: 'Space Exploration Technologies Corp.',
              face_value: 50000,
              offered_amount: 45000,
              discount: 12,
              maturity: 55,
              status: 'Available',
              funding_status: 'LISTED',
              buyer_rating: 'A',
            },
          ],
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

    await expect(workspaceData.loadInvestorWorkspaceState()).resolves.toMatchObject({
      invoices: [
        {
          id: 'INV-MKT-001',
          invoiceId: 'invoice-1',
          invoiceNumber: 'INV-MKT-001',
          fundingOfferId: 'offer-1',
          financeabilityId: 'financeability-1',
          supplier: 'Materion Corp',
          obligor: 'Space Exploration Technologies Corp.',
          faceValue: 50000,
          offeredAmount: 45000,
          fundingStatus: 'LISTED',
          buyerRating: 'A',
        },
      ],
    });
  });

  it('derives investor funding status from authoritative offer status when funding status is absent', async () => {
    const { participantAuth, workspaceData } = await importApiWorkspaceModules();
    participantAuth.storeApiSession({
      user: { id: 'user_3', email: 'investor@test.local', userMetadata: { participantRole: 'Investor' } },
      accessToken: 'investor-token',
    });
    vi.stubGlobal(
      'fetch',
      mockFetchJson(200, {
        data: {
          invoices: [
            {
              id: 'INV-MKT-002',
              invoice_id: 'invoice-2',
              invoice_number: 'INV-MKT-002',
              funding_offer_id: 'offer-2',
              financeability_id: 'financeability-2',
              supplier: 'Materion Corp',
              obligor: 'Space Exploration Technologies Corp.',
              face_value: 75000,
              offered_amount: 67500,
              discount: 11,
              maturity: 60,
              status: 'Available',
              invoice_status: 'FACTORING_REQUESTED',
              offer_status: 'OPEN',
              buyer_rating: 'A',
            },
          ],
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

    await expect(workspaceData.loadInvestorWorkspaceState()).resolves.toMatchObject({
      invoices: [
        {
          id: 'INV-MKT-002',
          invoiceStatus: 'FACTORING_REQUESTED',
          offerStatus: 'OPEN',
          fundingStatus: 'LISTED',
        },
      ],
    });
  });
});
