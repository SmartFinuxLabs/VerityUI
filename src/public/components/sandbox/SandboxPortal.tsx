import React, { useState } from 'react';
import {
  Wallet, Globe, ShieldCheck,
  Key, Sparkles, Settings,
} from 'lucide-react';
import { Invoice, TransactionRecord } from '../../types';
import { SupplierInvoiceForm, SupplierInvoiceSubmission } from './SupplierInvoiceForm';

interface SandboxPortalProps {
  invoices: Invoice[];
  onUpdateInvoices: (invoices: Invoice[]) => void;
  transactions: TransactionRecord[];
  onAddTransaction: (tx: TransactionRecord) => void;
  activeRole: 'Supplier' | 'Buyer' | 'Investor' | 'Operator';
  setActiveRole: (role: 'Supplier' | 'Buyer' | 'Investor' | 'Operator') => void;
}

export const SandboxPortal: React.FC<SandboxPortalProps> = ({
  invoices,
  onUpdateInvoices,
  transactions,
  onAddTransaction,
  activeRole,
  setActiveRole,
}) => {
  const [supplierBalances, setSupplierBalances] = useState({ usd: 125000, usdc: 28400, eurc: 0 });
  const [investorBalances, setInvestorBalances] = useState({ usd: 2500000, usdc: 852000, eurc: 120000 });
  const [buyerBalances, setBuyerBalances] = useState({ usd: 12000000, usdc: 3400000, eurc: 500000 });
  const [selectedTxDetail, setSelectedTxDetail] = useState<TransactionRecord | null>(null);

  const generateTxHash = () => {
    const letters = '0123456789abcdef';
    let hash = '0x';

    for (let index = 0; index < 40; index += 1) {
      hash += letters[Math.floor(Math.random() * 16)];
    }

    return `${hash.substring(0, 14)}...${hash.substring(34)}`;
  };

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'Pending_Buyer_Approval':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300 rounded-none">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-pulse" />
            Pending Signoff
          </span>
        );
      case 'Approved_Unfunded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-bold bg-blue-50 text-blue-855 border border-blue-300 rounded-none">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
            Approved Claim
          </span>
        );
      case 'Financed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-none">
            <Wallet className="w-3.5 h-3.5 text-emerald-700" />
            Factored & Paid
          </span>
        );
      case 'Settled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-bold bg-zinc-100 text-zinc-800 border border-zinc-300 rounded-none">
            <Globe className="w-3.5 h-3.5 text-zinc-650" />
            Fully Matured
          </span>
        );
      default:
        return null;
    }
  };

  const handleRegisterInvoice = ({ invoice, transaction }: SupplierInvoiceSubmission) => {
    onUpdateInvoices([invoice, ...invoices]);
    onAddTransaction(transaction);
  };

  const handleAuthorizeInvoice = (invoiceId: string) => {
    const updated = invoices.map((invoice) => {
      if (invoice.id === invoiceId) {
        return {
          ...invoice,
          status: 'Approved_Unfunded' as const,
          approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
        };
      }
      return invoice;
    });

    const targetInvoice = invoices.find((invoice) => invoice.id === invoiceId);
    if (!targetInvoice) {
      return;
    }

    onUpdateInvoices(updated);

    onAddTransaction({
      id: `tx_${Math.floor(2000 + Math.random() * 8000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      type: 'Invoice_Approved',
      actor: targetInvoice.buyerName,
      description: `Signed & approved invoice ${targetInvoice.invoiceNumber}; obligation locked on-chain`,
      amount: targetInvoice.amount,
      tokenSymbol: 'USD',
      txHash: generateTxHash(),
    });
  };

  const handleSupplierCashout = (invoiceId: string) => {
    const targetInvoice = invoices.find((invoice) => invoice.id === invoiceId);
    if (!targetInvoice || targetInvoice.status !== 'Approved_Unfunded') {
      return;
    }

    const payoutAmount = targetInvoice.earlyPaymentAmount;

    const updated = invoices.map((invoice) => {
      if (invoice.id === invoiceId) {
        return {
          ...invoice,
          status: 'Financed' as const,
          fundedBy: 'Verity Liquidity DAO (0xec29...ef30)',
          financedAt: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
        };
      }
      return invoice;
    });

    onUpdateInvoices(updated);

    setSupplierBalances((previous) => ({
      ...previous,
      usdc: targetInvoice.settlementRail === 'USDC' ? previous.usdc + payoutAmount : previous.usdc,
      eurc: targetInvoice.settlementRail === 'EURC' ? previous.eurc + payoutAmount : previous.eurc,
      usd: targetInvoice.settlementRail === 'Fiat' || targetInvoice.settlementRail === 'Hybrid' ? previous.usd + payoutAmount : previous.usd,
    }));

    onAddTransaction({
      id: `tx_${Math.floor(2000 + Math.random() * 8000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      type: 'Factoring_Requested',
      actor: targetInvoice.supplierName,
      description: `Exercised factoring for ${targetInvoice.invoiceNumber}; cashed out $${payoutAmount.toLocaleString()} to wallet`,
      amount: payoutAmount,
      tokenSymbol: targetInvoice.settlementRail === 'EURC' ? 'EURC' : (targetInvoice.settlementRail === 'USDC' ? 'USDC' : 'USD'),
      txHash: generateTxHash(),
    });
  };

  const handleInvestorFund = (invoiceId: string) => {
    const targetInvoice = invoices.find((invoice) => invoice.id === invoiceId);
    if (!targetInvoice || targetInvoice.status !== 'Approved_Unfunded') {
      return;
    }

    const fundsNeeded = targetInvoice.earlyPaymentAmount;

    if (investorBalances.usdc < fundsNeeded && targetInvoice.settlementRail === 'USDC') {
      alert('Insufficient USDC in Investor sandbox vault!');
      return;
    }

    const updated = invoices.map((invoice) => {
      if (invoice.id === invoiceId) {
        return {
          ...invoice,
          status: 'Financed' as const,
          fundedBy: 'Institutional Factor Pool A (0x81da...63ee)',
          financedAt: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
        };
      }
      return invoice;
    });

    onUpdateInvoices(updated);

    setInvestorBalances((previous) => ({
      ...previous,
      usdc: targetInvoice.settlementRail === 'USDC' ? previous.usdc - fundsNeeded : previous.usdc,
      eurc: targetInvoice.settlementRail === 'EURC' ? previous.eurc - fundsNeeded : previous.eurc,
      usd: targetInvoice.settlementRail === 'Fiat' || targetInvoice.settlementRail === 'Hybrid' ? previous.usd - fundsNeeded : previous.usd,
    }));

    setSupplierBalances((previous) => ({
      ...previous,
      usdc: targetInvoice.settlementRail === 'USDC' ? previous.usdc + fundsNeeded : previous.usdc,
      eurc: targetInvoice.settlementRail === 'EURC' ? previous.eurc + fundsNeeded : previous.eurc,
      usd: targetInvoice.settlementRail === 'Fiat' || targetInvoice.settlementRail === 'Hybrid' ? previous.usd + fundsNeeded : previous.usd,
    }));

    onAddTransaction({
      id: `tx_${Math.floor(2000 + Math.random() * 8000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      type: 'Factoring_Requested',
      actor: 'Institutional Factor Pool A',
      description: `Funded receivable ${targetInvoice.invoiceNumber}; deployed $${fundsNeeded.toLocaleString()} liquidity`,
      amount: fundsNeeded,
      tokenSymbol: targetInvoice.settlementRail === 'EURC' ? 'EURC' : (targetInvoice.settlementRail === 'USDC' ? 'USDC' : 'USD'),
      txHash: generateTxHash(),
    });
  };

  const handleBuyerSettle = (invoiceId: string) => {
    const targetInvoice = invoices.find((invoice) => invoice.id === invoiceId);
    if (!targetInvoice || targetInvoice.status === 'Settled' || targetInvoice.status === 'Pending_Buyer_Approval') {
      return;
    }

    const fullInvoiceValue = targetInvoice.amount;

    const updated = invoices.map((invoice) => {
      if (invoice.id === invoiceId) {
        return {
          ...invoice,
          status: 'Settled' as const,
          daysRemaining: 0,
          settledAt: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
        };
      }
      return invoice;
    });

    onUpdateInvoices(updated);

    setBuyerBalances((previous) => ({
      ...previous,
      usdc: targetInvoice.settlementRail === 'USDC' ? previous.usdc - fullInvoiceValue : previous.usdc,
      usd: targetInvoice.settlementRail === 'Fiat' || targetInvoice.settlementRail === 'Hybrid' ? previous.usd - fullInvoiceValue : previous.usd,
    }));

    if (targetInvoice.fundedBy || targetInvoice.status === 'Financed') {
      setInvestorBalances((previous) => ({
        ...previous,
        usdc: targetInvoice.settlementRail === 'USDC' ? previous.usdc + fullInvoiceValue : previous.usdc,
        usd: targetInvoice.settlementRail === 'Fiat' || targetInvoice.settlementRail === 'Hybrid' ? previous.usd + fullInvoiceValue : previous.usd,
      }));
    }

    onAddTransaction({
      id: `tx_${Math.floor(2000 + Math.random() * 8000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      type: 'Settlement_Completed',
      actor: targetInvoice.buyerName,
      description: `Matured settlement initiated for ${targetInvoice.invoiceNumber}; disbursed $${fullInvoiceValue.toLocaleString()} principal`,
      amount: fullInvoiceValue,
      tokenSymbol: targetInvoice.settlementRail === 'EURC' ? 'EURC' : (targetInvoice.settlementRail === 'USDC' ? 'USDC' : 'USD'),
      txHash: generateTxHash(),
    });
  };

  return (
    <section id="sandbox-portal" className="py-24 bg-zinc-50 border-b border-zinc-200 text-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-zinc-100 border border-zinc-200 text-[10px] text-zinc-800 tracking-widest font-mono font-bold mb-4 uppercase">
            <Sparkles className="w-3.5 h-3.5 text-zinc-950 inline" /> SANDBOX TERMINAL
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-light italic text-zinc-950 tracking-tight mb-4">
            Interactive Protocol Terminal
          </h2>
          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-zinc-500 leading-relaxed font-sans mt-2">
            Explore receivable workflows, execute factoring actions, and monitor live portfolio accounting metrics.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-10 bg-white p-1.5 rounded-none border border-zinc-200 shadow-sm">
          {[
            { id: 'Supplier', label: '🌾 SME Supplier', desc: 'Factor Receivables' },
            { id: 'Buyer', label: '🏛️ Anchor Buyer', desc: 'Approve & Settle' },
            { id: 'Investor', label: '📈 Capital Investor', desc: 'Deploy & Claims' },
            { id: 'Operator', label: '⚙️ Protocol Admin', desc: 'Tune Interest Rate' },
          ].map((role) => (
            <button
              key={role.id}
              onClick={() => setActiveRole(role.id as 'Supplier' | 'Buyer' | 'Investor' | 'Operator')}
              className={`text-left p-4 rounded-none border transition-all cursor-pointer ${
                activeRole === role.id
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                  : 'bg-transparent border-transparent hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <div className="text-sm font-bold tracking-tight">{role.label}</div>
              <div className={`text-[10px] font-mono leading-none mt-1 ${activeRole === role.id ? 'text-zinc-300' : 'text-zinc-400'}`}>{role.desc}</div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 border border-zinc-200 bg-white rounded-none p-6 md:p-8 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-zinc-900" />

            {activeRole === 'Supplier' && (
              <div>
                <div className="flex justify-between items-center border-b border-zinc-200 pb-4 mb-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 text-zinc-900 font-sans tracking-tight">
                      Supplier Action Desk
                      <span className="text-[9px] bg-zinc-100 text-zinc-800 font-mono font-bold uppercase py-0.5 px-2 rounded-none border border-zinc-300 tracking-wider">
                        Apex Advanced Corp
                      </span>
                    </h3>
                    <p className="text-xs text-zinc-500">Register corporate accounts receivables and cash out early payment yield pools.</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] font-mono text-zinc-400 block font-bold leading-none uppercase">SUPPLIER WALLET VALUE</span>
                    <span className="text-sm sm:text-base font-mono font-bold text-emerald-800">${supplierBalances.usdc.toLocaleString()} USDC</span>
                  </div>
                </div>

                <div className="space-y-8">
                  <SupplierInvoiceForm supplierBalanceUsdc={supplierBalances.usdc} onSubmit={handleRegisterInvoice} />

                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-bold mb-3 font-mono text-zinc-500">Your Accounts Receivable Portfolio</h4>
                    <div className="overflow-x-auto border border-zinc-200">
                      <table className="w-full text-xs text-left mb-0">
                        <thead>
                          <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 uppercase font-mono text-[9px] font-bold">
                            <th className="py-2.5 px-3">Reference</th>
                            <th className="py-2.5 px-3">Anchor Buyer</th>
                            <th className="py-2.5 px-3">Face Value</th>
                            <th className="py-2.5 px-3">Early Payoff Value</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                          {invoices.map((invoice) => (
                            <tr key={invoice.id} className="hover:bg-zinc-50 transition-colors">
                              <td className="py-3 px-3 font-mono">
                                <span className="text-zinc-905 font-bold">{invoice.invoiceNumber}</span>
                                <span className="block text-[10px] text-zinc-400">{invoice.daysRemaining} days remaining</span>
                              </td>
                              <td className="py-3 px-3">
                                <span className="text-zinc-900 font-medium block">{invoice.buyerName}</span>
                                <span className="text-[10px] font-mono text-zinc-500">Tier: {invoice.riskGrade} • Discount: {(invoice.discountRate * 100).toFixed(1)}%</span>
                              </td>
                              <td className="py-3 px-3 font-mono text-zinc-900">${invoice.amount.toLocaleString()}</td>
                              <td className="py-3 px-3 font-mono text-emerald-800">
                                ${invoice.earlyPaymentAmount.toLocaleString()}
                                <span className="block text-[10px] text-rose-700">Fee: -${(invoice.amount - invoice.earlyPaymentAmount).toLocaleString()}</span>
                              </td>
                              <td className="py-3 px-3">{getStatusBadge(invoice.status)}</td>
                              <td className="py-3 px-3 text-right whitespace-nowrap">
                                {invoice.status === 'Approved_Unfunded' ? (
                                  <button
                                    onClick={() => handleSupplierCashout(invoice.id)}
                                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-805 border border-emerald-350 rounded-none text-[10px] font-bold tracking-wider uppercase cursor-pointer"
                                  >
                                    Draw Cash
                                  </button>
                                ) : invoice.status === 'Pending_Buyer_Approval' ? (
                                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Awaiting Signoff</span>
                                ) : (
                                  <span className="text-[10px] text-zinc-500 font-mono">Transacted ✓</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeRole === 'Buyer' && (
              <div>
                <div className="flex justify-between items-center border-b border-zinc-200 pb-4 mb-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 text-zinc-900 font-sans tracking-tight">
                      Buyer Authorization Station
                    </h3>
                    <p className="text-xs text-zinc-500">Digitally verify and approve incoming SME invoice billing records. Settle liabilities upon maturity.</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] font-mono text-zinc-400 block font-bold leading-none uppercase">ANCHOR CAPITAL RESERVE</span>
                    <span className="text-sm sm:text-base font-mono font-bold text-zinc-950">${buyerBalances.usd.toLocaleString()} USD</span>
                  </div>
                </div>

                <div className="p-4 bg-zinc-50 rounded-none border border-zinc-200 mb-6 flex items-center gap-3">
                  <Key className="w-8 h-8 text-zinc-900 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-mono font-bold uppercase text-zinc-800">Smart Authorization Wrapper</h4>
                    <p className="text-xs text-zinc-550 leading-relaxed">
                      Authorizing SME claims signs a dual-covenant pledge on-chain. This guarantees repayment to whichever investor funds the pool by maturity, automatically nullifying duplicate invoice-sharing fraud.
                    </p>
                  </div>
                </div>

                <h4 className="text-xs uppercase tracking-wider font-bold mb-3 font-mono text-zinc-500">Incoming Liabilities Pending Action</h4>
                <div className="overflow-x-auto border border-zinc-200">
                  <table className="w-full text-xs text-left mb-0">
                    <thead>
                      <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 uppercase font-mono text-[9px] font-bold">
                        <th className="py-2.5 px-3">Invoice Code</th>
                        <th className="py-2.5 px-3">SME Supplier</th>
                        <th className="py-2.5 px-3">Liability value</th>
                        <th className="py-2.5 px-3">Maturity Date</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Approval Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="py-3 px-3 font-mono text-zinc-900 font-bold">{invoice.invoiceNumber}</td>
                          <td className="py-3 px-3">
                            <span className="text-zinc-900 font-medium block">{invoice.supplierName}</span>
                            <span className="text-[9px] text-zinc-500 font-bold uppercase">Discount APY: {(invoice.discountRate * 100).toFixed(1)}%</span>
                          </td>
                          <td className="py-3 px-3 font-mono text-zinc-900 font-bold">${invoice.amount.toLocaleString()}</td>
                          <td className="py-3 px-3 font-mono text-zinc-500 font-bold">{invoice.dueDate} </td>
                          <td className="py-3 px-3">{getStatusBadge(invoice.status)}</td>
                          <td className="py-3 px-3 text-right">
                            {invoice.status === 'Pending_Buyer_Approval' ? (
                              <button
                                onClick={() => handleAuthorizeInvoice(invoice.id)}
                                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-none text-[10px] uppercase tracking-widest cursor-pointer transition-colors"
                              >
                                Sign & Accept Obligation
                              </button>
                            ) : invoice.status === 'Financed' || invoice.status === 'Approved_Unfunded' ? (
                              <button
                                onClick={() => handleBuyerSettle(invoice.id)}
                                className="px-3 py-1.5 bg-white hover:bg-zinc-55 text-zinc-900 border border-zinc-300 font-bold rounded-none text-[10px] uppercase tracking-widest cursor-pointer transition-colors shadow-sm"
                              >
                                Early Settle
                              </button>
                            ) : (
                              <span className="text-[10px] text-zinc-405 font-bold uppercase font-mono">Liability Settled</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeRole === 'Investor' && (
              <div>
                <div className="flex justify-between items-center border-b border-zinc-200 pb-4 mb-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 text-zinc-900 font-sans tracking-tight">
                      Factor Investment Terminal
                    </h3>
                    <p className="text-xs text-zinc-500">Underwrite buyer-accepted receivables. Claim risk-adjusted commercial interest payouts.</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] font-mono text-zinc-400 block font-bold leading-none uppercase">INVESTOR RESERVE VALUE</span>
                    <span className="text-sm sm:text-base font-mono font-bold text-emerald-800">${investorBalances.usdc.toLocaleString()} USDC</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-none bg-zinc-50 border border-zinc-200">
                    <span className="block text-[9px] font-mono text-zinc-400 uppercase font-bold mb-1">Weighted Portfolio Yield APY</span>
                    <span className="text-sm sm:text-base font-mono font-bold text-zinc-900">6.12% Net Return</span>
                  </div>
                  <div className="p-4 rounded-none bg-zinc-50 border border-zinc-200">
                    <span className="block text-[9px] font-mono text-zinc-400 uppercase font-bold mb-1">Active Collateral Claims</span>
                    <span className="text-sm sm:text-base font-mono font-bold text-emerald-800">$630,000 Total Assets</span>
                  </div>
                </div>

                <h4 className="text-xs uppercase tracking-wider font-bold mb-3 font-mono text-zinc-500">Pre-Approved Receivables Available to Purchase</h4>
                <div className="overflow-x-auto border border-zinc-200">
                  <table className="w-full text-xs text-left mb-0">
                    <thead>
                      <tr className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 uppercase font-mono text-[9px] font-bold">
                        <th className="py-2.5 px-3">Reference Info</th>
                        <th className="py-2.5 px-3">SME Supplier</th>
                        <th className="py-2.5 px-3">Face Value</th>
                        <th className="py-2.5 px-3">Capital Required</th>
                        <th className="py-2.5 px-3">Maturity APY</th>
                        <th className="py-2.5 px-3 text-right">Investment Act</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {invoices.filter((invoice) => invoice.status === 'Approved_Unfunded' || invoice.status === 'Financed').map((invoice) => {
                        const earnedInterest = invoice.amount - invoice.earlyPaymentAmount;
                        return (
                          <tr key={invoice.id} className="hover:bg-zinc-50 transition-colors">
                            <td className="py-3 px-3 font-mono">
                              <span className="text-zinc-900 font-bold">{invoice.invoiceNumber}</span>
                              <span className="block text-[10px] text-zinc-400">{invoice.daysRemaining} days remaining</span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="text-zinc-900 font-medium block">{invoice.supplierName}</span>
                              <span className="text-[10px] text-zinc-500 font-mono">Buyer: {invoice.buyerName} ({invoice.riskGrade})</span>
                            </td>
                            <td className="py-3 px-3 font-mono text-zinc-900 font-bold">${invoice.amount.toLocaleString()}</td>
                            <td className="py-3 px-3 font-mono text-zinc-650">${invoice.earlyPaymentAmount.toLocaleString()}</td>
                            <td className="py-3 px-3 font-mono text-emerald-755 font-bold">
                              +{(invoice.discountRate * 100).toFixed(1)}% APY
                              <span className="block text-[9px] text-zinc-400 font-normal">Interest: +${earnedInterest.toLocaleString()}</span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              {invoice.status === 'Approved_Unfunded' ? (
                                <button
                                  onClick={() => handleInvestorFund(invoice.id)}
                                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-850 text-white font-bold rounded-none text-[10px] uppercase tracking-widest cursor-pointer"
                                >
                                  Deploy Asset
                                </button>
                              ) : (
                                <span className="text-[10px] text-zinc-500 font-mono bg-zinc-100 border border-zinc-250 py-1 px-1.5 rounded-none">
                                  Transacted
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {invoices.filter((invoice) => invoice.status === 'Approved_Unfunded' || invoice.status === 'Financed').length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-6 text-zinc-400 italic">
                            No approved receivables currently available for purchase. Swap to Supplier or Buyer role to generate/approve invoices first!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeRole === 'Operator' && (
              <div>
                <div className="flex justify-between items-center border-b border-zinc-200 pb-4 mb-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 text-zinc-900 font-sans tracking-tight">
                      Platform Configuration Dashboard
                    </h3>
                    <p className="text-xs text-zinc-500">Tune dynamic pricing bounds, toggle active stablecoins, and oversee risk settings.</p>
                  </div>
                  <Settings className="w-5 h-5 text-zinc-900 overlay" />
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-none">
                      <label className="block text-[10px] font-mono font-bold uppercase text-zinc-500 mb-2">Protocol Yield Split Fee</label>
                      <input type="range" min="5" max="25" defaultValue="12" className="w-full accent-zinc-900 bg-zinc-200 rounded-none" />
                      <div className="flex justify-between text-[9px] font-mono text-zinc-400 mt-1 font-bold">
                        <span>5% platform fee</span>
                        <span>12% (current)</span>
                        <span>25% maximum</span>
                      </div>
                    </div>

                    <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-none">
                      <label className="block text-[10px] font-mono font-bold uppercase text-zinc-500 mb-2">Reserve Threshold Ratio</label>
                      <input type="range" min="2" max="10" defaultValue="5" className="w-full accent-zinc-900 bg-zinc-200 rounded-none" />
                      <div className="flex justify-between text-[9px] font-mono text-zinc-400 mt-1 font-bold">
                        <span>2.0% standard</span>
                        <span>5.0% (current)</span>
                        <span>10% critical</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-zinc-50 rounded-none border border-zinc-200">
                    <h4 className="text-xs font-mono font-bold uppercase text-zinc-500 mb-3 block">Allowed Settlement Assets Rails</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="accent-zinc-900" />
                          <span className="text-xs font-bold text-zinc-800">USDC On-chain (Arbitrum Mainnet wrapper)</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-mono font-extrabold">ACTIVE • ONLINE</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="accent-zinc-900" />
                          <span className="text-xs font-bold text-zinc-800">EURC Stablecoin (Base L2 gasless contract)</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-mono font-extrabold">ACTIVE • ONLINE</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="accent-zinc-900" />
                          <span className="text-xs font-bold text-zinc-800">PYUSD (PayPal Stablecoin)</span>
                        </div>
                        <span className="text-[10px] text-amber-700 font-mono font-extrabold">COMPLIANCE REVIEW</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-100 border border-zinc-200 p-4 rounded-none text-[10px] font-mono space-y-2 text-zinc-500 font-bold">
                    <div className="flex justify-between"><span className="text-zinc-900">CORE HUB CONTRACT:</span> <span>0xa2bda5029e0149fbdcf20ac8</span></div>
                    <div className="flex justify-between"><span className="text-zinc-900">LEDGER MUTEX LOCKER:</span> <span>0x9812efda85fbeef2032e391</span></div>
                    <div className="flex justify-between"><span className="text-zinc-900">ORACLE INTERACTION GATEWAY:</span> <span>Chainlink SCF Pool V4</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border border-zinc-200 bg-white rounded-none p-5 relative overflow-hidden flex flex-col justify-between h-full min-h-[585px] shadow-sm">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-zinc-900" />

            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="p-1 rounded-none bg-zinc-100 text-zinc-900 border border-zinc-200">
                  <Wallet className="w-4 h-4 animate-pulse text-zinc-900" />
                </span>
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-extrabold">Verity Ledger Vaults</span>
              </div>

              <div className="bg-zinc-50 rounded-none p-4.5 border border-zinc-200 space-y-4 mb-6">
                <div>
                  <span className="text-[9px] font-mono text-zinc-400 block font-bold leading-none uppercase mb-1.5">SME Supplier Wallet Balance</span>
                  <div className="flex items-baseline justify-between font-mono">
                    <span className="text-base font-bold text-zinc-900">${supplierBalances.usdc.toLocaleString()}</span>
                    <span className="text-[10px] text-zinc-500 font-bold">USDC</span>
                  </div>
                </div>

                <div className="border-t border-zinc-200 pt-3">
                  <span className="text-[9px] font-mono text-zinc-400 block font-bold leading-none uppercase mb-1.5">Anchor Buyer Settle Reserves</span>
                  <div className="flex items-baseline justify-between font-mono">
                    <span className="text-base font-bold text-zinc-900">${buyerBalances.usd.toLocaleString()}</span>
                    <span className="text-[10px] text-zinc-500 font-bold">Fiat USD</span>
                  </div>
                </div>

                <div className="border-t border-zinc-200 pt-3">
                  <span className="text-[9px] font-mono text-zinc-400 block font-bold leading-none uppercase mb-1.5">Capital Investor Account Pool</span>
                  <div className="flex items-baseline justify-between font-mono">
                    <span className="text-base font-bold text-emerald-700">${investorBalances.usdc.toLocaleString()}</span>
                    <span className="text-[10px] text-emerald-755 font-bold">USDC</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-zinc-200 pb-2 mb-3">
                <span className="text-[10px] font-mono font-extrabold uppercase text-zinc-400">Live Double-Entry Audit Log</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="p-3 bg-zinc-50 border border-zinc-200 rounded-none text-xs hover:bg-zinc-100/50 transition-colors">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-mono text-zinc-700 font-extrabold uppercase text-[9px] bg-zinc-200 py-0.5 px-1.5 border border-zinc-300">
                        {transaction.type.replace('_', ' ')}
                      </span>
                      <span className="text-[9px] text-zinc-400 font-mono font-bold">{transaction.timestamp.substring(11, 16)} GMT</span>
                    </div>
                    <p className="text-zinc-650 leading-relaxed font-sans mb-2">{transaction.description}</p>

                    <div className="flex justify-between items-center text-[9px] font-mono border-t border-zinc-200 pt-2 mt-1 font-bold">
                      <span className="text-zinc-400">HASH:
                        <button
                          onClick={() => setSelectedTxDetail(transaction)}
                          className="text-zinc-900 font-bold underline outline-none ml-1 cursor-pointer"
                        >
                          {transaction.txHash}
                        </button>
                      </span>
                      {transaction.amount > 0 && (
                        <span className="text-emerald-700 font-extrabold">
                          ${transaction.amount.toLocaleString()} {transaction.tokenSymbol}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-200 text-[10px] text-zinc-450 flex items-center gap-1.5 mt-4">
              <ShieldCheck className="w-4 h-4 text-zinc-900 flex-shrink-0" />
              <span className="font-sans text-zinc-500 font-medium leading-normal">All sandbox ledgers are secured using simulated cryptographic hashing for full auditability.</span>
            </div>
          </div>
        </div>
      </div>

      {selectedTxDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09090B]/60 backdrop-blur-sm p-4">
          <div className="bg-white border-2 border-zinc-900 rounded-none p-6 max-w-md w-full relative shadow-xl">
            <h3 className="font-display text-xl font-light italic text-zinc-950 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              On-Chain Transaction Auditor
            </h3>
            <p className="text-[11px] text-zinc-500 mb-4 font-mono font-bold uppercase">
              Verifying block receipts generated via Verity dynamic consensus.
            </p>

            <div className="space-y-3 font-mono text-xs bg-zinc-50 border border-zinc-200 p-4 rounded-none mb-6 text-zinc-805">
              <div>
                <span className="text-zinc-400 block text-[9px] font-bold">EVENT CLASSIFICATION</span>
                <span className="text-zinc-900 font-bold font-mono">{selectedTxDetail.type}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[9px] font-bold">CRYPTOGRAPHIC RECEIPT HASH</span>
                <span className="text-zinc-900 break-all font-bold">{selectedTxDetail.txHash}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[9px] font-bold">CORRESPONDING ACTOR</span>
                <span className="text-zinc-900 font-bold">{selectedTxDetail.actor}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-zinc-200 pt-2.5 mt-2.5">
                <div>
                  <span className="text-zinc-400 block text-[9px] font-bold">LEDGER STATUS</span>
                  <span className="text-emerald-700 font-extrabold">Confirmed Block</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[9px] font-bold">DISBURSED VALUE</span>
                  <span className="text-zinc-900 font-bold">${selectedTxDetail.amount.toLocaleString()} {selectedTxDetail.tokenSymbol}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedTxDetail(null)}
                className="px-5 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-none text-xs tracking-widest uppercase cursor-pointer"
              >
                Close Audit Dialog
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
