import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CreateInvoiceFullView from '../../../src/supplier/components/create-invoice-wizard/CreateInvoiceFullView';

const buyerOptions = [
  {
    buyerId: 'buyer-org-1',
    buyerName: 'Northstar Buyer LLC',
    buyerStatus: 'VERIFIED',
  },
];

describe('supplier CreateInvoiceFullView component functions', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('defaults detailed invoice metadata to an auto invoice number and due date two months later', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-06T12:00:00.000Z'));
    const onSubmitFullInvoice = vi.fn();

    render(
      <CreateInvoiceFullView
        onSelectRoute={vi.fn()}
        onSubmitFullInvoice={onSubmitFullInvoice}
        buyerOptions={buyerOptions}
      />
    );

    const invoiceNumberInput = screen.getByLabelText(/Invoice Number/i);
    const issueDateInput = screen.getByLabelText(/Issue Date/i);
    const dueDateInput = screen.getByLabelText(/Due Date/i);

    expect((invoiceNumberInput as HTMLInputElement).value).toMatch(/^INV-2026-\d{4}$/);
    expect(issueDateInput).toHaveValue('2026-06-06');
    expect(dueDateInput).toHaveValue('2026-08-06');

    vi.useRealTimers();
    const user = userEvent.setup();

    await user.click(screen.getByLabelText(/Northstar Buyer LLC/i));
    await user.click(screen.getByRole('button', { name: /Next: Line Items/i }));
    await user.click(screen.getByRole('button', { name: /Next: Review & Sign/i }));

    expect(screen.getByText(/Aug 6, 2026/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Submit Invoice/i }));

    expect(onSubmitFullInvoice).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceNumber: expect.stringMatching(/^INV-2026-\d{4}$/),
        issueDate: '2026-06-06',
        dueDate: '2026-08-06',
      })
    );
  });

  it('captures invoice number, issue date, and due date in detailed invoice creation', async () => {
    const user = userEvent.setup();
    const onSubmitFullInvoice = vi.fn();

    render(
      <CreateInvoiceFullView
        onSelectRoute={vi.fn()}
        onSubmitFullInvoice={onSubmitFullInvoice}
        buyerOptions={buyerOptions}
      />
    );

    await user.clear(screen.getByLabelText(/Invoice Number/i));
    await user.type(screen.getByLabelText(/Invoice Number/i), 'INV-DETAIL-300');
    await user.clear(screen.getByLabelText(/Issue Date/i));
    await user.type(screen.getByLabelText(/Issue Date/i), '2026-06-05');
    await user.clear(screen.getByLabelText(/Due Date/i));
    await user.type(screen.getByLabelText(/Due Date/i), '2026-07-05');
    await user.click(screen.getByLabelText(/Northstar Buyer LLC/i));
    await user.click(screen.getByRole('button', { name: /Next: Line Items/i }));
    await user.click(screen.getByRole('button', { name: /Next: Review & Sign/i }));

    expect(screen.getByText(/#INV-DETAIL-300/i)).toBeInTheDocument();
    expect(screen.getByText(/Jun 5, 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/Jul 5, 2026/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Submit Invoice/i }));

    await waitFor(() => {
      expect(onSubmitFullInvoice).toHaveBeenCalledWith(
        expect.objectContaining({
          invoiceNumber: 'INV-DETAIL-300',
          issueDate: '2026-06-05',
          dueDate: '2026-07-05',
        })
      );
    });
  });

  it('requires the due date to be after the issue date', async () => {
    const user = userEvent.setup();

    render(
      <CreateInvoiceFullView
        onSelectRoute={vi.fn()}
        onSubmitFullInvoice={vi.fn()}
        buyerOptions={buyerOptions}
      />
    );

    await user.clear(screen.getByLabelText(/Invoice Number/i));
    await user.type(screen.getByLabelText(/Invoice Number/i), 'INV-DETAIL-301');
    await user.clear(screen.getByLabelText(/Issue Date/i));
    await user.type(screen.getByLabelText(/Issue Date/i), '2026-07-05');
    await user.clear(screen.getByLabelText(/Due Date/i));
    await user.type(screen.getByLabelText(/Due Date/i), '2026-06-05');
    await user.click(screen.getByLabelText(/Northstar Buyer LLC/i));
    await user.click(screen.getByRole('button', { name: /Next: Line Items/i }));

    expect(screen.getByText(/Due date must be after issue date/i)).toBeInTheDocument();
  });
});
