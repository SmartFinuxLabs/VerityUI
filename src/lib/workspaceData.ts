import type { FundingRequest, Invoice as BuyerInvoice, LiquidityProfile } from '../buyer/types';
import type { Invoice as InvestorInvoice, LedgerRow, Settlement } from '../investor/types';
import type { Invoice as SupplierInvoice, RegisteredBuyerOption } from '../supplier/types';
import { verityApi } from './apiClient';
import { getParticipantAccessSnapshot, type ParticipantAccessSnapshot } from './participantAuth';
import { normalizeFundingStatus } from './fundingStatusDisplay';

export interface BuyerWorkspaceState {
  invoices: BuyerInvoice[];
  fundingRequests: FundingRequest[];
  liquidity: LiquidityProfile;
}

export interface SupplierWorkspaceState {
  supplierOrganizationId: string | null;
  invoices: SupplierInvoice[];
  registeredBuyers: RegisteredBuyerOption[];
  availableLiquidity: number;
  escrowValue: number;
  onChainCredit: number;
  walletConnected: boolean;
  walletAddress: string | null;
}

export interface SupplierAnalyticsState {
  volumeByStatus: { status: string; count: number; totalAmount: number }[];
  timeTrends: { period: string; createdVolume: number; settledVolume: number }[];
  cashFlowProjections: { date: string; expectedAmount: number; factoredAmount: number }[];
  financialHealth: {
    disputeRatio: number;
    onChainCreditScore: number;
    totalOutstanding: number;
    totalFactored: number;
    liquidityRatio: number;
  };
  creditHistory: { period: string; score: number }[];
}

export interface InvestorWorkspaceState {
  investorOrganizationId: string | null;
  invoices: InvestorInvoice[];
  settlements: Settlement[];
  ledgerRows: LedgerRow[];
  totalCommitted: number;
  activeInvestments: number;
  availableCapital: number;
  projectedYield: number;
  ytdEarned: number;
}

function requireApiToken(snapshot: ParticipantAccessSnapshot | null): string {
  if (snapshot?.provider !== 'api' || !snapshot.accessToken) {
    throw new Error('API workspace data requires an authenticated VerityAPI access token.');
  }

  return snapshot.accessToken;
}

export function getBuyerWorkspaceInitialState(): BuyerWorkspaceState {
  return {
    invoices: [],
    fundingRequests: [],
    liquidity: {
      availableLiquidity: 0,
      walletAddress: '',
      walletName: 'VerityAPI',
      isConnected: false,
    },
  };
}

export function getSupplierWorkspaceInitialState(): SupplierWorkspaceState {
  return {
    supplierOrganizationId: null,
    invoices: [],
    registeredBuyers: [],
    availableLiquidity: 0,
    escrowValue: 0,
    onChainCredit: 0,
    walletConnected: false,
    walletAddress: null,
  };
}

export function getSupplierAnalyticsInitialState(): SupplierAnalyticsState {
  return {
    volumeByStatus: [],
    timeTrends: [],
    cashFlowProjections: [],
    financialHealth: {
      disputeRatio: 0,
      onChainCreditScore: 0,
      totalOutstanding: 0,
      totalFactored: 0,
      liquidityRatio: 0,
    },
    creditHistory: [],
  };
}

export function getInvestorWorkspaceInitialState(): InvestorWorkspaceState {
  return {
    investorOrganizationId: null,
    invoices: [],
    settlements: [],
    ledgerRows: [],
    totalCommitted: 0,
    activeInvestments: 0,
    availableCapital: 0,
    projectedYield: 0,
    ytdEarned: 0,
  };
}

