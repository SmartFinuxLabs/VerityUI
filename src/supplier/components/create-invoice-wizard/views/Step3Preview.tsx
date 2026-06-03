import { Zap, CheckCircle, Send, Wallet, X } from 'lucide-react';
import { FocusedHeader } from '../components/FocusedHeader';
import { StepperMini } from '../components/Steppers';

export function Step3Preview({ onBack, onSubmit }: { onBack: () => void, onSubmit?: () => void }) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="h-16 bg-surface-container-lowest border-b border-border-muted flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-on-surface-variant hover:text-on-surface transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-subtle">
             <X className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">Create Invoice</h1>
        </div>
        <StepperMini currentStep={3} />
        <div className="w-8"></div>
      </header>

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-10 py-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* Invoice Paper Preview */}
          <section className="w-full lg:w-[68%] bg-surface-container-lowest rounded-lg border border-border-muted shadow-[0px_4px_12px_rgba(0,0,0,0.03)] p-8 md:p-12">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-8">
              <div className="flex items-start gap-4">
                <img 
                  alt="Company Logo" 
                  src="https://placehold.co/48x48/003d9b/ffffff?text=SF" 
                  className="w-12 h-12 rounded object-cover"
                />
                <div>
                  <div className="text-xl font-semibold text-primary mb-1">Smart Finux Labs</div>
                  <div className="text-sm text-on-surface-variant leading-relaxed">
                    4400 Tech Corridor, Suite 900<br/>
                    San Francisco, CA 94107<br/>
                    supplier@smartfinux.com
                  </div>
                </div>
              </div>
              <div className="text-left md:text-right flex flex-col items-start md:items-end gap-2">
                <h2 className="text-3xl font-bold tracking-tight">INVOICE</h2>
                <div className="font-mono text-[13px] text-outline">#INV-2023-0894</div>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-secondary-fixed text-on-secondary-fixed border border-secondary-container">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Early Payment Eligible</span>
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-surface-container-highest mb-10"></div>

            {/* Meta Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-outline mb-1">Issue Date</div>
                <div className="text-sm font-medium">Oct 24, 2023</div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-outline mb-1">Due Date</div>
                <div className="text-sm font-medium">Nov 23, 2023</div>
              </div>
               <div>
                <div className="text-xs font-bold uppercase tracking-wider text-outline mb-1">Terms</div>
                <div className="text-sm font-medium">Net 30</div>
              </div>
               <div>
                <div className="text-xs font-bold uppercase tracking-wider text-outline mb-1">PO Number</div>
                <div className="font-mono text-[13px] font-medium">PO-9940-BX</div>
              </div>
            </div>

            {/* Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-surface-subtle p-6 rounded-lg border border-border-muted overflow-hidden relative">
                 <div className="text-xs font-bold uppercase tracking-wider text-outline mb-3">Billed To</div>
                 <div className="text-base font-semibold mb-1">Acme Global Manufacturing</div>
                 <div className="text-sm text-on-surface-variant leading-relaxed relative z-10">
                    100 Industrial Parkway<br/>
                    Building B, Receiving<br/>
                    Chicago, IL 60601<br/>
                    accounts.payable@acmeglobal.com
                 </div>
              </div>
            </div>

            {/* Table */}
            <div className="mb-10 w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b-2 border-surface-container-highest">
                    <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-outline">Description</th>
                    <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-outline text-right">Qty</th>
                    <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-outline text-right">Rate</th>
                    <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-outline text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="bg-surface-container-lowest border-b border-surface-container-low transition-colors">
                    <td className="py-4 px-4 align-top">
                      <div className="font-medium mb-1">Server Infrastructure Migration</div>
                      <div className="text-on-surface-variant text-sm pr-4">Phase 2: Database transfer and latency optimization across US-East regions.</div>
                    </td>
                    <td className="py-4 px-4 align-top text-right font-mono text-[13px]">1.00</td>
                    <td className="py-4 px-4 align-top text-right font-mono text-[13px]">$12,500.00</td>
                    <td className="py-4 px-4 align-top text-right font-mono text-[13px] font-medium">$12,500.00</td>
                  </tr>
                  <tr className="bg-surface-subtle transition-colors">
                    <td className="py-4 px-4 align-top">
                      <div className="font-medium mb-1">Security Audit Retainer</div>
                      <div className="text-on-surface-variant text-sm pr-4">October 2023 proactive monitoring.</div>
                    </td>
                    <td className="py-4 px-4 align-top text-right font-mono text-[13px]">40.00</td>
                    <td className="py-4 px-4 align-top text-right font-mono text-[13px]">$150.00</td>
                    <td className="py-4 px-4 align-top text-right font-mono text-[13px] font-medium">$6,000.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals Box */}
            <div className="flex justify-end mb-12">
              <div className="w-full md:w-1/2 lg:w-2/5">
                <div className="flex justify-between py-2 border-b border-surface-container-highest">
                  <span className="text-sm text-on-surface-variant">Subtotal</span>
                  <span className="font-mono text-[13px]">$18,500.00</span>
                </div>
                <div className="flex justify-between py-2 border-b border-surface-container-highest">
                   <span className="text-sm text-on-surface-variant">Tax (0%)</span>
                   <span className="font-mono text-[13px]">$0.00</span>
                </div>
                <div className="flex justify-between py-4 mt-2 bg-surface-subtle px-4 rounded-md border border-border-muted">
                  <span className="text-xl font-semibold">Total</span>
                  <span className="font-mono text-[20px] font-bold">USD $18,500.00</span>
                </div>
              </div>
            </div>

            {/* Remittance Details */}
            <div className="pt-8 border-t border-border-muted">
              <div className="text-xs font-bold uppercase tracking-wider text-outline mb-4">Remittance Details</div>
              <div className="bg-surface-container-low p-5 rounded-md border border-surface-container-highest inline-block w-full md:w-auto min-w-[300px]">
                <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                  <div className="text-on-surface-variant">Bank Name</div>
                  <div className="font-medium">JPMorgan Chase Bank, N.A.</div>
                  <div className="text-on-surface-variant">Account Name</div>
                  <div className="font-medium">Smart Finux Labs LLC</div>
                  <div className="text-on-surface-variant mt-2">Routing (ABA)</div>
                  <div className="font-mono text-[13px] mt-2">021000021</div>
                  <div className="text-on-surface-variant">Account No.</div>
                  <div className="font-mono text-[13px]">**** 9482</div>
                </div>
              </div>
            </div>
          </section>

          {/* Action Sidebar */}
          <aside className="w-full lg:w-[32%] sticky top-24">
            <div className="bg-surface-container-lowest rounded-lg border border-border-muted shadow-[0px_4px_12px_rgba(0,0,0,0.03)] p-6 flex flex-col gap-6">
              <div className="border-b border-surface-container-highest pb-4">
                <h3 className="text-2xl font-semibold mb-2 tracking-tight">Ready to Submit?</h3>
                <p className="text-sm text-on-surface-variant">Please review the invoice details carefully. Once submitted, it will be routed to Acme Global Manufacturing for approval.</p>
              </div>

              <div className="bg-surface-subtle p-4 rounded-md border border-border-muted flex flex-col gap-1">
                <div className="text-xs font-bold uppercase tracking-wider text-outline mb-1">Invoice Total</div>
                <div className="font-mono text-[24px] font-bold leading-tight">USD $18,500.00</div>
                <div className="flex items-center gap-1.5 mt-2 text-on-secondary-container">
                  <CheckCircle className="w-[14px] h-[14px]" />
                  <span className="text-[12px] font-medium">Matches PO #PO-9940-BX exactly</span>
                </div>
              </div>

              {/* Funding Callout */}
              <div className="bg-primary-fixed text-on-primary-fixed p-4 rounded-md border border-primary-fixed-dim">
                <div className="flex gap-3">
                  <Wallet className="w-5 h-5 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Fund this invoice early</h4>
                    <p className="text-[13px] opacity-90 leading-tight mb-3">This buyer is enrolled in the supply chain finance program. You can request early payment immediately upon approval.</p>
                    <label className="flex items-center gap-2 cursor-pointer group w-fit">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-on-primary-fixed-variant text-primary focus:ring-primary bg-surface-container-lowest" />
                      <span className="text-sm font-medium group-hover:underline">Opt-in for early funding</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Actions */}
              <div className="flex flex-col gap-3 pt-2">
                <button className="w-full bg-primary hover:bg-primary-container text-on-primary font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-subtle group" onClick={onSubmit}>
                  Submit Invoice
                  <Send className="w-5 h-5 -rotate-45 mb-1" />
                </button>
                <button className="w-full h-12 bg-surface-container-lowest text-primary border border-outline-variant hover:bg-surface-subtle hover:border-primary rounded-md text-base font-medium flex items-center justify-center transition-colors">
                  Save as Draft
                </button>
              </div>
            </div>
          </aside>
          
        </div>
      </main>
    </div>
  );
}
