import React, { useState } from 'react';
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  Star, 
  Upload, 
  Filter, 
  MoreVertical, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Info
} from 'lucide-react';
import { Invoice, InvoiceStatus, MainRoute } from '../types';

interface DashboardViewProps {
  workspacePerspective: 'Supplier' | 'Investor';
  invoices: Invoice[];
  availableLiquidity: number;
  onModifyLiquidity: (amount: number) => void;
  escrowValue: number;
  onChainCredit: number;
  onSelectRoute: (route: MainRoute) => void;
  onOpenUploadModal: () => void;
  searchQuery: string;
  onFocusInvoiceForFactoring: (invoiceId: string) => void;
  onFocusInvoiceForDispute: (invoiceId: string) => void;
  onFocusInvoiceForSettlement: (invoiceId: string) => void;
}

export default function DashboardView({
  workspacePerspective,
  invoices,
  availableLiquidity,
  onModifyLiquidity,
  escrowValue,
  onChainCredit,
  onSelectRoute,
  onOpenUploadModal,
  searchQuery,
  onFocusInvoiceForFactoring,
  onFocusInvoiceForDispute,
  onFocusInvoiceForSettlement
}: DashboardViewProps) {
  
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Interactive local helpers for simple Deposit/Withdraw simulator
  const [depositAmount, setDepositAmount] = useState('25000');
  const [withdrawAmount, setWithdrawAmount] = useState('15000');
  const [showDepositPanel, setShowDepositPanel] = useState(false);
  const [showWithdrawPanel, setShowWithdrawPanel] = useState(false);

  // Filter invoices based on global search in Header and local filter status
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          invoice.buyer.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === 'ALL') return matchesSearch;
    return matchesSearch && invoice.status === filterStatus;
  });

  // Simple status badge renderer
  const getStatusStyle = (status: InvoiceStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ACCEPTED':
        return 'bg-blue-100 text-[#0052CC] border-blue-200';
      case 'FACTORED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'SETTLED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'DISPUTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const isInvestor = workspacePerspective === 'Investor';
  const dashboardTitle = isInvestor ? 'Investor Overview' : 'Supplier Overview';
  const dashboardSubtitle = isInvestor
    ? 'Track receivable opportunities, monitor risk signals, and allocate liquidity across verified assets.'
    : 'Manage active invoices, view financing options, and monitor your decentralized credit rating.';

  return (
    <div id="supplier-overview" className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto w-full">
      
      {/* Overview Introductory Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">{dashboardTitle}</h1>
          <p className="text-[14px] text-slate-500 mt-1">
            {dashboardSubtitle}
          </p>
        </div>
        
        {/* Visual Walkthrough Assistance Help */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-[8px] max-w-md flex gap-3 text-slate-700 text-xs shadow-2xs">
          <Info className="w-5 h-5 text-[#0052CC] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#003D9B]">Interactive Interactive Walkthrough:</span>
            <p className="mt-1 leading-relaxed">
              Use the action buttons in the registered invoices table below to trigger the high-fidelity factoring screens (<b>ACCEPTED</b> items) or resolve buyer dispute claims (<b>DISPUTED</b> item).
            </p>
          </div>
        </div>
      </div>

      {/* Main Metric Cards Grid (Standard 3 columns) */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* Available Liquidity Core Card */}
        <div id="metric-liquidity" className="bg-white border border-slate-200 p-6 rounded-[12px] shadow-3xs flex flex-col justify-between relative overflow-hidden group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-bold text-slate-500 tracking-wider label-caps uppercase flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-[#0052CC]" />
                Available Liquidity
              </span>
            </div>
            
            <div className="space-y-1">
              <p className="sky-headline text-[32px] font-extrabold text-slate-900 tracking-tight">
                ${availableLiquidity.toLocaleString()} <span className="text-xs text-slate-400 font-bold tracking-widest font-mono">USDC</span>
              </p>
              <p className="text-[12px] text-slate-400 font-medium flex items-center gap-1">
                <span className="text-emerald-500 font-bold font-mono">+$40,000</span> pending settlement unlock
              </p>
            </div>
          </div>

          {/* Quick inline simulator actions */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  setShowDepositPanel(!showDepositPanel);
                  setShowWithdrawPanel(false);
                }}
                className="flex-1 bg-[#EBF2FF] hover:bg-[#D2E2FF] text-[#0052CC] text-[12.5px] font-semibold py-2 px-3 rounded-[6px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowDownLeft className="w-4 h-4" />
                Deposit
              </button>
              <button 
                onClick={() => {
                  setShowWithdrawPanel(!showWithdrawPanel);
                  setShowDepositPanel(false);
                }}
                className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[12.5px] font-semibold py-2 px-3 rounded-[6px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowUpRight className="w-4 h-4" />
                Withdraw
              </button>
            </div>

            {/* Simulated deposit form */}
            {showDepositPanel && (
              <div className="mt-4 p-3 bg-slate-50 rounded-[8px] border border-slate-200/80 animate-fadeIn space-y-2">
                <label className="block text-[11px] font-bold text-slate-500">Deposit amount (USDC)</label>
                <div className="flex gap-2">
                  <input 
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="flex-1 bg-white border border-slate-250 rounded-[4px] px-2 py-1 text-xs font-mono font-bold" 
                  />
                  <button 
                    onClick={() => {
                      onModifyLiquidity(parseFloat(depositAmount) || 0);
                      setShowDepositPanel(false);
                    }}
                    className="bg-[#0052CC] hover:bg-[#003D9B] text-white px-3 py-1 rounded-[4px] text-xs font-semibold cursor-pointer"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}

            {/* Simulated withdraw form */}
            {showWithdrawPanel && (
              <div className="mt-4 p-3 bg-slate-50 rounded-[8px] border border-slate-200/80 animate-fadeIn space-y-2">
                <label className="block text-[11px] font-bold text-slate-500">Withdraw amount (USDC)</label>
                <div className="flex gap-2">
                  <input 
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="flex-1 bg-white border border-slate-250 rounded-[4px] px-2 py-1 text-xs font-mono font-bold" 
                  />
                  <button 
                    onClick={() => {
                      onModifyLiquidity(-(parseFloat(withdrawAmount) || 0));
                      setShowWithdrawPanel(false);
                    }}
                    className="bg-[#0052CC] hover:bg-[#003D9B] text-white px-3 py-1 rounded-[4px] text-xs font-semibold cursor-pointer"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Value in Escrow Status Card */}
        <div id="metric-escrow" className="bg-white border border-slate-200 p-6 rounded-[12px] shadow-3xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-bold text-slate-500 tracking-wider label-caps uppercase flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                Value in Escrow
              </span>
              <span className="text-[11px] bg-amber-50 text-amber-700 font-extrabold px-2 py-0.5 rounded-[4px] border border-amber-150 uppercase tracking-wider">
                3 Active
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-[32px] font-extrabold text-slate-900 tracking-tight">
                ${escrowValue.toLocaleString()} <span className="text-xs text-slate-400 font-bold tracking-widest font-mono">USDC</span>
              </p>
              <p className="text-[12px] text-slate-400 font-medium">
                Locked securely across factored invoice vaults
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span className="text-amber-600 font-bold uppercase">Next unlock: Aug 14</span>
              <span>65% Matured</span>
            </div>
            {/* Elegant stylized progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full transition-all duration-1000" style={{ width: '65%' }} />
            </div>
          </div>
        </div>

        {/* Decentralized On-Chain Credit Score Card */}
        <div id="metric-reputation" className="bg-white border border-slate-200 p-6 rounded-[12px] shadow-3xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-bold text-slate-500 tracking-wider label-caps uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                On-Chain Credit Reputation
              </span>
              <span className="text-[11px] bg-emerald-50 text-emerald-700 font-extrabold px-2 py-0.5 rounded-[4px] border border-emerald-150 uppercase tracking-wider flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
                ↑ 45 pts
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-[32px] font-extrabold text-slate-900 tracking-tight font-mono">{onChainCredit}</span>
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded">
                  Excellent
                </span>
              </div>
              <div className="flex gap-0.5 text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[12px] text-slate-500 font-semibold gap-4">
            <div className="flex-1">
              <span className="block text-slate-400 text-[10px] uppercase font-bold label-caps tracking-wider">On-Time Settlements</span>
              <span className="text-slate-800 font-mono font-bold text-sm">98.0%</span>
            </div>
            <div className="bg-slate-200 w-[1px] h-8 shrink-0" />
            <div className="flex-1">
              <span className="block text-slate-400 text-[10px] uppercase font-bold label-caps tracking-wider">Invoice Accuracy</span>
              <span className="text-slate-800 font-mono font-bold text-sm">99.5%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Structured Invoices Section Table Container */}
      <div id="invoice-vault" className="bg-white border border-slate-200 rounded-[12px] shadow-3xs overflow-hidden">
        
        {/* Table Header with Title and Search/Actions controls */}
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Registered Invoices</h2>
            <p className="text-[12.5px] text-slate-500">Registry of programmatic assets generated on-chain.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            
            {/* Filter controls */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-[6px] pl-3 pr-2 py-1">
              <Filter className="w-3.5 h-3.5 text-slate-400 mr-2" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent border-0 text-slate-700 text-xs font-bold focus:outline-none focus:ring-0 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="FACTORED">Factored</option>
                <option value="SETTLED">Settled</option>
                <option value="DISPUTED">Disputed</option>
              </select>
            </div>

            {/* Primary Action Button trigger for Screen 3 Modal */}
            <button
              onClick={onOpenUploadModal}
              id="upload-invoice-btn"
              type="button"
              className="bg-[#0052CC] hover:bg-[#003D9B] active:bg-[#003D9B] text-white text-xs font-bold px-4 py-2 rounded-[6px] shadow-sm flex items-center gap-2 tracking-wide cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Invoice</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[#6B7280] text-[11px] font-bold tracking-wider uppercase">
                <th className="px-6 py-4">Invoice ID</th>
                <th className="px-6 py-4">Buyer Entity</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Maturity Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Primary Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13.5px]">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No verified invoices matching current search & filter criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50/70 transition-colors group">
                    
                    {/* Invoice ID in Mono to denote immutable authenticity */}
                    <td className="px-6 py-4 font-mono font-bold text-slate-950">
                      {invoice.id}
                    </td>

                    {/* Buyer entity */}
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {invoice.buyer}
                    </td>

                    {/* Amount in USDC */}
                    <td className="px-6 py-4 font-bold font-mono text-slate-900 text-[13.5px]">
                      ${invoice.amount.toLocaleString()} <span className="text-[10px] text-slate-400 font-bold inline-block ml-0.5">USDC</span>
                    </td>

                    {/* Maturity Date */}
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {invoice.maturityDate}
                    </td>

                    {/* Dynamic Status Badges conforming to design spec */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold border uppercase tracking-wider ${getStatusStyle(invoice.status)}`}>
                        {invoice.status === 'DISPUTED' && <AlertTriangle className="w-3 h-3 text-red-600 block" />}
                        {invoice.status === 'SETTLED' && <CheckCircle className="w-3 h-3 text-emerald-600 block" />}
                        <span>{invoice.status}</span>
                      </span>
                    </td>

                    {/* Context/Next Actions for Interactive Walkthrough flow */}
                    <td className="px-6 py-4 text-right">
                      {invoice.status === 'ACCEPTED' ? (
                        <button
                          type="button"
                          onClick={() => onFocusInvoiceForFactoring(invoice.id)}
                          className="bg-[#EBF2FF] hover:bg-[#0052CC] hover:text-white text-[#0052CC] text-xs font-bold py-1.5 px-3.5 rounded-[4px] border border-blue-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer ml-auto shadow-3xs"
                        >
                          <span>Request Financing</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : invoice.status === 'DISPUTED' ? (
                        <button
                          type="button"
                          onClick={() => onFocusInvoiceForDispute(invoice.id)}
                          className="bg-red-50 hover:bg-red-600 hover:text-white text-red-700 text-xs font-bold py-1.5 px-3.5 rounded-[4px] border border-red-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer ml-auto shadow-3xs hover:border-red-600 animate-pulse"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Resolve Dispute</span>
                        </button>
                      ) : invoice.status === 'PENDING' ? (
                        <span className="text-slate-400 text-xs font-medium italic">Awaiting approval</span>
                      ) : invoice.status === 'FACTORED' ? (
                        <button
                          type="button"
                          onClick={() => onFocusInvoiceForSettlement(invoice.id)}
                          className="bg-purple-50 hover:bg-[#0052CC] hover:text-white text-purple-700 text-xs font-bold py-1.5 px-3.5 rounded-[4px] border border-purple-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer ml-auto shadow-3xs"
                        >
                          <span>Final Settlement</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-emerald-600 text-xs font-bold flex items-center justify-end gap-1 select-none">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Settled on Chain
                        </span>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Dense Table Summary info */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>Showing 1-{filteredInvoices.length} of {invoices.length} invoices</span>
          <div className="flex items-center gap-1">
            <button disabled className="px-2.5 py-1 bg-white border border-slate-200 text-slate-300 rounded text-xs select-none cursor-not-allowed">◀</button>
            <button disabled className="px-2.5 py-1 bg-white border border-slate-200 text-slate-300 rounded text-xs select-none cursor-not-allowed">▶</button>
          </div>
        </div>

      </div>

    </div>
  );
}
