import React from 'react';

interface TimeTrendPoint {
  period: string;
  createdVolume: number;
  settledVolume: number;
}

interface TimeTrendsChartProps {
  data: TimeTrendPoint[];
}

function formatPeriod(value: string) {
  const timestamp = Date.parse(`${value}-01`);
  if (Number.isNaN(timestamp)) return value;
  return new Intl.DateTimeFormat(undefined, { month: 'short' }).format(new Date(timestamp));
}

function formatCurrency(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function TimeTrendsChart({ data }: TimeTrendsChartProps) {
  const maxAmount = Math.max(1, ...data.map((point) => Math.max(point.createdVolume, point.settledVolume)));

  return (
    <section className="bg-white border border-slate-200 rounded-[8px] p-5 shadow-3xs">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">Historical Invoice Trend</h3>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">Created vs settled</p>
        </div>
        <div className="flex gap-3 text-[10px] font-bold text-slate-500">
          <span className="inline-flex items-center gap-1"><i className="w-2 h-2 rounded-full bg-[#0052CC]" />Created</span>
          <span className="inline-flex items-center gap-1"><i className="w-2 h-2 rounded-full bg-emerald-500" />Settled</span>
        </div>
      </div>

      <div className="h-36 flex items-end gap-3">
        {data.length === 0 ? (
          <div className="w-full h-full rounded-[8px] border border-dashed border-slate-200 flex items-center justify-center text-sm text-slate-400">
            No trend history available.
          </div>
        ) : (
          data.map((point) => (
            <div key={point.period} className="flex-1 min-w-0 h-full flex flex-col justify-end gap-2">
              <div className="h-full flex items-end justify-center gap-1.5">
                <div
                  className="w-4 rounded-t-[4px] bg-[#0052CC]"
                  style={{ height: `${Math.max(8, (point.createdVolume / maxAmount) * 100)}%` }}
                  title={`${formatCurrency(point.createdVolume)} created`}
                />
                <div
                  className="w-4 rounded-t-[4px] bg-emerald-500"
                  style={{ height: `${Math.max(8, (point.settledVolume / maxAmount) * 100)}%` }}
                  title={`${formatCurrency(point.settledVolume)} settled`}
                />
              </div>
              <span className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">{formatPeriod(point.period)}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
