/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Filter, 
  Download, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Wallet, 
  ChevronRight, 
  X, 
  FileText,
  AlertCircle,
  Hash,
  ArrowUpRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Invoice, LiquidityProfile } from '../types';

interface InvoiceListTabProps {
  invoices: Invoice[];
  liquidity: LiquidityProfile;
  onSelectInvoiceDetails: (invoiceId: string) => void;
  onApproveInvoice: (invoiceId: string) => void;
  onRejectOrDispute: (invoiceId: string) => void;
}

export default function InvoiceListTab({
  invoices,
  liquidity,
  onSelectInvoiceDetails,
  onApproveInvoice,
  onRejectOrDispute,
}: InvoiceListTabProps) {
  // Currently highlighted invoice in the right-side quick review panel
  const [selectedReviewId, setSelectedReviewId] = useState<string>('INV-2026-089');

  // Interactive quick checkbox verification states
  const [confirmReceipt, setConfirmReceipt] = useState(false);
  const [verifyTerms, setVerifyTerms] = useState(false);

  // Success signature confirmation alert after signing
  const [signatureSuccess, setSignatureSuccess] = useState<string | null>(null);

  // Selected quick-review invoice body
  const currentInvoice = invoices.find(inv => inv.id === selectedReviewId) || invoices[0];

  const handleQuickRowClick = (id: string) => {
    setSelectedReviewId(id);
    setConfirmReceipt(false);
    setVerifyTerms(false);
    setSignatureSuccess(null);
  };

  const handleQuickSign = () => {
    if (!confirmReceipt || !verifyTerms) return;
    
    // Simulate web3 / cryptographic signing trigger
    setSignatureSuccess(currentInvoice.id);
    setTimeout(() => {
      onApproveInvoice(currentInvoice.id);
      setSignatureSuccess(null);
      setConfirmReceipt(false);
      setVerifyTerms(false);
    }, 1800);
  };

  // Helper values for headers
  const pendingInvoices = invoices.filter(inv => inv.status === 'PENDING_VERIFICATION');
  const approvedInvoicesVal = invoices.filter(inv => inv.status === 'VERIFIED').reduce((s, x) => s + x.amount, 0);

  return (
    <div id="invoice-list-tab-root" className="space-y-6">
      
      {/* Search/Filter & Export Rows matching Screen 3 */}
      <div id="invoices-header-bar" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-sans">
            Invoice Verification
          </h1>
          <p className="text-slate-500 text-xs mt-1 font-sans">
            Review and approve pending supplier invoices for Acme Corp.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-filter-invoices"
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg border border-[#E5E7EB] active:bg-slate-100 transition-colors font-sans"
          >
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Filter</span>
          </button>
          
          <button
            id="btn-export-invoices"
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg border border-[#E5E7EB] active:bg-slate-100 transition-colors font-sans"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Screen 3 Top Horizontal Card Panels */}
      <div id="invoices-stat-panels" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Panel 1 */}
        <div id="panel-pending-count" className="bg-white p-4.5 rounded-xl border border-[#E5E7EB] hover:shadow-xs transition-all flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold font-sans tracking-tight">Pending Approval</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 font-sans">12</div>
            <span className="text-amber-600 text-xs font-semibold font-sans mt-1 block">$450,000 USDC</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Panel 2 */}
        <div id="panel-approved-count" className="bg-white p-4.5 rounded-xl border border-[#E5E7EB] hover:shadow-xs transition-all flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold font-sans tracking-tight">Approved (30 Days)</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 font-sans">45</div>
            <span className="text-[#0052cc] text-xs font-semibold font-sans mt-1 block">
              $1.2M USDC
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#0052cc]/10 text-[#0052cc] flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Panel 3 */}
        <div id="panel-maturity-count" className="bg-white p-4.5 rounded-xl border border-[#E5E7EB] hover:shadow-xs transition-all flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold font-sans tracking-tight">Upcoming Maturity</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 font-sans">8</div>
            <span className="text-emerald-600 text-xs font-semibold font-sans mt-1 block">Next 7 Days</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Panel 4 */}
        <div id="panel-wallet-balance" className="bg-white p-4.5 rounded-xl border border-[#E5E7EB] hover:shadow-xs transition-all flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold font-sans tracking-tight">Wallet Balance</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 font-sans">
              ${liquidity.availableLiquidity.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
            <span className="text-slate-500 text-xs font-semibold font-sans mt-1 block">Arc Network</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Split View List & Side Review Panel */}
      <div id="invoices-split-view" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Action Required Pending Invoices List */}
        <div id="split-left-list" className="lg:col-span-2 bg-white rounded-xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h3 className="font-sans font-bold text-slate-800 text-sm">
                Action Required: Pending Invoices
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-extrabold uppercase font-mono tracking-wider">
              {pendingInvoices.length} Pending
            </span>
          </div>

          <div className="overflow-x-auto">
            <table id="tbl-verity-queue" className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-slate-50/30 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  <th className="py-2.5 px-4 font-semibold">Supplier</th>
                  <th className="py-2.5 px-4 font-semibold">Invoice ID</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Amount</th>
                  <th className="py-2.5 px-4 font-semibold">Maturity</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-xs">
                {invoices.map((inv) => {
                  const isSelected = selectedReviewId === inv.id;
                  return (
                    <tr 
                      id={`verity-row-${inv.id}`}
                      key={inv.id} 
                      onClick={() => handleQuickRowClick(inv.id)}
                      className={`transition-colors cursor-pointer relative ${
                        isSelected 
                          ? 'bg-slate-50 font-medium' 
                          : 'hover:bg-slate-50/50'
                      }`}
                    >
                      {/* Left border indicator if selected */}
                      {isSelected && (
                        <td className="absolute left-0 top-0 bottom-0 w-1 bg-[#0052cc]" />
                      )}

                      <td className="py-3 px-4">
                        <div>
                          <div className="font-bold text-slate-800 font-sans">{inv.supplierName}</div>
                          <span className="font-mono text-[10px] text-slate-400 font-medium">ID: {inv.supplierId}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-600">
                        {inv.id}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        USD {inv.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-500 font-medium">
                        {inv.maturityDate}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          id={`btn-verity-action-row-${inv.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectInvoiceDetails(inv.id);
                          }}
                          className="px-3 py-1.5 bg-[#0052cc] hover:bg-[#0040a2] text-white text-[11px] font-bold rounded-lg transition-colors shadow-2xs"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Dynamic Quick Verification Sidebar as shown in Screen 3 */}
        <div id="split-right-sidebar" className="bg-white rounded-xl border border-[#E5E7EB] shadow-xs p-5 space-y-5 flex flex-col justify-between relative">
          
          {/* Main header block */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-sans font-bold text-slate-800 text-sm">
                  Invoice Verification
                </h3>
                <span className="font-mono text-[10px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wide">
                  {currentInvoice.id}
                </span>
              </div>
              <button 
                id="btn-close-quick-review"
                onClick={() => setSelectedReviewId('')}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Invoice stats card details */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3 text-xs" id="quick-review-data-block">
              <div>
                <span className="text-slate-400 text-[9px] uppercase font-bold tracking-wider font-mono">From Supplier</span>
                <div className="flex justify-between items-center mt-1">
                  <div>
                    <span className="font-sans font-extrabold text-slate-800 block text-xs">{currentInvoice.supplierName}</span>
                    <span className="font-mono text-[10px] text-slate-400 font-medium">ID: {currentInvoice.supplierId}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                    currentInvoice.status === 'PENDING_VERIFICATION'
                      ? 'bg-amber-100 text-amber-800'
                      : currentInvoice.status === 'CONTESTED'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {currentInvoice.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/50">
                <div>
                  <span className="text-slate-400 text-[9px] uppercase font-bold tracking-wider font-mono">Amount</span>
                  <div className="font-sans font-extrabold text-slate-950 text-sm mt-0.5">
                    ${currentInvoice.amount.toLocaleString()}
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono font-bold block">USDC</span>
                </div>

                <div>
                  <span className="text-slate-400 text-[9px] uppercase font-bold tracking-wider font-mono">Maturity Date</span>
                  <div className="font-sans font-bold text-slate-800 text-xs mt-0.5">
                    {currentInvoice.maturityDate}
                  </div>
                  <span className="text-[10px] text-slate-500 font-sans font-medium block mt-0.5">
                    31 days remaining
                  </span>
                </div>
              </div>
            </div>

            {/* Verification Checklist Requirements */}
            <div id="quick-verification-requirements" className="space-y-3.5 pt-1">
              <span className="text-slate-400 text-[10px] bg-slate-100 px-2 py-0.5 rounded uppercase font-bold tracking-wider font-mono">
                Verification Requirements
              </span>

              {currentInvoice.status !== 'PENDING_VERIFICATION' ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-2 py-6">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                    <Check className="w-5 h-5 stroke-3" />
                  </div>
                  <p className="font-sans font-bold text-slate-800 text-xs">Verification Completed</p>
                  <p className="text-slate-500 text-[11px] font-medium leading-relaxed">
                    This invoice has been cleared. All associated goods receipt matches and identities are logged to the ledger.
                  </p>
                  <button
                    id="btn-quick-full-details"
                    onClick={() => onSelectInvoiceDetails(currentInvoice.id)}
                    className="mt-2 text-xs text-[#0052cc] hover:underline font-semibold font-sans block mx-auto"
                  >
                    View Ledger Receipt
                  </button>
                </div>
              ) : (
                <div id="verification-interactive" className="space-y-3">
                  <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer select-none">
                    <input
                      id="chk-receipt-goods"
                      type="checkbox"
                      checked={confirmReceipt}
                      onChange={(e) => setConfirmReceipt(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#0052cc] focus:ring-[#0052cc]/20 cursor-pointer"
                    />
                    <span className="text-xs text-slate-600 font-medium font-sans leading-relaxed">
                      I confirm receipt of goods/services specified in this invoice.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer select-none">
                    <input
                      id="chk-verify-terms"
                      type="checkbox"
                      checked={verifyTerms}
                      onChange={(e) => setVerifyTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#0052cc] focus:ring-[#0052cc]/20 cursor-pointer"
                    />
                    <span className="text-xs text-slate-600 font-medium font-sans leading-relaxed">
                      I verify accuracy of invoice terms and amounts.
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Action trigger buttons */}
          {currentInvoice.status === 'PENDING_VERIFICATION' && (
            <div className="flex gap-2.5 pt-4 border-t border-slate-100 mt-4 bg-white relative z-10">
              <button
                id="btn-quick-reject"
                onClick={() => onRejectOrDispute(currentInvoice.id)}
                className="flex-1 py-2 px-3 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition-all text-center"
              >
                Reject & Dispute
              </button>
              
              <button
                id="btn-quick-accept-sign"
                disabled={!confirmReceipt || !verifyTerms}
                onClick={handleQuickSign}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all text-center text-white ${
                  confirmReceipt && verifyTerms
                    ? 'bg-[#0052cc] hover:bg-[#0040a2] active:bg-[#003d9b]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200'
                }`}
              >
                Accept & Sign
              </button>
            </div>
          )}

          {/* Ledger detail secondary link */}
          <button
            id="btn-goto-full-details"
            onClick={() => onSelectInvoiceDetails(currentInvoice.id)}
            className="w-full text-center mt-3 pt-2 text-[11px] text-slate-400 hover:text-[#0052cc] transition-colors font-semibold font-sans border-t border-dashed border-slate-100"
          >
            Go to Full Evaluation Page →
          </button>

          {/* Cryptographic Signature Animation Overlay */}
          {signatureSuccess && (
            <div id="signature-signing-overlay" className="absolute inset-0 bg-[#0052cc]/95 rounded-xl flex flex-col items-center justify-center p-6 text-white text-center z-20 animate-in fade-in duration-200">
              <div className="w-12 h-12 rounded-full border-2 border-white/30 border-t-white animate-spin mb-4" />
              <ShieldCheck className="w-10 h-10 text-[#6cf8bb] animate-bounce mb-2" />
              <h4 className="font-sans font-bold text-sm tracking-tight">Generating Crypto-Signature</h4>
              <p className="text-[10px] text-white/70 font-mono mt-1 max-w-[200px]">
                Signing block with Fireblocks Vault key {liquidity.walletAddress.substring(0, 8)}...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Screen 3 Bottom Upcoming Payment Schedule boxes */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5" id="invoices-bottom-schedule">
        <h4 className="font-sans font-bold text-slate-800 text-sm mb-4">
          Upcoming Payment Schedule
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3" id="timeline-payment-flex">
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl" id="time-item-yesterday">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Yesterday</span>
            <span className="font-bold text-slate-400 text-sm font-sans block mt-1">$0.00</span>
            <span className="text-[9px] font-medium text-slate-400 font-sans block mt-0.5">No payments</span>
          </div>

          <div className="p-3.5 bg-[#0052cc]/5 border-2 border-[#0052cc] rounded-xl relative" id="time-item-oct15">
            <span className="text-[10px] text-[#0052cc] uppercase font-mono font-bold block flex items-center justify-between">
              TODAY
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            </span>
            <span className="font-bold text-[#0052cc] text-sm font-sans block mt-1">$25,000</span>
            <span className="text-[9px] font-bold text-amber-600 font-sans block mt-0.5">• 1 Invoice</span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl" id="time-item-oct18">
            <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block">May 25</span>
            <span className="font-bold text-slate-800 text-xs font-sans block mt-1">$150,000</span>
            <span className="text-[9px] font-medium text-[#006c49] font-sans block mt-0.5">• 3 Invoices</span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl" id="time-item-oct20">
            <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block">Jun 01</span>
            <span className="font-bold text-slate-800 text-xs font-sans block mt-1">$85,500</span>
            <span className="text-[9px] font-medium text-amber-600 font-sans block mt-0.5">• 2 Invoices</span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl" id="time-item-oct22">
            <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block">Jun 15</span>
            <span className="font-bold text-slate-800 text-xs font-sans block mt-1">$320,000</span>
            <span className="text-[9px] font-medium text-[#006c49] font-sans block mt-0.5">• 5 Invoices</span>
          </div>
        </div>
      </div>

    </div>
  );
}
