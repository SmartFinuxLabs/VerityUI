export type InvoiceStatus = 'PENDING' | 'ACCEPTED' | 'FACTORED' | 'SETTLED' | 'DISPUTED';

export interface Invoice {
  id: string;
  buyerId?: string;
  buyer: string;
  amount: number;
  grossAmount?: number;
  acceptedAmount?: number;
  maturityDate: string;
  status: InvoiceStatus;
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
