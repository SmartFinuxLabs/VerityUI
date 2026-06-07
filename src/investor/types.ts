/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Invoice {
  id: string;
  invoiceId?: string;
  invoiceNumber?: string;
  fundingOfferId?: string;
  financeabilityId?: string;
  obligor: string;
  supplier: string;
  logoType: 'logistics' | 'assembly' | 'renewables' | 'retail' | 'motors' | 'tech';
  faceValue: number;
  discount: number; // in percentage, e.g. 1.8
  maturity: number; // in days, e.g. 32
  status: 'Available' | 'Funded' | 'Settled' | 'Pending';
  fundingStatus?: 'NOT_LISTED' | 'ELIGIBLE' | 'LISTED' | 'COMMITTED' | 'FUNDED' | 'CANCELLED' | 'EXPIRED';
  invoiceStatus?: string;
  offeredAmount?: number;
  offerStatus?: string;
  expiresAt?: string;
  reserveRate?: number;
  buyerRating: string; // e.g., 'AAA', 'A-', 'B'
  buyerScore: number; // e.g., 94
  poNumber: string;
  poDate: string;
  grnWarehouse: string;
  grnDate: string;
  signatureName: string;
  signatureDivision: string;
  signatureDate: string;
  description: string;
  verityScore: number;
  paymentDelinquency: number; // percentage, e.g. 0.02
  avgDaysBeyondTerm: number; // e.g. 0.4
  disputeRatio: number; // percentage, e.g. 0.0
  retentionReleaseRate: number; // percentage, e.g. 100
  marketCap: string; // e.g., "$54.2B"
  spRating: string; // e.g., "A-"
  nyseSymbol: string; // e.g. "GM"
}

export interface Settlement {
  id: string;
  invoiceId: string;
  payer: string;
  amount: number;
  yieldEarned: number;
  timeAgo: string;
  status: 'Settled' | 'Pending' | 'Verification';
  date: string;
}

export interface LedgerRow {
  invoiceId: string;
  obligor: string;
  faceValue: number;
  yieldEarned: number;
  settlementDate: string;
  status: 'SETTLED' | 'PENDING' | 'FACTORED';
}

export type ActiveScreen = 'direct-funding' | 'liquidity-marketplace' | 'invoice-deep-dive' | 'portfolio-analytics';

export interface WalletState {
  connected: boolean;
  address: string | null;
  balance: number; // in USDC
  network: 'ethereum' | 'arc' | 'polygon';
}