function normalizeSupplierApiInvoice(invoice: SupplierInvoice): SupplierInvoice {
  const rawInvoice = invoice as SupplierInvoice & {
    invoice_number?: string;
    issue_date?: string;
    due_date?: string;
    financeability_id?: string;
    funding_offer_id?: string;
    funding_status?: string;
    offered_amount?: number;
    advance_amount?: number;
    yield_apr?: number;
    reserve_rate?: number;
    marketplace_submitted_at?: string;
    metadata?: {
      invoiceNumber?: string;
      invoice_number?: string;
      financeabilityId?: string;
      financeability_id?: string;
      fundingOfferId?: string;
      funding_offer_id?: string;
      fundingStatus?: string;
      funding_status?: string;
      offeredAmount?: number;
      offered_amount?: number;
      advanceAmount?: number;
      advance_amount?: number;
      yieldApr?: number;
      yield_apr?: number;
      reserveRate?: number;
      reserve_rate?: number;
      marketplaceSubmittedAt?: string;
      marketplace_submitted_at?: string;
    };
  };
  const invoiceNumber =
    rawInvoice.invoiceNumber ??
    rawInvoice.invoice_number ??
    rawInvoice.metadata?.invoiceNumber ??
    rawInvoice.metadata?.invoice_number;

  return {
    ...invoice,
    invoiceNumber,
    issueDate: rawInvoice.issueDate ?? rawInvoice.issue_date,
    dueDate: rawInvoice.dueDate ?? rawInvoice.due_date,
    maturityDate: rawInvoice.maturityDate ?? rawInvoice.due_date ?? rawInvoice.dueDate,
    financeabilityId: rawInvoice.financeabilityId ?? rawInvoice.financeability_id ?? rawInvoice.metadata?.financeabilityId ?? rawInvoice.metadata?.financeability_id,
    fundingOfferId: rawInvoice.fundingOfferId ?? rawInvoice.funding_offer_id ?? rawInvoice.metadata?.fundingOfferId ?? rawInvoice.metadata?.funding_offer_id,
    fundingStatus: normalizeFundingStatus(rawInvoice.fundingStatus ?? rawInvoice.funding_status ?? rawInvoice.metadata?.fundingStatus ?? rawInvoice.metadata?.funding_status),
    offeredAmount: rawInvoice.offeredAmount ?? rawInvoice.offered_amount ?? rawInvoice.metadata?.offeredAmount ?? rawInvoice.metadata?.offered_amount,
    advanceAmount: rawInvoice.advanceAmount ?? rawInvoice.advance_amount ?? rawInvoice.metadata?.advanceAmount ?? rawInvoice.metadata?.advance_amount,
    yieldApr: rawInvoice.yieldApr ?? rawInvoice.yield_apr ?? rawInvoice.metadata?.yieldApr ?? rawInvoice.metadata?.yield_apr,
    reserveRate: rawInvoice.reserveRate ?? rawInvoice.reserve_rate ?? rawInvoice.metadata?.reserveRate ?? rawInvoice.metadata?.reserve_rate,
    marketplaceSubmittedAt:
      rawInvoice.marketplaceSubmittedAt ??
      rawInvoice.marketplace_submitted_at ??
      rawInvoice.metadata?.marketplaceSubmittedAt ??
      rawInvoice.metadata?.marketplace_submitted_at,
  };
}

function normalizeInvestorApiInvoice(invoice: InvestorInvoice): InvestorInvoice {
  const rawInvoice = invoice as InvestorInvoice & {
    invoice_id?: string;
    invoice_number?: string;
    funding_offer_id?: string;
    financeability_id?: string;
    face_value?: number;
    offered_amount?: number;
    funding_status?: string;
    buyer_rating?: string;
    buyer_score?: number;
    invoice_status?: string;
    offer_status?: string;
    expires_at?: string;
    reserve_rate?: number;
  };

  return {
    ...invoice,
    invoiceId: rawInvoice.invoiceId ?? rawInvoice.invoice_id,
    invoiceNumber: rawInvoice.invoiceNumber ?? rawInvoice.invoice_number ?? rawInvoice.id,
    fundingOfferId: rawInvoice.fundingOfferId ?? rawInvoice.funding_offer_id,
    financeabilityId: rawInvoice.financeabilityId ?? rawInvoice.financeability_id,
    faceValue: rawInvoice.faceValue ?? rawInvoice.face_value,
    offeredAmount: rawInvoice.offeredAmount ?? rawInvoice.offered_amount,
    fundingStatus: normalizeFundingStatus(rawInvoice.fundingStatus ?? rawInvoice.funding_status ?? rawInvoice.offerStatus ?? rawInvoice.offer_status),
    buyerRating: rawInvoice.buyerRating ?? rawInvoice.buyer_rating,
    buyerScore: rawInvoice.buyerScore ?? rawInvoice.buyer_score,
    invoiceStatus: rawInvoice.invoiceStatus ?? rawInvoice.invoice_status,
    offerStatus: rawInvoice.offerStatus ?? rawInvoice.offer_status,
    expiresAt: rawInvoice.expiresAt ?? rawInvoice.expires_at,
    reserveRate: rawInvoice.reserveRate ?? rawInvoice.reserve_rate,
  };
}

