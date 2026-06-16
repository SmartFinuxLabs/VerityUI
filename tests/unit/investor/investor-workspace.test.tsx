import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import InvestorWorkspace from '../../../src/investor/InvestorWorkspace';
import { initialInvoices, initialLedger, initialSettlements } from '../../../src/investor/data';
import { storeApiSession } from '../../../src/lib/participantAuth';

async function importInvestorApiWorkspace() {
  vi.stubEnv('VITE_RUN_MODE', 'api');
  vi.resetModules();

  const [{ default: ApiInvestorWorkspace }, participantAuth] = await Promise.all([
    import('../../../src/investor/InvestorWorkspace'),
    import('../../../src/lib/participantAuth'),
  ]);

  return { ApiInvestorWorkspace, storeApiSession: participantAuth.storeApiSession };
}

function mockFetchJson(status: number, body: unknown) {
  const ok = status >= 200 && status < 300;

  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: vi.fn().mockResolvedValue(body),
  });
}

describe('InvestorWorkspace module', () => {
  beforeEach(() => {
    storeApiSession({
      user: { id: 'investor-user-1', email: 'investor@test.local', userMetadata: { participantRole: 'Investor' } },
      accessToken: 'investor-token',
    });
    vi.stubGlobal(
      'fetch',
      mockFetchJson(200, {
        data: {
          invoices: initialInvoices,
          settlements: initialSettlements,
          ledgerRows: initialLedger,
          totalCommitted: 12450000,
          activeInvestments: 8124550,
          availableCapital: 4325450,
          projectedYield: 8.45,
          ytdEarned: 156250,
        },
      })
    );
  });

  it('renders investor-specific shell and direct funding metrics', async () => {
    render(<InvestorWorkspace accessLabel="API Access · investor@test.local" accessRole="Investor" />);

    expect(await screen.findByText(/Prime Network Node/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Committed/i)).toBeInTheDocument();
    expect(screen.getByText('Verity Institutional')).toBeInTheDocument();
  });

  it('navigates from direct funding to portfolio analytics', async () => {
    const user = userEvent.setup();
    render(<InvestorWorkspace accessRole="Investor" />);

    await user.click(await screen.findByRole('button', { name: /Portfolio Analytics/i }));

    expect(screen.getAllByText(/Portfolio Analytics/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Portfolio Health Score/i)).toBeInTheDocument();
  });

  it('shows API marketplace invoice status and opens status-rich details', async () => {
    const user = userEvent.setup();
    const { ApiInvestorWorkspace, storeApiSession } = await importInvestorApiWorkspace();
    storeApiSession({
      user: { id: 'investor-user-1', email: 'investor@test.local', userMetadata: { participantRole: 'Investor' } },
      accessToken: 'investor-token',
    });
    vi.stubGlobal(
      'fetch',
      mockFetchJson(200, {
        data: {
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
              discount: 12,
              maturity: 55,
              status: 'Available',
              fundingStatus: 'LISTED',
              invoiceStatus: 'FACTORING_REQUESTED',
              buyerRating: 'A',
              buyerScore: 90,
              poNumber: 'PO-MKT-001',
              poDate: '2026-06-01',
              grnWarehouse: 'GR-MKT-001',
              grnDate: '2026-06-10',
              signatureName: 'Verity Verified',
              signatureDivision: 'Accounts Payable',
              signatureDate: '2026-06-01',
              description: 'Industrial Sensors',
              verityScore: 92,
              paymentDelinquency: 0,
              avgDaysBeyondTerm: 0,
              disputeRatio: 0,
              retentionReleaseRate: 100,
              marketCap: 'N/A',
              spRating: 'A',
              nyseSymbol: 'N/A',
            },
          ],
          settlements: [],
          ledgerRows: [],
          totalCommitted: 0,
          activeInvestments: 0,
          availableCapital: 100000,
          projectedYield: 0,
          ytdEarned: 0,
        },
      })
    );

    render(<ApiInvestorWorkspace accessRole="Investor" />);

    await user.click(await screen.findByRole('button', { name: /Marketplace & Bridge/i }));

    expect(await screen.findByText(/INV-MKT-001/i)).toBeInTheDocument();
    expect(screen.getByText(/Marketplace Listed/i)).toBeInTheDocument();
    expect(screen.getByText(/Materion Corp/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Fund This Invoice/i }));

    expect(await screen.findByText(/Invoice Deep Dive/i)).toBeInTheDocument();
    expect(screen.getByText(/Invoice Status/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Factoring Requested/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Funding Status/i)).toBeInTheDocument();
    expect(screen.getByText(/Marketplace Listed/i)).toBeInTheDocument();
  });
});
