import { INITIAL_FUNDING_REQUESTS, INITIAL_INVOICES as BUYER_INVOICES, INITIAL_LIQUIDITY } from '../buyer/data';
import type { FundingRequest, Invoice as BuyerInvoice, LiquidityProfile } from '../buyer/types';
import { initialInvoices as INVESTOR_INVOICES, initialLedger, initialSettlements } from '../investor/data';
import type { Invoice as InvestorInvoice, LedgerRow, Settlement } from '../investor/types';
import { INITIAL_INVOICES as SUPPLIER_INVOICES } from '../supplier/data';
import type { Invoice as SupplierInvoice, RegisteredBuyerOption } from '../supplier/types';
import { verityApi } from './apiClient';
import { getParticipantAccessSnapshot, type ParticipantAccessSnapshot } from './participantAuth';
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
  
  const syncedSupplierInvoices = SUPPLIER_INVOICES.map(inv => {
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
  return {
    invoices: INVESTOR_INVOICES,
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
    metadata?: {
      invoiceNumber?: string;
      invoice_number?: string;
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
    invoices: data?.invoices ?? [],
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
