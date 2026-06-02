import type { ParticipantRole, PartyType } from './participantAuth';
import type { Invoice as BuyerInvoice, FundingRequest, LiquidityProfile } from '../buyer/types';
import type { Invoice as SupplierInvoice } from '../supplier/types';
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
  availableLiquidity?: number;
  escrowValue?: number;
  onChainCredit?: number;
  walletConnected?: boolean;
  walletAddress?: string | null;
}

export interface InvestorWorkspaceApiState {
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
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

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

  getInvestorWorkspaceState(accessToken: string) {
    return requestApi<{ data?: InvestorWorkspaceApiState }>('/workspaces/investor', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },
};
