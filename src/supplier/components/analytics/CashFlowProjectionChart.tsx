import React from 'react';

interface CashFlowProjectionPoint {
  date: string;
  expectedAmount: number;
  factoredAmount: number;
}

interface CashFlowProjectionChartProps {
  data: CashFlowProjectionPoint[];
}

function formatShortDate(value: string) {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return value;
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(timestamp));
}

function formatCurrency(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function CashFlowProjectionChart({ data }: CashFlowProjectionChartProps) {
  const maxAmount = Math.max(1, ...data.map((point) => point.expectedAmount + point.factoredAmount));
  const totalProjected = data.reduce((total, point) => total + point.expectedAmount + point.factoredAmount, 0);

  return (
    <section className="bg-white border border-slate-200 rounded-[8px] p-5 shadow-3xs">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">Cash Flow Projection</h3>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">Maturity timeline</p>
        </div>
        <span className="text-[11px] font-mono font-bold text-[#0052CC]">{formatCurrency(totalProjected)} USDC</span>
      </div>

      <div className="h-40 flex items-end gap-3">
        {data.length === 0 ? (
          <div className="w-full h-full rounded-[8px] border border-dashed border-slate-200 flex items-center justify-center text-sm text-slate-400">
            No maturity dates available.
          </div>
        ) : (
          data.map((point) => {
            const total = point.expectedAmount + point.factoredAmount;
            const expectedHeight = Math.max(8, (point.expectedAmount / maxAmount) * 100);
            const factoredHeight = Math.max(point.factoredAmount > 0 ? 6 : 0, (point.factoredAmount / maxAmount) * 100);

            return (
              <div key={point.date} className="flex-1 min-w-0 flex flex-col items-center justify-end gap-2 h-full">
                <div className="w-full max-w-[58px] h-full flex flex-col justify-end rounded-t-[8px] overflow-hidden bg-slate-100">
                  <div className="bg-[#0052CC]" style={{ height: `${expectedHeight}%` }} title={`${formatCurrency(point.expectedAmount)} expected`} />
                  <div className="bg-emerald-400" style={{ height: `${factoredHeight}%` }} title={`${formatCurrency(point.factoredAmount)} factored`} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{formatShortDate(point.date)}</span>
                <span className="text-[10px] font-mono font-bold text-slate-700">{formatCurrency(total)}</span>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
