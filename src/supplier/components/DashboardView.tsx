import React, { useState } from 'react';
import { 
  Building2,
  DollarSign, 
  Clock, 
  CheckCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  Star, 
  Upload, 
  Filter, 
  ArrowRight,
  Gavel,
  Rocket,
  ShieldCheck,
  AlertTriangle,
  Info,
  Wallet
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
  const totalOutstandingVolume = invoices
    .filter((invoice) => invoice.status !== 'SETTLED')
    .reduce((total, invoice) => total + invoice.amount, 0);
  const pendingFinancingVolume = invoices
    .filter((invoice) => invoice.status === 'ACCEPTED')
    .reduce((total, invoice) => total + invoice.amount, 0);
  const factoredVolume = invoices
    .filter((invoice) => invoice.status === 'FACTORED')
    .reduce((total, invoice) => total + invoice.amount, 0);
  const statusCounts = invoices.reduce<Record<InvoiceStatus, number>>(
    (counts, invoice) => ({
      ...counts,
      [invoice.status]: counts[invoice.status] + 1,
    }),
    {
      PENDING: 0,
      ACCEPTED: 0,
      FACTORED: 0,
      SETTLED: 0,
      DISPUTED: 0,
    }
  );
  const statusBreakdown = (Object.keys(statusCounts) as InvoiceStatus[]).filter((status) => statusCounts[status] > 0);

  const formatCurrency = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 0 });

  const getBreakdownColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-500';
      case 'ACCEPTED':
        return 'bg-[#0052CC]';
      case 'FACTORED':
        return 'bg-violet-500';
      case 'SETTLED':
        return 'bg-emerald-500';
      case 'DISPUTED':
        return 'bg-red-600';
      default:
        return 'bg-slate-300';
    }
  };

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

      {/* SupplierDashboard analytics merged into VerityUI visual language */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 p-6 rounded-[8px] shadow-3xs">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-[#EBF2FF] text-[#0052CC] rounded-[8px]">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="flex items-center gap-1 text-sm font-bold text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                  +12.5%
                </span>
              </div>
              <p className="text-[11px] font-bold tracking-wider text-slate-400 mb-1 uppercase">Total Outstanding Volume</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{formatCurrency(totalOutstandingVolume)}</h2>
                <span className="text-sm font-mono font-medium text-slate-400">USDC</span>
              </div>
              <p className="text-xs text-slate-500 mt-3">{invoices.length} registered receivables tracked in this workspace</p>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-[8px] shadow-3xs">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-[8px]">
                  <Clock className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-slate-400">{statusCounts.ACCEPTED} Invoices</span>
              </div>
              <p className="text-[11px] font-bold tracking-wider text-slate-400 mb-1 uppercase">Pending Financing</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{formatCurrency(pendingFinancingVolume)}</h2>
                <span className="text-sm font-mono font-medium text-slate-400">USDC</span>
              </div>
              <p className="text-xs mt-3 bg-slate-50 inline-block px-2 py-1 rounded-[6px]">
                <span className="text-emerald-700 font-bold">Est. yield 8.2%</span> <span className="text-slate-400">Risk-adjusted</span>
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-[8px] shadow-3xs">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-[8px]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-[6px]">Top 5% of network</span>
              </div>
              <p className="text-[11px] font-bold tracking-wider text-slate-400 mb-1 uppercase">On-Chain Credit Score</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{onChainCredit}</h2>
                <span className="text-sm font-bold text-emerald-600">Excellent</span>
              </div>
              <p className="text-xs text-slate-500 mt-3">{formatCurrency(availableLiquidity)} USDC available for treasury actions</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-[8px] shadow-3xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Cash Flow Projection</h2>
              <select className="bg-slate-50 border border-slate-200 text-slate-700 rounded-[6px] text-sm px-3 py-2 focus:ring-2 focus:ring-[#0052CC]/15 outline-none cursor-pointer">
                <option>Next 90 Days</option>
                <option>Next 180 Days</option>
              </select>
            </div>

            <div className="h-44 w-full flex items-end justify-between gap-4 px-1 sm:gap-6 sm:px-4">
              {[
                { label: 'Day 30', height: 55, factorable: 40 },
                { label: 'Day 60', height: 85, factorable: 30 },
                { label: 'Day 90', height: 45, factorable: 50, active: true },
                { label: 'Day 120', height: 70, factorable: 25 },
              ].map((bar) => (
                <div key={bar.label} className="flex-1 flex flex-col items-center gap-4 h-full justify-end">
                  <div
                    className={`w-full rounded-t-[8px] relative transition-all ${bar.active ? 'bg-[#0052CC]' : 'bg-[#EBF2FF]'}`}
                    style={{ height: `${bar.height}%` }}
                  >
                    <div
                      className={`absolute bottom-0 w-full rounded-t-sm border-t ${bar.active ? 'bg-white/20 border-white/30' : 'bg-emerald-500/20 border-emerald-500/30'}`}
                      style={{ height: `${bar.factorable}%` }}
                    />
                  </div>
                  <span className={`text-[11px] font-bold tracking-widest uppercase ${bar.active ? 'text-[#0052CC]' : 'text-slate-400'}`}>{bar.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-wrap gap-5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-1.5 bg-[#0052CC]/30 rounded-full" />
                  <span className="text-xs font-semibold text-slate-500 tracking-wide">Projected Cash</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-1.5 bg-emerald-500/40 rounded-full" />
                  <span className="text-xs font-semibold text-slate-500 tracking-wide">Factorable Opportunity</span>
                </div>
              </div>
              <div className="sm:text-right">
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block mb-1">Estimated Net Position</span>
                <span className="text-base font-mono font-bold text-[#0052CC]">+{formatCurrency(totalOutstandingVolume + availableLiquidity)} USDC</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[8px] p-6 shadow-3xs">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 mb-7">Recent Activity</h2>
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-11 h-11 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Gavel className="w-5 h-5" />
                </div>
                <div className="flex-1 border-b border-slate-100 pb-5">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
                    <p className="text-base font-bold text-slate-900">Dispute rebutted for #INV-2026-089</p>
                    <span className="text-xs text-slate-400 font-mono font-medium">5h ago</span>
                  </div>
                  <p className="text-sm text-slate-500">Rebuttal submitted via smart contract evidence bundle.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-11 h-11 rounded-full bg-blue-50 text-[#0052CC] flex items-center justify-center shrink-0">
                  <Rocket className="w-5 h-5" />
                </div>
                <div className="flex-1 border-b border-slate-100 pb-5">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
                    <p className="text-base font-bold text-slate-900">Factoring request approved</p>
                    <span className="text-xs text-slate-400 font-mono font-medium">Yesterday</span>
                  </div>
                  <p className="text-sm text-slate-500">Batch funding prepared for {formatCurrency(factoredVolume || pendingFinancingVolume)} USDC.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
                    <p className="text-base font-bold text-slate-900">Compliance check passed</p>
                    <span className="text-xs text-slate-400 font-mono font-medium">2 days ago</span>
                  </div>
                  <p className="text-sm text-slate-500">KYC / AML verifications successfully re-certified for the quarter.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-[8px] p-6 shadow-3xs">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 mb-8">Status Breakdown</h2>
            <div className="flex justify-center mb-8">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full -rotate-90 drop-shadow-sm" viewBox="0 0 36 36" aria-hidden="true">
                  <circle className="text-blue-500 stroke-current" cx="18" cy="18" fill="none" r="15.915" strokeDasharray="40 100" strokeWidth="4" />
                  <circle className="text-violet-500 stroke-current" cx="18" cy="18" fill="none" r="15.915" strokeDasharray="30 100" strokeDashoffset="-40" strokeWidth="4" />
                  <circle className="text-emerald-500 stroke-current" cx="18" cy="18" fill="none" r="15.915" strokeDasharray="20 100" strokeDashoffset="-70" strokeWidth="4" />
                  <circle className="text-red-600 stroke-current" cx="18" cy="18" fill="none" r="15.915" strokeDasharray="10 100" strokeDashoffset="-90" strokeWidth="4" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">{invoices.length}</span>
                  <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Total Units</span>
                </div>
              </div>
            </div>
            <div className="space-y-4 px-2">
              {statusBreakdown.map((status) => {
                const percent = invoices.length ? Math.round((statusCounts[status] / invoices.length) * 100) : 0;
                return (
                  <div key={status} className="flex justify-between items-center text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${getBreakdownColor(status)}`} />
                      <span className="capitalize text-slate-700">{status.toLowerCase()}</span>
                    </div>
                    <span className="font-bold text-slate-900">{percent}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#0052CC] rounded-[8px] p-6 text-white relative overflow-hidden shadow-[0_8px_30px_rgba(0,82,204,0.15)]">
            <div className="relative z-10">
              <h2 className="text-2xl font-extrabold tracking-tight mb-3">Request Factoring</h2>
              <p className="text-[15px] font-medium text-white/90 leading-relaxed mb-6">Unlock liquidity from accepted invoices using the existing Verity factoring workflow.</p>
              <button
                type="button"
                onClick={() => onSelectRoute('factoring')}
                className="w-full py-3 bg-white text-[#0052CC] font-bold rounded-[6px] shadow hover:bg-slate-50 transition-all text-[14px]"
              >
                Calculate Liquidity
              </button>
            </div>
            <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none">
              <Wallet size={180} strokeWidth={1} />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[8px] p-6 shadow-3xs">
            <h2 className="text-[10px] font-bold tracking-widest text-slate-400 mb-5 uppercase">Platform Status</h2>
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-40" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                  </span>
                  <p className="text-[15px] font-bold text-slate-900">Healthy</p>
                </div>
                <p className="text-xs text-slate-400 font-medium ml-5">Polygon Mainnet</p>
              </div>
              <div className="text-right flex flex-col gap-1.5">
                <p className="text-xs font-mono font-medium text-slate-900">Latency: 24ms</p>
                <p className="text-xs font-mono font-medium text-slate-400">Block: 45,129,088</p>
              </div>
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
