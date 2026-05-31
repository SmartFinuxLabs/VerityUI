export type InvoiceStatus = 'PENDING' | 'ACCEPTED' | 'FACTORED' | 'SETTLED' | 'DISPUTED';

export interface Invoice {
  id: string;
  buyer: string;
  amount: number;
  maturityDate: string;
  status: InvoiceStatus;
  originalQty?: number;
  unitPrice?: number;
  itemDescription?: string;
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

export type MainRoute = 'landing' | 'dashboard' | 'factoring' | 'disputes' | 'settlement';

export interface AppState {
  invoices: Invoice[];
  availableLiquidity: number;
  escrowValue: number;
  onChainCredit: number;
  walletConnected: boolean;
  walletAddress: string | null;
}