function normalizeBuyerStatus(status?: string): BuyerInvoice['status'] {
  const normalized = (status ?? '').toUpperCase();
  if (normalized === 'PENDING' || normalized === 'SUBMITTED' || normalized === 'UNDER_REVIEW') return 'PENDING_VERIFICATION';
  if (normalized === 'ACCEPTED' || normalized === 'PARTIALLY_ACCEPTED') return 'VERIFIED';
  if (normalized === 'DISPUTED' || normalized === 'HELD' || normalized === 'REJECTED') return 'CONTESTED';
  if (normalized === 'FACTORED') return 'FACTORED';
  if (normalized === 'SETTLED') return 'SETTLED';
  if (normalized === 'VERIFIED' || normalized === 'CONTESTED' || normalized === 'PENDING_VERIFICATION') {
    return normalized as BuyerInvoice['status'];
  }
  return 'PENDING_VERIFICATION';
}

function readOptionalString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
}

function readDisplayString(excludedValue: string | undefined, ...values: unknown[]) {
  const excluded = excludedValue?.trim();
  for (const value of values) {
    if (typeof value !== 'string') continue;

    const candidate = value.trim();
    if (
      candidate.length > 0 &&
      candidate !== excluded &&
      candidate.toLowerCase() !== 'supplier name unavailable'
    ) {
      return candidate;
    }
  }

  return undefined;
}

function normalizeBuyerApiInvoice(invoice: BuyerInvoice): BuyerInvoice {
  const rawInvoice = invoice as BuyerInvoice & {
    invoice_number?: string;
    supplier_name?: string;
    supplier_id?: string;
    supplier?: {
      legal_name?: string;
      legalName?: string;
      name?: string;
      display_name?: string;
      displayName?: string;
    };
    issue_date?: string;
    due_date?: string;
    maturity_date?: string;
    factored_amount?: number;
    settled_at?: string;
    paid_at?: string;
    discount_amount?: number;
    payment_status?: string;
    metadata?: {
      invoiceNumber?: string;
      invoice_number?: string;
      supplierName?: string;
      supplier_name?: string;
      supplierLegalName?: string;
      supplier_legal_name?: string;
      supplierDisplayName?: string;
      supplier_display_name?: string;
      factoredAmount?: number;
      factored_amount?: number;
      settledAt?: string;
      settled_at?: string;
      paidAt?: string;
      paid_at?: string;
      discountAmount?: number;
      discount_amount?: number;
      paymentStatus?: string;
      payment_status?: string;
    };
  };

  const supplierId = readOptionalString(rawInvoice.supplierId, rawInvoice.supplier_id);
  const invoiceNumber =
    rawInvoice.invoiceNumber ??
    rawInvoice.invoice_number ??
    rawInvoice.metadata?.invoiceNumber ??
    rawInvoice.metadata?.invoice_number;
  const supplierName = readDisplayString(
    supplierId,
    rawInvoice.supplier?.legal_name,
    rawInvoice.supplier?.legalName,
    rawInvoice.supplier?.display_name,
    rawInvoice.supplier?.displayName,
    rawInvoice.supplier?.name,
    rawInvoice.metadata?.supplierLegalName,
    rawInvoice.metadata?.supplier_legal_name,
    rawInvoice.metadata?.supplierDisplayName,
    rawInvoice.metadata?.supplier_display_name,
    rawInvoice.supplierName,
    rawInvoice.supplier_name,
    rawInvoice.metadata?.supplierName,
    rawInvoice.metadata?.supplier_name
  );

  return {
    ...invoice,
    invoiceNumber,
    supplierName: supplierName ?? 'Supplier name unavailable',
    supplierId: supplierId ?? rawInvoice.supplierName ?? rawInvoice.supplier_name,
    issueDate: rawInvoice.issueDate ?? rawInvoice.issue_date,
    dueDate: rawInvoice.dueDate ?? rawInvoice.due_date ?? rawInvoice.maturity_date,
    maturityDate: rawInvoice.maturityDate ?? rawInvoice.maturity_date ?? rawInvoice.due_date ?? rawInvoice.dueDate,
    status: normalizeBuyerStatus(rawInvoice.status),
    factoredAmount: rawInvoice.factoredAmount ?? rawInvoice.factored_amount ?? rawInvoice.metadata?.factoredAmount ?? rawInvoice.metadata?.factored_amount,
    settledAt: rawInvoice.settledAt ?? rawInvoice.settled_at ?? rawInvoice.metadata?.settledAt ?? rawInvoice.metadata?.settled_at,
    paidAt: rawInvoice.paidAt ?? rawInvoice.paid_at ?? rawInvoice.metadata?.paidAt ?? rawInvoice.metadata?.paid_at,
    discountAmount: rawInvoice.discountAmount ?? rawInvoice.discount_amount ?? rawInvoice.metadata?.discountAmount ?? rawInvoice.metadata?.discount_amount,
    paymentStatus: rawInvoice.paymentStatus ?? rawInvoice.payment_status ?? rawInvoice.metadata?.paymentStatus ?? rawInvoice.metadata?.payment_status,
  };
}

