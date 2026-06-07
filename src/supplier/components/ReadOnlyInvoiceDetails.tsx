import { X } from 'lucide-react';
import { getInvoiceDisplayNumber, formatInvoiceDate } from '../../lib/invoiceDisplay';
import { getFundingStatusDisplay } from '../../lib/fundingStatusDisplay';
import type { Invoice } from '../types';

interface ReadOnlyInvoiceDetailsProps {
  invoice: Invoice;
  onClose: () => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount);

export default function ReadOnlyInvoiceDetails({ invoice, onClose }: ReadOnlyInvoiceDetailsProps) {
  const displayNumber = getInvoiceDisplayNumber(invoice);
  const lineItems = invoice.lineItems ?? [];
  const fundingStatusDisplay = getFundingStatusDisplay(invoice.fundingStatus);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="read-only-invoice-details-title"
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[8px] border border-slate-200 bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Supplier Invoice Review</p>
            <h2 id="read-only-invoice-details-title" className="mt-1 text-xl font-extrabold text-slate-950">
              Read-only invoice details
            </h2>
            <p className="mt-1 font-mono text-sm font-bold text-[#0052CC]">{displayNumber}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-[6px] border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
            aria-label="Close invoice details"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-6 px-6 py-5">
          <p className="rounded-[6px] border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
            No edits are available from this review view.
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Buyer</p>
              <p className="mt-1 text-sm font-extrabold text-slate-900">{invoice.buyer}</p>
              <p className="mt-1 font-mono text-xs text-slate-500">{invoice.buyerId ?? 'Buyer ID pending'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Amount</p>
              <p className="mt-1 font-mono text-sm font-extrabold text-slate-900">
                {formatCurrency(invoice.grossAmount ?? invoice.amount)} USDC
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</p>
              <p className="mt-1 text-sm font-extrabold text-slate-900">{invoice.status}</p>
            </div>
          </div>

          <div className="grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Issue Date</p>
              <p className="mt-1 text-sm font-bold text-slate-800">{formatInvoiceDate(invoice.issueDate)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Due Date</p>
              <p className="mt-1 text-sm font-bold text-slate-800">
                {formatInvoiceDate(invoice.dueDate ?? invoice.maturityDate)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">PO Number</p>
              <p className="mt-1 font-mono text-sm font-bold text-slate-800">{invoice.poNumber ?? 'Not provided'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Goods Receipt</p>
              <p className="mt-1 font-mono text-sm font-bold text-slate-800">
                {invoice.goodsReceiptNumber ?? 'Not provided'}
              </p>
            </div>
          </div>

          <div className="grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Funding Status</p>
              <span
                className={`mt-1 inline-flex rounded-[6px] border px-2.5 py-1 text-[11px] font-bold ${fundingStatusDisplay.className}`}
              >
                {fundingStatusDisplay.label}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Funding Offer</p>
              <p className="mt-1 font-mono text-sm font-bold text-slate-800">{invoice.fundingOfferId ?? 'Not listed'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Offered Amount</p>
              <p className="mt-1 font-mono text-sm font-bold text-slate-800">
                {invoice.offeredAmount ? formatCurrency(invoice.offeredAmount) : 'Not listed'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Submitted</p>
              <p className="mt-1 text-sm font-bold text-slate-800">{formatInvoiceDate(invoice.marketplaceSubmittedAt)}</p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <h3 className="text-sm font-extrabold text-slate-900">Line Items</h3>
            {lineItems.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">{invoice.itemDescription ?? 'No line items provided.'}</p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[620px] text-left">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <tr>
                      <th className="px-3 py-2">Description</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Unit Price</th>
                      <th className="px-3 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {lineItems.map((item: any, index) => {
                      const qty = item.quantity ?? item.qty ?? 1;
                      const unitPrice = item.price ?? item.unitPrice ?? invoice.amount;
                      const total = item.total ?? qty * unitPrice;

                      return (
                        <tr key={item.id ?? `${item.description}-${index}`}>
                          <td className="px-3 py-3 font-medium text-slate-800">{item.description ?? 'Invoice line item'}</td>
                          <td className="px-3 py-3 text-right font-mono text-slate-700">{qty}</td>
                          <td className="px-3 py-3 text-right font-mono text-slate-700">{formatCurrency(unitPrice)}</td>
                          <td className="px-3 py-3 text-right font-mono font-bold text-slate-900">{formatCurrency(total)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
