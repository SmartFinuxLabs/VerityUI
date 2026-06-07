import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import InvoiceVerification from '../../../src/buyer/components/InvoiceVerification';
import type { Invoice, LiquidityProfile } from '../../../src/buyer/types';

const baseInvoice: Invoice = {
  id: 'invoice-1',
  invoiceNumber: 'INV-BUYER-001',
  supplierName: 'Northstar Supplier LLC',
  supplierId: 'supplier-org-1',
  walletAddress: '0x123456789',
  amount: 25000,
  grossAmount: 25000,
  currency: 'USDC',
  issueDate: '2026-06-01',
  maturityDate: '2026-07-01',
  status: 'PENDING_VERIFICATION',
  poNumber: 'PO-1',
  goodsReceiptNumber: 'GR-1',
  lineItems: [{ description: 'Sensors', qty: 1, unitPrice: 25000, total: 25000 }],
  validations: [{ key: 'supplier_identity', name: 'Supplier Identity', status: 'passed', detail: 'Supplier verified.' }],
};

const liquidity: LiquidityProfile = {
  availableLiquidity: 50000,
  walletAddress: '0xwallet',
  walletName: 'Buyer Vault',
  isConnected: true,
};

describe('buyer invoice verification view', () => {
  it('renders the supplier legal name on invoice viewing', () => {
    render(
      <InvoiceVerification
        invoice={baseInvoice}
        liquidity={liquidity}
        onBack={vi.fn()}
        onAcceptAndSign={vi.fn()}
        onSubmitDispute={vi.fn()}
      />
    );

    expect(screen.getAllByText('Northstar Supplier LLC').length).toBeGreaterThan(0);
    expect(screen.queryByText('supplier-org-1')).not.toBeInTheDocument();
  });

  it('does not substitute supplier id as the supplier display name', () => {
    render(
      <InvoiceVerification
        invoice={{ ...baseInvoice, supplierName: 'supplier-org-1' }}
        liquidity={liquidity}
        onBack={vi.fn()}
        onAcceptAndSign={vi.fn()}
        onSubmitDispute={vi.fn()}
      />
    );

    expect(screen.getAllByText('Supplier name unavailable').length).toBeGreaterThan(0);
    expect(screen.queryByText('supplier-org-1')).not.toBeInTheDocument();
  });
});
