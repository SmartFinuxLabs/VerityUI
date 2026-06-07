export type InvoiceStatus = 'PENDING' | 'ACCEPTED' | 'FACTORING_REQUESTED' | 'FACTORED' | 'SETTLED' | 'DISPUTED';

export interface Invoice {
  id: string;
  invoiceNumber?: string;
  buyerId?: string;
  buyer: string;
  amount: number;
  grossAmount?: number;
  acceptedAmount?: number;
  maturityDate: string;
  issueDate?: string;
  dueDate?: string;
  status: InvoiceStatus;
  financeabilityId?: string;
  fundingOfferId?: string;
  fundingStatus?: 'NOT_LISTED' | 'ELIGIBLE' | 'LISTED' | 'COMMITTED' | 'FUNDED' | 'CANCELLED' | 'EXPIRED';
  offeredAmount?: number;
  advanceAmount?: number;
  yieldApr?: number;
  reserveRate?: number;
  marketplaceSubmittedAt?: string;
  originalQty?: number;
  unitPrice?: number;
  itemDescription?: string;
  lineItems?: any[];
  revisedQty?: number;
  disputeReason?: string;
  disputeEvidenceFile?: string;
  disputeDetailedDescription?: string;
  rebuttalCounterReason?: string;
  rebuttalDetail?: string;
  rebuttalEvidenceFile?: string;
  smartContractAddress?: string;
  poNumber?: string;
  goodsReceiptNumber?: string;
  lifecycleTimeline?: {
    registered: string;
    approved?: string;
    matured?: string;
    settled?: string;
  };
}

export type MainRoute =
  | 'landing'
  | 'auth'
  | 'dashboard'
  | 'invoice-queue'
  | 'factoring'
  | 'disputes'
  | 'settlement'
  | 'create-invoice'
  | 'buyer-workspace';

export interface AppState {
  invoices: Invoice[];
  availableLiquidity: number;
  escrowValue: number;
  onChainCredit: number;
  walletConnected: boolean;
  walletAddress: string | null;
}

export interface RegisteredBuyerOption {
  buyerId: string;
  buyerName: string;
  buyerStatus?: string;
}
