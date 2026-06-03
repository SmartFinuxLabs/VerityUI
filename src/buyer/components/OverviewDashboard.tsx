/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, 
  TrendingUp, 
  Calendar, 
  Globe2, 
  Download, 
  Coins, 
  HelpCircle, 
  ChevronRight, 
  Wallet,
  Play,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { Invoice, FundingRequest, LiquidityProfile } from '../types';

interface OverviewDashboardProps {
  invoices: Invoice[];
  fundingRequests: FundingRequest[];
  onAddFundingRequest: (req: Omit<FundingRequest, 'id'>) => void;
  liquidity: LiquidityProfile;
  adjustLiquidity: (amount: number) => void;
  onSelectInvoice: (invoiceId: string) => void;
  onExportData: () => void;
}

export default function OverviewDashboard({
  invoices,
  fundingRequests,
  onAddFundingRequest,
  liquidity,
  adjustLiquidity,
  onSelectInvoice,
  onExportData,
}: OverviewDashboardProps) {
  // Deposit and Withdrawal state handlers
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [txAmount, setTxAmount] = useState('50000');
  const [showNewReqModal, setShowNewReqModal] = useState(false);

  // New funding request construction
  const [newReqType, setNewReqType] = useState('Batch payment for 3 suppliers');
  const [newReqAmount, setNewReqAmount] = useState('180000');
  const [newReqDesc, setNewReqDesc] = useState('Immediate liquidity settlement');

  const pendingCount = invoices.filter(inv => inv.status === 'PENDING_VERIFICATION').length;
  
  // Calculate total USDC value of verified vs pending
  const totalVerifiedPayables = invoices
    .filter(inv => inv.status === 'VERIFIED')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalPendingPayables = invoices
    .filter(inv => inv.status === 'PENDING_VERIFICATION')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const handleDeposit = () => {
    const val = parseFloat(txAmount);
    if (!isNaN(val) && val > 0) {
      adjustLiquidity(val);
      setShowDepositModal(false);
    }
  };

  const handleWithdraw = () => {
    const val = parseFloat(txAmount);
    if (!isNaN(val) && val > 0 && val <= liquidity.availableLiquidity) {
      adjustLiquidity(-val);
      setShowWithdrawModal(false);
    }
  };

  const handleCreateRequest = () => {
    const amt = parseFloat(newReqAmount);
    if (newReqType && !isNaN(amt) && amt > 0) {
      onAddFundingRequest({
        type: newReqType,
        amount: amt,
        status: 'DRAFT',
        description: newReqDesc || 'Awaiting supervisor approval'
      });
      setShowNewReqModal(false);
      setNewReqType('Batch payment for 3 suppliers');
      setNewReqAmount('180000');
      setNewReqDesc('');
    }
  };

  return (
    <div id="overview-dashboard-root" className="space-y-6">
      
      {/* Title Header area matching mockup */}
      <div id="dashboard-heading-bar" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-sans">
            Buyer Dashboard
          </h1>
          <p className="text-slate-500 text-xs mt-1 font-sans">
            Manage your supply chain payables, direct drafts, and verified liquidity pool.
          </p>
        </div>

        <div className="flex items-center gap-3" id="dashboard-heading-actions">
          <button
            id="btn-export-rep-dashboard"
            onClick={onExportData}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg border border-[#E5E7EB] shadow-xs active:bg-slate-100 transition-colors font-sans"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export Report</span>
          </button>

          <button
            id="btn-fund-payables-dashboard"
            onClick={() => setShowNewReqModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0052cc] hover:bg-[#0040a2] text-white font-sans font-semibold text-xs rounded-lg shadow-xs transition-colors"
          >
            <Coins className="w-4 h-4 text-white/90" />
            <span>Fund Payables</span>
          </button>
        </div>
      </div>

      {/* Grid of four stat blocks as shown in Screen 5 */}
      <div id="dashboard-metric-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div id="metric-card-pending" className="bg-white p-5 rounded-xl border border-[#E5E7EB] hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-dashed border-slate-100 pb-3 mb-3">
            <span className="text-slate-500 text-xs font-semibold font-sans tracking-tight">Pending Funding</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold font-sans text-slate-900">{pendingCount}</span>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold py-0.5 px-2 rounded-full uppercase tracking-wider font-mono">
                Requires Review
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div id="metric-card-payables" className="bg-white p-5 rounded-xl border border-[#E5E7EB] hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-dashed border-slate-100 pb-3 mb-3">
            <span className="text-slate-500 text-xs font-semibold font-sans tracking-tight">Active Payables</span>
            <div className="w-8 h-8 rounded-lg bg-[#0052cc]/10 flex items-center justify-center text-[#0052cc]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold font-sans text-slate-900">
              USDC {(totalVerifiedPayables / 1000).toFixed(1)}k
            </span>
            <div className="flex items-center gap-1 mt-2 text-emerald-600 font-sans font-semibold text-xs">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+5.2% vs last month</span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div id="metric-card-maturing" className="bg-white p-5 rounded-xl border border-[#E5E7EB] hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-dashed border-slate-100 pb-3 mb-3">
            <span className="text-slate-500 text-xs font-semibold font-sans tracking-tight">Upcoming Maturities (7d)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-extrabold font-sans text-slate-900">USDC 850K</span>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold py-0.5 px-2 rounded-full uppercase tracking-wider font-mono">
                Fully Funded
              </span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div id="metric-card-suppliers" className="bg-white p-5 rounded-xl border border-[#E5E7EB] hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-dashed border-slate-100 pb-3 mb-3">
            <span className="text-slate-500 text-xs font-semibold font-sans tracking-tight">Total Suppliers Active</span>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-600">
              <Globe2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold font-sans text-slate-900">48</span>
            <p className="text-slate-400 text-xs mt-1.5 font-sans font-medium">Across 3 Geographies</p>
          </div>
        </div>
      </div>

      {/* Main content grid: Top priority items & liquidity stats */}
      <div id="dashboard-col-container" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1 & 2: Action Required Pending Table */}
        <div id="dashboard-left-col" className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xs overflow-hidden" id="pending-actions-list-card">
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h3 className="font-sans font-bold text-slate-800 text-sm">
                  Action Required: Pending Invoices
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-extrabold uppercase font-mono tracking-wider">
                {pendingCount} Pending
              </span>
            </div>

            <div className="overflow-x-auto">
              <table id="tbl-pending-invoices-dashboard" className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-slate-50/30 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    <th className="py-2.5 px-4 font-semibold">Supplier</th>
                    <th className="py-2.5 px-4 font-semibold">Invoice ID</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Amount</th>
                    <th className="py-2.5 px-4 font-semibold">Maturity Date</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] text-xs">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-sans">
                        No pending reviews. All clear!
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr 
                        id={`row-pending-inv-${inv.id}`}
                        key={inv.id} 
                        className="hover:bg-slate-50/60 transition-colors cursor-pointer group"
                        onClick={() => onSelectInvoice(inv.id)}
                      >
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-bold text-slate-800 font-sans group-hover:text-[#0052cc] transition-colors">
                              {inv.supplierName}
                            </div>
                            <span className="font-mono text-[10px] text-slate-400 font-medium">ID: {inv.supplierId}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-600">
                          {inv.id}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          {inv.amount.toLocaleString()} <span className="text-slate-400 text-[10px] font-medium">{inv.currency}</span>
                        </td>
                        <td className="py-3 px-4 font-sans text-slate-500 font-medium whitespace-nowrap">
                          {inv.maturityDate}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            id={`btn-review-invoice-${inv.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectInvoice(inv.id);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                              inv.status === 'PENDING_VERIFICATION'
                                ? 'bg-[#0052cc]/10 hover:bg-[#0052cc] text-[#0052cc] hover:text-white'
                                : inv.status === 'CONTESTED'
                                ? 'bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            {inv.status === 'PENDING_VERIFICATION' ? 'Review & Sign' : inv.status === 'CONTESTED' ? 'Review Rebuttal' : 'Details'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Module: Funding Request Tracker */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xs p-5" id="funding-request-tracker-card">
            <div className="flex items-center justify-between border-b border-dashed border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="font-sans font-bold text-slate-800 text-sm">
                  Funding Request Tracker
                </h3>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-semibold">
                  Buyer-Originated Funding (Self-Billing)
                </span>
              </div>
              <button
                id="btn-view-all-requests"
                className="text-xs text-[#0052cc] hover:underline font-semibold font-sans flex items-center gap-0.5"
              >
                <span>View All Requests</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {fundingRequests.map((req) => (
                <div 
                  id={`tracker-item-${req.id}`}
                  key={req.id} 
                  className="p-3.5 rounded-xl bg-slate-50/60 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs ${
                      req.status === 'DRAFT'
                        ? 'bg-purple-50 text-purple-600 border border-purple-100'
                        : req.status === 'SUPPLIER_REVIEW'
                        ? 'bg-amber-50 text-amber-600 border border-amber-100'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {req.id.replace('REQ-', '')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-bold text-slate-800 text-xs">
                          {req.id}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold tracking-wider font-mono uppercase ${
                          req.status === 'DRAFT'
                            ? 'bg-purple-100/60 text-purple-800'
                            : req.status === 'SUPPLIER_REVIEW'
                            ? 'bg-amber-100/60 text-amber-800'
                            : 'bg-emerald-100/60 text-emerald-800'
                        }`}>
                          {req.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-slate-600 text-xs font-sans mt-0.5 font-medium">{req.type}</p>
                      <p className="text-slate-400 text-[10px] font-sans font-medium">Goal: USDC {req.amount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-1.5">
                    <span className="font-mono font-bold text-slate-800 text-xs">
                      USDC {req.amount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 font-sans font-medium flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        req.status === 'DRAFT' ? 'bg-purple-500' : req.status === 'SUPPLIER_REVIEW' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                      {req.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3: Liquidity Profile & Key Wallet Details */}
        <div id="dashboard-right-col" className="space-y-6">
          
          {/* Card 1: Liquidity Profile Card matching Screen 5 layout */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xs p-5" id="liquidity-profile-card">
            <h3 className="font-sans font-bold text-slate-800 text-sm mb-4">
              Liquidity Profile
            </h3>

            <div className="bg-[#002e75] text-white p-5 rounded-xl space-y-4 shadow-md relative overflow-hidden" id="available-liquid-indicator">
              {/* Background decorative ring */}
              <div className="absolute right-0 bottom-0 w-32 h-32 rounded-full border border-white/5 pointer-events-none translate-x-10 translate-y-10" />

              <div className="flex justify-between items-start">
                <div>
                  <span className="text-white/60 text-[10px] uppercase tracking-wider font-mono font-semibold">
                    Available Liquidity
                  </span>
                  <div className="text-xl md:text-2xl font-extrabold font-sans tracking-tight mt-1">
                    <span className="text-white/75 text-xs mr-1 font-mono font-bold">USDR / USDC</span>
                    {liquidity.availableLiquidity.toLocaleString('en-US', { minimumFractionDigits: 1 })}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-white/10 text-white border border-white/10 shrink-0">
                  <Coins className="w-4.5 h-4.5" />
                </div>
              </div>

              {/* Action Buttons to test deposit/withdraw */}
              <div className="grid grid-cols-2 gap-2.5 pt-2 relative z-10">
                <button
                  id="btn-deposit-liquidity-dash"
                  onClick={() => setShowDepositModal(true)}
                  className="flex items-center justify-center gap-1 py-2 px-3 bg-white text-slate-900 hover:bg-slate-100 rounded-lg font-sans font-bold text-xs shadow-xs transition-colors"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Deposit</span>
                </button>
                <button
                  id="btn-withdraw-liquidity-dash"
                  onClick={() => setShowWithdrawModal(true)}
                  className="flex items-center justify-center gap-1 py-2 px-3 bg-white/10 hover:bg-white/15 text-white border border-white/15 rounded-lg font-sans font-bold text-xs transition-colors"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5 text-rose-300" />
                  <span>Withdraw</span>
                </button>
              </div>
            </div>

            {/* Wallet Panel nested within Liquidity Profile details */}
            <div className="mt-4 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between" id="wallet-profile-mini">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0052cc]/10 text-[#0052cc] flex items-center justify-center shrink-0">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 text-[9px] uppercase tracking-wider font-mono font-semibold block">Connected Vault</span>
                  <span className="font-sans font-bold text-slate-800 text-xs leading-none">
                    {liquidity.isConnected ? 'Fireblocks Vault' : 'No Wallet Connected'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${liquidity.isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span className="text-[10px] text-slate-500 font-mono">
                  {liquidity.isConnected ? '0x7f2E...3B92' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Upcoming Payment Schedule as shown in Screen 5 */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xs p-5" id="payment-schedule-card">
            <div className="flex items-center justify-between border-b border-dashed border-slate-100 pb-3 mb-4">
              <h3 className="font-sans font-bold text-slate-800 text-sm">
                Payment Schedule
              </h3>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-4">
              <div className="relative pl-5 border-l-2 border-amber-400 py-0.5 animate-in slide-in-from-left-2 duration-150">
                <div className="absolute -left-[6px] top-1.5 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-white" />
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-amber-600 font-bold font-sans uppercase tracking-wider block">Tomorrow</span>
                </div>
                <div className="flex justify-between items-start mt-1">
                  <div>
                    <span className="text-slate-800 font-extrabold text-xs">Apex Tech Supplies</span>
                    <span className="font-mono text-[9px] text-slate-400 block mt-0.5">INV-2023-8901</span>
                  </div>
                  <span className="font-mono font-bold text-xs text-slate-800">USDC 145K</span>
                </div>
                <div className="mt-1.5">
                  <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-extrabold font-mono tracking-wider bg-amber-50 text-amber-700 uppercase border border-amber-100">
                    PENDING REVIEW
                  </span>
                </div>
              </div>

              <div className="relative pl-5 border-l-2 border-emerald-500 py-0.5">
                <div className="absolute -left-[6px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 text-[10px] font-bold font-mono">Oct 18, 2024</span>
                </div>
                <div className="flex justify-between items-start mt-1">
                  <div>
                    <span className="text-slate-800 font-extrabold text-xs">Global Mfg Ltd</span>
                    <span className="font-mono text-[9px] text-slate-400 block mt-0.5">INV-GM-442</span>
                  </div>
                  <span className="font-mono font-bold text-xs text-slate-800">USDC 89.5K</span>
                </div>
                <div className="mt-1.5">
                  <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-extrabold font-mono tracking-wider bg-emerald-50 text-emerald-700 uppercase border border-emerald-100">
                    AUTO-FUND SCHEDULED
                  </span>
                </div>
              </div>

              <div className="relative pl-5 border-l-2 border-slate-200 py-0.5">
                <div className="absolute -left-[6px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white" />
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 text-[10px] font-bold font-mono">Oct 22, 2024</span>
                </div>
                <div className="flex justify-between items-start mt-1">
                  <div>
                    <span className="text-slate-800 font-extrabold text-xs">Batch Payment (3)</span>
                    <span className="font-mono text-[9px] text-slate-400 block mt-0.5">Multiple Invoices</span>
                  </div>
                  <span className="font-mono font-bold text-xs text-slate-800">USDC 310K</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Dialog: Deposit Modal */}
      {showDepositModal && (
        <div id="modal-deposit-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div id="modal-deposit-content" className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="font-sans font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-emerald-500" />
                <span>Deposit USDC Liquidity</span>
              </span>
              <button onClick={() => setShowDepositModal(false)} id="btn-close-modal-dep" className="p-1 hover:bg-slate-100 rounded text-slate-400">✕</button>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Amount to deposit</label>
              <div className="relative">
                <input
                  id="in-deposit-amount"
                  type="number"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full pl-3 pr-14 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#0052cc] text-sm font-mono font-bold"
                />
                <span className="absolute right-3 top-2.5 font-mono text-xs font-bold text-slate-400">USDC</span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                This transaction will pull USDC from your connected wallet (Fireblocks Vault) and make it available in Smart Finux Labs for instant supplier factoring on-demand.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button 
                id="btn-confirm-deposit-action"
                onClick={handleDeposit} 
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-sans font-bold text-xs rounded-lg shadow-xs transition-colors"
              >
                Confirm Deposit
              </button>
              <button onClick={() => setShowDepositModal(false)} id="btn-cancel-modal-dep" className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-sans font-bold text-xs rounded-lg transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Dialog: Withdraw Modal */}
      {showWithdrawModal && (
        <div id="modal-withdraw-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div id="modal-withdraw-content" className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="font-sans font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-rose-500" />
                <span>Withdraw Liquidity</span>
              </span>
              <button onClick={() => setShowWithdrawModal(false)} id="btn-close-modal-with" className="p-1 hover:bg-slate-100 rounded text-slate-400">✕</button>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Amount to withdraw</label>
              <div className="relative">
                <input
                  id="in-withdraw-amount"
                  type="number"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full pl-3 pr-14 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#0052cc] text-sm font-mono font-bold"
                />
                <span className="absolute right-3 top-2.5 font-mono text-xs font-bold text-slate-400">USDC</span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                Maximum withdrawable amount is <span className="font-mono text-slate-900 font-bold">{liquidity.availableLiquidity.toLocaleString()} USDC</span>. This transfers funds back to your private vaults.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button 
                id="btn-confirm-withdraw-action"
                onClick={handleWithdraw} 
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-sans font-bold text-xs rounded-lg shadow-xs transition-colors"
              >
                Confirm Withdrawal
              </button>
              <button onClick={() => setShowWithdrawModal(false)} id="btn-cancel-modal-with" className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-sans font-bold text-xs rounded-lg transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Dialog: Construct New Funding Request Modal */}
      {showNewReqModal && (
        <div id="modal-new-req-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div id="modal-new-req-content" className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="font-sans font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <FileText className="w-5 h-5 text-[#0052cc]" />
                <span>Create New Funding Request</span>
              </span>
              <button onClick={() => setShowNewReqModal(false)} id="btn-close-modal-new-req" className="p-1 hover:bg-slate-100 rounded text-slate-400">✕</button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Request Title / Supplier Type</label>
                <input
                  id="in-new-req-type"
                  type="text"
                  value={newReqType}
                  onChange={(e) => setNewReqType(e.target.value)}
                  placeholder="e.g., Batch payment for 3 suppliers"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#0052cc] font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Total Target Amount (USDC)</label>
                <div className="relative">
                  <input
                    id="in-new-req-amount"
                    type="number"
                    value={newReqAmount}
                    onChange={(e) => setNewReqAmount(e.target.value)}
                    className="w-full pl-3 pr-14 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#0052cc] font-mono font-bold"
                  />
                  <span className="absolute right-3 top-2.5 font-mono text-xs font-bold text-slate-400">USDC</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Workflow Instructions / Notes</label>
                <textarea
                  id="in-new-req-desc"
                  rows={2}
                  value={newReqDesc}
                  onChange={(e) => setNewReqDesc(e.target.value)}
                  placeholder="e.g., Scheduled payment batch awaiting final audit matches..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#0052cc] font-sans"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                id="btn-confirm-create-req"
                onClick={handleCreateRequest} 
                className="flex-1 py-2 bg-[#0052cc] hover:bg-[#0040a2] text-white font-sans font-semibold text-xs rounded-lg shadow-xs transition-colors"
              >
                Submit Draft Request
              </button>
              <button onClick={() => setShowNewReqModal(false)} id="btn-cancel-modal-new-req" className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-sans font-bold text-xs rounded-lg transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
