import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  CheckCircle,
  Clock,
  Filter,
  Plus,
  Receipt,
  Search,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { Invoice, InvoiceStatus, MainRoute } from '../types';
import { getInvoiceDisplayNumber } from '../../lib/invoiceDisplay';
import { getFundingStatusDisplay, isActiveFundingStatus } from '../../lib/fundingStatusDisplay';

interface InvoiceQueueViewProps {
  invoices: Invoice[];
  searchQuery: string;
  onOpenUploadModal: () => void;
  onFocusInvoiceForFactoring: (invoiceId: string) => void;
  onFocusInvoiceForDispute: (invoiceId: string) => void;
  onFocusInvoiceForSettlement: (invoiceId: string) => void;
  onOpenReadOnlyInvoiceDetails: (invoiceId: string) => void;
  onSelectRoute: (route: MainRoute) => void;
}

const statusLabels: Record<InvoiceStatus, string> = {
  PENDING: 'Pending buyer',
  ACCEPTED: 'Finance ready',
  FACTORING_REQUESTED: 'Factoring requested',
  FACTORED: 'Factored',
  SETTLED: 'Settled',
  DISPUTED: 'Disputed',
};

const statusStyles: Record<InvoiceStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  ACCEPTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  FACTORING_REQUESTED: 'bg-blue-50 text-[#0052CC] border-blue-200',
  FACTORED: 'bg-blue-50 text-[#0052CC] border-blue-200',
  SETTLED: 'bg-slate-100 text-slate-600 border-slate-200',
  DISPUTED: 'bg-rose-50 text-rose-700 border-rose-200',
};

const statusIcons: Record<InvoiceStatus, React.ComponentType<{ className?: string }>> = {
  PENDING: Clock,
  ACCEPTED: CheckCircle,
  FACTORING_REQUESTED: Wallet,
  FACTORED: Wallet,
  SETTLED: ShieldCheck,
  DISPUTED: AlertTriangle,
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);

function getInvoiceLifecycleLabel(invoice: Invoice) {
  if (invoice.status === 'ACCEPTED' && isActiveFundingStatus(invoice.fundingStatus)) {
    return 'Accepted';
  }

  return statusLabels[invoice.status];
}

