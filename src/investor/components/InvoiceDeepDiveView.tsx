/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowUpRight, 
  MapPin, 
  Users, 
  Calculator, 
  FileCheck, 
  UserCheck, 
  BadgeCheck, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  ShieldCheck, 
  FileText, 
  Copy, 
  Check, 
  Calendar, 
  Workflow, 
  FileSignature, 
  Building2,
  TrendingUpIcon,
  CheckCircle2
} from 'lucide-react';
import { Invoice, Settlement, ActiveScreen } from '../types';
import { getFundingStatusDisplay } from '../../lib/fundingStatusDisplay';
import { getInvoiceStatusDisplay } from '../../lib/invoiceStatusDisplay';

interface InvoiceDeepDiveViewProps {
  onNavigate: (screen: ActiveScreen) => void;
  selectedInvoice: Invoice | null;
  availableCapital: number;
  onFundInvoice: (invoiceId: string, amount: number) => void | Promise<void>;
  onTriggerSuccess: (title: string, amount: string | number, hash: string, details: Record<string, string>) => void;
  onBack: () => void;
}

export default function InvoiceDeepDiveView({
  onNavigate,
  selectedInvoice,
  availableCapital,
  onFundInvoice,
  onTriggerSuccess,
  onBack
}: InvoiceDeepDiveViewProps) {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  if (!selectedInvoice) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center" id="empty-deep-dive">
        <Workflow className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="font-bold text-slate-800 text-base">Select active Invoice for Deep Dive</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Return to the Dashboard or Invoice Marketplace to browse active institutional invoices and evaluate cryptographic verification protocols.
        </p>
        <button 
          onClick={() => onNavigate('direct-funding')}
          className="mt-4 bg-brand-primary text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition"
        >
          View Dashboard
        </button>
      </div>
    );
  }

  const inv = selectedInvoice;

  // Calculative financial parameters
  const faceValue = inv.faceValue;
  const advanceAmount = faceValue * 0.9;
  const retention = faceValue * 0.1;
  const expectedYield = faceValue * (inv.discount / 100);
  const fundingStatusDisplay = getFundingStatusDisplay(inv.fundingStatus);
  const invoiceStatusDisplay = getInvoiceStatusDisplay(inv.invoiceStatus ?? inv.status);

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleFundConfirmation = async () => {
    // Check if enough available capital
    if (availableCapital < advanceAmount) {
      alert(`Insufficient Available Capital ($${availableCapital.toLocaleString()}) to resource the advance requirement ($${advanceAmount.toLocaleString()}) of this invoice. Please bridge liquidity inside the 'Liquidity & Marketplace' dashboard first.`);
      onNavigate('liquidity-marketplace');
      return;
    }

    try {
      await onFundInvoice(inv.id, advanceAmount);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Investor funding failed.');
      return;
    }

    const txHash = '0xfund' + Array.from({ length: 40 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('').substring(0, 10) + '...' + Array.from({ length: 4 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    onTriggerSuccess(
      "Invoice Funded Successfully",
      advanceAmount,
      txHash,
      {
        "Invoice Standard": inv.id,
        "Obligor Payer": inv.obligor,
        "Dynamic APR Equivalent": `${(inv.discount * (365 / inv.maturity)).toFixed(1)}%`,
        "Expected Payout": `$${(advanceAmount + expectedYield).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
      }
    );
  };

  return (
    <div className="space-y-6 animate-fade-in" id="invoice-deep-dive-view">
      
      {/* Top Breadcrumb Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider flex items-center space-x-2">
            <span>Marketplace</span>
            <span>&gt;</span>
            <span>Logistics &amp; Supply</span>
            <span>&gt;</span>
            <span className="font-mono text-brand-primary">{inv.id}</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight mt-1">
            Invoice Deep Dive: <span className="font-mono font-bold text-slate-700">{inv.id}</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            {inv.description}
          </p>
        </div>

        {/* Dynamic Trust badging */}
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-bold text-slate-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded">
            {inv.buyerRating} CREDIT RATED
          </span>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>VERIFIED ASSET</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Invoice Status</p>
          <p className="mt-1 text-sm font-extrabold text-slate-900">{invoiceStatusDisplay.label}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Funding Status</p>
          <span className={`mt-1 inline-flex rounded-[6px] border px-2.5 py-1 text-[11px] font-bold ${fundingStatusDisplay.className}`}>
            {fundingStatusDisplay.label}
          </span>
          {inv.fundingOfferId && <p className="mt-1 font-mono text-[10px] text-slate-400">{inv.fundingOfferId}</p>}
        </div>
      </div>

      {/* Main Grid: timeline / sub-cards (Col 8) and Summary Box (Col 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="deep-dive-body">
        
        {/* Left Side Content Column (Col 8) */}
        <div className="lg:col-span-8 space-y-6" id="deep-dive-left">
          
          {/* Verifiable Truth Audit Trail (Timeline) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-primary" />
                <span>Verifiable Truth™ Audit Trail</span>
              </h3>
              <span className="text-[10px] font-bold font-mono text-slate-400">Ledger Secured</span>
            </div>

            {/* Stepper Timeline list */}
            <div className="relative pl-6 border-l-2 border-slate-100 space-y-5" id="audit-trail-timeline">
              
              {/* Step 1 */}
              <div className="relative pb-1">
                <div className="absolute left-0 top-0.5 -translate-x-[31px] w-5 h-5 rounded-full bg-brand-primary text-white flex items-center justify-center font-mono text-[9px] shadow-sm">1</div>
                
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                      <span>Purchase Order Issued</span>
                      <span className="font-mono text-[10px] bg-slate-50 text-slate-500 px-1 border border-slate-100 rounded font-normal">{inv.poNumber}</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">{inv.poDate}</p>
                    <div className="mt-1 flex items-center space-x-1 text-[10px] font-mono text-slate-400">
                      <span>Hash:</span>
                      <button 
                        onClick={() => handleCopy(`0x8a2f${inv.id}e91`)}
                        className="hover:text-brand-primary flex items-center space-x-0.5"
                      >
                        <span className="underline pr-0.5">0x8a2f...4e91</span>
                        {copiedHash === `0x8a2f${inv.id}e91` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      alert(`Loading cryptographically validated system transcript representing PO contract values for matching node index: PO-9902.`);
                    }}
                    className="text-[10px] font-bold text-brand-primary hover:underline flex items-center space-x-0.5"
                  >
                    <span>View PDF</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative pb-1">
                <div className="absolute left-0 top-0.5 -translate-x-[31px] w-5 h-5 rounded-full bg-brand-primary text-white flex items-center justify-center font-mono text-[9px] shadow-sm">2</div>
                
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                      <span>Goods Receipt Note (GRN)</span>
                      <span className="text-[9px] uppercase tracking-wider bg-emerald-50 text-emerald-700 px-1.5 font-bold border border-emerald-100 rounded">Matched</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">Confirmed by {inv.grnWarehouse} • {inv.grnDate}</p>
                    <div className="mt-1 flex items-center space-x-1 text-[10px] font-mono text-slate-400">
                      <span>Hash:</span>
                      <button 
                        onClick={() => handleCopy(`0xf31b${inv.id}a20d`)}
                        className="hover:text-brand-primary flex items-center space-x-0.5"
                      >
                        <span className="underline pr-0.5">0xf31b...a20d</span>
                        {copiedHash === `0xf31b${inv.id}a20d` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="absolute left-0 top-0.5 -translate-x-[31px] w-5 h-5 rounded-full bg-brand-primary text-white flex items-center justify-center font-mono text-[9px] shadow-sm">3</div>
                
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                      <span>Final Buyer Acceptance</span>
                      <span className="text-[9px] uppercase tracking-wider bg-indigo-50 text-indigo-700 px-1.5 font-bold border border-indigo-100 rounded">Authenticated</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">Digital Signature: {inv.signatureName} ({inv.signatureDivision}) • {inv.signatureDate}</p>
                    <div className="mt-1 flex items-center space-x-1 text-[10px] font-mono text-slate-400">
                      <span>Hash:</span>
                      <button 
                        onClick={() => handleCopy(`0xbb22${inv.id}110c`)}
                        className="hover:text-brand-primary flex items-center space-x-0.5"
                      >
                        <span className="underline pr-0.5">0xbb22...110c</span>
                        {copiedHash === `0xbb22${inv.id}110c` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Subcard Row: Buyer Profile & Supplier History */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="profile-history-grid">
            
            {/* Buyer Profile */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Buyer Credit Profile</h4>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-500/10 flex items-center justify-center bg-emerald-50 shrink-0">
                    <span className="font-mono font-extrabold text-emerald-700 text-sm">{inv.verityScore}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Verity Score: AAA</span>
                    <span className="text-[10px] text-slate-400">Top 2% of Institutional Payers</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-3 text-xs mb-3">
                  <div>
                    <span className="text-slate-400 block font-medium">Payment Delinquency</span>
                    <span className="text-emerald-600 font-bold font-mono mt-0.5 block">{inv.paymentDelinquency}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Avg Days Beyond Term</span>
                    <span className="text-emerald-600 font-bold font-mono mt-0.5 block">{inv.avgDaysBeyondTerm} Days</span>
                  </div>
                </div>
              </div>

              {/* Segmented green progress bar */}
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-1.5 flex-1 bg-emerald-500 rounded-full"></div>
                ))}
              </div>
            </div>

            {/* Supplier History */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Supplier History</h4>
                
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-slate-505" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">{inv.supplier}</span>
                    <span className="text-[10px] text-slate-400">Client since 2022 • 142 Settlements</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-3 text-xs mb-3">
                  <div>
                    <span className="text-slate-400 block font-medium">Dispute Ratio</span>
                    <span className="text-emerald-600 font-semibold font-mono mt-0.5 block">{inv.disputeRatio}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Retention Release Rate</span>
                    <span className="text-emerald-600 font-semibold font-mono mt-0.5 block">{inv.retentionReleaseRate}%</span>
                  </div>
                </div>
              </div>

              {/* Segmented green progress bar */}
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= 5 ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                ))}
              </div>
            </div>

          </div>

          {/* Underlay row: Network Liquidity Strength & Primary Buyer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="underlay-grid-blocks">
            
            {/* Liquidity strength block */}
            <div className="bg-brand-primary p-5 rounded-xl text-white shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-[10px] font-bold text-brand-on-primary-container uppercase tracking-wide block mb-3">Network Liquidity Strength</h4>
                <p className="text-xs leading-relaxed font-light text-brand-on-primary-container">
                  This asset is backed by {inv.obligor}'s {inv.marketCap} quarterly procurement budget, currently operating at 112% liquidity coverage.
                </p>
              </div>
            </div>

            {/* Primary Buyer Profile */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Primary Buyer</h4>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-900 text-white font-bold font-mono text-xs flex items-center justify-center rounded-lg shrink-0">
                  {inv.nyseSymbol}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{inv.obligor} (NYSE: {inv.nyseSymbol})</h4>
                  <div className="flex flex-wrap text-[10px] mt-1 gap-2 border-t border-slate-100 pt-1.5 text-slate-400 font-medium">
                    <span>Market Cap: {inv.marketCap}</span>
                    <span>•</span>
                    <span>S&P Rating: {inv.spRating}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right Side Investment Summary Box (Col 4) */}
        <div className="lg:col-span-4" id="deep-dive-sidebar">
          
          {/* Summary Box */}
          <div className="bg-white rounded-xl border-2 border-brand-primary shadow-[0px_6px_20px_rgba(0,82,204,0.06)] overflow-hidden flex flex-col justify-between" id="investment-summary-card">
            
            {/* Header banner */}
            <div className="bg-brand-primary text-white p-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-on-primary-container">Investment Summary</span>
              <h3 className="font-extrabold text-base tracking-wide mt-1">{inv.id}</h3>
            </div>

            <div className="p-5 space-y-4">
              
              {/* Financial values stack */}
              <div className="space-y-3.5 border-b border-slate-100 pb-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-medium">Invoice Face Value</span>
                  <span className="text-sm font-bold font-mono text-slate-800">${faceValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between items-center bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100/35">
                  <div>
                    <span className="text-xs text-indigo-700 font-bold block">Advance Amount (90%)</span>
                    <span className="text-[10px] text-slate-400">Total Capital Committed</span>
                  </div>
                  <span className="text-base font-extrabold font-mono text-indigo-700">${advanceAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-medium">Retention (10%)</span>
                  <span className="text-xs font-semibold font-mono text-slate-700">${retention.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between items-center bg-emerald-50/40 p-2 border border-emerald-100/30 rounded-lg text-xs">
                  <div>
                    <span className="text-emerald-700 font-bold block">Expected Net Yield</span>
                    <span className="text-[9px] text-slate-400">Projected {inv.discount.toFixed(1)}% ({((inv.discount * 365) / inv.maturity).toFixed(1)}% APY equiv)</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 text-sm">+${expectedYield.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Maturity calendars parameters */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Maturity Date:</span>
                  </span>
                  <span className="font-bold text-slate-800 font-mono">Oct 15, 2026 ({inv.maturity} Days)</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 inline-flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Insurance:</span>
                  </span>
                  <span className="font-bold text-slate-800 font-mono text-[11px]">Standard Lloyds Coverage</span>
                </div>
              </div>

              {/* Interactive Fund Actions */}
              <div className="pt-3 space-y-2">
                {inv.status === 'Funded' || inv.status === 'Settled' ? (
                  <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 p-3 rounded-lg text-center font-bold text-xs flex items-center justify-center space-x-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-500" />
                    <span>In-Ledger Capital Disbursed</span>
                  </div>
                ) : (
                  <button
                    onClick={handleFundConfirmation}
                    className="w-full bg-brand-primary hover:bg-brand-primary-container text-white py-3 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center space-x-1.5 shadow cursor-pointer active:scale-95"
                  >
                    <BadgeCheck className="w-4 h-4 text-emerald-400" />
                    <span>Approve &amp; Fund Invoice</span>
                  </button>
                )}

                <button 
                  onClick={() => {
                    alert(`Compiling risk evaluation metrics for obligor: ${inv.obligor}. S&P evaluation context is appended.`);
                  }}
                  className="w-full border border-slate-200 hover:bg-slate-50 text-slate-600 py-2.5 text-xs font-bold rounded-lg transition"
                >
                  Download Risk Assessment
                </button>
              </div>

              {/* Disclaimer */}
              <p className="text-[10px] text-slate-400 leading-normal text-center pt-2 font-light">
                By clicking Approve &amp; Fund, you authorize the immediate matching of digital assets and disburse {inv.poDate} smart contract values under local factoring protocols.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
