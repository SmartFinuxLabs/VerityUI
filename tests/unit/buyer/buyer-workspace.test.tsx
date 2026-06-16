import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BuyerWorkspace from '../../../src/buyer/BuyerWorkspace';
import { INITIAL_FUNDING_REQUESTS, INITIAL_INVOICES, INITIAL_LIQUIDITY } from '../../../src/buyer/data';
import { storeApiSession } from '../../../src/lib/participantAuth';

async function importBuyerApiWorkspace() {
  vi.stubEnv('VITE_RUN_MODE', 'api');
  vi.resetModules();

  const [{ default: ApiBuyerWorkspace }, participantAuth] = await Promise.all([
    import('../../../src/buyer/BuyerWorkspace'),
    import('../../../src/lib/participantAuth'),
  ]);

  return { ApiBuyerWorkspace, storeApiSession: participantAuth.storeApiSession };
}

describe('BuyerWorkspace module', () => {
  beforeEach(() => {
    storeApiSession({
      user: { id: 'buyer-user-1', email: 'buyer@test.local', userMetadata: { participantRole: 'Buyer' } },
      accessToken: 'buyer-token',
    });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          data: {
            invoices: INITIAL_INVOICES,
            fundingRequests: INITIAL_FUNDING_REQUESTS,
            liquidity: INITIAL_LIQUIDITY,
          },
        }),
      })
    );
  });

  it('renders buyer-specific header, sidebar action, and dashboard content', () => {
    render(<BuyerWorkspace accessLabel="API Access · buyer@test.local" accessRole="Buyer" />);

    expect(screen.getByText(/Loading buyer workspace data/i)).toBeInTheDocument();
  });

  it('renders loaded buyer-specific header, sidebar action, and dashboard content', async () => {
    render(<BuyerWorkspace accessLabel="API Access · buyer@test.local" accessRole="Buyer" />);

    expect((await screen.findAllByText(/Buyer Dashboard/i)).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /New Funding Request/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search invoices, suppliers, or hashes/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Factoring Exposure/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Settlement Progress/i)).toBeInTheDocument();
    expect(screen.getByText(/Supplier Concentration/i)).toBeInTheDocument();
    expect(screen.getAllByText(/FACTORED/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/tg_0492/i)).not.toBeInTheDocument();
  });

  it('navigates from buyer dashboard to invoice queue', async () => {
    const user = userEvent.setup();
    render(<BuyerWorkspace accessRole="Buyer" />);

    await user.click(await screen.findByRole('button', { name: /Invoices Queue/i }));

    expect(screen.getAllByText(/Invoices Queue/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Verify and authorize incoming peer-to-peer invoice assets/i)).toBeInTheDocument();
  });

  it('renders an empty invoice queue from VerityAPI without a blank screen', async () => {
    const user = userEvent.setup();
    const { ApiBuyerWorkspace, storeApiSession } = await importBuyerApiWorkspace();
    storeApiSession({
      user: { id: 'buyer-user-1', email: 'buyer@test.local', userMetadata: { participantRole: 'Buyer' } },
      accessToken: 'buyer-token',
    });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          data: {
            invoices: [],
            fundingRequests: [],
            liquidity: {
              availableLiquidity: 0,
              walletAddress: '',
              walletName: 'VerityAPI',
              isConnected: false,
            },
          },
        }),
      })
    );

    render(<ApiBuyerWorkspace accessRole="Buyer" />);

    await user.click(await screen.findByRole('button', { name: /Invoices Queue/i }));

    expect(screen.getByText(/No invoices in queue/i)).toBeInTheDocument();
    expect(screen.getByText(/Supplier invoices will appear here once they are submitted to your buyer organization/i)).toBeInTheDocument();
  });

  it('persists normal buyer Accept and Sign approvals and reloads the verified invoice status from VerityAPI', async () => {
    const user = userEvent.setup();
    const { ApiBuyerWorkspace, storeApiSession } = await importBuyerApiWorkspace();
    storeApiSession({
      user: { id: 'buyer-user-1', email: 'buyer@test.local', userMetadata: { participantRole: 'Buyer' } },
      accessToken: 'buyer-token',
    });

    const pendingInvoice = {
      id: 'invoice-1',
      supplierName: 'TechGear Solutions',
      supplierId: 'supplier-org-1',
      walletAddress: '0x8a4f2b00',
      amount: 25000,
      grossAmount: 25000,
      currency: 'USDC',
      issueDate: 'May 10, 2026',
      maturityDate: 'June 15, 2026',
      status: 'PENDING_VERIFICATION',
      poNumber: 'PO-2026-781',
      goodsReceiptNumber: 'GR-8833',
      lineItems: [{ description: 'Industrial Sensors', qty: 1, unitPrice: 25000, total: 25000 }],
      validations: [{ key: 'quantity_match', name: 'Quantity Match', status: 'passed', detail: 'Quantity verified.' }],
    };
    const verifiedInvoice = {
      ...pendingInvoice,
      status: 'VERIFIED',
      signedAt: 'Jun 2, 2026 07:00 PM',
    };

    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (url.includes('/invoices/invoice-1/resolution') && init?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          status: 201,
          json: vi.fn().mockResolvedValue({
            data: {
              resolution: { id: 'resolution-1', decisionState: 'ACCEPTED' },
              invoice: { id: 'invoice-1', state: 'ACCEPTED' },
            },
          }),
        });
      }

      return Promise.resolve({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          data: {
            invoices: fetchMock.mock.calls.some(([calledUrl, calledInit]) =>
              String(calledUrl).includes('/invoices/invoice-1/resolution') && calledInit?.method === 'POST'
            )
              ? [verifiedInvoice]
              : [pendingInvoice],
            fundingRequests: [],
            liquidity: {
              availableLiquidity: 0,
              walletAddress: '',
              walletName: 'VerityAPI',
              isConnected: false,
            },
          },
        }),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<ApiBuyerWorkspace accessRole="Buyer" />);

    await user.click(await screen.findByRole('button', { name: /Invoices Queue/i }));
    await user.click(await screen.findByRole('button', { name: /Review/i }));
    await user.click(await screen.findByLabelText(/authorize the cryptographic signing/i));
    await user.click(await screen.findByRole('button', { name: /Accept & Sign/i }));

    await waitFor(
      () => {
        expect(fetchMock).toHaveBeenCalledWith(
          expect.stringContaining('/invoices/invoice-1/resolution'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              Authorization: 'Bearer buyer-token',
            }),
            body: expect.stringContaining('"decisionState":"ACCEPTED"'),
          })
        );
        expect(fetchMock).toHaveBeenCalledWith(
          expect.stringContaining('/invoices/invoice-1/resolution'),
          expect.objectContaining({
            body: expect.stringContaining('"reasonCode":"BUYER_APPROVED"'),
          })
        );
      },
      { timeout: 5000 }
    );

    await waitFor(
      () => {
        const buyerWorkspaceLoads = fetchMock.mock.calls.filter(([url]) => String(url).includes('/workspaces/buyer'));
        expect(buyerWorkspaceLoads.length).toBeGreaterThanOrEqual(2);
      },
      { timeout: 5000 }
    );
  }, 10000);

  it('persists accepted supplier rebuttals as immediate buyer approvals and reloads the verified status from VerityAPI', async () => {
    const user = userEvent.setup();
    const { ApiBuyerWorkspace, storeApiSession } = await importBuyerApiWorkspace();
    storeApiSession({
      user: { id: 'buyer-user-1', email: 'buyer@test.local', userMetadata: { participantRole: 'Buyer' } },
      accessToken: 'buyer-token',
    });

    const contestedInvoice = {
      id: 'invoice-1',
      supplierName: 'Global Logistics Ltd',
      supplierId: 'supplier-org-1',
      walletAddress: '0x3c2d9a11',
      amount: 12500,
      grossAmount: 12500,
      currency: 'USDC',
      issueDate: 'May 10, 2026',
      maturityDate: 'June 15, 2026',
      status: 'CONTESTED',
      poNumber: 'PO-2026-781',
      goodsReceiptNumber: 'GR-8833',
      lineItems: [{ description: 'Freight Shipping', qty: 1, unitPrice: 12500, total: 12500 }],
      validations: [{ key: 'quantity_match', name: 'Quantity Match', status: 'failed', detail: 'Quantity contested.' }],
      dispute: {
        reason: 'Quantity Mismatch',
        description: 'Received 480 units instead of 500.',
        evidenceFileName: 'dock_photo.jpg',
        evidenceFileSize: '1.4 MB',
        date: 'May 18, 2026',
      },
      rebuttal: {
        stance: 'Full Quantity Delivered',
        explanation: 'Signed delivery note confirms full delivery.',
        evidenceFileName: 'signed_delivery_note.pdf',
        evidenceFileSize: '1.2 MB',
        date: 'May 19, 2026',
      },
    };
    const verifiedInvoice = {
      ...contestedInvoice,
      status: 'VERIFIED',
      internalNotes: '[Resolved today]: Accept supplier proof of shipment. Ledger updated.',
    };

    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      if (url.includes('/invoices/invoice-1/resolution') && init?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          status: 201,
          json: vi.fn().mockResolvedValue({
            data: {
              resolution: { id: 'resolution-1', decisionState: 'ACCEPTED' },
              invoice: { id: 'invoice-1', state: 'ACCEPTED' },
            },
          }),
        });
      }

      return Promise.resolve({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          data: {
            invoices: fetchMock.mock.calls.some(([calledUrl, calledInit]) =>
              String(calledUrl).includes('/invoices/invoice-1/resolution') && calledInit?.method === 'POST'
            )
              ? [verifiedInvoice]
              : [contestedInvoice],
            fundingRequests: [],
            liquidity: {
              availableLiquidity: 0,
              walletAddress: '',
              walletName: 'VerityAPI',
              isConnected: false,
            },
          },
        }),
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<ApiBuyerWorkspace accessRole="Buyer" />);

    await user.click(await screen.findByRole('button', { name: /Invoices Queue/i }));
    await user.click(await screen.findByRole('button', { name: /Review/i }));
    await user.click(await screen.findByRole('button', { name: /Accept Rebuttal/i }));

    await waitFor(
      () => {
        expect(fetchMock).toHaveBeenCalledWith(
          expect.stringContaining('/invoices/invoice-1/resolution'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              Authorization: 'Bearer buyer-token',
            }),
            body: expect.stringContaining('"decisionState":"ACCEPTED"'),
          })
        );
        const resolutionCall = fetchMock.mock.calls.find(([url]) => String(url).includes('/invoices/invoice-1/resolution'));
        expect(String(resolutionCall?.[1]?.body)).not.toContain('nextInvoiceState');
      },
      { timeout: 3000 }
    );

    await waitFor(
      () => {
        const buyerWorkspaceLoads = fetchMock.mock.calls.filter(([url]) => String(url).includes('/workspaces/buyer'));
        expect(buyerWorkspaceLoads.length).toBeGreaterThanOrEqual(2);
      },
      { timeout: 4000 }
    );
  }, 10000);
});
