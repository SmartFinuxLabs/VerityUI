import { INITIAL_FUNDING_REQUESTS, INITIAL_INVOICES as BUYER_INVOICES, INITIAL_LIQUIDITY } from '../buyer/data';
import type { FundingRequest, Invoice as BuyerInvoice, LiquidityProfile } from '../buyer/types';
import { initialInvoices as INVESTOR_INVOICES, initialLedger, initialSettlements } from '../investor/data';
import type { Invoice as InvestorInvoice, LedgerRow, Settlement } from '../investor/types';
import { INITIAL_INVOICES as SUPPLIER_INVOICES } from '../supplier/data';
import type { Invoice as SupplierInvoice, RegisteredBuyerOption } from '../supplier/types';
import { verityApi } from './apiClient';
import { getParticipantAccessSnapshot, type ParticipantAccessSnapshot } from './participantAuth';
import { normalizeFundingStatus } from './fundingStatusDisplay';
import { isDemoMode } from './runtimeMode';

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

function readJsonStorage<T>(key: string, fallback: T): T {
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

function requireApiToken(snapshot: ParticipantAccessSnapshot | null): string {
  if (snapshot?.provider !== 'api' || !snapshot.accessToken) {
    throw new Error('API workspace data requires an authenticated VerityAPI access token.');
  }

  return snapshot.accessToken;
}

export function isDemoWorkspaceDataMode(
  snapshot: ParticipantAccessSnapshot | null = getParticipantAccessSnapshot(),
  demoMode = isDemoMode()
) {
  return demoMode || snapshot?.provider !== 'api';
}

export function getBuyerDemoWorkspaceState(): BuyerWorkspaceState {
  return {
    invoices: readJsonStorage('sfl_invoices', BUYER_INVOICES),
    fundingRequests: readJsonStorage('sfl_funding_requests', INITIAL_FUNDING_REQUESTS),
    liquidity: readJsonStorage('sfl_liquidity', INITIAL_LIQUIDITY),
  };
}

export function getSupplierDemoWorkspaceState(): SupplierWorkspaceState {
  const buyerInvoices = readJsonStorage<BuyerInvoice[]>('sfl_invoices', BUYER_INVOICES);
  const savedSupplierInvoices = readJsonStorage<SupplierInvoice[] | null>('sfl_supplier_invoices', null);
  
  const baseSupplierInvoices = savedSupplierInvoices ?? SUPPLIER_INVOICES;
  const syncedSupplierInvoices = baseSupplierInvoices.map(inv => {
    const matchingBuyer = buyerInvoices.find(b => b.id === inv.id || b.invoiceNumber === inv.invoiceNumber);
    if (matchingBuyer && matchingBuyer.status === 'CONTESTED') {
      return { ...inv, status: 'DISPUTED' as const };
    }
    if (matchingBuyer && matchingBuyer.status === 'VERIFIED') {
      return { ...inv, status: 'ACCEPTED' as const };
    }
    return inv;
  });

  return {
    supplierOrganizationId: 'demo-supplier-techgear',
    invoices: syncedSupplierInvoices,
    registeredBuyers: [
      { buyerId: 'demo-buyer-acme-global', buyerName: 'Acme Corp Global', buyerStatus: 'ACTIVE' },
      { buyerId: 'demo-buyer-global-mfg', buyerName: 'Global Manufacturing Corp', buyerStatus: 'ACTIVE' },
      { buyerId: 'demo-buyer-stark', buyerName: 'Stark Industries', buyerStatus: 'ACTIVE' },
      { buyerId: 'demo-buyer-retail', buyerName: 'Retail Giant', buyerStatus: 'ACTIVE' },
    ],
    availableLiquidity: 215500,
    escrowValue: 145000,
    onChainCredit: 820,
    walletConnected: true,
    walletAddress: '0x71C8384f9E58A49dfF0bd083B20B2F5b48B64F9E',
  };
}

export function getSupplierDemoAnalyticsState(): SupplierAnalyticsState {
  return {
    volumeByStatus: [
      { status: 'PENDING', count: 2, totalAmount: 35000 },
      { status: 'ACCEPTED', count: 3, totalAmount: 75000 },
      { status: 'FACTORED', count: 1, totalAmount: 50000 },
    ],
    timeTrends: [
      { period: '2026-05', createdVolume: 120000, settledVolume: 80000 },
      { period: '2026-06', createdVolume: 160000, settledVolume: 40000 },
    ],
    cashFlowProjections: [
      { date: '2026-07-15', expectedAmount: 45000, factoredAmount: 20000 },
      { date: '2026-08-01', expectedAmount: 30000, factoredAmount: 30000 },
    ],
    financialHealth: {
      disputeRatio: 0.05,
      onChainCreditScore: 820,
      totalOutstanding: 160000,
      totalFactored: 50000,
      liquidityRatio: 0.31,
    },
    creditHistory: [
      { period: '2026-02', score: 775 },
      { period: '2026-03', score: 790 },
      { period: '2026-04', score: 805 },
      { period: '2026-05', score: 820 },
    ],
  };
}

export function getInvestorDemoWorkspaceState(): InvestorWorkspaceState {
  const supplierInvoices = readJsonStorage<SupplierInvoice[]>('sfl_supplier_invoices', SUPPLIER_INVOICES);
  const marketplaceInvoices = supplierInvoices
    .filter((invoice) => normalizeFundingStatus(invoice.fundingStatus) === 'LISTED')
    .map((invoice): InvestorInvoice => ({
      id: invoice.invoiceNumber ?? invoice.id,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber ?? invoice.id,
      fundingOfferId: invoice.fundingOfferId ?? `demo-offer-${invoice.id}`,
      financeabilityId: invoice.financeabilityId ?? `demo-financeability-${invoice.id}`,
      obligor: invoice.buyer,
      supplier: 'Smart Finux Labs',
      logoType: 'tech',
      faceValue: invoice.grossAmount ?? invoice.amount,
      offeredAmount: invoice.offeredAmount ?? invoice.advanceAmount ?? invoice.amount * 0.9,
      discount: (invoice.yieldApr ?? 0.12) * 100,
      maturity: 60,
      status: 'Available',
      fundingStatus: 'LISTED',
      invoiceStatus: invoice.status,
      buyerRating: 'A',
      buyerScore: 90,
      poNumber: invoice.poNumber ?? `PO-${invoice.invoiceNumber ?? invoice.id}`,
      poDate: invoice.issueDate ?? '',
      grnWarehouse: invoice.goodsReceiptNumber ?? `GR-${invoice.invoiceNumber ?? invoice.id}`,
      grnDate: invoice.dueDate ?? invoice.maturityDate,
      signatureName: 'Verity Verified',
      signatureDivision: 'Accounts Payable',
      signatureDate: invoice.issueDate ?? '',
      description: invoice.itemDescription ?? 'Supplier marketplace invoice',
      verityScore: 92,
      paymentDelinquency: 0,
      avgDaysBeyondTerm: 0,
      disputeRatio: 0,
      retentionReleaseRate: 100,
      marketCap: 'N/A',
      spRating: 'A',
      nyseSymbol: 'N/A',
    }));

  return {
    investorOrganizationId: 'demo-investor-capital',
    invoices: [...marketplaceInvoices, ...INVESTOR_INVOICES],
    settlements: initialSettlements,
    ledgerRows: initialLedger,
    totalCommitted: 12450000.0,
    activeInvestments: 8124550.0,
    availableCapital: 4325450.0,
    projectedYield: 8.45,
    ytdEarned: 156250.0,
  };
}

export function getBuyerWorkspaceInitialState() {
  return isDemoWorkspaceDataMode()
    ? getBuyerDemoWorkspaceState()
    : {
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

export function getSupplierWorkspaceInitialState() {
  return isDemoWorkspaceDataMode()
    ? getSupplierDemoWorkspaceState()
    : {
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
  return isDemoWorkspaceDataMode()
    ? getSupplierDemoAnalyticsState()
    : {
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

export function getInvestorWorkspaceInitialState() {
  return isDemoWorkspaceDataMode()
    ? getInvestorDemoWorkspaceState()
    : {
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
  if (isDemoWorkspaceDataMode(snapshot)) {
    return getBuyerDemoWorkspaceState();
  }

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
  if (isDemoWorkspaceDataMode(snapshot)) {
    return getSupplierDemoWorkspaceState();
  }

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
  if (isDemoWorkspaceDataMode(snapshot)) {
    return getSupplierDemoAnalyticsState();
  }

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
  if (isDemoWorkspaceDataMode(snapshot)) {
    return getInvestorDemoWorkspaceState();
  }

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

export function persistBuyerDemoWorkspaceState(state: BuyerWorkspaceState) {
  if (!isDemoWorkspaceDataMode()) {
    return;
  }

  window.localStorage.setItem('sfl_invoices', JSON.stringify(state.invoices));
  window.localStorage.setItem('sfl_funding_requests', JSON.stringify(state.fundingRequests));
  window.localStorage.setItem('sfl_liquidity', JSON.stringify(state.liquidity));
}

export function persistSupplierDemoWorkspaceState(state: SupplierWorkspaceState) {
  if (!isDemoWorkspaceDataMode()) {
    return;
  }

  window.localStorage.setItem('sfl_supplier_invoices', JSON.stringify(state.invoices));
}
