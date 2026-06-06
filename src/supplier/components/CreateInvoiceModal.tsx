import React, { useState } from 'react';
import { X, Upload, CheckCircle2, ShieldAlert, Sparkles, Loader2, FileCheck } from 'lucide-react';
import { Invoice, RegisteredBuyerOption } from '../types';

interface CreateInvoiceModalProps {
  onClose: () => void;
  onSubmitInvoice: (invoice: Omit<Invoice, 'status'>) => void | Promise<void>;
  buyerOptions: RegisteredBuyerOption[];
}

export default function CreateInvoiceModal({ onClose, onSubmitInvoice, buyerOptions }: CreateInvoiceModalProps) {
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [invoiceId, setInvoiceId] = useState(`INV-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [buyerId, setBuyerId] = useState(buyerOptions[0]?.buyerId ?? '');
  const [amountStr, setAmountStr] = useState('50000.00');
  const [maturityDate, setMaturityDate] = useState('Aug 14, 2026');
  const [itemDescription, setItemDescription] = useState('Industrial Sensors Type-X');
  
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Drag and drop event states
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateFileUpload(e.dataTransfer.files[0].name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      simulateFileUpload(e.target.files[0].name);
    }
  };

  const simulateFileUpload = (name: string) => {
    setIsUploading(true);
    setTimeout(() => {
      setFileName(name);
      setIsUploading(false);
      // Auto fill some data mock
      setAmountStr('75000.00');
      setItemDescription('Next-Gen Microprocessor Base Plates');
    }, 1500);
  };

  const buildInvoiceSubmission = () => {
    const selectedBuyer = buyerOptions.find((option) => option.buyerId === buyerId);

    if (!selectedBuyer) return null;

    return {
      id: `supplier-invoice-${Date.now()}`,
      invoiceNumber: invoiceId,
      buyerId: selectedBuyer.buyerId,
      buyer: selectedBuyer.buyerName,
      amount: parseFloat(amountStr) || 25000,
      maturityDate,
      originalQty: 500,
      unitPrice: 150,
      itemDescription
    } satisfies Omit<Invoice, 'status'>;
  };

  const executeSubmit = () => {
    const invoiceSubmission = buildInvoiceSubmission();
    if (!invoiceSubmission) return;

    // Go to Verification Loading state
    setIsVerifying(true);
    setSubmitError('');
    setStep(2);
    
    setTimeout(() => {
      void (async () => {
        try {
          await onSubmitInvoice(invoiceSubmission);
          // Advance to Confirmation success step only after persistence completes.
          setStep(3);
        } catch (error) {
          setStep(1);
          setSubmitError(error instanceof Error ? error.message : 'Invoice submission failed.');
        } finally {
          setIsVerifying(false);
        }
      })();
    }, 2000);
  };

  const handleFinalConfirm = () => {
    onClose();
  };

  return (
    <div id="modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      
      <div id="invoice-modal-card" className="bg-white rounded-[16px] shadow-medium max-w-2xl w-full overflow-hidden border border-slate-200">
        
        {/* Modal Inner Title header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#EBF2FF] flex items-center justify-center text-[#0052CC]">
              <Upload className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">Create New Invoice</h2>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modular Step Progress Bar Wizard */}
        <div className="px-10 py-5 bg-slate-50 border-b border-slate-200/50 flex justify-between items-center relative">
          
          <div className="absolute top-1/2 left-10 right-10 h-[2px] bg-slate-200 -translate-y-1/2 z-0" />
          
          {/* Timeline Node 1 */}
          <div className="relative z-10 flex flex-col items-center gap-1.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= 1 ? 'bg-[#0052CC] text-white ring-4 ring-blue-50' : 'bg-slate-200 text-slate-500'
            }`}>
              1
            </div>
            <span className={`text-[11px] font-bold uppercase tracking-wider ${step >= 1 ? 'text-[#0052CC]' : 'text-slate-400'}`}>
              Upload Data
            </span>
          </div>

          {/* Timeline Node 2 */}
          <div className="relative z-10 flex flex-col items-center gap-1.5 font-sans">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= 2 ? 'bg-[#0052CC] text-white ring-4 ring-blue-50' : 'bg-slate-200 text-slate-500'
            }`}>
              2
            </div>
            <span className={`text-[11px] font-bold uppercase tracking-wider ${step >= 2 ? 'text-[#0052CC]' : 'text-slate-400'}`}>
              Verification
            </span>
          </div>

          {/* Timeline Node 3 */}
          <div className="relative z-10 flex flex-col items-center gap-1.5 font-sans">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= 3 ? 'bg-[#0052CC] text-white ring-4 ring-blue-50' : 'bg-slate-200 text-slate-500'
            }`}>
              3
            </div>
            <span className={`text-[11px] font-bold uppercase tracking-wider ${step >= 3 ? 'text-[#0052CC]' : 'text-slate-400'}`}>
              Confirmation
            </span>
          </div>

        </div>

        {/* Modal Form Step Renderer */}
        <div className="p-6">
          
          {step === 1 && (
            <div className="grid md:grid-cols-2 gap-6 animate-fadeIn">
              
              {/* Left Column: Drag & Drop */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  DOCUMENT UPLOAD
                </label>
                
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-[12px] p-6 text-center h-[240px] flex flex-col items-center justify-center transition-all ${
                    dragActive ? 'border-[#0052CC] bg-[#EBF2FF]' : 'border-slate-300 bg-slate-50'
                  }`}
                >
                  {isUploading ? (
                    <div className="space-y-3">
                      <Loader2 className="w-8 h-8 text-[#0052CC] animate-spin mx-auto" />
                      <p className="text-xs text-slate-500 font-semibold uppercase">Analyzing digital asset structure...</p>
                    </div>
                  ) : fileName ? (
                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                        <FileCheck className="w-6 h-6 animate-bounce" />
                      </div>
                      <p className="text-xs font-bold text-slate-600 truncate max-w-[200px] mx-auto uppercase">{fileName}</p>
                      <button 
                        onClick={() => setFileName(null)}
                        className="text-[11px] font-bold tracking-wider text-red-500 hover:underline cursor-pointer"
                      >
                        REMOVE & RETRY
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-10 h-10 bg-white rounded-full border border-slate-200 flex items-center justify-center text-slate-400 mx-auto shadow-2xs">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-slate-800">Drag & drop invoice file</p>
                        <p className="text-[11px] text-slate-400 mt-1">Supported formats: PDF, XML</p>
                      </div>
                      
                      {/* Hidden native input */}
                      <label className="inline-block bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold px-4 py-2 rounded-[6px] tracking-wide transition-all shadow-3xs cursor-pointer">
                        Browse Files
                        <input 
                          type="file" 
                          accept=".pdf,.xml" 
                          onChange={handleFileChange} 
                          className="hidden" 
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: MANUAL INPUTS */}
              <div className="space-y-4 font-sans">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  MANUAL DETAILS
                </label>

                {/* Invoice Number */}
                <div className="space-y-1">
                  <span className="block text-[11.5px] font-bold text-slate-600">Invoice Number</span>
                  <input
                    type="text"
                    value={invoiceId}
                    onChange={(e) => setInvoiceId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0052CC] rounded-[6px] px-3 py-2 text-[13px] font-mono font-bold"
                  />
                </div>

                {/* Buyer selection map */}
                <div className="space-y-1">
                  <label htmlFor="buyer-selection" className="block text-[11.5px] font-bold text-slate-600">
                    Buyer Selection
                  </label>
                  <select
                    id="buyer-selection"
                    value={buyerId}
                    onChange={(e) => setBuyerId(e.target.value)}
                    disabled={buyerOptions.length === 0}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0052CC] rounded-[6px] px-3 py-2 text-[13px] font-semibold cursor-pointer disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    {buyerOptions.length === 0 ? (
                      <option value="">No registered buyers available</option>
                    ) : (
                      buyerOptions.map((option) => (
                        <option key={option.buyerId} value={option.buyerId}>
                          {option.buyerName}
                        </option>
                      ))
                    )}
                  </select>
                  {buyerOptions.length === 0 && (
                    <p className="text-[11px] text-amber-600 font-semibold">
                      No registered buyer organizations are available from Verity database.
                    </p>
                  )}
                </div>

                {/* Amount in USDC */}
                <div className="space-y-1">
                  <span className="block text-[11.5px] font-bold text-slate-600">Amount (USDC)</span>
                  <div className="relative rounded-[6px] shadow-3xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-mono text-xs font-bold">
                      USDC
                    </div>
                    <input
                      type="text"
                      value={amountStr}
                      onChange={(e) => setAmountStr(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0052CC] rounded-[6px] pl-14 pr-3 py-2 text-[13px] font-mono font-bold text-slate-800"
                    />
                  </div>
                </div>

                {/* Maturity Date */}
                <div className="space-y-1">
                  <span className="block text-[11.5px] font-bold text-slate-600">Maturity Date</span>
                  <input
                    type="text"
                    value={maturityDate}
                    onChange={(e) => setMaturityDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0052CC] rounded-[6px] px-3 py-2 text-[13px] font-semibold"
                  />
                </div>

                {submitError && (
                  <div className="rounded-[6px] border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-700">
                    {submitError}
                  </div>
                )}

              </div>

            </div>
          )}

          {step === 2 && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-fadeIn">
              <Loader2 className="w-12 h-12 text-[#0052CC] animate-spin" />
              <div>
                <h3 className="text-base font-bold text-slate-900">Programmatic Verification Active</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Performing automated double-factoring checks, signature encryption, and smart billing alignment on Verity Virtual Machine...
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-6 animate-fadeIn">
              <div className="w-14 h-14 bg-emerald-50 rounded-full border border-emerald-200 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-slate-900">Invoice Registered and Verified</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Invoice <span className="font-mono font-bold text-slate-900">{invoiceId}</span> has successfully passed validation checks and is now live on the registry with <b>ACCEPTED</b> status.
                </p>
              </div>

              {/* Verified Details preview */}
              <div className="bg-slate-50 rounded-[8px] p-4 text-[13.5px] border border-slate-200 max-w-md w-full grid grid-cols-2 text-left font-sans gap-3">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-bold label-caps">Invoice Hash</span>
                  <span className="font-mono text-slate-800 font-bold block truncate">0x9a3e...b411</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-bold label-caps">Total Value</span>
                  <span className="font-mono text-slate-900 font-bold block">${parseFloat(amountStr).toLocaleString()} USDC</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Controls footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 rounded-b-[16px]">
          {step === 1 ? (
            <>
              <button 
                type="button"
                onClick={onClose}
                className="bg-white hover:bg-slate-50 border border-slate-250 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-[6px] tracking-wide transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={executeSubmit}
                disabled={buyerOptions.length === 0}
                className="bg-[#0052CC] hover:bg-[#003D9B] text-white text-xs font-bold px-5 py-2.5 rounded-[6px] tracking-wide transition-all cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                Verify & Submit
              </button>
            </>
          ) : step === 3 ? (
            <button 
              type="button"
              onClick={handleFinalConfirm}
              className="bg-[#0052CC] hover:bg-[#003D9B] text-white text-xs font-bold px-6 py-2.5 rounded-[6px] tracking-wide transition-all cursor-pointer"
            >
              Close & View Registry
            </button>
          ) : (
            // Disabled loader button
            <button 
              type="button"
              disabled
              className="bg-slate-100 border border-slate-200 text-slate-400 text-xs font-bold px-5 py-2.5 rounded-[6px] flex items-center gap-2"
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Verifying Ledger Alignment...</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
