import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CreateInvoiceModal from '../../../src/supplier/components/CreateInvoiceModal';

const buyerOptions = [
  {
    buyerId: 'buyer-org-1',
    buyerName: 'Northstar Buyer LLC',
    buyerStatus: 'ACTIVE',
  },
];

describe('supplier quick invoice creation modal', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows sellers to fill issue date and due date for quick invoice creation', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-06T12:00:00.000Z'));
    const onSubmitInvoice = vi.fn();

    render(
      <CreateInvoiceModal
        onClose={vi.fn()}
        onSubmitInvoice={onSubmitInvoice}
        buyerOptions={buyerOptions}
      />
    );

    expect(screen.getByLabelText(/Issue Date/i)).toHaveValue('2026-06-06');
    expect(screen.getByLabelText(/Due Date/i)).toHaveValue('2026-08-06');

    fireEvent.change(screen.getByLabelText(/Issue Date/i), { target: { value: '2026-06-10' } });
    fireEvent.change(screen.getByLabelText(/Due Date/i), { target: { value: '2026-08-10' } });
    fireEvent.click(screen.getByRole('button', { name: /Verify & Submit/i }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    expect(onSubmitInvoice).toHaveBeenCalledWith(
      expect.objectContaining({
        issueDate: '2026-06-10',
        dueDate: '2026-08-10',
        maturityDate: '2026-08-10',
      })
    );
  });
});
