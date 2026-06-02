import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import BuyerWorkspace from '../../../src/buyer/BuyerWorkspace';
import { storeApiSession } from '../../../src/lib/participantAuth';

describe('BuyerWorkspace module', () => {
  it('renders buyer-specific header, sidebar action, and dashboard content', () => {
    render(<BuyerWorkspace accessLabel="API Access · buyer@test.local" accessRole="Buyer" />);

    expect(screen.getAllByText(/Buyer Dashboard/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /New Funding Request/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search invoices, suppliers, or hashes/i)).toBeInTheDocument();
  });

  it('navigates from buyer dashboard to invoice queue', async () => {
    const user = userEvent.setup();
    render(<BuyerWorkspace accessRole="Buyer" />);

    await user.click(screen.getByRole('button', { name: /Invoices Queue/i }));

    expect(screen.getAllByText(/Invoices Queue/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Verify and authorize incoming peer-to-peer invoice assets/i)).toBeInTheDocument();
  });

  it('renders an empty invoice queue from VerityAPI without a blank screen', async () => {
    const user = userEvent.setup();
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

    render(<BuyerWorkspace accessRole="Buyer" />);

    await user.click(await screen.findByRole('button', { name: /Invoices Queue/i }));

    expect(screen.getByText(/No invoices in queue/i)).toBeInTheDocument();
    expect(screen.getByText(/Supplier invoices will appear here once they are submitted to your buyer organization/i)).toBeInTheDocument();
  });
});
