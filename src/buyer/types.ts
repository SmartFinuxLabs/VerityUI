/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LineItem {
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface ValidationCheck {
  key: string;
  name: string;
  status: 'passed' | 'failed' | 'pending';
  detail: string;
}

export interface DisputeInfo {
  reason: string;
  description: string;
  evidenceFileName: string;
  evidenceFileSize: string;
  date: string;
}

export interface RebuttalInfo {
  stance: string;
  explanation: string;
  evidenceFileName: string;
  evidenceFileSize: string;
  date: string;
}

export interface Invoice {
  id: string;
  supplierName: string;
  supplierId: string; // e.g. "tg_0492"
  walletAddress: string; // e.g. "0x8a...4f2b"
  amount: number;
  currency: string; // USDC
  issueDate: string;
  maturityDate: string;
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'CONTESTED' | 'SETTLED' | 'FACTORED';
  poNumber: string;
  goodsReceiptNumber: string;
  lineItems: LineItem[];
  validations: ValidationCheck[];
  dispute?: DisputeInfo;
  rebuttal?: RebuttalInfo;
  internalNotes?: string;
  signedAt?: string;
  acknowledgedTerms?: boolean;
}

export interface FundingRequest {
  id: string;
  type: string; // e.g. "Batch payment for 5 suppliers"
  amount: number;
  status: 'DRAFT' | 'SUPPLIER_REVIEW' | 'READY_FOR_FUNDING' | 'FUNDED';
  description: string;
}

export interface LiquidityProfile {
  availableLiquidity: number;
  walletAddress: string;
  walletName: string;
  isConnected: boolean;
}
