import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { storeApiSession } from '../../../src/lib/participantAuth';
import SupplierWorkspace from '../../../src/supplier/SupplierWorkspace';

function mockFetchJson(status: number, body: unknown) {
  const ok = status >= 200 && status < 300;

  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: vi.fn().mockResolvedValue(body),
  });
}

function storeSupplierApiSession() {
  storeApiSession({
    user: { id: 'supplier-user-1', email: 'supplier@test.local', userMetadata: { participantRole: 'Supplier' } },
    accessToken: 'supplier-token',
  });
}

function supplierWorkspaceBody(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      supplierOrganizationId: 'supplier-org-1',
      invoices: [],
      registeredBuyers: [],
      availableLiquidity: 0,
      escrowValue: 0,
      onChainCredit: 0,
      walletConnected: false,
      walletAddress: null,
      ...overrides,
    },
  };
}

describe('SupplierWorkspace module', () => {
  it('renders supplier-specific shell and dashboard context', () => {
    render(<SupplierWorkspace accessLabel="Demo Access · supplier@test.local" accessRole="Supplier" />);

    expect(screen.getAllByText(/Supplier Overview/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /New Funding Request/i })).toBeInTheDocument();
    expect(screen.getByText(/Finux-Vault-01/i)).toBeInTheDocument();
  });

  it('renders supplier dashboard analytics while preserving VerityUI theme labels', () => {
    render(<SupplierWorkspace accessRole="Supplier" />);

    expect(screen.getByRole('heading', { name: /Supplier Overview/i })).toBeInTheDocument();
    expect(screen.getByText(/Total Outstanding Volume/i)).toBeInTheDocument();
    expect(screen.getByText(/Pending Financing/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Cash Flow Projection/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Status Breakdown/i)).toBeInTheDocument();
    expect(screen.getByText(/Recent Activity/i)).toBeInTheDocument();
    expect(screen.getByText(/Platform Status/i)).toBeInTheDocument();
  });

  it('navigates from supplier dashboard to factoring workflow', async () => {
    const user = userEvent.setup();
    render(<SupplierWorkspace accessRole="Supplier" />);

    await user.click(screen.getByRole('button', { name: /^Factoring/i }));

    expect(screen.getAllByText(/Request Factoring/i).length).toBeGreaterThan(0);
  });

  it('opens the supplier invoice queue from the left panel', async () => {
    const user = userEvent.setup();
    render(<SupplierWorkspace accessRole="Supplier" />);

    await user.click(screen.getByRole('button', { name: /Invoice Queue/i }));

    expect(screen.getByRole('heading', { name: /Supplier Invoice Queue/i })).toBeInTheDocument();
    expect(screen.getByText(/Manage submitted invoices, buyer status, and financing readiness/i)).toBeInTheDocument();
    expect(screen.getByText(/INV-001/i)).toBeInTheDocument();
    expect(screen.queryByText(/supplier-invoice-001/i)).not.toBeInTheDocument();
  });

  it('opens read-only supplier invoice details from the invoice number', async () => {
    const user = userEvent.setup();
    render(<SupplierWorkspace accessRole="Supplier" />);

    await user.click(screen.getByRole('button', { name: /Invoice Queue/i }));

    const table = screen.getByRole('table');
    expect(within(table).getByRole('columnheader', { name: /Invoice Number/i })).toBeInTheDocument();
    expect(within(table).queryByText(/Invoice ID/i)).not.toBeInTheDocument();
    expect(within(table).getByRole('button', { name: 'INV-001' })).toBeInTheDocument();
    expect(within(table).queryByText(/supplier-invoice-001/i)).not.toBeInTheDocument();

    await user.click(within(table).getByRole('button', { name: 'INV-001' }));

    const dialog = screen.getByRole('dialog', { name: /Read-only invoice details/i });
    expect(within(dialog).getByRole('heading', { name: /Read-only invoice details/i })).toBeInTheDocument();
    expect(within(dialog).getByText(/^Acme Corp$/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/No edits are available from this review view/i)).toBeInTheDocument();
  });

  it('shows invoice numbers in supplier disputes', async () => {
    const user = userEvent.setup();
    render(<SupplierWorkspace accessRole="Supplier" />);

    await user.click(screen.getByRole('button', { name: /Disputes/i }));

    const table = screen.getByRole('table');
    expect(within(table).getByRole('columnheader', { name: /Invoice Number/i })).toBeInTheDocument();
    expect(within(table).queryByText(/Invoice ID/i)).not.toBeInTheDocument();
  });

  it('shows an empty invoice queue state when supplier clicks Invoice Queue with no invoices', async () => {
    const user = userEvent.setup();
    storeSupplierApiSession();
    vi.stubGlobal(
      'fetch',
      mockFetchJson(200, {
        data: supplierWorkspaceBody().data,
      })
    );

    render(<SupplierWorkspace accessRole="Supplier" />);

    await user.click(await screen.findByRole('button', { name: /Invoice Queue/i }));

    expect(screen.getByText(/No supplier invoices in queue/i)).toBeInTheDocument();
  });

  it('shows API invoice number instead of API invoice id in supplier invoice queue', async () => {
    const user = userEvent.setup();
    storeSupplierApiSession();
    vi.stubGlobal(
      'fetch',
      mockFetchJson(200, {
        data: supplierWorkspaceBody({
          invoices: [
            {
              id: 'uuid-api-invoice-1',
              invoiceNumber: 'INV-API-SUP-900',
              buyer: 'Northstar Buyer LLC',
              amount: 42000,
              maturityDate: '2026-07-05',
              status: 'ACCEPTED',
            },
          ],
          registeredBuyers: [],
        }).data,
      })
    );

    render(<SupplierWorkspace accessRole="Supplier" />);

    await user.click(await screen.findByRole('button', { name: /Invoice Queue/i }));

    const table = screen.getByRole('table');
    expect(within(table).getByRole('columnheader', { name: /Invoice Number/i })).toBeInTheDocument();
    expect(within(table).getByRole('button', { name: 'INV-API-SUP-900' })).toBeInTheDocument();
    expect(within(table).queryByText(/uuid-api-invoice-1/i)).not.toBeInTheDocument();
  });

  it('loads supplier analytics from VerityAPI and renders the dashboard overview', async () => {
    storeSupplierApiSession();
    const fetchMock = vi.fn((url: string) => {
      if (url.includes('/workspaces/supplier/analytics')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: vi.fn().mockResolvedValue({
            data: {
              volumeByStatus: [
                { status: 'ACCEPTED', count: 2, totalAmount: 42000 },
                { status: 'SETTLED', count: 1, totalAmount: 18000 },
              ],
              timeTrends: [
                { period: '2026-04', createdVolume: 24000, settledVolume: 12000 },
                { period: '2026-05', createdVolume: 36000, settledVolume: 18000 },
              ],
              cashFlowProjections: [
                { date: '2026-07-15', expectedAmount: 42000, factoredAmount: 9000 },
              ],
              financialHealth: {
                disputeRatio: 0,
                onChainCreditScore: 835,
                totalOutstanding: 42000,
                totalFactored: 9000,
                liquidityRatio: 0.21,
              },
              creditHistory: [
                { period: '2026-04', score: 820 },
                { period: '2026-05', score: 835 },
              ],
            },
          }),
        });
      }

      return Promise.resolve({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(
          supplierWorkspaceBody({
            invoices: [],
            registeredBuyers: [],
            availableLiquidity: 0,
            escrowValue: 0,
            onChainCredit: 835,
          })
        ),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<SupplierWorkspace accessRole="Supplier" />);

    expect(await screen.findByText(/Analytics Overview/i)).toBeInTheDocument();
    expect(screen.getByText(/42,000 USDC/i)).toBeInTheDocument();
    expect(screen.getByText(/Liquidity Ratio/i)).toBeInTheDocument();
    expect(screen.getByText(/21%/i)).toBeInTheDocument();
    expect(screen.getByText(/Credit Trajectory/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/workspaces/supplier/analytics'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer supplier-token',
        }),
      })
    );
  });

  it('shows an empty disputes state when supplier clicks Disputes with no disputes', async () => {
    const user = userEvent.setup();
    storeSupplierApiSession();
    vi.stubGlobal(
      'fetch',
      mockFetchJson(200, {
        data: supplierWorkspaceBody().data,
      })
    );

    render(<SupplierWorkspace accessRole="Supplier" />);

    await user.click(await screen.findByRole('button', { name: /Disputes/i }));

    expect(screen.getByText(/No buyer disputes require action/i)).toBeInTheDocument();
  });

  it('loads buyer choices for invoice upload from registered buyers', async () => {
    const user = userEvent.setup();
    storeSupplierApiSession();
    vi.stubGlobal(
      'fetch',
      mockFetchJson(200, {
        data: supplierWorkspaceBody({
          registeredBuyers: [
            {
              buyerId: 'buyer-org-1',
              buyerName: 'Northstar Buyer LLC',
              buyerStatus: 'ACTIVE',
            },
          ],
        }).data,
      })
    );

    render(<SupplierWorkspace accessRole="Supplier" />);

    await user.click(await screen.findByRole('button', { name: /New Funding Request/i }));

    expect(screen.getByRole('option', { name: /Northstar Buyer LLC/i })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Acme Corp Global/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /Buyer Name/i })).not.toBeInTheDocument();
  });

  it('requires registered buyer selection from Verity database when no buyer options are available', async () => {
    const user = userEvent.setup();
    storeSupplierApiSession();
    vi.stubGlobal(
      'fetch',
      mockFetchJson(200, {
        data: supplierWorkspaceBody().data,
      })
    );

    render(<SupplierWorkspace accessRole="Supplier" />);

    await user.click(await screen.findByRole('button', { name: /New Funding Request/i }));

    expect(screen.queryByRole('textbox', { name: /Buyer Name/i })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: /No registered buyers available/i })).toBeInTheDocument();
    expect(screen.getByText(/No registered buyer organizations are available from Verity database/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Verify & Submit/i })).toBeDisabled();
  });

  it('submits invoice with selected registered buyer from Verity database', async () => {
    const user = userEvent.setup();
    storeSupplierApiSession();
    let invoiceCreated = false;
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (url.includes('/invoices') && init?.method === 'POST') {
        invoiceCreated = true;
        return Promise.resolve({
        ok: true,
        status: 201,
        json: vi.fn().mockResolvedValue({ data: { id: 'invoice-1' } }),
        });
      }

      return Promise.resolve({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue(
          supplierWorkspaceBody({
            invoices: invoiceCreated
              ? [
                  {
                    id: 'invoice-1',
                    buyerId: 'buyer-org-1',
                    buyer: 'Northstar Buyer LLC',
                    amount: 50000,
                    maturityDate: '2026-08-14',
                    status: 'ACCEPTED',
                  },
                ]
              : [],
            registeredBuyers: [
              {
                buyerId: 'buyer-org-1',
                buyerName: 'Northstar Buyer LLC',
                buyerStatus: 'ACTIVE',
              },
            ],
          })
        ),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<SupplierWorkspace accessRole="Supplier" />);

    await user.click(await screen.findByRole('button', { name: /New Funding Request/i }));
    await user.click(screen.getByRole('button', { name: /Verify & Submit/i }));
    await screen.findByRole('button', { name: /Close & View Registry/i }, { timeout: 3000 });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/invoices'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer supplier-token',
          }),
          body: expect.stringContaining('"supplierId":"supplier-org-1"'),
        })
      );
    });

    await user.click(screen.getByRole('button', { name: /Close & View Registry/i }));

    expect(await screen.findByText(/Northstar Buyer LLC/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/invoices'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer supplier-token',
        }),
        body: expect.stringContaining('"supplierId":"supplier-org-1"'),
      })
    );
  }, 10000);
});