export async function loadBuyerWorkspaceState(
  snapshot: ParticipantAccessSnapshot | null = getParticipantAccessSnapshot()
): Promise<BuyerWorkspaceState> {
  const { data } = await verityApi.getBuyerWorkspaceState(requireApiToken(snapshot));
  return {
    invoices: (data?.invoices ?? []).map(normalizeBuyerApiInvoice),
    fundingRequests: data?.fundingRequests ?? [],
    liquidity:
      data?.liquidity ??
      ({
        availableLiquidity: 0,
        walletAddress: '',
        walletName: 'VerityAPI',
        isConnected: false,
      } satisfies LiquidityProfile),
  };
}

export async function loadSupplierWorkspaceState(
  snapshot: ParticipantAccessSnapshot | null = getParticipantAccessSnapshot()
): Promise<SupplierWorkspaceState> {
  const { data } = await verityApi.getSupplierWorkspaceState(requireApiToken(snapshot));
  return {
    supplierOrganizationId: data?.supplierOrganizationId ?? null,
    invoices: (data?.invoices ?? []).map(normalizeSupplierApiInvoice),
    registeredBuyers: data?.registeredBuyers ?? [],
    availableLiquidity: data?.availableLiquidity ?? 0,
    escrowValue: data?.escrowValue ?? 0,
    onChainCredit: data?.onChainCredit ?? 0,
    walletConnected: data?.walletConnected ?? false,
    walletAddress: data?.walletAddress ?? null,
  };
}

export async function loadSupplierAnalytics(
  snapshot: ParticipantAccessSnapshot | null = getParticipantAccessSnapshot()
): Promise<SupplierAnalyticsState> {
  const { data } = await verityApi.getSupplierAnalytics(requireApiToken(snapshot));
  return {
    volumeByStatus: data?.volumeByStatus ?? [],
    timeTrends: data?.timeTrends ?? [],
    cashFlowProjections: data?.cashFlowProjections ?? [],
    financialHealth: {
      disputeRatio: data?.financialHealth?.disputeRatio ?? 0,
      onChainCreditScore: data?.financialHealth?.onChainCreditScore ?? 0,
      totalOutstanding: data?.financialHealth?.totalOutstanding ?? 0,
      totalFactored: data?.financialHealth?.totalFactored ?? 0,
      liquidityRatio: data?.financialHealth?.liquidityRatio ?? 0,
    },
    creditHistory: data?.creditHistory ?? [],
  };
}

export async function loadInvestorWorkspaceState(
  snapshot: ParticipantAccessSnapshot | null = getParticipantAccessSnapshot()
): Promise<InvestorWorkspaceState> {
  const { data } = await verityApi.getInvestorWorkspaceState(requireApiToken(snapshot));
  return {
    investorOrganizationId: data?.investorOrganizationId ?? null,
    invoices: (data?.invoices ?? []).map(normalizeInvestorApiInvoice),
    settlements: data?.settlements ?? [],
    ledgerRows: data?.ledgerRows ?? [],
    totalCommitted: data?.totalCommitted ?? 0,
    activeInvestments: data?.activeInvestments ?? 0,
    availableCapital: data?.availableCapital ?? 0,
    projectedYield: data?.projectedYield ?? 0,
    ytdEarned: data?.ytdEarned ?? 0,
  };
}
