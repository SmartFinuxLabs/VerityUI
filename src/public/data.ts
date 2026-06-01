import { Invoice, TransactionRecord, PlatformStats } from './types';

export const SUPPLIERS = [
  { id: 'sup_apex', name: 'Apex Advanced Components' },
  { id: 'sup_novatech', name: 'NovaTech Castings Ltd' },
  { id: 'sup_lithium', name: 'Lithium-X Battery Systems' },
  { id: 'sup_starlight', name: 'Starlight Global Logistics' },
];

export const BUYERS = [
  { id: 'buy_aero', name: 'Aero-Systems International', rating: 'AAA', baseRate: 0.042 },
  { id: 'buy_prism', name: 'Prism Automotive Group', rating: 'AA', baseRate: 0.051 },
  { id: 'buy_vortex', name: 'Vortex Telecom Networks', rating: 'A', baseRate: 0.060 },
  { id: 'buy_jupiter', name: 'Jupiter Electronics Corp', rating: 'BBB', baseRate: 0.075 },
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv_101',
    invoiceNumber: 'INV-2026-7892',
    supplierName: 'Apex Advanced Components',
    buyerName: 'Aero-Systems International',
    amount: 450000,
    faceValue: 450000,
    issueDate: '2026-05-15',
    dueDate: '2026-07-15',
    status: 'Approved_Unfunded',
    discountRate: 0.042, // 4.2% annualized
    earlyPaymentAmount: 447585, // Computed discount for remaining days
    settlementRail: 'USDC',
    daysRemaining: 45,
    riskGrade: 'AAA',
    onChainTxHash: '0x3f5c9e21de7da...8b31a2',
    approvedAt: '2026-05-18 10:45 UTC',
  },
  {
    id: 'inv_102',
    invoiceNumber: 'INV-2026-5120',
    supplierName: 'NovaTech Castings Ltd',
    buyerName: 'Prism Automotive Group',
    amount: 180000,
    faceValue: 180000,
    issueDate: '2026-05-20',
    dueDate: '2026-06-20',
    status: 'Financed',
    discountRate: 0.051, // 5.1% annualized
    earlyPaymentAmount: 179497,
    fundedBy: 'Factor One Capital Ltd (0xaf39...5e32)',
    settlementRail: 'Hybrid',
    daysRemaining: 20,
    riskGrade: 'AA',
    onChainTxHash: '0x8b5ea01d4ca86...e98cb5',
    approvedAt: '2026-05-21 08:30 UTC',
    financedAt: '2026-05-22 14:12 UTC',
  },
  {
    id: 'inv_103',
    invoiceNumber: 'INV-2026-1025',
    supplierName: 'Lithium-X Battery Systems',
    buyerName: 'Vortex Telecom Networks',
    amount: 1250000,
    faceValue: 1250000,
    issueDate: '2026-05-28',
    dueDate: '2026-08-28',
    status: 'Pending_Buyer_Approval',
    discountRate: 0.060, // 6.0% annualized
    earlyPaymentAmount: 1231507,
    settlementRail: 'Fiat',
    daysRemaining: 89,
    riskGrade: 'A',
    onChainTxHash: '0xcd220f8ab882d...bc640e',
  },
  {
    id: 'inv_104',
    invoiceNumber: 'INV-2026-0419',
    supplierName: 'Starlight Global Logistics',
    buyerName: 'Jupiter Electronics Corp',
    amount: 95000,
    faceValue: 95000,
    issueDate: '2026-04-10',
    dueDate: '2026-05-10',
    status: 'Settled',
    discountRate: 0.075, // 7.5% annualized
    earlyPaymentAmount: 94407,
    fundedBy: 'Apex Capital Fund (0x742d...d23b)',
    settlementRail: 'USDC',
    daysRemaining: 0,
    riskGrade: 'BBB',
    onChainTxHash: '0x19a0ce8f0ba7b...14cc80',
    approvedAt: '2026-04-12 11:20 UTC',
    financedAt: '2026-04-14 09:12 UTC',
    settledAt: '2026-05-10 18:00 UTC',
  },
  {
    id: 'inv_105',
    invoiceNumber: 'INV-2026-9932',
    supplierName: 'Apex Advanced Components',
    buyerName: 'Jupiter Electronics Corp',
    amount: 320000,
    faceValue: 320000,
    issueDate: '2026-05-25',
    dueDate: '2026-07-25',
    status: 'Approved_Unfunded',
    discountRate: 0.075,
    earlyPaymentAmount: 316054,
    settlementRail: 'EURC',
    daysRemaining: 55,
    riskGrade: 'BBB',
    onChainTxHash: '0xef02188faee33...74ff3d',
    approvedAt: '2026-05-27 16:15 UTC',
  },
];

