export type CanonicalInvoiceStatus = 'PENDING' | 'ACCEPTED' | 'FACTORING_REQUESTED' | 'FACTORED' | 'SETTLED' | 'DISPUTED';

export interface InvoiceStatusDisplay {
  canonicalStatus: CanonicalInvoiceStatus | 'UNKNOWN';
  label: string;
  className: string;
}

const STATUS_CLASSES: Record<CanonicalInvoiceStatus | 'UNKNOWN', string> = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  ACCEPTED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  FACTORING_REQUESTED: 'bg-sky-100 text-sky-800 border-sky-200',
  FACTORED: 'bg-sky-100 text-sky-800 border-sky-200',
  SETTLED: 'bg-slate-100 text-slate-700 border-slate-200',
  DISPUTED: 'bg-rose-100 text-rose-800 border-rose-200',
  UNKNOWN: 'bg-slate-100 text-slate-700 border-slate-200',
};

const STATUS_LABELS: Record<CanonicalInvoiceStatus, string> = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  FACTORING_REQUESTED: 'Factoring Requested',
  FACTORED: 'FACTORED',
  SETTLED: 'SETTLED',
  DISPUTED: 'DISPUTED',
};

export function getCanonicalInvoiceStatus(status?: string | null): CanonicalInvoiceStatus | 'UNKNOWN' {
  const normalized = (status ?? '').trim().toUpperCase();

  if (normalized === 'PENDING' || normalized === 'PENDING_VERIFICATION' || normalized === 'SUBMITTED' || normalized === 'UNDER_REVIEW') {
    return 'PENDING';
  }

  if (normalized === 'ACCEPTED' || normalized === 'VERIFIED' || normalized === 'PARTIALLY_ACCEPTED') {
    return 'ACCEPTED';
  }

  if (normalized === 'FACTORING_REQUESTED') {
    return 'FACTORING_REQUESTED';
  }

  if (normalized === 'FACTORED') {
    return 'FACTORED';
  }

  if (normalized === 'SETTLED') {
    return 'SETTLED';
  }

  if (normalized === 'DISPUTED' || normalized === 'CONTESTED' || normalized === 'HELD' || normalized === 'REJECTED') {
    return 'DISPUTED';
  }

  return 'UNKNOWN';
}

export function getInvoiceStatusDisplay(status?: string | null): InvoiceStatusDisplay {
  const canonicalStatus = getCanonicalInvoiceStatus(status);
  const normalized = (status ?? '').trim().toUpperCase();
  const label = canonicalStatus === 'UNKNOWN' ? normalized.replace(/_/g, ' ') || 'UNKNOWN' : STATUS_LABELS[canonicalStatus];

  return {
    canonicalStatus,
    label,
    className: `inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider font-mono ${STATUS_CLASSES[canonicalStatus]}`,
  };
}
