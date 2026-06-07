/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ExternalLink, 
  CheckCircle2, 
  Trash2,
  X, 
  AlertTriangle, 
  Upload, 
  FileText, 
  FileSignature, 
  ShieldCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Invoice, LiquidityProfile } from '../types';
import { getInvoiceDisplayNumber } from '../../lib/invoiceDisplay';
import { getSupplierDisplayName } from '../../lib/supplierDisplay';

interface InvoiceVerificationProps {
  invoice: Invoice;
  liquidity: LiquidityProfile;
  onBack: () => void;
  onAcceptAndSign: (invoiceId: string) => void;
  onSubmitDispute: (invoiceId: string, reason: string, description: string, filename: string, filesize: string) => void;
}

export default function InvoiceVerification({
  invoice,
  liquidity,
  onBack,
  onAcceptAndSign,
  onSubmitDispute,
}: InvoiceVerificationProps) {
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [acknowledgedTerms, setAcknowledgedTerms] = useState(false);
  const [signingInProgress, setSigningInProgress] = useState(false);
  const [signCompleteText, setSignCompleteText] = useState(false);

  // Dispute form values
  const [disputeReason, setDisputeReason] = useState('Quantity Mismatch');
  const [disputeDesc, setDisputeDesc] = useState('Provide a detailed explanation of the discrepancy to facilitate faster resolution with the supplier...');
  const [disputedFile, setDisputedFile] = useState<{name: string, size: string} | null>({
    name: 'receiving_report_v2.pdf',
    size: '2.4 MB'
  });
  const supplierDisplayName = getSupplierDisplayName(invoice);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropMockFile = (e: React.DragEvent) => {
    e.preventDefault();
    setDisputedFile({
      name: 'quality_report_089.xlsx',
      size: '1.8 MB'
    });
  };

  const submitDisputeAction = () => {
    if (!disputeReason || !disputeDesc) return;
    const fname = disputedFile ? disputedFile.name : 'no_attachment.pdf';
    const fsize = disputedFile ? disputedFile.size : '0 KB';
    onSubmitDispute(invoice.id, disputeReason, disputeDesc, fname, fsize);
    setShowDisputeModal(false);
  };

  const handleSigningAccept = () => {
    if (!acknowledgedTerms) return;
    setSigningInProgress(true);
    setTimeout(() => {
      onAcceptAndSign(invoice.id);
      setSigningInProgress(false);
      setSignCompleteText(true);
    }, 2000);
  };

  return (
    <div id="invoice-verification-root" className="space-y-6">
      
      {/* Top back & Header action bar matching Screen 1 */}
      <div id="verification-header-row" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div className="space-y-1">
          <button
            id="btn-back-to-overviews"
            onClick={onBack}
            className="flex items-center gap-1 text-slate-500 hover:text-[#0052cc] text-xs font-bold font-sans tracking-wide uppercase transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Buyer Review</span>
          </button>
          
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold font-sans text-slate-900 tracking-tight">
              Invoice Verification
            </h1>
            <span className="font-mono text-slate-500 text-xs font-medium px-2 py-0.5 bg-slate-100 rounded">
              {getInvoiceDisplayNumber(invoice)}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-sans uppercase tracking-wider ${
              invoice.status === 'PENDING_VERIFICATION' 
                ? 'bg-amber-50 text-amber-600 border border-amber-200 animate-pulse'
                : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
            }`}>
              • {invoice.status.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Supplier & Amount Info Strip matches Screen 1 Header Block */}
      <div id="verification-supplier-strip" className="bg-white rounded-xl border border-[#E5E7EB] p-5 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-xs">
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-bold font-sans tracking-tight block">Supplier</span>
          <div className="flex items-center gap-2.5 mt-2">
            <div className="w-9 h-9 rounded-lg bg-[#003d9b]/10 text-[#003d9b] font-bold text-sm flex items-center justify-center font-mono shrink-0 select-none">
              TS
            </div>
            <div>
              <span className="font-sans font-bold text-slate-950 text-sm leading-none block">
                {supplierDisplayName}
              </span>
              <span className="font-mono text-[10px] text-slate-400 font-medium mt-1 block">
                ID: {invoice.walletAddress}
              </span>
            </div>
          </div>
        </div>

        <div>
          <span className="text-slate-400 text-[10px] uppercase font-bold font-sans tracking-tight block">Invoice Amount</span>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-950 font-sans tracking-tight">
              ${(invoice.grossAmount || invoice.amount).toLocaleString()}
            </span>
            <span className="font-mono text-xs font-bold text-slate-500">{invoice.currency}</span>
          </div>
        </div>

        <div>
          <span className="text-slate-400 text-[10px] uppercase font-bold font-sans tracking-tight block">Maturity Date</span>
          <div className="mt-2 flex items-center gap-2 text-slate-800">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="font-sans font-bold text-sm">{invoice.maturityDate}</span>
          </div>
        </div>
      </div>

      {/* Matching & Evidence layout module matches Screen 1 Section */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xs overflow-hidden" id="card-matching-evidence">
        <div className="px-5 py-3.5 border-b border-[#E5E7EB] bg-slate-50/50 flex items-center gap-2">
          <FileText className="w-4.5 h-4.5 text-[#0052cc]" />
          <h3 className="font-sans font-bold text-slate-800 text-sm">
            Matching & Evidence
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-[#E5E7EB]">
          {/* Linked Documents list - left 2 columns */}
          <div className="lg:col-span-2 p-5 space-y-4" id="evidence-linked-docs-sub">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider font-mono block">
              Linked Documents
            </span>

            <div className="space-y-3">
              <a 
                href="#download-po" 
                onClick={(e) => e.preventDefault()}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-[#0052cc]/40 bg-slate-50/50 hover:bg-white transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#0052cc]/10 text-[#0052cc] flex items-center justify-center">
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="font-sans font-bold text-slate-850 text-xs block">Purchase Order</span>
                    <span className="font-mono text-[9px] text-slate-400 font-semibold">{invoice.poNumber}</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#0052cc] transition-colors" />
              </a>

              <a 
                href="#download-goods-receipt" 
                onClick={(e) => e.preventDefault()}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-[#0052cc]/40 bg-slate-50/50 hover:bg-white transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100/60 text-emerald-700 flex items-center justify-center">
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="font-sans font-bold text-slate-850 text-xs block">Goods Receipt</span>
                    <span className="font-mono text-[9px] text-slate-400 font-semibold">{invoice.goodsReceiptNumber}</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </a>
            </div>
          </div>

          {/* System Validations column - right 3 columns */}
          <div className="lg:col-span-3 p-5 space-y-4" id="evidence-system-validations-sub">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider font-mono block">
              System Validation
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {invoice.validations.map((check) => (
                <div 
                  id={`validation-item-${check.key}`}
                  key={check.key} 
                  className="flex items-start gap-2.5 p-1"
                >
                  <CheckCircle2 className={`w-4.5 h-4.5 mt-0.5 shrink-0 ${
                    check.status === 'passed' ? 'text-emerald-500' : 'text-rose-500'
                  }`} />
                  <div>
                    <span className="font-sans font-bold text-slate-900 text-xs leading-none block">
                      {check.name}
                    </span>
                    <span className="text-slate-500 font-mono text-[10px] mt-1 block">
                      {check.detail}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Line Items Table matches Screen 1 List structure */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xs overflow-hidden" id="card-line-items">
        <div className="px-5 py-3.5 border-b border-[#E5E7EB] bg-slate-50/50">
          <h3 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">
            Line Items
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table id="tbl-line-items-verify" className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-slate-50/30 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                <th className="py-3 px-5">Description</th>
                <th className="py-3 px-5 text-center">QTY</th>
                <th className="py-3 px-5 text-right">Unit Price</th>
                <th className="py-3 px-5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] font-sans text-xs">
              {invoice.lineItems.map((item, idx) => (
                <tr id={`line-row-${idx}`} key={idx} className="hover:bg-slate-50/30 transition-colors">
                  <td className="py-4 px-5 font-bold text-slate-800 font-sans">
                    {item.description}
                  </td>
                  <td className="py-4 px-5 text-center font-mono font-bold text-slate-900">
                    {item.qty}
                  </td>
                  <td className="py-4 px-5 text-right font-mono font-medium text-slate-500">
                    ${item.unitPrice.toFixed(2)}
                  </td>
                  <td className="py-4 px-5 text-right font-mono font-bold text-slate-950">
                    ${item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Buyer Signing Statement Panel matches Screen 1 Bottom Panel */}
      <div 
        id="buyer-signing-statement-card"
        className={`bg-white rounded-xl border-l-4 p-5 md:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${
          invoice.status === 'PENDING_VERIFICATION' 
            ? 'border-l-[#003d9b]' 
            : 'border-l-emerald-500 bg-emerald-50/10'
        }`}
      >
        <div className="space-y-3 max-w-2xl">
          <h3 className="font-sans font-bold text-slate-800 text-sm">
            Buyer Signing Statement
          </h3>
          <p className="text-slate-500 text-xs leading-relaxed font-sans font-medium">
            By accepting, you confirm that goods/services have been received satisfactorily and irrevocably commit to paying this invoice upon maturity. This action will create a legally binding digital asset.
          </p>

          {invoice.status === 'PENDING_VERIFICATION' ? (
            <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
              <input
                id="chk-terms-verify-screen-1"
                type="checkbox"
                checked={acknowledgedTerms}
                onChange={(e) => setAcknowledgedTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#003d9b] focus:ring-[#003d9b]/20 cursor-pointer"
              />
              <span className="text-xs text-slate-700 font-semibold font-sans">
                I acknowledge the terms and authorize the cryptographic signing of this acceptance.
              </span>
            </label>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold font-sans text-xs pt-1">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
              <span>Cryptographic Signature generated via Vault {liquidity.walletAddress.substring(0, 8)} on {invoice.signedAt || 'today'}.</span>
            </div>
          )}
        </div>

        {/* Action Triggers */}
        {invoice.status === 'PENDING_VERIFICATION' && (
          <div className="flex gap-2.5 shrink-0 self-end md:self-center" id="statement-actions">
            <button
              id="btn-dispute-trigger-main"
              onClick={() => setShowDisputeModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-lg shadow-2xs active:bg-red-200 transition-colors font-sans"
            >
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>Dispute</span>
            </button>

            <button
              id="btn-accept-sign-trigger-main"
              disabled={!acknowledgedTerms || signingInProgress}
              onClick={handleSigningAccept}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-sans font-bold text-xs shadow-xs transition-all ${
                acknowledgedTerms && !signingInProgress
                  ? 'bg-[#003d9b] hover:bg-[#002e75] active:bg-[#001d4a]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed border-slate-200 shadow-none'
              }`}
            >
              {signingInProgress ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  <span>Signing Vault Block...</span>
                </>
              ) : (
                <>
                  <FileSignature className="w-4 h-4" />
                  <span>Accept & Sign</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Dynamic Dispute Invoice Modal matches Screen 2 */}
      {showDisputeModal && (
        <div id="dispute-modal-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-205">
          <div id="dispute-modal-container" className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden max-h-[90vh]">
            
            {/* Header matches Screen 2 */}
            <div className="px-6 py-4.5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
                  <AlertTriangle className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-slate-900 text-sm">Dispute Invoice</h3>
                  <p className="text-[11px] text-slate-500 font-sans font-medium mt-0.5">Initiate a resolution process for discrepancies.</p>
                </div>
              </div>
              <button 
                id="btn-close-dispute-modal-x"
                onClick={() => setShowDisputeModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-650 transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Scrollable Modal Body matches Screen 2 */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 select-none font-sans text-xs text-slate-700">
              {/* Warning strip */}
              <div id="dispute-modal-warning" className="p-3.5 pb-4 bg-amber-50 rounded-xl border border-amber-100 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs uppercase font-sans">
                  <AlertCircle className="w-4 h-4" />
                  <span>Attention Required</span>
                </div>
                <p className="text-amber-800 text-[11px] font-medium leading-relaxed">
                  Filing a dispute will pause this invoice's eligibility for factoring until the resolution process is completed. The supplier will be notified immediately.
                </p>
              </div>

              {/* Invoice Specs summary */}
              <div id="dispute-modal-specs" className="p-4 rounded-xl border border-slate-100 bg-slate-50/40">
                <span className="text-slate-400 text-[9px] uppercase font-bold tracking-wider font-mono">Invoice Details</span>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                  <div>
                    <span className="text-slate-405 block text-[10px] font-medium font-sans">Invoice Number</span>
                    <span className="font-mono font-bold text-slate-800 mt-1 block">{getInvoiceDisplayNumber(invoice)}</span>
                  </div>

                  <div>
                    <span className="text-slate-405 block text-[10px] font-medium font-sans">Supplier</span>
                    <span className="font-sans font-bold text-slate-800 mt-1 block">{supplierDisplayName}</span>
                  </div>

                  <div>
                    <span className="text-slate-405 block text-[10px] font-medium font-sans">Issue Date</span>
                    <span className="font-sans font-bold text-slate-800 mt-1 block">Oct 12, 2024</span>
                  </div>

                  <div>
                    <span className="text-slate-405 block text-[10px] font-medium font-sans">Amount</span>
                    <span className="font-mono font-bold text-slate-900 mt-1 block">USDC {(invoice.grossAmount || invoice.amount).toLocaleString()}.00</span>
                  </div>
                </div>
              </div>

              {/* Input: Dispute Reason dropdown */}
              <div className="space-y-1.5">
                <label className="text-slate-650 font-bold block text-[11px] font-sans">
                  Dispute Reason <span className="text-rose-500">*</span>
                </label>
                <select
                  id="sel-dispute-reason"
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 hover:border-slate-300 focus:border-[#0052cc] rounded-lg outline-none bg-white text-slate-800 font-sans"
                >
                  <option value="Quantity Mismatch">Quantity Mismatch (Billed amount doesn't match physical count)</option>
                  <option value="Price/Rate Discrepancy">Price / Rate Discrepancy (Rate is different from pre-agreed PO)</option>
                  <option value="Product Damaged/Defective">Product Damaged or Defective (Cargo damaged in transit)</option>
                  <option value="Duplicate Submission">Erroneous Duplicate Submission</option>
                </select>
              </div>

              {/* Input: Detailed Description */}
              <div className="space-y-1.5">
                <label className="text-slate-650 font-bold block text-[11px] font-sans">
                  Detailed Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="txt-dispute-desc"
                  rows={3}
                  value={disputeDesc}
                  onChange={(e) => setDisputeDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 focus:border-[#0052cc] rounded-lg outline-none bg-white text-slate-800 font-sans"
                />
              </div>

              {/* Input: Drag 'n drop upload with pre-allocated sample file receiving_report_v2.pdf */}
              <div className="space-y-1.5">
                <label className="text-slate-650 font-bold block text-[11px] font-sans">
                  Supporting Evidence
                </label>

                {/* Simulated file drop container */}
                <div 
                  id="drop-zone-dispute"
                  onDragOver={handleDragOver}
                  onDrop={handleDropMockFile}
                  className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors flex flex-col items-center justify-center gap-1.5"
                >
                  <Upload className="w-7 h-7 text-slate-400" />
                  <span className="text-xs text-[#0052cc] font-bold font-sans hover:underline cursor-pointer block">
                    Upload files
                  </span>
                  <span className="text-[10px] text-slate-400">or drag and drop</span>
                  <span className="text-[9px] text-[#737685] font-semibold mt-1">PNG, JPG, PDF up to 10MB each</span>
                </div>

                {/* Row showing current evidence matches Screen 2 */}
                {disputedFile && (
                  <div 
                    id="mock-disputed-file-row"
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between mt-2 font-mono text-[11px]"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4.5 h-4.5 text-slate-500" />
                      <span className="font-bold text-slate-700">{disputedFile.name}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-slate-400">{disputedFile.size}</span>
                      <button 
                        id="btn-remove-disputed-file"
                        onClick={() => setDisputedFile(null)}
                        className="text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Buttons row matches Screen 2 */}
            <div className="px-6 py-4.5 bg-slate-100/40 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
              <button
                id="btn-dispute-modal-cancel"
                onClick={() => setShowDisputeModal(false)}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 font-sans font-bold text-xs rounded-lg transition-colors"
              >
                Cancel
              </button>

              <button
                id="btn-dispute-modal-submit"
                onClick={submitDisputeAction}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#0052cc] hover:bg-[#0040a2] active:bg-[#003d9b] text-white font-sans font-bold text-xs rounded-lg transition-colors shadow-2xs"
              >
                <span>Submit Dispute</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
