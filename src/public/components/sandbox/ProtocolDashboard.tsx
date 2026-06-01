import React from 'react';
import { TrendingUp, BarChart3, Database, Users, Landmark, Zap } from 'lucide-react';
import { PlatformStats } from '../../types';

interface ProtocolDashboardProps {
  stats: PlatformStats;
}

export const ProtocolDashboard: React.FC<ProtocolDashboardProps> = ({ stats }) => {
  const maxVolumeVal = 10;
  const volumeData = [
    { label: 'Jan', value: 1.2 },
    { label: 'Feb', value: 1.8 },
    { label: 'Mar', value: 2.5 },
    { label: 'Apr', value: 3.4 },
    { label: 'May', value: stats.cumulativeFinanced / 1000000 },
  ];

  const yieldData = [
    { label: 'Jan', rate: 5.8 },
    { label: 'Feb', rate: 5.9 },
    { label: 'Mar', rate: 6.1 },
    { label: 'Apr', rate: 6.3 },
    { label: 'May', rate: stats.averageYield * 100 },
  ];

  const chartWidth = 500;
  const chartHeight = 150;
  const padding = 20;

  const getLineCoordinates = () => {
    return volumeData.map((point, index) => {
      const x = padding + (index * (chartWidth - padding * 2)) / (volumeData.length - 1);
      const y = chartHeight - padding - (point.value * (chartHeight - padding * 2)) / maxVolumeVal;
      return { x, y, ...point };
    });
  };

  const lineCoords = getLineCoordinates();
  const linePath = lineCoords.map((coord, index) => `${index === 0 ? 'M' : 'L'} ${coord.x} ${coord.y}`).join(' ');
  const areaPath = `${linePath} L ${lineCoords[lineCoords.length - 1].x} ${chartHeight - padding} L ${lineCoords[0].x} ${chartHeight - padding} Z`;

  return (
    <section id="protocol-analytics" className="py-24 bg-zinc-50 border-t border-b border-zinc-200 text-zinc-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8">
          <h3 className="font-display text-2xl sm:text-3xl font-light italic text-zinc-950 tracking-tight mb-3">
            Live Portfolio Accounting.
          </h3>
          <p className="max-w-3xl mx-auto text-xs sm:text-sm text-zinc-500 leading-relaxed font-sans">
            Swap between participant personas to experience live, real-time double-entry ledger settlement on-chain with automatic fraud prevention.
          </p>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-[0.25em] font-extrabold text-zinc-400 block mb-2">PROTOCOL METRICS FEED</span>
            <h2 className="font-display text-3xl sm:text-4xl font-light italic text-zinc-950 tracking-tight leading-none">Live Portfolio Accounting</h2>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-200 rounded-none text-[10px] font-mono font-bold uppercase text-zinc-700 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            Oracle Feed Sync Active (12s refresh)
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="p-6 bg-white border border-zinc-250 hover:border-zinc-350 transition-all shadow-sm rounded-none flex flex-col justify-between relative group">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-zinc-900" />
            <div className="flex justify-between items-center text-zinc-400 mb-4">
              <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-zinc-400">Total Value Locked</span>
              <Database className="w-4 h-4 text-zinc-900" />
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-zinc-950 tracking-tight leading-none mb-3">
              ${stats.totalValueLocked.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> +14.2% Monthly
            </div>
          </div>

          <div className="p-6 bg-white border border-zinc-250 hover:border-zinc-350 transition-all shadow-sm rounded-none flex flex-col justify-between relative group">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-zinc-900" />
            <div className="flex justify-between items-center text-zinc-400 mb-4">
              <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-zinc-400">Cumulative Financed</span>
              <Landmark className="w-4 h-4 text-zinc-900" />
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-zinc-950 tracking-tight leading-none mb-3">
              ${stats.cumulativeFinanced.toLocaleString()}
            </div>
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider font-mono">
              Aggregate factored assets
            </div>
          </div>

          <div className="p-6 bg-white border border-zinc-250 hover:border-zinc-350 transition-all shadow-sm rounded-none flex flex-col justify-between relative group">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-zinc-900" />
            <div className="flex justify-between items-center text-zinc-400 mb-4">
              <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-zinc-400">Avg Factoring Yield</span>
              <BarChart3 className="w-4 h-4 text-zinc-900" />
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-zinc-950 tracking-tight leading-none mb-3">
              {(stats.averageYield * 100).toFixed(2)}% <span className="text-xs font-sans text-zinc-400 uppercase font-bold">APY</span>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider font-mono text-zinc-500">
              AAA-BBB Payer Arbitrage
            </div>
          </div>

          <div className="p-6 bg-white border border-zinc-250 hover:border-zinc-350 transition-all shadow-sm rounded-none flex flex-col justify-between relative group">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-zinc-900" />
            <div className="flex justify-between items-center text-zinc-400 mb-4">
              <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-zinc-400">Suppliers Active</span>
              <Users className="w-4 h-4 text-zinc-900" />
            </div>
            <div className="text-xl sm:text-2xl font-mono font-bold text-zinc-950 tracking-tight leading-none mb-3">
              {stats.activeSuppliersCount} <span className="text-xs font-sans text-zinc-400 uppercase font-bold">Firms</span>
            </div>
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider font-mono">
              Total active global businesses
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-6 sm:p-8 bg-white border border-zinc-200 rounded-none shadow-sm relative">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-zinc-950">Cumulative Checkout Capital Growth</h3>
                <p className="text-xs text-zinc-500">Measured in Millions of USD ($M)</p>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-800 bg-zinc-100 border border-zinc-200 px-2 py-1 rounded-none shadow-sm">
                Growth Feed
              </span>
            </div>

            <div className="w-full h-44 relative bg-zinc-50 rounded-none border border-zinc-200 p-2 overflow-hidden">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#71717A" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#71717A" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {lineCoords.map((coord, index) => (
                  <line key={index} x1={coord.x} y1={padding} x2={coord.x} y2={chartHeight - padding} stroke="#E4E4E7" strokeWidth="1" strokeDasharray="3,3" />
                ))}

                {[0, 2.5, 5.0, 7.5, 10.0].map((value, index) => {
                  const y = chartHeight - padding - (value * (chartHeight - padding * 2)) / maxVolumeVal;
                  return (
                    <line key={index} x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="#E4E4E7" strokeWidth="1" />
                  );
                })}

                <path d={areaPath} fill="url(#areaGlow)" />
                <path d={linePath} fill="none" stroke="#09090B" strokeWidth="2.5" strokeLinecap="round" />

                {lineCoords.map((coord, index) => (
                  <g key={index}>
                    <circle cx={coord.x} cy={coord.y} r="4" fill="#FFFFFF" stroke="#09090B" strokeWidth="2" />
                    {index === lineCoords.length - 1 && (
                      <circle cx={coord.x} cy={coord.y} r="8" fill="none" stroke="#10b981" strokeWidth="1" className="animate-pulse" />
                    )}
                  </g>
                ))}
              </svg>

              <div className="absolute top-3 left-4 text-[9px] font-mono text-zinc-400 font-bold space-y-7.5">
                <div>$10.0M</div>
                <div>$5.0M</div>
                <div>$0.0M</div>
              </div>
            </div>

            <div className="flex justify-between px-6 text-[10px] font-mono text-zinc-500 mt-4">
              {volumeData.map((point, index) => (
                <div key={index} className="text-center font-bold">
                  {point.label}
                  <span className="block text-[9px] text-zinc-950">${point.value.toFixed(1)}M</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-8 bg-white border border-zinc-200 rounded-none shadow-sm relative">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-zinc-950">Weighted Factoring APY Index by Period</h3>
                <p className="text-xs text-zinc-500">Supplier credit spread arbitrage returns (%)</p>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-800 bg-zinc-100 border border-zinc-200 px-2 py-1 rounded-none shadow-sm">
                Factor Yield APY
              </span>
            </div>

            <div className="flex justify-between items-end h-44 bg-zinc-50 rounded-none border border-zinc-250 px-6 sm:px-12 py-4">
              {yieldData.map((point, index) => {
                const heightPercentage = (point.rate / 10) * 100;
                const isCurrent = index === yieldData.length - 1;

                return (
                  <div key={index} className="flex flex-col items-center group w-8 sm:w-12 h-full justify-end relative">
                    <div
                      style={{ height: `${heightPercentage}%` }}
                      className={`w-4 sm:w-6 rounded-none transition-all duration-500 relative ${
                        isCurrent
                          ? 'bg-zinc-900 border-t border-zinc-950 shadow-sm'
                          : 'bg-zinc-200 group-hover:bg-zinc-300 border-t border-zinc-300'
                      }`}
                    >
                      <div className="absolute top-0 inset-x-0 h-[1.5px] bg-white/20" />
                    </div>

                    <div className="text-[10px] font-mono text-zinc-500 mt-2 font-bold uppercase">
                      {point.label}
                    </div>
                    <div className={`text-[9px] font-mono font-extrabold mt-0.5 ${isCurrent ? 'text-zinc-950 underline' : 'text-zinc-400'}`}>
                      {point.rate.toFixed(1)}%
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 justify-center mt-4 text-[10px] text-zinc-450 font-mono font-bold">
              <Zap className="w-3.5 h-3.5 text-zinc-950" />
              DETERMINED BY MULTI-SIG ORACLE UNDERWRITING ALIGNMENT
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
