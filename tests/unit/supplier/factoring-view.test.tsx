import { act } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import FactoringView from '../../../src/supplier/components/FactoringView';
import type { Invoice } from '../../../src/supplier/types';

const invoices: Invoice[] = [
  {
    id: 'INV-001',
    buyer: 'Acme Buyer',
    amount: 100,
    maturityDate: '2026-06-10',
    status: 'ACCEPTED',
  },
  {
    id: 'INV-002',
    buyer: 'Globex Buyer',
    amount: 200,
    maturityDate: '2026-06-20',
    status: 'ACCEPTED',
  },
  {
    id: 'INV-003',
    buyer: 'Pending Buyer',
    amount: 900,
    maturityDate: '2026-07-01',
    status: 'PENDING',
  },
];

describe('supplier FactoringView component functions', () => {
  it('calculates factoring terms from eligible selected invoices', () => {
    render(
      <FactoringView
        invoices={invoices}
        onSelectRoute={vi.fn()}
        onSubmitFactoringBatch={vi.fn()}
        preselectedInvoiceId={null}
      />
    );

    expect(screen.getByText('USDC 300.00')).toBeInTheDocument();
    expect(screen.getByText('270.00 USDC')).toBeInTheDocument();
    expect(screen.getByText('-1.50 USDC')).toBeInTheDocument();
    expect(screen.getByText('268.50')).toBeInTheDocument();
  });

  it('submits selected invoices and routes to settlement after escrow signing', async () => {
    vi.useFakeTimers();
    const onSelectRoute = vi.fn();
    const onSubmitFactoringBatch = vi.fn();

    render(
      <FactoringView
        invoices={invoices}
        onSelectRoute={onSelectRoute}
        onSubmitFactoringBatch={onSubmitFactoringBatch}
        preselectedInvoiceId="INV-002"
      />
    );

    expect(screen.getByText('1 Invoices selected')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Submit to Marketplace/i }));

    expect(screen.getByText(/Signing Smart Escrow/i)).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    expect(onSubmitFactoringBatch).toHaveBeenCalledWith(['INV-002'], 180);
    expect(screen.getByText(/Financing Request Submitted/i)).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2500);
    });

    expect(onSelectRoute).toHaveBeenCalledWith('settlement');
  });

  it('prevents marketplace submission when no invoices are selected', async () => {
    const user = userEvent.setup();

    render(
      <FactoringView
        invoices={invoices}
        onSelectRoute={vi.fn()}
        onSubmitFactoringBatch={vi.fn()}
        preselectedInvoiceId={null}
      />
    );

    await user.click(screen.getByRole('button', { name: /Deselect All/i }));

    expect(screen.getByRole('button', { name: /Submit to Marketplace/i })).toBeDisabled();
    expect(screen.getByText('0 Invoices selected')).toBeInTheDocument();
  });
});
