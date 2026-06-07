import React from 'react';

interface StatusBreakdownPoint {
  status: string;
  count: number;
  totalAmount: number;
}

interface StatusBreakdownChartProps {
  data: StatusBreakdownPoint[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  ACCEPTED: '#0052CC',
  FACTORING_REQUESTED: '#0ea5e9',
  FACTORED: '#8b5cf6',
  SETTLED: '#10b981',
  DISPUTED: '#dc2626',
};

function formatCurrency(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function StatusBreakdownChart({ data }: StatusBreakdownChartProps) {
  const totalCount = data.reduce((total, point) => total + point.count, 0);
  let offset = 25;

  return (
    <section className="bg-white border border-slate-200 rounded-[8px] p-5 shadow-3xs">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">Invoice Status Mix</h3>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">Volume and count</p>
        </div>
        <span className="text-[11px] font-mono font-bold text-slate-500">{totalCount} invoices</span>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative w-32 h-32 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 42 42" aria-label="Invoice status breakdown">
            <circle cx="21" cy="21" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="5" />
            {data.map((point) => {
              const percent = totalCount > 0 ? (point.count / totalCount) * 100 : 0;
              const dash = `${percent} ${100 - percent}`;
              const currentOffset = offset;
              offset -= percent;
              return (
                <circle
                  key={point.status}
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="none"
                  stroke={STATUS_COLORS[point.status] ?? '#64748b'}
                  strokeDasharray={dash}
                  strokeDashoffset={currentOffset}
                  strokeWidth="5"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-extrabold text-slate-900">{totalCount}</span>
            <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400">Total</span>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          {data.length === 0 ? (
            <p className="text-sm text-slate-400">No invoice status data available.</p>
          ) : (
            data.map((point) => (
              <div key={point.status} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: STATUS_COLORS[point.status] ?? '#64748b' }}
                  />
                  <span className="text-xs font-bold text-slate-600 truncate">{point.status}</span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-900">{formatCurrency(point.totalAmount)} USDC</span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
