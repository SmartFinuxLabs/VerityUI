export interface Invoice {
  id: string;
  invoiceNumber: string;
  supplierName: string;
  buyerName: string;
  amount: number;
  faceValue: number;
  issueDate: string;
  dueDate: string;
  status: 'Pending_Buyer_Approval' | 'Approved_Unfunded' | 'Financed' | 'Settled';
  discountRate: number; // Annualized factoring fee (e.g., 0.0575 for 5.75%)
  earlyPaymentAmount: number; // Discounted payoff amount
  fundedBy?: string; // Address of Investor / Factor
  settlementRail: 'Fiat' | 'USDC' | 'EURC' | 'Hybrid';
  daysRemaining: number;
  riskGrade: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB';
  onChainTxHash?: string;
  approvedAt?: string;
  financedAt?: string;
  settledAt?: string;
}

export interface PlatformConfig {
  baseDiscountRate: number; // Base rate for AAA suppliers
  investorYieldCut: number; // Fee percentage taken by the platform protocol
  liquidityReserveRate: number; // Reserve ratio for smart contract risk
  allowedStablecoins: ('USDC' | 'EURC')[];
  autoLiquidateOnMaturity: boolean;
}

export interface PlatformStats {
  totalValueLocked: number; // Total collateral / funded assets
  cumulativeFinanced: number; // Sum of all invoices cashed out
  averageYield: number; // Weighted average investor return
  activeSuppliersCount: number;
  activeInvoicesCount: number;
}

export interface TransactionRecord {
  id: string;
  timestamp: string;
  type: 'Invoice_Registered' | 'Invoice_Approved' | 'Factoring_Requested' | 'Liquidated' | 'Settlement_Scheduled' | 'Settlement_Completed';
  actor: string;
  description: string;
  amount: number;
  tokenSymbol: 'USD' | 'USDC' | 'EURC';
  txHash: string;
}

export interface UserAccount {
  role: 'Supplier' | 'Buyer' | 'Investor' | 'Operator';
  address: string;
  balanceFiat: number;
  balanceUSDC: number;
  balanceEURC: number;
}
