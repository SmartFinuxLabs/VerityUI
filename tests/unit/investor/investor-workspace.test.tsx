import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import InvestorWorkspace from '../../../src/investor/InvestorWorkspace';

describe('InvestorWorkspace module', () => {
  it('renders investor-specific shell and direct funding metrics', () => {
    render(<InvestorWorkspace accessLabel="API Access · investor@test.local" accessRole="Investor" />);

    expect(screen.getByText(/Prime Network Node/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Committed/i)).toBeInTheDocument();
    expect(screen.getByText('Verity Institutional')).toBeInTheDocument();
  });

  it('navigates from direct funding to portfolio analytics', async () => {
    const user = userEvent.setup();
    render(<InvestorWorkspace accessRole="Investor" />);

    await user.click(screen.getByRole('button', { name: /Portfolio Analytics/i }));

    expect(screen.getAllByText(/Portfolio Analytics/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Portfolio Health Score/i)).toBeInTheDocument();
  });
});