export default function InvoiceQueueView({
  invoices,
  searchQuery,
  onOpenUploadModal,
  onFocusInvoiceForFactoring,
  onFocusInvoiceForDispute,
  onFocusInvoiceForSettlement,
  onOpenReadOnlyInvoiceDetails,
  onSelectRoute,
}: InvoiceQueueViewProps) {
  const [localQuery, setLocalQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | InvoiceStatus>('ALL');

  const combinedQuery = `${searchQuery} ${localQuery}`.trim().toLowerCase();

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesStatus = statusFilter === 'ALL' || invoice.status === statusFilter;
      const searchable = [
        invoice.id,
        invoice.invoiceNumber,
        invoice.buyer,
        invoice.buyerId,
        invoice.itemDescription,
        invoice.status,
        invoice.maturityDate,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesStatus && (!combinedQuery || searchable.includes(combinedQuery));
    });
  }, [combinedQuery, invoices, statusFilter]);

  const metrics = useMemo(() => {
    const outstanding = invoices
      .filter((invoice) => invoice.status !== 'SETTLED')
      .reduce((total, invoice) => total + (invoice.grossAmount || invoice.amount), 0);
    const financeReady = invoices
      .filter((invoice) => invoice.status === 'ACCEPTED' && !isActiveFundingStatus(invoice.fundingStatus))
      .reduce((total, invoice) => total + (invoice.grossAmount || invoice.amount), 0);
    const disputed = invoices
      .filter((invoice) => invoice.status === 'DISPUTED')
      .reduce((total, invoice) => total + (invoice.grossAmount || invoice.amount), 0);

    return {
      outstanding,
      financeReady,
      disputed,
      count: invoices.length,
    };
  }, [invoices]);

  const renderPrimaryAction = (invoice: Invoice) => {
    if (invoice.status === 'ACCEPTED' && !isActiveFundingStatus(invoice.fundingStatus)) {
      return (
        <button
          type="button"
          onClick={() => onFocusInvoiceForFactoring(invoice.id)}
          className="inline-flex items-center justify-center gap-1.5 rounded-[6px] bg-[#0052CC] px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#003D9B]"
        >
          Request Financing
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      );
    }

    if (invoice.status === 'ACCEPTED' && isActiveFundingStatus(invoice.fundingStatus)) {
      return (
        <span className="inline-flex items-center justify-center rounded-[6px] border border-blue-200 bg-blue-50 px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-[#0052CC]">
          Marketplace Listed
        </span>
      );
    }

    if (invoice.status === 'FACTORING_REQUESTED') {
      return (
        <span className="inline-flex items-center justify-center rounded-[6px] border border-blue-200 bg-blue-50 px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-[#0052CC]">
          Marketplace Listed
        </span>
      );
    }

    if (invoice.status === 'FACTORED') {
      return (
        <button
          type="button"
          onClick={() => onFocusInvoiceForSettlement(invoice.id)}
          className="inline-flex items-center justify-center gap-1.5 rounded-[6px] border border-blue-200 bg-blue-50 px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-[#0052CC] transition-colors hover:bg-blue-100"
        >
          Final Settlement
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      );
    }

    if (invoice.status === 'DISPUTED') {
      return (
        <button
          type="button"
          onClick={() => onFocusInvoiceForDispute(invoice.id)}
          className="inline-flex items-center justify-center gap-1.5 rounded-[6px] border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-rose-700 transition-colors hover:bg-rose-100"
        >
          Resolve Dispute
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      );
    }

    return (
      <span className="inline-flex items-center justify-center rounded-[6px] border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
        {invoice.status === 'SETTLED' ? 'Settled on Chain' : 'Awaiting Approval'}
      </span>
    );
  };

  return (
    <main className="p-6 space-y-6 max-w-[1440px] w-full mx-auto">
      <section className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-[6px] border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#0052CC]">
            <Receipt className="h-3.5 w-3.5" />
            Supplier receivables
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">Supplier Invoice Queue</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            Manage submitted invoices, buyer status, and financing readiness.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onOpenUploadModal}
            className="inline-flex items-center justify-center gap-2 rounded-[6px] bg-[#0052CC] px-4 py-2.5 text-[12px] font-bold uppercase tracking-widest text-white shadow-sm transition-colors hover:bg-[#003D9B]"
          >
            <Plus className="h-4 w-4" />
            Quick Upload
          </button>
          <button
            type="button"
            onClick={() => onSelectRoute('create-invoice')}
            className="inline-flex items-center justify-center gap-2 rounded-[6px] border border-[#0052CC] bg-white px-4 py-2.5 text-[12px] font-bold uppercase tracking-widest text-[#0052CC] shadow-sm transition-colors hover:bg-blue-50"
          >
            <Plus className="h-4 w-4" />
            Detailed Invoice
          </button>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <div className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-3xs">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Queue</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-950">{metrics.count}</p>
          <p className="mt-1 text-xs text-slate-500">Registered supplier invoices</p>
        </div>
        <div className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-3xs">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Outstanding</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-950">{formatCurrency(metrics.outstanding)}</p>
          <p className="mt-1 text-xs text-slate-500">Unsettled receivables</p>
        </div>
        <div className="rounded-[8px] border border-emerald-200 bg-white p-4 shadow-3xs">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Finance Ready</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-950">{formatCurrency(metrics.financeReady)}</p>
          <p className="mt-1 text-xs text-slate-500">Accepted by buyer</p>
        </div>
        <div className="rounded-[8px] border border-rose-200 bg-white p-4 shadow-3xs">
          <p className="text-[10px] font-bold uppercase tracking-widest text-rose-600">Dispute Exposure</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-950">{formatCurrency(metrics.disputed)}</p>
          <p className="mt-1 text-xs text-slate-500">Needs supplier response</p>
        </div>
      </section>

      <section className="rounded-[8px] border border-slate-200 bg-white shadow-3xs">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Invoice Queue</h2>
            <p className="mt-1 text-xs text-slate-500">Track buyer acceptance, risk exceptions, and available financing actions.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="relative block">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={localQuery}
                onChange={(event) => setLocalQuery(event.target.value)}
                placeholder="Search queue..."
                className="w-full rounded-[6px] border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs font-medium text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-[#0052CC] focus:bg-white focus:ring-2 focus:ring-[#0052CC]/10 sm:w-[220px]"
              />
            </label>
            <label className="relative block">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Filter className="h-4 w-4" />
              </span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as 'ALL' | InvoiceStatus)}
                className="w-full appearance-none rounded-[6px] border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-xs font-bold text-slate-700 outline-none transition-colors focus:border-[#0052CC] focus:bg-white focus:ring-2 focus:ring-[#0052CC]/10 sm:w-[190px]"
              >
                <option value="ALL">All statuses</option>
                <option value="PENDING">Pending buyer</option>
                <option value="ACCEPTED">Finance ready</option>
                <option value="FACTORING_REQUESTED">Factoring requested</option>
                <option value="FACTORED">Factored</option>
                <option value="DISPUTED">Disputed</option>
                <option value="SETTLED">Settled</option>
              </select>
            </label>
          </div>
        </div>

        {invoices.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[8px] border border-slate-200 bg-slate-50 text-slate-500">
              <Receipt className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">No supplier invoices in queue</h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
              Submitted supplier invoices will appear here after creation or VerityAPI synchronization.
            </p>
            <button
              type="button"
              onClick={onOpenUploadModal}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-[6px] bg-[#0052CC] px-4 py-2.5 text-[12px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#003D9B]"
            >
              <Plus className="h-4 w-4" />
              Add Invoice
            </button>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-12 text-center">
            <h3 className="text-base font-extrabold text-slate-900">No invoices match these filters</h3>
            <p className="mt-2 max-w-md text-sm text-slate-500">Clear the search or status filter to return to the full supplier queue.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <tr>
                  <th className="px-4 py-3">Invoice Number</th>
                  <th className="px-4 py-3">Buyer Entity</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Maturity Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Funding Status</th>
                  <th className="px-4 py-3 text-right">Primary Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((invoice) => {
                  const StatusIcon = statusIcons[invoice.status];
                  const displayNumber = getInvoiceDisplayNumber(invoice);
                  const fundingStatusDisplay = getFundingStatusDisplay(invoice.fundingStatus);

                  return (
                    <tr key={invoice.id} className="transition-colors hover:bg-slate-50/70">
                      <td className="px-4 py-4 align-top">
                        <button
                          type="button"
                          onClick={() => onOpenReadOnlyInvoiceDetails(invoice.id)}
                          className="text-left font-mono text-sm font-extrabold text-[#0052CC] hover:underline"
                        >
                          {displayNumber}
                        </button>
                        <p className="mt-1 max-w-[220px] truncate text-xs text-slate-500">
                          {invoice.itemDescription ?? 'Supplier receivable'}
                        </p>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <p className="text-sm font-bold text-slate-800">{invoice.buyer}</p>
                        <p className="mt-1 text-xs font-mono text-slate-400">{invoice.buyerId ?? 'Registered buyer pending'}</p>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <p className="text-sm font-extrabold text-slate-950">{formatCurrency(invoice.grossAmount || invoice.amount)}</p>
                        <p className="mt-1 text-xs text-slate-500">USDC receivable</p>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <p className="text-sm font-bold text-slate-800">{invoice.maturityDate}</p>
                        <p className="mt-1 text-xs text-slate-500">{invoice.lifecycleTimeline?.registered ?? 'Registration pending'}</p>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-[6px] border px-2.5 py-1 text-[11px] font-bold ${statusStyles[invoice.status]}`}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {getInvoiceLifecycleLabel(invoice)}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-[6px] border px-2.5 py-1 text-[11px] font-bold ${fundingStatusDisplay.className}`}
                        >
                          {fundingStatusDisplay.label}
                        </span>
                        {invoice.fundingOfferId && (
                          <p className="mt-1 max-w-[150px] truncate font-mono text-[10px] text-slate-400">
                            {invoice.fundingOfferId}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right align-top">{renderPrimaryAction(invoice)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-3xs">
          <div className="flex items-center gap-2 text-[#0052CC]">
            <Banknote className="h-4 w-4" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Funding Handoff</p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Accepted invoices route directly into the existing factoring workflow for advance selection.
          </p>
        </div>
        <div className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-3xs">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="h-4 w-4" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Exception Handoff</p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Disputed invoices open the supplier dispute workspace with the selected invoice in focus.
          </p>
        </div>
        <div className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-3xs">
          <div className="flex items-center gap-2 text-emerald-600">
            <ShieldCheck className="h-4 w-4" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Settlement Handoff</p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Factored invoices keep their final settlement path without exposing a separate sidebar route.
          </p>
        </div>
      </section>
    </main>
  );
}
