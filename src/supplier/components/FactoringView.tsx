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
  const [flowStep, setFlowStep] = useState<'select' | 'review' | 'confirmation'>('select');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAt, setSubmittedAt] = useState('');
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

  const buildSubmissionTerms = (): FactoringSubmissionTerms => ({
    selectedTotalAmount: totalSelectedAmount,
    advanceRate: ADVANCE_RATE,
    estimatedAdvance,
    platformFee: estimatedPlatformFee,
    reserveRate: RESERVE_RATE,
    yieldApr: 0.12,
    settlementCurrency: 'USDC',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });

  const handleMarketplaceSubmission = () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one eligible invoice to submit for factoring.");
      return;
    }

    setFlowStep('review');
    setSubmissionError('');
  };

  const handleConfirmMarketplaceSubmission = () => {
    setIsSubmitting(true);
    setSubmissionError('');
    
    // Simulate marketplace offer generation and indexing delay.
    setTimeout(() => {
      void (async () => {
        try {
          await onSubmitFactoringBatch(selectedIds, estimatedAdvance, buildSubmissionTerms());
          setSubmittedAt(new Date().toISOString());
          setFlowStep('confirmation');
        } catch (error) {
          setSubmissionError(error instanceof Error ? error.message : 'Marketplace submission failed.');
        } finally {
          setIsSubmitting(false);
        }
      })();

    }, 2000);
  };

  const SummaryRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <span className="text-sm font-extrabold text-slate-900 text-right">{value}</span>
    </div>
  );

  if (flowStep === 'review') {
    return (
      <div id="request-factoring-review" className="p-6 md:p-10 space-y-8 max-w-5xl mx-auto w-full animate-fadeIn font-sans">
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <button onClick={() => setFlowStep('select')} className="hover:text-[#0052CC] cursor-pointer flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to selection
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#0052CC]">Review</span>
        </nav>

        <div className="border-b border-slate-200/50 pb-6">
          <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">Review Marketplace Submission</h1>
          <p className="text-[14px] text-slate-500 mt-1">
            Confirm the financing request terms before listing these accepted invoices for investor review.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <section className="lg:col-span-7 bg-white border border-slate-200 rounded-[12px] shadow-3xs overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-base font-extrabold text-slate-900">Invoices to list</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {selectedInvoicesList.map((invoice) => (
                <div key={invoice.id} className="p-5 grid sm:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Invoice</span>
                    <span className="font-mono font-extrabold text-slate-950">{getInvoiceDisplayNumber(invoice)}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Buyer</span>
                    <span className="font-bold text-slate-700">{invoice.buyer}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Accepted Value</span>
                    <span className="font-mono font-extrabold text-slate-900">
                      {invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Maturity</span>
                    <span className="font-bold text-slate-600">{invoice.maturityDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="lg:col-span-5 bg-white border border-slate-200 rounded-[12px] p-6 shadow-3xs">
            <h2 className="text-base font-extrabold text-[#003D9B] mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              Submission Terms
            </h2>
            <SummaryRow
              label="Accepted Value"
              value={`${totalSelectedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC`}
            />
            <SummaryRow label="Advance" value={`${estimatedAdvance.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC`} />
            <SummaryRow label="Reserve" value={`${retentionAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC`} />
            <SummaryRow label="Platform Fee" value={`${estimatedPlatformFee.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC`} />
            <SummaryRow label="Yield APR" value="12.00%" />
            <SummaryRow label="Funding Currency" value="USDC" />

            <div className="mt-5 rounded-[8px] border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 leading-relaxed">
              <p className="font-extrabold mb-1">Representation and warranty recourse acknowledged</p>
              <p>
                The seller confirms these invoices are valid, buyer-accepted receivables and may be reviewed by investors on the marketplace.
              </p>
            </div>

            {submissionError && (
              <div className="mt-4 rounded-[8px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {submissionError}
              </div>
            )}

            <button
              type="button"
              onClick={handleConfirmMarketplaceSubmission}
              disabled={isSubmitting}
              className="mt-5 w-full bg-[#0052CC] hover:bg-[#003D9B] disabled:bg-slate-300 disabled:text-slate-500 text-white text-[14px] font-bold py-3.5 px-4 rounded-[6.5px] transition-all flex items-center justify-center gap-2 tracking-wide shadow-sm cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting to Marketplace...</span>
                </>
              ) : (
                <span>Confirm Submission</span>
              )}
            </button>
          </aside>
        </div>
      </div>
    );
  }

  if (flowStep === 'confirmation') {
    return (
      <div id="request-factoring-confirmation" className="p-6 md:p-10 max-w-4xl mx-auto w-full animate-fadeIn font-sans">
        <div className="bg-white border border-emerald-200 rounded-[12px] p-8 shadow-3xs">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-700 mb-2">Marketplace Listed</p>
              <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">Marketplace Submission Confirmed</h1>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                The selected invoice receivable is now available for investor review. Settlement operations remain pending until investor funding and platform settlement instructions are created.
              </p>
            </div>
          </div>

          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-4">
              <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Submitted invoices</span>
              <span className="text-lg font-extrabold text-slate-900">{selectedIds.length}</span>
            </div>
            <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-4">
              <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Estimated advance</span>
              <span className="text-lg font-extrabold text-slate-900 font-mono">
                {estimatedAdvance.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC
              </span>
            </div>
            <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-4">
              <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Marketplace status</span>
              <span className="text-lg font-extrabold text-emerald-700">Listed</span>
            </div>
            <div className="rounded-[8px] border border-slate-200 bg-slate-50 p-4">
              <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Submitted at</span>
              <span className="text-sm font-bold text-slate-700">{submittedAt ? new Date(submittedAt).toLocaleString() : 'Just now'}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => onSelectRoute('invoice-queue')}
              className="px-5 py-3 bg-[#0052CC] text-white text-xs font-bold uppercase tracking-widest rounded-[6px]"
            >
              View Invoice Queue
            </button>
            <button
              type="button"
              onClick={() => setFlowStep('select')}
              className="px-5 py-3 bg-white border border-slate-300 text-slate-700 text-xs font-bold uppercase tracking-widest rounded-[6px]"
            >
              Create Another Request
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                    ● Available after investor funding
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
                    <span>Submitting to Marketplace...</span>
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
              By submitting, these invoices will be visible to institutional liquidity providers on the Verity network. Settlement operations start only after investor funding and platform settlement instructions are created.
            </p>
          </div>

        </div>

      </div>

      {submissionError && (
        <div className="rounded-[8px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {submissionError}
        </div>
      )}

    </div>
  );
}
