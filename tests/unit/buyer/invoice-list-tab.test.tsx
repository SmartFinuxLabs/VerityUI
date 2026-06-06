import { act } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import InvoiceListTab from '../../../src/buyer/components/InvoiceListTab';
import type { Invoice, LiquidityProfile } from '../../../src/buyer/types';

const invoices: Invoice[] = [
  {
    id: 'INV-2026-089',
    invoiceNumber: 'INV-BUYER-089',
    supplierName: 'Northstar Components',
    supplierId: 'SUP-100',
    walletAddress: '0x123',
    amount: 25000,
    currency: 'USDC',
    issueDate: '2026-05-01',
    maturityDate: '2026-06-15',
    status: 'PENDING_VERIFICATION',
    poNumber: 'PO-100',
    goodsReceiptNumber: 'GRN-100',
    lineItems: [],
    validations: [],
  },
  {
    id: 'INV-2026-090',
    supplierName: 'Verified Supplier',
    supplierId: 'SUP-200',
    walletAddress: '0x456',
    amount: 40000,
    currency: 'USDC',
    issueDate: '2026-05-03',
    maturityDate: '2026-06-30',
    status: 'VERIFIED',
    poNumber: 'PO-200',
    goodsReceiptNumber: 'GRN-200',
    lineItems: [],
    validations: [],
  },
];

const liquidity: LiquidityProfile = {
  availableLiquidity: 125000,
  walletAddress: '0xwallet',
  walletName: 'Arc Vault',
  isConnected: true,
};

describe('buyer InvoiceListTab component functions', () => {
  it('routes review actions with the selected invoice id', async () => {
    const user = userEvent.setup();
    const onSelectInvoiceDetails = vi.fn();

    render(
      <InvoiceListTab
        invoices={invoices}
        liquidity={liquidity}
        onSelectInvoiceDetails={onSelectInvoiceDetails}
        onApproveInvoice={vi.fn()}
        onRejectOrDispute={vi.fn()}
      />
    );

    const firstDataRow = screen.getAllByText('INV-BUYER-089')[0].closest('tr');
    expect(firstDataRow).not.toBeNull();

    await user.click(within(firstDataRow as HTMLTableRowElement).getByRole('button', { name: 'Review' }));

    expect(onSelectInvoiceDetails).toHaveBeenCalledWith('INV-2026-089');
  });

  it('shows invoice numbers as the user-facing invoice identifier', async () => {
    const user = userEvent.setup();
    const onSelectInvoiceDetails = vi.fn();

    render(
      <InvoiceListTab
        invoices={invoices}
        liquidity={liquidity}
        onSelectInvoiceDetails={onSelectInvoiceDetails}
        onApproveInvoice={vi.fn()}
        onRejectOrDispute={vi.fn()}
      />
    );

    const table = screen.getByRole('table');
    expect(within(table).getByRole('columnheader', { name: /Invoice Number/i })).toBeInTheDocument();
    expect(within(table).queryByText(/Invoice ID/i)).not.toBeInTheDocument();

    await user.click(within(table).getByRole('button', { name: 'INV-BUYER-089' }));

    expect(onSelectInvoiceDetails).toHaveBeenCalledWith('INV-2026-089');
  });

  it('requires both quick verification checks before accepting and signing', async () => {
    vi.useFakeTimers();
    const onApproveInvoice = vi.fn();

    render(
      <InvoiceListTab
        invoices={invoices}
        liquidity={liquidity}
        onSelectInvoiceDetails={vi.fn()}
        onApproveInvoice={onApproveInvoice}
        onRejectOrDispute={vi.fn()}
      />
    );

    const acceptButton = screen.getByRole('button', { name: /Accept & Sign/i });
    expect(acceptButton).toBeDisabled();

    fireEvent.click(screen.getByLabelText(/confirm receipt/i));
    expect(acceptButton).toBeDisabled();

    fireEvent.click(screen.getByLabelText(/verify accuracy/i));
    expect(acceptButton).toBeEnabled();

    fireEvent.click(acceptButton);
    expect(screen.getByText(/Generating Crypto-Signature/i)).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1800);
    });

    expect(onApproveInvoice).toHaveBeenCalledWith('INV-2026-089');
  });

  it('submits quick disputes with the current invoice id', async () => {
    const user = userEvent.setup();
    const onRejectOrDispute = vi.fn();

    render(
      <InvoiceListTab
        invoices={invoices}
        liquidity={liquidity}
        onSelectInvoiceDetails={vi.fn()}
        onApproveInvoice={vi.fn()}
        onRejectOrDispute={onRejectOrDispute}
      />
    );

    await user.click(screen.getByRole('button', { name: /Reject & Dispute/i }));

    expect(onRejectOrDispute).toHaveBeenCalledWith('INV-2026-089');
  });
});
