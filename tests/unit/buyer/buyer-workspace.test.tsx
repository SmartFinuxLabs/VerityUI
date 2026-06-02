import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import BuyerWorkspace from '../../../src/buyer/BuyerWorkspace';

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
});
