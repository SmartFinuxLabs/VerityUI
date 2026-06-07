import { describe, expect, it } from 'vitest';
import { buildBuyerDashboardAnalytics } from '../../../src/buyer/analytics';
import type { Invoice } from '../../../src/buyer/types';

const invoices: Invoice[] = [
  {
    id: 'invoice-pending',
    invoiceNumber: 'INV-PENDING',
    supplierName: 'Pending Supplier',
    supplierId: 'sup-pending',
    walletAddress: '0x1',
    amount: 10000,
    currency: 'USDC',
    issueDate: '2026-06-01',
    maturityDate: '2026-06-12',
    status: 'PENDING_VERIFICATION',
    poNumber: 'PO-1',
    goodsReceiptNumber: 'GR-1',
    lineItems: [],
    validations: [],
  },
  {
    id: 'invoice-accepted',
    invoiceNumber: 'INV-ACCEPTED',
    supplierName: 'Accepted Supplier',
    supplierId: 'sup-accepted',
    walletAddress: '0x2',
    amount: 25000,
    currency: 'USDC',
    issueDate: '2026-06-10',
    maturityDate: '2026-06-20',
    status: 'VERIFIED',
    poNumber: 'PO-2',
    goodsReceiptNumber: 'GR-2',
    lineItems: [],
    validations: [],
  },
  {
    id: 'invoice-disputed',
    invoiceNumber: 'INV-DISPUTED',
    supplierName: 'Disputed Supplier',
    supplierId: 'sup-disputed',
    walletAddress: '0x3',
    amount: 5000,
    currency: 'USDC',
    issueDate: '2026-05-15',
    maturityDate: '2026-05-30',
    status: 'CONTESTED',
    poNumber: 'PO-3',
    goodsReceiptNumber: 'GR-3',
    lineItems: [],
    validations: [],
  },
  {
    id: 'invoice-factored',
    invoiceNumber: 'INV-FACTORED',
    supplierName: 'Factored Supplier',
    supplierId: 'sup-factored',
    walletAddress: '0x5',
    amount: 20000,
    currency: 'USDC',
    issueDate: '2026-06-08',
    maturityDate: '2026-06-15',
    status: 'FACTORED',
    poNumber: 'PO-5',
    goodsReceiptNumber: 'GR-5',
    lineItems: [],
    validations: [],
    factoredAmount: 19000,
    discountAmount: 1000,
    paymentStatus: 'FINANCED',
  },
  {
    id: 'invoice-settled',
    invoiceNumber: 'INV-SETTLED',
    supplierName: 'Settled Supplier',
    supplierId: 'sup-settled',
    walletAddress: '0x4',
    amount: 8000,
    currency: 'USDC',
    issueDate: '2026-05-20',
    maturityDate: '2026-06-01',
    status: 'SETTLED',
    poNumber: 'PO-4',
    goodsReceiptNumber: 'GR-4',
    lineItems: [],
    validations: [],
    paidAt: '2026-06-02T00:00:00.000Z',
    paymentStatus: 'PAID',
  },
];

describe('buyer dashboard analytics', () => {
  it('derives volume, status, trend, cash-flow, and health metrics from buyer invoices', () => {
    const analytics = buildBuyerDashboardAnalytics(invoices, new Date('2026-06-10T12:00:00Z'), 30000);

    expect(analytics.totalInvoiceCount).toBe(5);
    expect(analytics.totalInvoiceValue).toBe(68000);
    expect(analytics.pendingValue).toBe(10000);
    expect(analytics.acceptedFactoredSettledValue).toBe(53000);
    expect(analytics.disputedValue).toBe(5000);
    expect(analytics.openInvoiceValue).toBe(60000);
    expect(analytics.factoredValue).toBe(19000);
    expect(analytics.factoredInvoiceCount).toBe(1);
    expect(analytics.factoredExposurePercent).toBe(31.7);
    expect(analytics.supplierFinancedValue).toBe(19000);
    expect(analytics.discountImpactValue).toBe(1000);
    expect(analytics.settledValue).toBe(8000);
    expect(analytics.settledInvoiceCount).toBe(1);
    expect(analytics.paymentDueValue).toBe(60000);
    expect(analytics.overduePaymentValue).toBe(5000);
    expect(analytics.paymentCompletionRatio).toBeCloseTo(0.1176, 4);
    expect(analytics.liquidityCoverageRatio).toBe(0.5);
    expect(analytics.overdueValue).toBe(5000);
    expect(analytics.upcomingMaturityValue).toBe(55000);
    expect(analytics.statusVolumes).toEqual(
      expect.arrayContaining([
        { status: 'PENDING', count: 1, totalAmount: 10000 },
        { status: 'ACCEPTED', count: 1, totalAmount: 25000 },
        { status: 'DISPUTED', count: 1, totalAmount: 5000 },
        { status: 'FACTORED', count: 1, totalAmount: 20000 },
        { status: 'SETTLED', count: 1, totalAmount: 8000 },
      ])
    );
    expect(analytics.timeTrends).toEqual([
      { period: '2026-05', invoiceCount: 2, totalAmount: 13000 },
      { period: '2026-06', invoiceCount: 3, totalAmount: 55000 },
    ]);
    expect(analytics.cashFlowBuckets).toEqual([
      { label: 'Overdue', invoiceCount: 1, totalAmount: 5000 },
      { label: 'Next 7 Days', invoiceCount: 2, totalAmount: 30000 },
      { label: '8-30 Days', invoiceCount: 1, totalAmount: 25000 },
      { label: '31-60 Days', invoiceCount: 0, totalAmount: 0 },
      { label: 'Later', invoiceCount: 0, totalAmount: 0 },
    ]);
    expect(analytics.supplierConcentration.slice(0, 2)).toEqual([
      { supplierName: 'Accepted Supplier', invoiceCount: 1, outstandingValue: 25000, exposurePercent: 41.7 },
      { supplierName: 'Factored Supplier', invoiceCount: 1, outstandingValue: 20000, exposurePercent: 33.3 },
    ]);
    expect(analytics.healthIndicators).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Dispute Exposure', value: '7.4%', tone: 'watch' }),
        expect.objectContaining({ label: 'Overdue Payments', value: '8.3%', tone: 'risk' }),
        expect.objectContaining({ label: 'Upcoming Maturity Concentration', value: '91.7%', tone: 'watch' }),
        expect.objectContaining({ label: 'Factoring Exposure', value: '31.7%', tone: 'good' }),
        expect.objectContaining({ label: 'Settlement Completion', value: '11.8%', tone: 'watch' }),
        expect.objectContaining({ label: 'Liquidity Coverage', value: '50.0%', tone: 'watch' }),
      ])
    );
  });

  it('keeps zero-invoice health output stable', () => {
    const analytics = buildBuyerDashboardAnalytics([], new Date('2026-06-10T12:00:00Z'));

    expect(analytics.totalInvoiceCount).toBe(0);
    expect(analytics.openInvoiceValue).toBe(0);
    expect(analytics.liquidityCoverageRatio).toBe(0);
    expect(analytics.supplierConcentration).toEqual([]);
    expect(analytics.healthIndicators).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Liquidity Coverage', value: '0.0%', tone: 'good' }),
      ])
    );
  });
});
