export type FundingStatus =
  | 'NOT_LISTED'
  | 'ELIGIBLE'
  | 'LISTED'
  | 'COMMITTED'
  | 'FUNDED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface FundingStatusDisplay {
  canonicalStatus: FundingStatus;
  label: string;
  className: string;
}

const fundingStatusDisplays: Record<FundingStatus, FundingStatusDisplay> = {
  NOT_LISTED: {
    canonicalStatus: 'NOT_LISTED',
    label: 'Not Listed',
    className: 'bg-slate-50 text-slate-600 border-slate-200',
  },
  ELIGIBLE: {
    canonicalStatus: 'ELIGIBLE',
    label: 'Eligible',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  LISTED: {
    canonicalStatus: 'LISTED',
    label: 'Marketplace Listed',
    className: 'bg-blue-50 text-[#0052CC] border-blue-200',
  },
  COMMITTED: {
    canonicalStatus: 'COMMITTED',
    label: 'Investor Committed',
    className: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  FUNDED: {
    canonicalStatus: 'FUNDED',
    label: 'Funded',
    className: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
  CANCELLED: {
    canonicalStatus: 'CANCELLED',
    label: 'Cancelled',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  EXPIRED: {
    canonicalStatus: 'EXPIRED',
    label: 'Expired',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
};

export function normalizeFundingStatus(status?: string): FundingStatus {
  const normalized = (status ?? '').toUpperCase();
  if (normalized === 'OPEN' || normalized === 'LISTED_FOR_FUNDING') return 'LISTED';
  if (normalized === 'PARTIALLY_FILLED' || normalized === 'PLEDGED' || normalized === 'CONFIRMED') return 'COMMITTED';
  if (normalized === 'FILLED') return 'FUNDED';
  if (
    normalized === 'NOT_LISTED' ||
    normalized === 'ELIGIBLE' ||
    normalized === 'LISTED' ||
    normalized === 'COMMITTED' ||
    normalized === 'FUNDED' ||
    normalized === 'CANCELLED' ||
    normalized === 'EXPIRED'
  ) {
    return normalized as FundingStatus;
  }
  return 'NOT_LISTED';
}

export function getFundingStatusDisplay(status?: string): FundingStatusDisplay {
  return fundingStatusDisplays[normalizeFundingStatus(status)];
}

export function isActiveFundingStatus(status?: string): boolean {
  const normalized = normalizeFundingStatus(status);
  return normalized === 'LISTED' || normalized === 'COMMITTED' || normalized === 'FUNDED';
}