export const INITIAL_TRANSACTIONS: TransactionRecord[] = [
  {
    id: 'tx_c101',
    timestamp: '2026-05-28 15:45 UTC',
    type: 'Invoice_Registered',
    actor: 'Lithium-X Battery Systems',
    description: 'Registered INV-2026-1025 with Aero-Systems for validation',
    amount: 1250000,
    tokenSymbol: 'USD',
    txHash: '0xcd220f8ab882d...bc640e',
  },
  {
    id: 'tx_c102',
    timestamp: '2026-05-27 16:15 UTC',
    type: 'Invoice_Approved',
    actor: 'Jupiter Electronics Corp',
    description: 'Approved and legally validated INV-2026-9932 obligation',
    amount: 320000,
    tokenSymbol: 'USD',
    txHash: '0xef02188faee33...74ff3d',
  },
  {
    id: 'tx_c103',
    timestamp: '2026-05-22 14:12 UTC',
    type: 'Factoring_Requested',
    actor: 'NovaTech Castings Ltd',
    description: 'Received early payoff for INV-2026-5120 from Alpha pool',
    amount: 179497,
    tokenSymbol: 'USDC',
    txHash: '0x8b5ea01d4ca86...e98cb5',
  },
  {
    id: 'tx_c104',
    timestamp: '2026-05-10 18:00 UTC',
    type: 'Settlement_Completed',
    actor: 'Jupiter Electronics Corp',
    description: 'Autopay protocol disbursed final principal to Factor',
    amount: 95000,
    tokenSymbol: 'USDC',
    txHash: '0x19a0ce8f0ba7b...14cc80',
  },
];

export const HISTORICAL_CHART_DATA = [
  { month: 'Jan', volume: 1.2, yield: 5.8 },
  { month: 'Feb', volume: 1.8, yield: 5.9 },
  { month: 'Mar', volume: 2.5, yield: 6.1 },
  { month: 'Apr', volume: 3.4, yield: 6.3 },
  { month: 'May', volume: 4.8, yield: 6.2 },
  { month: 'June', volume: 5.9, yield: 6.4 },
];

export const SECURITY_AND_COMPLIANCE_CARDS = [
  {
    title: 'Dual-Covenant Smart Guarantees',
    description: 'Legal-to-smart contract wrappers binding off-chain corporate purchasing terms directly to EVM payment executors, creating immutable debt priority.',
    icon: 'ShieldAlert',
  },
  {
    title: 'Zero Double-Financing Risk',
    description: 'Using persistent on-chain invoice hash tracking to mathematically prevent duplicate factoring requests of the same receivable across banking pipelines.',
    icon: 'Cpu',
  },
  {
    title: 'SEC & MiCA Compliant Infrastructure',
    description: 'Automated on-chain qualified investor verification, institutional KYC/AML firewalls, and programmatic tax reporting for full multijurisdictional safety.',
    icon: 'FileCheck',
  },
];

// Helper formula to compute Early Payment Amount
// P_early = Principal * (1 - (Discount_Rate * Days_To_Maturity / 365))
export function calculateEarlyPayoff(principal: number, annualRate: number, daysRemaining: number): number {
  if (daysRemaining <= 0) return principal;
  const factor = 1 - (annualRate * (daysRemaining / 365));
  return Math.round(principal * factor * 100) / 100;
}
