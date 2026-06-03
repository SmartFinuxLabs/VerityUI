/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Download, 
  ExternalLink, 
  FileText, 
  ShieldCheck, 
  MessageSquare,
  Scale,
  CheckCircle2,
  AlertTriangle,
  FileCheck2
} from 'lucide-react';
import { Invoice } from '../types';

interface ReviewRebuttalProps {
  invoice: Invoice;
  onBack: () => void;
  onAcceptRebuttal: (invoiceId: string) => void;
  onUpholdDispute: (invoiceId: string) => void;
  onViewOriginal: () => void;
}

export default function ReviewRebuttal({
  invoice,
  onBack,
  onAcceptRebuttal,
  onUpholdDispute,
  onViewOriginal,
}: ReviewRebuttalProps) {
  // Mock prefilled internal reviewer notes state
  const [internalNotes, setInternalNotes] = useState(
    invoice.internalNotes || 'Checked with receiving dock manager, they found the missing 20 units in temporary hold room B...'
  );
  
  // Simulation feedback alert state
  const [showResolutionToast, setShowResolutionToast] = useState<string | null>(null);

  const handleResolveAccept = () => {
    setShowResolutionToast('accepting');
    setTimeout(() => {
      onAcceptRebuttal(invoice.id);
      setShowResolutionToast(null);
    }, 1500);
  };

  const handleResolveReject = () => {
    setShowResolutionToast('upholding');
    setTimeout(() => {
      onUpholdDispute(invoice.id);
      setShowResolutionToast(null);
    }, 1500);
  };

  const disputeInfo = invoice.dispute || {
    reason: 'Quantity Mismatch',
    description: 'Received 480 units instead of 500. Under-delivery logged at dock.',
    evidenceFileName: 'dock_photo_480_pallet.jpg',
    evidenceFileSize: '1.4 MB',
    date: 'Oct 12, 2024'
  };

  const rebuttalInfo = invoice.rebuttal || {
    stance: 'Full Quantity Delivered',
    explanation: 'Our warehouse logs and digital Bill of Lading confirm 500 units were loaded and signed for at the Detroit facility dock. The discrepancy likely occurred during your internal routing from the receiving dock to your primary storage. Attached is the countersigned delivery note showing a count of 500.',
    evidenceFileName: 'signed_delivery_note_500.pdf',
    evidenceFileSize: '1.2 MB',
    date: 'Oct 14, 2024'
  };

  return (
    <div id="review-rebuttal-root" className="space-y-6">
      
      {/* Target heading & Actions exactly as Screen 4 */}
      <div id="rebuttal-header-row" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
        <div className="space-y-1">
          <button
            id="btn-back-from-rebuttal"
            onClick={onBack}
            className="flex items-center gap-1 text-slate-500 hover:text-[#0052cc] text-xs font-bold font-sans tracking-wide uppercase transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Invoices</span>
          </button>
          
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-sans text-slate-900 tracking-tight">
              Review Rebuttal
            </h1>
            <span className="px-2.5 py-0.5 rounded bg-orange-100 text-orange-800 text-[10px] font-bold uppercase font-mono tracking-wider">
              CONTESTED
            </span>
          </div>
          <p className="font-mono text-slate-500 text-[11px] leading-none font-medium">
            Invoice: <span className="font-bold text-slate-700">{invoice.id}</span>  •  Supplier: <span className="font-bold text-slate-700">{invoice.supplierName}</span>
          </p>
        </div>

        {/* Global actions at the top */}
        <div className="flex items-center gap-3 shrink-0" id="rebuttal-main-actions">
          <button
            id="btn-uphold-dispute"
            onClick={handleResolveReject}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-lg border border-[#E5E7EB] shadow-2xs active:bg-slate-100 transition-colors font-sans"
          >
            Uphold Dispute
          </button>

          <button
            id="btn-accept-rebuttal"
            onClick={handleResolveAccept}
            className="px-5 py-2.5 bg-[#0052cc] hover:bg-[#0040a2] active:bg-[#003d9b] text-white font-sans font-bold text-xs rounded-lg shadow-xs transition-colors"
          >
            Accept Rebuttal
          </button>
        </div>
      </div>

      {/* Grid: 2 columns left core items, 1 column right stats */}
      <div id="rebuttal-split-layout" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left main area: Supplier Rebuttal & Original Dispute & Internal notes */}
        <div id="rebuttal-left-col" className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Supplier Rebuttal statement matches Screen 4 */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xs p-5 space-y-4" id="supplier-rebuttal-evidence-card">
            <div className="flex items-center justify-between border-b border-dashed border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Scale className="w-4.5 h-4.5" />
                </div>
                <h3 className="font-sans font-bold text-slate-800 text-sm">
                  Supplier Rebuttal
                </h3>
              </div>
              <span className="text-slate-400 text-[10px] font-sans font-medium">
                Submitted 2 hours ago
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-slate-400 text-[9px] uppercase font-bold tracking-wider font-mono">Supplier Stance</span>
                <span className="inline-block ml-3 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100 font-sans font-bold text-[10px]">
                  {rebuttalInfo.stance}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-405 block text-[10px] font-bold font-sans">Detailed Explanation</span>
                <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-100 text-xs text-slate-700 leading-relaxed font-sans font-medium">
                  "{rebuttalInfo.explanation}"
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-slate-405 block text-[10px] font-bold font-sans">Counter-Evidence</span>
                
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between font-mono text-[11px]" id="evidence-rebuttal-file-chip">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center shrink-0 text-xs font-bold font-sans">
                      PDF
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block leading-none">{rebuttalInfo.evidenceFileName}</span>
                      <span className="text-[9px] text-slate-400 mt-1 block flex items-center gap-1">
                        {rebuttalInfo.evidenceFileSize} • 
                        <span className="text-emerald-600 font-sans font-semibold flex items-center gap-0.5">
                          <ShieldCheck className="w-3.5 h-3.5" /> Verified Signature
                        </span>
                      </span>
                    </div>
                  </div>

                  <button 
                    id="btn-download-rebuttal-file"
                    title="Download counter evidence"
                    className="p-2 border border-slate-105 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-900 transition-colors shrink-0"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Original Dispute Context matches Screen 4 */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xs p-5 space-y-4" id="original-dispute-context-card">
            <div className="flex items-center justify-between border-b border-dashed border-slate-100 pb-3">
              <h3 className="font-sans font-bold text-slate-800 text-sm">
                Original Dispute Context
              </h3>
              <span className="text-slate-400 text-[10px] font-sans font-medium">
                By You • Oct 12, 2024
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <span className="text-slate-400 text-[9px] uppercase font-bold tracking-wider font-mono">Dispute Reason</span>
                <span className="font-sans font-bold text-slate-900 block mt-1.5 flex items-center gap-1 text-rose-600">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {disputeInfo.reason}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-[9px] uppercase font-bold tracking-wider font-mono">Claimed Discrepancy</span>
                <p className="font-sans text-slate-800 font-medium block mt-1.5">
                  {disputeInfo.description}
                </p>
              </div>

              <div className="sm:col-span-2 space-y-1 pt-1 border-t border-slate-100">
                <span className="text-slate-400 text-[9px] uppercase font-bold tracking-wider font-mono">Original Evidence</span>
                <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-2 font-mono text-[10px] text-slate-600 max-w-sm mt-1.5">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="font-bold">{disputeInfo.evidenceFileName}</span>
                  <span className="text-slate-400 ml-auto">{disputeInfo.evidenceFileSize}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Internal Review Notes matches Screen 4 */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xs p-5 space-y-3" id="internal-review-notes-card">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <h3 className="font-sans font-bold text-slate-800 text-sm">
                Internal Review Notes
              </h3>
            </div>
            <p className="text-slate-400 text-[10px] font-sans leading-relaxed">
              Add internal notes before making a final decision. These are not visible to the supplier.
            </p>

            <textarea
              id="txt-internal-review-notes"
              rows={3}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="e.g., Checked with receiving dock manager, they found the missing 20 units..."
              className="w-full px-3.5 py-2.5 border border-slate-200 hover:border-slate-300 focus:border-[#0052cc] rounded-lg outline-none bg-white text-xs text-slate-800 leading-relaxed font-sans"
            />
          </div>

        </div>

        {/* Right Sidebar Column: Invoice Specs details */}
        <div id="rebuttal-right-col" className="space-y-6">
          
          {/* Main Invoice Specs panel */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xs p-5 space-y-4" id="rebuttal-specs-card">
            <div className="flex items-center gap-2 border-b border-dashed border-slate-100 pb-3 mb-2">
              <FileCheck2 className="w-4.5 h-4.5 text-[#0052cc]" />
              <h4 className="font-sans font-bold text-slate-850 text-xs uppercase tracking-wider font-mono">Invoice Details</h4>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-slate-400 text-[9px] uppercase font-bold tracking-wider font-mono block">Invoice ID</span>
                <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">{invoice.id}</span>
              </div>

              <div>
                <span className="text-slate-400 text-[9px] uppercase font-bold tracking-wider font-mono block">Line Item (Contested)</span>
                <span className="font-sans font-extrabold text-slate-900 mt-0.5 block">
                  {invoice.lineItems[0]?.description || 'Industrial Logistics'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 py-2.5 border-y border-slate-100">
                <div>
                  <span className="text-slate-500 text-[10px] font-medium font-sans block">Billed Qty</span>
                  <span className="font-mono font-bold text-slate-800 mt-0.5 block">
                    {invoice.lineItems[0]?.qty || 500}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] font-medium font-sans block">Unit Price</span>
                  <span className="font-mono font-extrabold text-slate-850 mt-0.5 block">
                    ${(invoice.lineItems[0]?.unitPrice || 100.0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="pt-1.5 focus:outline-none">
                <span className="text-slate-400 text-[9px] uppercase font-bold tracking-wider font-mono block">Total Amount</span>
                <div className="text-xl font-extrabold text-[#0052cc] font-sans tracking-tight mt-1">
                  <span className="text-slate-550 text-xs font-mono font-bold mr-1">USD</span>
                  ${(invoice.grossAmount || invoice.amount).toLocaleString()}.00
                </div>
              </div>

              <a 
                href="#original-invoice" 
                onClick={(e) => { e.preventDefault(); onViewOriginal(); }}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-slate-150 hover:bg-slate-50 text-slate-500 hover:text-slate-800 font-semibold font-sans rounded-lg transition-all text-[11px]"
              >
                <span>View Full Original Invoice</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Resolution state overlays matching system loading/confirmation locks */}
      {showResolutionToast && (
        <div id="resolution-block-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-[#ffffff] text-center z-50">
          <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl shadow-2xl max-w-sm w-full space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white animate-spin mx-auto" />
            
            <div className="space-y-1">
              <h4 className="font-sans font-bold text-sm tracking-tight text-white">
                {showResolutionToast === 'accepting' ? 'Resolving Dispute...' : 'Upholding Dispute...'}
              </h4>
              <p className="text-[10px] text-slate-400 font-mono mt-1">
                Writing block signature & updating state on-ledger...
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
