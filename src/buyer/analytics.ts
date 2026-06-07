import type { Invoice } from './types';
import { getCanonicalInvoiceStatus, type CanonicalInvoiceStatus } from '../lib/invoiceStatusDisplay';

export interface BuyerSupplierConcentration {
  supplierName: string;
  invoiceCount: number;
  outstandingValue: number;
  exposurePercent: number;
}

export interface BuyerDashboardAnalytics {
  totalInvoiceCount: number;
  totalInvoiceValue: number;
  pendingValue: number;
  acceptedFactoredSettledValue: number;
  disputedValue: number;
  openInvoiceValue: number;
  factoredValue: number;
  factoredInvoiceCount: number;
  factoredExposurePercent: number;
  supplierFinancedValue: number;
  discountImpactValue: number;
  settledValue: number;
  settledInvoiceCount: number;
  paymentDueValue: number;
  overduePaymentValue: number;
  paymentCompletionRatio: number;
  liquidityCoverageRatio: number;
  overdueValue: number;
  upcomingMaturityValue: number;
  statusVolumes: { status: CanonicalInvoiceStatus; count: number; totalAmount: number }[];
  timeTrends: { period: string; invoiceCount: number; totalAmount: number }[];
  cashFlowBuckets: { label: string; invoiceCount: number; totalAmount: number }[];
  supplierConcentration: BuyerSupplierConcentration[];
  healthIndicators: { label: string; value: string; tone: 'good' | 'watch' | 'risk' }[];
}

const CASH_FLOW_BUCKETS = ['Overdue', 'Next 7 Days', '8-30 Days', '31-60 Days', 'Later'] as const;

function parseDate(value?: string | null) {
  if (!value) return null;

  const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const timestamp = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3])).getTime()
    : Date.parse(value);

  if (Number.isNaN(timestamp)) return null;
  return new Date(timestamp);
}

