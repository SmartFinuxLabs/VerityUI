import { INITIAL_FUNDING_REQUESTS, INITIAL_INVOICES as BUYER_INVOICES, INITIAL_LIQUIDITY } from '../buyer/data';
import type { FundingRequest, Invoice as BuyerInvoice, LiquidityProfile } from '../buyer/types';
import { initialInvoices as INVESTOR_INVOICES, initialLedger, initialSettlements } from '../investor/data';
import type { Invoice as InvestorInvoice, LedgerRow, Settlement } from '../investor/types';
import { INITIAL_INVOICES as SUPPLIER_INVOICES } from '../supplier/data';
import type { Invoice as SupplierInvoice } from '../supplier/types';
import { verityApi } from './apiClient';
import { getParticipantAccessSnapshot, type ParticipantAccessSnapshot } from './participantAuth';
import { isDemoMode } from './runtimeMode';

export interface BuyerWorkspaceState {
  invoices: BuyerInvoice[];
  fundingRequests: FundingRequest[];
  liquidity: LiquidityProfile;
}

export interface SupplierWorkspaceState {
  invoices: SupplierInvoice[];
  availableLiquidity: number;
  escrowValue: number;
  onChainCredit: number;
  walletConnected: boolean;
  walletAddress: string | null;
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
  return {
    invoices: SUPPLIER_INVOICES,
    availableLiquidity: 215500,
    escrowValue: 145000,
    onChainCredit: 820,
    walletConnected: true,
    walletAddress: '0x71C8384f9E58A49dfF0bd083B20B2F5b48B64F9E',
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
        invoices: [],
        availableLiquidity: 0,
        escrowValue: 0,
        onChainCredit: 0,
        walletConnected: false,
        walletAddress: null,
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

export async function loadBuyerWorkspaceState(
  snapshot: ParticipantAccessSnapshot | null = getParticipantAccessSnapshot()
): Promise<BuyerWorkspaceState> {
  if (isDemoWorkspaceDataMode(snapshot)) {
    return getBuyerDemoWorkspaceState();
  }

  const { data } = await verityApi.getBuyerWorkspaceState(requireApiToken(snapshot));
  return {
    invoices: data?.invoices ?? [],
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
    invoices: data?.invoices ?? [],
    availableLiquidity: data?.availableLiquidity ?? 0,
    escrowValue: data?.escrowValue ?? 0,
    onChainCredit: data?.onChainCredit ?? 0,
    walletConnected: data?.walletConnected ?? false,
    walletAddress: data?.walletAddress ?? null,
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
