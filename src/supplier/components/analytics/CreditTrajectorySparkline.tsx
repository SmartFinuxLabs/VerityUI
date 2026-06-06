import React from 'react';

interface CreditHistoryPoint {
  period: string;
  score: number;
}

interface CreditTrajectorySparklineProps {
  data: CreditHistoryPoint[];
}

export function CreditTrajectorySparkline({ data }: CreditTrajectorySparklineProps) {
  const points = data.length > 0 ? data : [{ period: 'Current', score: 0 }];
  const minScore = Math.min(...points.map((point) => point.score), 600);
  const maxScore = Math.max(...points.map((point) => point.score), 850);
  const range = Math.max(1, maxScore - minScore);
  const pathPoints = points.map((point, index) => {
    const x = points.length === 1 ? 100 : (index / (points.length - 1)) * 200;
    const y = 58 - ((point.score - minScore) / range) * 46;
    return `${x},${y}`;
  });
  const latest = points.at(-1)?.score ?? 0;
  const previous = points.at(-2)?.score ?? latest;
  const delta = latest - previous;

  return (
    <section className="bg-white border border-slate-200 rounded-[8px] p-5 shadow-3xs">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">Credit Trajectory</h3>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1">On-chain reputation</p>
        </div>
        <span className={`text-[11px] font-mono font-bold ${delta >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {delta >= 0 ? '+' : ''}{delta} pts
        </span>
      </div>
      <svg className="w-full h-20" viewBox="0 0 200 64" role="img" aria-label="Credit score history">
        <polyline fill="none" stroke="#dbeafe" strokeWidth="10" strokeLinecap="round" points={pathPoints.join(' ')} />
        <polyline fill="none" stroke="#0052CC" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={pathPoints.join(' ')} />
        {pathPoints.map((point, index) => {
          const [cx, cy] = point.split(',');
          return <circle key={points[index].period} cx={cx} cy={cy} r="3.5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />;
        })}
      </svg>
      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        <span>{points[0].period}</span>
        <span>{points.at(-1)?.period}</span>
      </div>
    </section>
  );
}
