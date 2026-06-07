import type { ParticipantRole, PartyType } from './participantAuth';
import type { Invoice as BuyerInvoice, FundingRequest, LiquidityProfile } from '../buyer/types';
import type { Invoice as SupplierInvoice, RegisteredBuyerOption } from '../supplier/types';
import type { Invoice as InvestorInvoice, LedgerRow, Settlement } from '../investor/types';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1').replace(/\/$/, '');

export interface ApiAuthSession {
  user: {
    id: string;
    email?: string;
    userMetadata?: Record<string, unknown>;
  };
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
}

export interface RoleHint {
  participantRole?: PartyType | ParticipantRole;
  organizationRole?: string;
  organizationName?: string;
}

export interface BuyerWorkspaceApiState {
  invoices?: BuyerInvoice[];
  fundingRequests?: FundingRequest[];
  liquidity?: LiquidityProfile;
}

export interface SupplierWorkspaceApiState {
  invoices?: SupplierInvoice[];
  registeredBuyers?: RegisteredBuyerOption[];
  supplierOrganizationId?: string | null;
  availableLiquidity?: number;
  escrowValue?: number;
  onChainCredit?: number;
  walletConnected?: boolean;
  walletAddress?: string | null;
}

export interface SupplierAnalyticsApiState {
  volumeByStatus?: { status: string; count: number; totalAmount: number }[];
  timeTrends?: { period: string; createdVolume: number; settledVolume: number }[];
  cashFlowProjections?: { date: string; expectedAmount: number; factoredAmount: number }[];
  financialHealth?: {
    disputeRatio: number;
    onChainCreditScore: number;
    totalOutstanding?: number;
    totalFactored?: number;
    liquidityRatio?: number;
  };
  creditHistory?: { period: string; score: number }[];
}

export interface CreateInvoicePayload {
  relationshipId?: string;
  supplierId: string;
  buyerId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: 'USDC';
  grossAmount: number;
  acceptedAmount?: number;
  sourceSystemReference: string;
  metadata?: Record<string, unknown>;
}

export interface SubmitInvoiceToMarketplacePayload {
  offeredAmount: number;
  yieldApr: number;
  reserveRate: number;
  settlementCurrency: 'USDC';
  expiresAt: string;
}

export interface CreateFundingCommitmentPayload {
  investorId: string;
  committedAmount: number;
  offeredRate: number;
  commitmentTxRef: string;
}

export interface InvestorWorkspaceApiState {
  investorOrganizationId?: string | null;
  invoices?: InvestorInvoice[];
  settlements?: Settlement[];
  ledgerRows?: LedgerRow[];
  totalCommitted?: number;
  activeInvestments?: number;
  availableCapital?: number;
  projectedYield?: number;
  ytdEarned?: number;
}

interface ApiErrorBody {
  message?: string;
  reasonCode?: string;
}

async function requestApi<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Unable to reach VerityAPI at ${apiBaseUrl}. Start VerityAPI or set VITE_RUN_MODE=demo for local demo login.`
      );
    }

    throw error;
  }

  if (!response.ok) {
    let errorBody: ApiErrorBody | undefined;

    try {
      errorBody = (await response.json()) as ApiErrorBody;
    } catch {
      errorBody = undefined;
    }

    throw new Error(errorBody?.message ?? `VerityAPI request failed with HTTP ${response.status}.`);
  }

  return (await response.json()) as T;
}

export const verityApi = {
  getRoleHint(email: string) {
    return requestApi<{ data?: RoleHint }>(`/auth/role-hint?email=${encodeURIComponent(email)}`);
  },

  signIn(payload: { email: string; password: string }) {
    return requestApi<{ data?: { session?: ApiAuthSession } }>('/auth/sign-in', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  register(payload: {
    email: string;
    password: string;
    fullName: string;
    entityName: string;
    participantRole: ParticipantRole;
    partyType: PartyType;
    invitationToken?: string;
  }) {
    return requestApi<{ data?: { session?: ApiAuthSession; confirmationRequired?: boolean } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  acceptInvitation(payload: {
    invitationToken: string;
    accessToken: string;
    fullName?: string;
    legalName?: string;
  }) {
    return requestApi<{ data?: { organizationId?: string } }>(
      `/organization-invitations/${encodeURIComponent(payload.invitationToken)}/accept`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${payload.accessToken}`,
        },
        body: JSON.stringify({
          fullName: payload.fullName,
          legalName: payload.legalName,
          riskProfile: {},
        }),
      }
    );
  },

  getBuyerWorkspaceState(accessToken: string) {
    return requestApi<{ data?: BuyerWorkspaceApiState }>('/workspaces/buyer', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  getSupplierWorkspaceState(accessToken: string) {
    return requestApi<{ data?: SupplierWorkspaceApiState }>('/workspaces/supplier', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  getSupplierAnalytics(accessToken: string) {
    return requestApi<{ data?: SupplierAnalyticsApiState }>('/workspaces/supplier/analytics', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  createInvoice(accessToken: string, payload: CreateInvoicePayload) {
    return requestApi<{ data?: unknown }>('/invoices', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });
  },

  submitInvoiceToMarketplace(accessToken: string, invoiceId: string, payload: SubmitInvoiceToMarketplacePayload) {
    return requestApi<{ data?: unknown }>(`/invoices/${encodeURIComponent(invoiceId)}/marketplace-submissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });
  },

  createInvoiceResolution(
    accessToken: string,
    invoiceId: string,
    payload: {
      decisionState: string;
      decisionReason: string;
      reasonCode: string;
      acceptedAmount?: number;
      nextInvoiceState?: string;
    }
  ) {
    return requestApi<{ data?: unknown }>(`/invoices/${invoiceId}/resolution`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });
  },

  getInvestorWorkspaceState(accessToken: string) {
    return requestApi<{ data?: InvestorWorkspaceApiState }>('/workspaces/investor', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  createFundingCommitment(accessToken: string, offerId: string, payload: CreateFundingCommitmentPayload) {
    return requestApi<{ data?: unknown }>(`/offers/${encodeURIComponent(offerId)}/commitments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });
  },
};
