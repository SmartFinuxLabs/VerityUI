import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import SupplierWorkspace from '../../../src/supplier/SupplierWorkspace';

describe('SupplierWorkspace module', () => {
  it('renders supplier-specific shell and dashboard context', () => {
    render(<SupplierWorkspace accessLabel="Demo Access · supplier@test.local" accessRole="Supplier" />);

    expect(screen.getAllByText(/Supplier Overview/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /New Funding Request/i })).toBeInTheDocument();
    expect(screen.getByText(/Finux-Vault-01/i)).toBeInTheDocument();
  });

  it('navigates from supplier dashboard to factoring workflow', async () => {
    const user = userEvent.setup();
    render(<SupplierWorkspace accessRole="Supplier" />);

    await user.click(screen.getByRole('button', { name: /^Factoring/i }));

    expect(screen.getAllByText(/Request Factoring/i).length).toBeGreaterThan(0);
  });
});
