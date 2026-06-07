import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  HelpCircle, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight, 
  Coins, 
  Building2, 
  CheckSquare, 
  Square,
  BadgeAlert,
  Loader2
} from 'lucide-react';
import { Invoice, MainRoute } from '../types';
import { getInvoiceDisplayNumber } from '../../lib/invoiceDisplay';
import { isActiveFundingStatus } from '../../lib/fundingStatusDisplay';

interface FactoringViewProps {
  invoices: Invoice[];
  onSelectRoute: (route: MainRoute) => void;
  onSubmitFactoringBatch: (invoiceIds: string[], totalAdvance: number, terms: FactoringSubmissionTerms) => void | Promise<void>;
  preselectedInvoiceId: string | null;
}

export interface FactoringSubmissionTerms {
  selectedTotalAmount: number;
  advanceRate: number;
  estimatedAdvance: number;
  platformFee: number;
  reserveRate: number;
  yieldApr: number;
  settlementCurrency: 'USDC';
  expiresAt: string;
}

function isEligibleForFactoring(invoice: Invoice) {
  return invoice.status === 'ACCEPTED' && !isActiveFundingStatus(invoice.fundingStatus);
}

export default function FactoringView({
  invoices,
  onSelectRoute,
  onSubmitFactoringBatch,
  preselectedInvoiceId
}: FactoringViewProps) {
  
  // Eligible invoices are ACCEPTED ones. Keep list preloaded.
  const [localInvoices, setLocalInvoices] = useState<Invoice[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [submissionError, setSubmissionError] = useState('');

  // Initialize the list of eligible invoices
  useEffect(() => {
    const eligible = invoices.filter(isEligibleForFactoring);
    setLocalInvoices(eligible);

    // If there is a preselected ID (e.g. user clicked "Request Financing" on INV-002), select it!
    // Otherwise select the ones matching the mock screen (INV-2023-0891, INV-2023-0904, INV-2023-0912)
    if (preselectedInvoiceId && eligible.some((invoice) => invoice.id === preselectedInvoiceId)) {
      setSelectedIds([preselectedInvoiceId]);
    } else {
      const defaultMockInvoiceNumbers = ['INV-2023-0891', 'INV-2023-0904', 'INV-2023-0912'];
      const defaultMockIds = eligible
        .filter(inv => defaultMockInvoiceNumbers.includes(inv.invoiceNumber ?? inv.id))
        .map(inv => inv.id);
      setSelectedIds(defaultMockIds.length > 0 ? defaultMockIds : eligible.slice(0, 3).map(i => i.id));
    }
  }, [invoices, preselectedInvoiceId]);

  // Handle row selection toggle
  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Perform calculations based on selected lines
  const selectedInvoicesList = localInvoices.filter(inv => selectedIds.includes(inv.id));
  const totalSelectedAmount = selectedInvoicesList.reduce((acc, inv) => acc + inv.amount, 0);
  
  const ADVANCE_RATE = 0.90; // 90%
  const PLATFORM_FEE_RATE = 0.005; // 0.5%
  const RESERVE_RATE = 0.10; // 10%
  
  const estimatedAdvance = totalSelectedAmount * ADVANCE_RATE;
  const estimatedPlatformFee = totalSelectedAmount * PLATFORM_FEE_RATE;
  const retentionAmount = totalSelectedAmount * (1 - ADVANCE_RATE);
  const estimatedNetFunding = estimatedAdvance - estimatedPlatformFee;

  const handleMarketplaceSubmission = () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one eligible invoice to submit for factoring.");
      return;
    }

    setIsSubmitting(true);
    setSubmissionError('');
    
    // Simulate smart contract generation & indexing delay
    setTimeout(() => {
      void (async () => {
        try {
          await onSubmitFactoringBatch(selectedIds, estimatedAdvance, {
            selectedTotalAmount: totalSelectedAmount,
            advanceRate: ADVANCE_RATE,
            estimatedAdvance,
            platformFee: estimatedPlatformFee,
            reserveRate: RESERVE_RATE,
            yieldApr: 0.12,
            settlementCurrency: 'USDC',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          });
          setShowSuccessNotification(true);
          
          // Continue the investor flow into settlement after funding is confirmed.
          setTimeout(() => {
            onSelectRoute('settlement');
          }, 2500);
        } catch (error) {
          setSubmissionError(error instanceof Error ? error.message : 'Marketplace submission failed.');
        } finally {
          setIsSubmitting(false);
        }
      })();

    }, 2000);
  };

  return (
    <div id="request-factoring-view" className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto w-full animate-fadeIn font-sans">
      
      {/* Top Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
        <button onClick={() => onSelectRoute('dashboard')} className="hover:text-[#0052CC] cursor-pointer">Dashboard</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-500">Factoring</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#0052CC]">New Request</span>
      </nav>

      {/* Main Header / Banner Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 pb-6">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">Request Factoring</h1>
          <p className="text-[14px] text-slate-500 mt-1">
            Select eligible verified invoices to lock and offer for early payment funding.
          </p>
        </div>

        {/* Real-time status indicator */}
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-bold border border-emerald-150 shadow-3xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Marketplace Online</span>
        </div>
      </div>

      {/* Real-time recomputed horizontal metric summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white border border-slate-200 rounded-[12px] p-6 shadow-3xs divide-y md:divide-y-0 md:divide-x divide-slate-100">
        
        <div className="pb-4 md:pb-0">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider label-caps mb-1">
            TOTAL SELECTED AMOUNT
          </span>
          <p className="text-2xl font-extrabold text-slate-900 font-mono">
            USDC {totalSelectedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-slate-400 font-semibold">{selectedIds.length} Invoices selected</span>
        </div>

        <div className="py-4 md:py-0 md:pl-6">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider label-caps mb-1 flex items-center gap-1" title="90% of total Gross Value">
            ESTIMATED ADVANCE
            <HelpCircle className="w-3 h-3 text-slate-300" aria-hidden="true" />
          </span>
          <p className="text-2xl font-extrabold text-[#0052CC] font-mono">
            USDC {estimatedAdvance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-emerald-600 font-bold">90.00% advance rate applied</span>
        </div>

        <div className="pt-4 md:pt-0 md:pl-6">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider label-caps mb-1 flex items-center gap-1" title="0.5% platform protocol cost">
            EST. PLATFORM FEE
            <HelpCircle className="w-3 h-3 text-slate-300" aria-hidden="true" />
          </span>
          <p className="text-2xl font-extrabold text-slate-900 font-mono">
            USDC {estimatedPlatformFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-xs text-slate-400 font-semibold">0.5% platform rate</span>
        </div>

      </div>

      {/* Two Column Grid */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Eligible Invoices checkable list */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[12px] shadow-3xs overflow-hidden">
          
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">Eligible Invoices</h2>
            <button 
              onClick={() => {
                const allIds = localInvoices.map(i => i.id);
                setSelectedIds(selectedIds.length === allIds.length ? [] : allIds);
              }}
              className="text-xs text-[#0052CC] hover:underline font-bold cursor-pointer"
            >
              {selectedIds.length === localInvoices.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10.5px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-3.5 w-12 text-center">Select</th>
                  <th className="px-6 py-3.5">Invoice Number</th>
                  <th className="px-6 py-3.5">Buyer Entity</th>
                  <th className="px-6 py-3.5">Amount (USDC)</th>
                  <th className="px-6 py-3.5">Maturity</th>
                  <th className="px-6 py-3.5 text-right font-sans">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-[13px] font-sans">
                {localInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-semibold bg-slate-50/50">
                      No invoices currently classified with 'ACCEPTED' status for factoring.
                    </td>
                  </tr>
                ) : (
                  localInvoices.map((inv) => {
                    const isChecked = selectedIds.includes(inv.id);
                    const displayNumber = getInvoiceDisplayNumber(inv);
                    return (
                      <tr 
                        key={inv.id} 
                        onClick={() => toggleSelect(inv.id)}
                        className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                          isChecked ? 'bg-blue-50/20' : ''
                        }`}
                      >
                        
                        {/* Checkbox trigger Column */}
                        <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => toggleSelect(inv.id)}
                            className="text-[#0052CC] inline-block cursor-pointer focus:outline-none"
                          >
                            {isChecked ? (
                              <CheckSquare className="w-5 h-5 text-[#0052CC] fill-blue-100" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-300 hover:text-slate-500" />
                            )}
                          </button>
                        </td>

                        {/* ID */}
                        <td className="px-6 py-4 font-mono font-bold text-slate-950">
                          {displayNumber}
                        </td>

                        {/* Buyer */}
                        <td className="px-6 py-4 font-bold text-slate-700">
                          {inv.buyer}
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4 font-mono font-bold text-slate-900">
                          ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>

                        {/* Maturity Date */}
                        <td className="px-6 py-4 text-slate-500 font-semibold">
                          {inv.maturityDate}
                        </td>

                        {/* Static verified status mapping from Screen 4 */}
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            <span className="w-1 h-1 rounded-full bg-emerald-500" />
                            Verified
                          </span>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* Right Column: Factoring Summary Terms Card */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-[12px] p-6 shadow-3xs font-sans relative overflow-hidden">
            
            {/* Top border decor */}
            <div className="absolute top-0 left-0 w-full h-[4px] bg-[#0052CC]" />

            <h2 className="text-base font-extrabold text-[#003D9B] mb-5 flex items-center gap-2">
              <Coins className="w-5 h-5" />
              <span>Factoring Terms</span>
            </h2>

            {/* Calculations lines list */}
            <div className="space-y-4 text-[13px] border-b border-slate-100 pb-5">
              
              <div className="flex justify-between items-center text-slate-500">
                <span>Gross Invoice Value</span>
                <span className="font-mono font-bold text-slate-900">
                  {totalSelectedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400 font-bold -mt-2">
                <span>Invoices Selected</span>
                <span>{selectedIds.length} total</span>
              </div>

              <div className="flex justify-between items-center text-slate-500">
                <span className="flex items-center gap-1" title="The pre-approved leverage percentage">
                  Advance Rate
                  <HelpCircle className="w-3.5 h-3.5 text-slate-300" aria-hidden="true" />
                </span>
                <span className="font-bold text-slate-800">90.00%</span>
              </div>

              <div className="flex justify-between items-center text-slate-500">
                <span>Est. Advance Amount</span>
                <span className="font-mono font-bold text-slate-900">
                  {estimatedAdvance.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-500">
                <span>Retention Amount (10%)</span>
                <span className="font-mono font-semibold text-slate-600">
                  {retentionAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-500">
                <span>Platform Fee (0.5%)</span>
                <span className="font-mono text-xs text-slate-600">
                  -{estimatedPlatformFee.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
                </span>
              </div>

            </div>

            {/* Net payment indicator */}
            <div className="pt-5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider label-caps">
                    ESTIMATED NET FUNDING
                  </span>
                  <span className="text-[11px] text-emerald-600 font-bold block mt-0.5">
                    ● Instant settlement routing
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-[#0052CC] font-mono block">
                    {estimatedNetFunding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold font-mono">USDC</span>
                </div>
              </div>

              {/* Submit Main CTA */}
              <button
                type="button"
                onClick={handleMarketplaceSubmission}
                disabled={isSubmitting || selectedIds.length === 0}
                className={`w-full text-white text-[14px] font-bold py-3.5 px-4 rounded-[6.5px] transition-all flex items-center justify-center gap-2 tracking-wide shadow-sm cursor-pointer ${
                  selectedIds.length === 0 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300' 
                    : 'bg-[#0052CC] hover:bg-[#003D9B] active:bg-[#003D9B] hover:scale-101'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing Smart Escrow...</span>
                  </>
                ) : (
                  <>
                    <span>Submit to Marketplace</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Legal Disclaimer block and system terms */}
          <div className="bg-slate-50 border border-slate-200 rounded-[12px] p-4 flex gap-3 text-slate-500 text-xs shadow-3xs leading-relaxed">
            <ShieldCheck className="w-8 h-8 text-[#0052CC] shrink-0 mt-0.5" />
            <p>
              By submitting, these invoices will be visible to institutional liquidity providers on the Verity network. A cryptographically secure commitment hash will be generated upon immediate funding.
            </p>
          </div>

        </div>

      </div>

      {/* Floating success notification card */}
      {showSuccessNotification && (
        <div className="fixed bottom-10 inset-x-6 mx-auto max-w-md bg-emerald-600 text-white p-4 rounded-[12px] shadow-lg border border-emerald-500 flex items-center gap-3 animate-slideIn z-50">
          <CheckCircle2 className="w-6 h-6 text-emerald-100 shrink-0" />
          <div>
            <p className="font-extrabold text-sm">Financing Request Submitted!</p>
            <p className="text-[11.5px] text-emerald-50/90 mt-0.5 leading-tight">
              Invoiced assets have been registered inside the escrow pool. Opening settlement workflow...
            </p>
          </div>
        </div>
      )}
      {submissionError && (
        <div className="rounded-[8px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {submissionError}
        </div>
      )}

    </div>
  );
}