function monthKey(value?: string | null) {
  const date = parseDate(value);
  if (!date) return 'Unknown';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function percent(part: number, total: number) {
  return total > 0 ? `${((part / total) * 100).toFixed(1)}%` : '0.0%';
}

function ratio(part: number, total: number) {
  return total > 0 ? part / total : 0;
}

function roundPercentValue(part: number, total: number) {
  return total > 0 ? Number(((part / total) * 100).toFixed(1)) : 0;
}

function numericValue(value?: number | null) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function getFactoredAmount(invoice: Invoice, amount: number, canonicalStatus: CanonicalInvoiceStatus | 'UNKNOWN') {
  const explicitAmount = numericValue(invoice.factoredAmount);
  if (explicitAmount > 0) return explicitAmount;
  return canonicalStatus === 'FACTORED' ? amount : 0;
}

function isSettled(invoice: Invoice, canonicalStatus: CanonicalInvoiceStatus | 'UNKNOWN') {
  const paymentStatus = (invoice.paymentStatus ?? '').toUpperCase();
  return canonicalStatus === 'SETTLED' || Boolean(invoice.settledAt || invoice.paidAt) || paymentStatus === 'PAID' || paymentStatus === 'SETTLED';
}

function maturityBucket(invoice: Invoice, today: Date) {
  const maturity = parseDate(invoice.maturityDate ?? invoice.dueDate);
  if (!maturity) return 'Later';

  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const maturityStart = new Date(maturity.getFullYear(), maturity.getMonth(), maturity.getDate()).getTime();
  const days = Math.ceil((maturityStart - todayStart) / 86400000);

  if (days < 0) return 'Overdue';
  if (days <= 7) return 'Next 7 Days';
  if (days <= 30) return '8-30 Days';
  if (days <= 60) return '31-60 Days';
  return 'Later';
}

export function buildBuyerDashboardAnalytics(
  invoices: Invoice[],
  today: Date = new Date(),
  availableLiquidity = 0
): BuyerDashboardAnalytics {
  const statusMap = new Map<CanonicalInvoiceStatus, { status: CanonicalInvoiceStatus; count: number; totalAmount: number }>();
  const trendMap = new Map<string, { period: string; invoiceCount: number; totalAmount: number }>();
  const bucketMap = new Map<string, { label: string; invoiceCount: number; totalAmount: number }>(
    CASH_FLOW_BUCKETS.map((label) => [label, { label, invoiceCount: 0, totalAmount: 0 }])
  );
  const supplierMap = new Map<string, BuyerSupplierConcentration>();

  let totalInvoiceValue = 0;
  let pendingValue = 0;
  let acceptedFactoredSettledValue = 0;
  let disputedValue = 0;
  let openInvoiceValue = 0;
  let factoredValue = 0;
  let factoredInvoiceCount = 0;
  let discountImpactValue = 0;
  let settledValue = 0;
  let settledInvoiceCount = 0;
  let paymentDueValue = 0;
  let overdueValue = 0;
  let upcomingMaturityValue = 0;

  for (const invoice of invoices) {
    const amount = invoice.amount ?? 0;
    const canonicalStatus = getCanonicalInvoiceStatus(invoice.status);
    const settled = isSettled(invoice, canonicalStatus);
    const invoiceFactoredAmount = getFactoredAmount(invoice, amount, canonicalStatus);
    totalInvoiceValue += amount;
    discountImpactValue += numericValue(invoice.discountAmount);

    if (canonicalStatus !== 'UNKNOWN') {
      const statusStat = statusMap.get(canonicalStatus) ?? { status: canonicalStatus, count: 0, totalAmount: 0 };
      statusStat.count += 1;
      statusStat.totalAmount += amount;
      statusMap.set(canonicalStatus, statusStat);
    }

    const trendPeriod = monthKey(invoice.issueDate);
    const trend = trendMap.get(trendPeriod) ?? { period: trendPeriod, invoiceCount: 0, totalAmount: 0 };
    trend.invoiceCount += 1;
    trend.totalAmount += amount;
    trendMap.set(trendPeriod, trend);

    if (canonicalStatus === 'PENDING') pendingValue += amount;
    if (canonicalStatus === 'ACCEPTED' || canonicalStatus === 'FACTORED' || canonicalStatus === 'SETTLED') {
      acceptedFactoredSettledValue += amount;
    }
    if (canonicalStatus === 'DISPUTED') disputedValue += amount;

    if (invoiceFactoredAmount > 0) {
      factoredValue += invoiceFactoredAmount;
      factoredInvoiceCount += 1;
    }

    if (settled) {
      settledValue += amount;
      settledInvoiceCount += 1;
    }

    if (!settled) {
      openInvoiceValue += amount;
      paymentDueValue += amount;

      const supplierName = invoice.supplierName || 'Unknown Supplier';
      const supplierStat = supplierMap.get(supplierName) ?? {
        supplierName,
        invoiceCount: 0,
        outstandingValue: 0,
        exposurePercent: 0,
      };
      supplierStat.invoiceCount += 1;
      supplierStat.outstandingValue += amount;
      supplierMap.set(supplierName, supplierStat);

      const label = maturityBucket(invoice, today);
      const bucket = bucketMap.get(label);
      if (bucket) {
        bucket.invoiceCount += 1;
        bucket.totalAmount += amount;
      }
      if (label === 'Overdue') overdueValue += amount;
      if (label === 'Next 7 Days' || label === '8-30 Days') upcomingMaturityValue += amount;
    }
  }

  const factoredExposurePercent = roundPercentValue(factoredValue, openInvoiceValue);
  const paymentCompletionRatio = ratio(settledValue, totalInvoiceValue);
  const liquidityCoverageRatio = ratio(availableLiquidity, paymentDueValue);
  const supplierConcentration = Array.from(supplierMap.values())
    .map((supplier) => ({
      ...supplier,
      exposurePercent: roundPercentValue(supplier.outstandingValue, openInvoiceValue),
    }))
    .sort((a, b) => b.outstandingValue - a.outstandingValue || a.supplierName.localeCompare(b.supplierName));

  const healthIndicators = [
    {
      label: 'Dispute Exposure',
      value: percent(disputedValue, totalInvoiceValue),
      tone: ratio(disputedValue, totalInvoiceValue) > 0.1 ? 'risk' as const : ratio(disputedValue, totalInvoiceValue) > 0 ? 'watch' as const : 'good' as const,
    },
    {
      label: 'Overdue Payments',
      value: percent(overdueValue, openInvoiceValue),
      tone: overdueValue > 0 ? 'risk' as const : 'good' as const,
    },
    {
      label: 'Upcoming Maturity Concentration',
      value: percent(upcomingMaturityValue, openInvoiceValue),
      tone: ratio(upcomingMaturityValue, openInvoiceValue) > 0.5 ? 'watch' as const : 'good' as const,
    },
    {
      label: 'Factoring Exposure',
      value: percent(factoredValue, openInvoiceValue),
      tone: ratio(factoredValue, openInvoiceValue) > 0.4 ? 'watch' as const : 'good' as const,
    },
    {
      label: 'Settlement Completion',
      value: percent(settledValue, totalInvoiceValue),
      tone: paymentCompletionRatio >= 0.5 ? 'good' as const : paymentCompletionRatio > 0 ? 'watch' as const : 'watch' as const,
    },
    {
      label: 'Liquidity Coverage',
      value: `${(liquidityCoverageRatio * 100).toFixed(1)}%`,
      tone: paymentDueValue === 0 ? 'good' as const : liquidityCoverageRatio >= 1 ? 'good' as const : liquidityCoverageRatio >= 0.5 ? 'watch' as const : 'risk' as const,
    },
  ];

  return {
    totalInvoiceCount: invoices.length,
    totalInvoiceValue,
    pendingValue,
    acceptedFactoredSettledValue,
    disputedValue,
    openInvoiceValue,
    factoredValue,
    factoredInvoiceCount,
    factoredExposurePercent,
    supplierFinancedValue: factoredValue,
    discountImpactValue,
    settledValue,
    settledInvoiceCount,
    paymentDueValue,
    overduePaymentValue: overdueValue,
    paymentCompletionRatio,
    liquidityCoverageRatio,
    overdueValue,
    upcomingMaturityValue,
    statusVolumes: Array.from(statusMap.values()).sort((a, b) => a.status.localeCompare(b.status)),
    timeTrends: Array.from(trendMap.values()).sort((a, b) => a.period.localeCompare(b.period)),
    cashFlowBuckets: Array.from(bucketMap.values()),
    supplierConcentration,
    healthIndicators,
  };
}
