import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Download, 
  CheckCircle, 
  FileText, 
  Upload, 
  AlertTriangle, 
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Info,
  Loader2,
  Building2
} from 'lucide-react';
import { Invoice, MainRoute } from '../types';

interface DisputeViewProps {
  invoice: Invoice;
  onSelectRoute: (route: MainRoute) => void;
  onResolveDispute: (invoiceId: string, updatedParams: {
    status: 'ACCEPTED' | 'PENDING';
    amount?: number;
    qty?: number;
    rebuttalCounterReason?: string;
    rebuttalDetail?: string;
  }) => void;
}

export default function DisputeView({
  invoice,
  onSelectRoute,
  onResolveDispute
}: DisputeViewProps) {
  
  // Resolution choices: 'CORRECT' / Acknowledge vs 'REBUT'
  const [resolutionMode, setResolutionMode] = useState<'CORRECT' | 'REBUT'>('CORRECT');
  
  // Acknowledge subform fields
  const [revisedQty, setRevisedQty] = useState(480);
  const unitPrice = invoice.unitPrice || 100;
  const originalQty = invoice.originalQty || 500;
  
  // Computed adjusted amount
  const adjustedAmount = revisedQty * unitPrice;

  // Rebuttal subform fields
  const [rebuttalCounterReason, setRebuttalCounterReason] = useState('Manifest fully signed on oct 12th logistics dock');
  const [rebuttalDetail, setRebuttalDetail] = useState('All 500 units were tracked, scanned, and signed off under shipment proof B2026-114-AQ. The dispute regarding quantity is invalid; we attach the certified gate manifest.');
  const [rebuttalFileName, setRebuttalFileName] = useState<string | null>(null);
  
  // Loading & success flags
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const executeCorrect = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMsg('Invoice revised and updated successfully!');
      
      // Resolve global state
      onResolveDispute(invoice.id, {
        status: 'ACCEPTED',
        amount: adjustedAmount,
        qty: revisedQty
      });

      // Quick auto route
      setTimeout(() => {
        onSelectRoute('dashboard');
      }, 2000);
    }, 1800);
  };

  const executeRebut = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMsg('Formal Rebuttal submitted to credit arbiters!');
      
      // Resolve global state: Status goes to PENDING (with arbiters reviewing)
      onResolveDispute(invoice.id, {
        status: 'PENDING',
        rebuttalCounterReason,
        rebuttalDetail
      });

      // Quick routing helper
      setTimeout(() => {
        onSelectRoute('dashboard');
      }, 2000);
    }, 1800);
  };

  return (
    <div id="dispute-resolution" className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto w-full animate-fadeIn font-sans">
      
      {/* Top Header Controls with Back button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <button 
            onClick={() => onSelectRoute('dashboard')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-primary lowercase tracking-wider uppercase mb-3 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>Back to Dashboard</span>
          </button>
          
          <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">Dispute Response</h1>
          <p className="text-[14px] text-slate-500 mt-1">
            Resolve outstanding buyer disputes by adjusting invoice parameters or rebutting claims.
          </p>
        </div>

        {/* Informative Walkthrough badge */}
        <div className="bg-red-50 border border-red-200 p-3.5 rounded-[8px] flex items-start gap-2.5 max-w-sm text-xs text-red-950 shadow-3xs">
          <Info className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p>
            You are managing dispute resolution for <span className="font-mono font-bold">{invoice.id}</span>. Selecting <b>Acknowledge & Correct</b> recalculates yields in real-time, while <b>Rebut Dispute</b> uploads formal receipts.
          </p>
        </div>
      </div>

      {/* Invoice Detail Header bar */}
      <div className="bg-slate-900 text-white p-5 rounded-[12px] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle">
        <div className="space-y-1">
          <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase font-bold block">ACTIVE ASSET CASE</span>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold font-mono">{invoice.id}</h2>
            <span className="text-slate-500">•</span>
            <span className="text-sm text-slate-300 font-semibold">{invoice.buyer}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-bold">CURRENT STATUS</span>
          <span className="inline-flex items-center gap-1.5 bg-red-500/20 text-red-400 border border-red-500/40 px-3 py-1 rounded-full text-xs font-extrabold tracking-widest uppercase">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>DISPUTED</span>
          </span>
        </div>
      </div>

      {/* Main Two Column layout */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column Component: BUYER DISPUTE SUMMARY card */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-[12px] p-6 shadow-3xs space-y-6">
          <div className="flex items-center gap-2 text-slate-400 font-bold text-xs tracking-wider uppercase border-b border-slate-100 pb-3">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>BUYER DISPUTE SUMMARY</span>
          </div>

          {/* Dispute details listed */}
          <div className="space-y-4">
            
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Disputing Entity</span>
              <span className="text-slate-800 font-bold text-[14px] flex items-center gap-1.5 mt-1">
                <Building2 className="w-4 h-4 text-slate-400" />
                {invoice.buyer}
              </span>
            </div>

            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Dispute Reason</span>
              <span className="inline-block bg-red-50 text-red-700 border border-red-100 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full mt-1.5 uppercase tracking-wide">
                {invoice.disputeReason}
              </span>
            </div>

            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Evidence Provided</span>
              {invoice.disputeEvidenceFile && (
                <div className="inline-flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-[6px] px-3.5 py-2.5 text-xs text-slate-700 mt-1.5 font-semibold group hover:border-[#0052CC] transition-colors select-all">
                  <FileText className="w-4 h-4 text-slate-400 group-hover:text-[#0052CC]" />
                  <span>{invoice.disputeEvidenceFile}</span>
                  <button onClick={() => alert(`Downloading mock evidence file: ${invoice.disputeEvidenceFile}`)} className="text-[#0052CC] hover:opacity-80 ml-2 cursor-pointer">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-150 p-4 rounded-[8px] space-y-1">
              <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Detailed Description</span>
              <p className="text-[12.5px] text-slate-600 leading-relaxed italic">
                "{invoice.disputeDetailedDescription}"
              </p>
            </div>

          </div>

        </div>

        {/* Right Column Component: DISPUTE RESOLUTION OPTIONS builder */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-[12px] p-6 shadow-3xs space-y-6 relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-[4px] bg-[#0052CC]" />
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-slate-400 font-bold text-xs tracking-wider uppercase flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#0052CC]" />
              <span>DISPUTE RESOLUTION OPTIONS</span>
            </span>
          </div>

          {/* Mode Switch Selection Boxes */}
          <div className="grid sm:grid-cols-2 gap-4">
            
            {/* Box Option 1: CORRECT */}
            <div 
              onClick={() => setResolutionMode('CORRECT')}
              className={`p-4 rounded-[10px] border-2 cursor-pointer transition-all ${
                resolutionMode === 'CORRECT'
                  ? 'border-[#0052CC] bg-[#EBF2FF]/30'
                  : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <input 
                  type="radio" 
                  checked={resolutionMode === 'CORRECT'}
                  onChange={() => setResolutionMode('CORRECT')}
                  className="text-[#0052CC] cursor-pointer"
                />
                <span className="text-[13.5px] font-bold text-slate-900">Acknowledge & Correct</span>
              </div>
              <p className="text-xs text-slate-500 leading-normal">
                Acknowledge the buyer's dispute claim and issue a revised invoice with updated variables.
              </p>
            </div>

            {/* Box Option 2: REBUT */}
            <div 
              onClick={() => setResolutionMode('REBUT')}
              className={`p-4 rounded-[10px] border-2 cursor-pointer transition-all ${
                resolutionMode === 'REBUT'
                  ? 'border-[#0052CC] bg-[#EBF2FF]/30'
                  : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <input 
                  type="radio" 
                  checked={resolutionMode === 'REBUT'}
                  onChange={() => setResolutionMode('REBUT')}
                  className="text-[#0052CC] cursor-pointer"
                />
                <span className="text-[13.5px] font-bold text-slate-900">Rebut Dispute</span>
              </div>
              <p className="text-xs text-slate-500 leading-normal">
                Provide counter-evidence and submit a formal rebuttal to enforce original terms of the asset contract.
              </p>
            </div>

          </div>

          {/* Renderer based on selected Mode choice */}
          {resolutionMode === 'CORRECT' ? (
            
            // Subform if Acknowledge & Correct (Screen 5 Active subform)
            <div className="space-y-5 animate-fadeIn">
              
              <div className="grid grid-cols-3 gap-4 bg-slate-50/70 p-4 rounded-[8px] text-xs border border-slate-150">
                <div>
                  <span className="block text-slate-400 font-bold uppercase text-[9.5px]">Original Qty</span>
                  <span className="text-slate-800 font-bold block mt-0.5">{originalQty} Units</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold uppercase text-[9.5px]">Unit Price</span>
                  <span className="text-slate-800 font-bold block mt-0.5">${unitPrice.toFixed(2)} USDC</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold uppercase text-[9.5px]">Billed Value</span>
                  <span className="text-slate-800 font-bold block mt-0.5 font-mono">${invoice.amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Input for Revised Qty */}
              <div className="space-y-1.5 font-sans">
                <label className="block text-[13px] font-bold text-slate-700">Revised Billed Quantity</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={revisedQty}
                    onChange={(e) => setRevisedQty(parseInt(e.target.value) || 0)}
                    className="w-1/3 bg-slate-50 border border-slate-250 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0052CC] rounded-[6px] px-3 py-2 text-sm font-mono font-bold"
                  />
                  <span className="text-xs text-slate-400 font-bold uppercase">Units</span>
                </div>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  Adjusted to candidate buyer claim quantity of <b>480 units</b>.
                </span>
              </div>

              {/* Live recomputed mathematical values */}
              <div className="bg-blue-50 border border-blue-150 p-4 rounded-[8px] flex items-center justify-between">
                <div>
                  <span className="block text-[10px] text-[#003D9B] uppercase font-bold tracking-wider">Computed Adjusted Amount</span>
                  <p className="text-xs text-slate-500 mt-0.5 mt-1">{revisedQty} units × ${unitPrice.toFixed(2)} USDC</p>
                </div>
                <div>
                  <span className="text-xl font-extrabold text-[#0052CC] font-mono leading-none">
                    ${adjustedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-[#003D9B] font-bold font-mono ml-0.5">USDC</span>
                </div>
              </div>

              {/* Submit Adjustment */}
              <button
                type="button"
                onClick={executeCorrect}
                disabled={isSubmitting}
                className="w-full bg-[#0052CC] hover:bg-[#003D9B] active:bg-brand-primary text-white text-[13.5px] font-bold py-3.5 px-4 rounded-[6px] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Recalculating Ledger Pool...</span>
                  </>
                ) : (
                  <>
                    <span>Issue Revised Invoice</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </div>

          ) : (
            
            // Subform if Rebut Dispute (Screen 6 Active subform)
            <div className="space-y-4 animate-fadeIn">
              
              {/* Short title Reason */}
              <div className="space-y-1">
                <span className="block text-[12.5px] font-bold text-slate-700">Counter Reason</span>
                <input
                  type="text"
                  value={rebuttalCounterReason}
                  onChange={(e) => setRebuttalCounterReason(e.target.value)}
                  placeholder="e.g. Original quantity fully delivered and manifest signed"
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0052CC] rounded-[6px] px-3 py-2 text-sm font-semibold text-slate-800"
                />
              </div>

              {/* Long detailed description */}
              <div className="space-y-1">
                <span className="block text-[12.5px] font-bold text-slate-700">Rebuttal Detail</span>
                <textarea
                  rows={4}
                  value={rebuttalDetail}
                  onChange={(e) => setRebuttalDetail(e.target.value)}
                  placeholder="Provide a detailed defense of your original delivery with tracking metrics..."
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0052CC] rounded-[6px] px-3 py-2 text-sm leading-relaxed text-slate-700"
                />
              </div>

              {/* Evidence drag and drop container */}
              <div className="space-y-1.5 font-sans">
                <span className="block text-[12.5px] font-bold text-slate-700">Rebuttal Evidence File</span>
                
                <div className="border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100/50 rounded-[8px] p-4 text-center cursor-pointer transition-colors relative">
                  {rebuttalFileName ? (
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700 truncate">
                        <FileText className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                        <span>{rebuttalFileName}</span>
                      </div>
                      <button 
                        onClick={() => setRebuttalFileName(null)}
                        className="text-xs text-red-500 font-bold hover:underline cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 text-xs text-slate-500 font-bold cursor-pointer h-[40px] px-4">
                      <Upload className="w-4 h-4 text-slate-400" />
                      <span>Upload signed manifests or receipt logs (PDF, PNG)</span>
                      <input 
                        type="file" 
                        accept=".pdf,.png" 
                        onChange={(e) => setRebuttalFileName(e.target.files?.[0]?.name || null)} 
                        className="hidden" 
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Submit Rebuttal */}
              <button
                type="button"
                onClick={executeRebut}
                disabled={isSubmitting}
                className="w-full bg-[#006C49] hover:bg-emerald-850 active:bg-brand-secondary text-white text-[13.5px] font-bold py-3.5 px-4 rounded-[6px] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing Cryptographic Proof...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Formal Rebuttal</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </div>

          )}

        </div>

      </div>

      {/* Floating success popup banner */}
      {successMsg && (
        <div className="fixed bottom-10 inset-x-6 mx-auto max-w-sm bg-emerald-700 text-white p-4 rounded-[12px] shadow-lg flex items-center gap-3 border border-emerald-500 z-50 animate-slideIn">
          <CheckCircle className="w-6 h-6 text-emerald-100 shrink-0" />
          <div>
            <p className="font-extrabold text-sm">{successMsg}</p>
            <p className="text-[11.5px] text-emerald-50/80 mt-0.5">Asset ledger registry updated successfully. Redirecting...</p>
          </div>
        </div>
      )}

      {/* Auxiliary Help list */}
      <div className="grid sm:grid-cols-3 gap-6 pt-6 border-t border-slate-200">
        <div className="space-y-1">
          <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block">1. Settlement Escrow Lockup</span>
          <p className="text-slate-500 text-xs leading-normal">
            Upon correction, factored yields are automatically rebalanced across the active smart contract escrow.
          </p>
        </div>
        <div className="space-y-1">
          <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block">2. Reputation Guarantee</span>
          <p className="text-slate-500 text-xs leading-normal">
            Prompt, professional resolution of dispute claims prevents downgrading of your standard credit reputation rating.
          </p>
        </div>
        <div className="space-y-1">
          <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block">3. Cryptographic Arbitrary Log</span>
          <p className="text-slate-500 text-xs leading-normal">
            All counter-reason evidence files are hashes directly to the transaction ledger for auditor compliance indexing.
          </p>
        </div>
      </div>

    </div>
  );
}
