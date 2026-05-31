/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TrendingUp, 
  ArrowDownWideNarrow, 
  Calendar, 
  Download, 
  ShieldCheck, 
  FileText, 
  BarChart4, 
  PieChart, 
  Clock, 
  Award, 
  Percent, 
  ChevronRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { LedgerRow, ActiveScreen } from '../types';

interface PortfolioAnalyticsViewProps {
  onNavigate: (screen: ActiveScreen) => void;
  onSelectInvoice: (invoiceId: string) => void;
  ledgerRows: LedgerRow[];
  totalRealizedYield: number;
}

export default function PortfolioAnalyticsView({
  onNavigate,
  onSelectInvoice,
  ledgerRows,
  totalRealizedYield
}: PortfolioAnalyticsViewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('Last 12 Months');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // SVG Bar Chart mock values representing Net Yield trends vs Benchmark
  const chartData = [
    { month: 'Jan', yield: 45, benchmark: 35, yieldVal: '$24K', benchVal: '$18K' },
    { month: 'Mar', yield: 60, benchmark: 40, yieldVal: '$35K', benchVal: '$21K' },
    { month: 'May', yield: 55, benchmark: 42, yieldVal: '$32K', benchVal: '$22K' },
    { month: 'Jul', yield: 75, benchmark: 48, yieldVal: '$48K', benchVal: '$28K' },
    { month: 'Sep', yield: 70, benchmark: 52, yieldVal: '$42K', benchVal: '$30K' },
    { month: 'Nov', yield: 85, benchmark: 55, yieldVal: '$54K', benchVal: '$32K' }
  ];

  return (
    <div className="space-y-6 animate-fade-in" id="portfolio-analytics-view">
      
      {/* Top title and filters bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Portfolio Analytics</h2>
          <p className="text-xs text-slate-400 font-medium mt-1">Realized yield and historical performance benchmarks for institutional liquidity pools</p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Calendar selector */}
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs font-semibold text-slate-600 outline-none cursor-pointer appearance-none hover:bg-slate-50"
            >
              <option>Last 12 Months</option>
              <option>Year to Date (YTD)</option>
              <option>Last Quarter</option>
              <option>All Historical Records</option>
            </select>
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          <button 
            onClick={() => {
              alert("Exporting professional portfolio report in CSV sheet structure. Initiated complete node audit download.");
            }}
            className="bg-white border border-slate-200 hover:bg-slate-50 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 flex items-center space-x-1 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Top Row: Metrics Overview Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5" id="analytics-overview-cards">
        
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Realized Yield</span>
          <span className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight block mt-2">
            ${totalRealizedYield.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <div className="flex items-center mt-3 space-x-1 text-xs text-emerald-600 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12.4% vs last period</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Avg. Annualized Return %</span>
          <span className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight block mt-2">
            11.24%
          </span>
          <span className="text-[10px] text-slate-400 mt-3 block font-semibold uppercase tracking-tight">Weighted Average (XIRR)</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Portfolio Health Score</span>
            <span className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight block mt-2">
              98.2<span className="text-slate-300 font-sans text-sm font-semibold">/100</span>
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '98.2%' }}></div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Settled Volume</span>
          <span className="text-2xl font-extrabold text-brand-primary font-mono tracking-tight block mt-2">
            34.2M <span className="text-slate-400 font-semibold text-xs inline-block">USDC</span>
          </span>
          <span className="text-[10px] text-slate-400 mt-3 block font-semibold">Across 1,248 Settled Invoices</span>
        </div>

      </div>

      {/* Main Charts Row: Yield Trends Bar Chart & Portfolio Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="analytics-charts-row">
        
        {/* Yield Trends Custom Bar Chart (Col 8) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Yield Trends</h3>
                <p className="text-[11px] text-slate-400">Yield comparisons over the chosen accounting period</p>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center space-x-4 text-xs font-semibold">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-brand-primary"></span>
                  <span className="text-slate-500">Net Yield</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-300"></span>
                  <span className="text-slate-400">Benchmark</span>
                </span>
              </div>
            </div>

            {/* Custom Responsive SVG Chart */}
            <div className="relative w-full h-56 pt-2 select-none" id="custom-bar-chart">
              
              {/* Y Axis Grid lines */}
              <div className="absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between pointer-events-none">
                {[100, 75, 50, 25, 0].map((val) => (
                  <div key={val} className="w-full flex items-center text-[10px] text-slate-350">
                    <span className="w-8 shrink-0 font-mono text-[9px] text-slate-400">{val}%</span>
                    <div className="flex-1 border-t border-slate-100 border-dashed"></div>
                  </div>
                ))}
              </div>

              {/* Chart bars canvas area */}
              <div className="absolute left-8 right-0 top-0 bottom-6 flex justify-around items-end">
                {chartData.map((data, index) => (
                  <div 
                    key={data.month} 
                    className="flex flex-col items-center justify-end h-full w-12 group cursor-pointer relative"
                    onMouseEnter={() => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    
                    {/* Tooltip on hover */}
                    {hoveredBar === index && (
                      <div className="absolute bottom-full mb-1.5 bg-slate-900 text-white font-mono text-[10px] p-2 rounded shadow-lg z-20 flex flex-col space-y-0.5 whitespace-nowrap animate-fade-in">
                        <span className="font-sans font-bold text-slate-400 border-b border-white/10 pb-0.5 mb-0.5">{data.month} Payouts</span>
                        <span className="flex justify-between space-x-3"><span>Net Yield:</span> <span className="text-emerald-400 font-bold">{data.yieldVal}</span></span>
                        <span className="flex justify-between space-x-3"><span>Benchmark:</span> <span className="text-slate-300 font-medium">{data.benchVal}</span></span>
                      </div>
                    )}

                    {/* Side-by-side bars */}
                    <div className="flex items-end space-x-1 w-full justify-center">
                      {/* Yield Bar */}
                      <div 
                        className="w-4 bg-brand-primary rounded-t group-hover:bg-brand-primary-container transition-all shadow-sm"
                        style={{ height: `${data.yield}%` }}
                      ></div>
                      {/* Benchmark Bar */}
                      <div 
                        className="w-4 bg-slate-300 rounded-t group-hover:bg-slate-450 transition-all"
                        style={{ height: `${data.benchmark}%` }}
                      ></div>
                    </div>

                    {/* X axis indicator */}
                    <span className="absolute top-full mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-tight">{data.month}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* Portfolio Composition Sector Distribution (Col 4) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 mb-1">Portfolio Composition</h3>
            <p className="text-[11px] text-slate-400 border-b border-slate-100 pb-3">Distribution patterns within the active capital pool</p>
            
            {/* Distribution metrics */}
            <div className="space-y-4 mt-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-500">Manufacturing</span>
                  <span className="font-mono text-slate-800">42%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-primary" style={{ width: '42%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-500">Logistics</span>
                  <span className="font-mono text-slate-800">28%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500" style={{ width: '28%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-500">Retail</span>
                  <span className="font-mono text-slate-800">18%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: '18%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Credit Quality indicators */}
          <div className="pt-3 border-t border-slate-100 mt-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Credit Quality</h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold" id="credit-blocks">
              <div className="p-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg">
                <span className="block font-bold">A</span>
                <span className="text-[9px] text-emerald-600 block mt-0.5">Institutional</span>
              </div>
              <div className="p-2 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg">
                <span className="block font-bold">B</span>
                <span className="text-[9px] text-amber-600 block mt-0.5">Mid-Market</span>
              </div>
              <div className="p-2 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg">
                <span className="block font-bold">C</span>
                <span className="text-[9px] text-rose-600 block mt-0.5">High Yield</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Settled Returns Ledger and Risk Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="ledger-metrics-row">
        
        {/* Ledger Table (Col 8) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between h-full">
          <div>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Settled Returns Ledger</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Verifiable ledger recording settled invoice transaction parameters</p>
              </div>

              <button 
                onClick={() => {
                  alert("Ledger synchronization complete. All 142 historical items are fully audited.");
                }}
                className="text-xs font-bold text-brand-primary hover:underline flex items-center space-x-0.5 cursor-pointer"
              >
                <span>View All Records</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100 h-10">
                    <th className="py-2 px-5">Invoice ID</th>
                    <th className="py-2 px-5">Obligor</th>
                    <th className="py-2 px-5 text-right">Face Value</th>
                    <th className="py-2 px-5 text-right text-emerald-600">Yield Earned</th>
                    <th className="py-2 px-5 text-center">Settlement Date</th>
                    <th className="py-2 px-5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ledgerRows.map((row) => (
                    <tr 
                      key={row.invoiceId} 
                      onClick={() => onSelectInvoice(row.invoiceId)}
                      className="hover:bg-slate-50 cursor-pointer h-12 transition-colors group"
                    >
                      <td className="py-2 px-5 font-mono font-semibold text-brand-primary group-hover:underline">
                        {row.invoiceId}
                      </td>
                      <td className="py-2 px-5 font-extrabold text-slate-800">
                        {row.obligor}
                      </td>
                      <td className="py-2 px-5 text-right font-semibold font-mono text-slate-700">
                        ${row.faceValue.toLocaleString()}
                      </td>
                      <td className="py-2 px-5 text-right font-extrabold font-mono text-emerald-600">
                        +${row.yieldEarned.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-5 text-center text-slate-450 font-medium font-mono whitespace-nowrap">
                        {row.settlementDate}
                      </td>
                      <td className="py-2 px-5 text-center whitespace-nowrap">
                        <span className="text-[9px] font-extrabold uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-lg">
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Risk Metrics Column (Col 4) */}
        <div className="lg:col-span-4 space-y-4" id="analytics-risk-col">
          
          {/* Card Head */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-full">
            <div>
              <h4 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3 mb-4">Risk Metrics</h4>
              
              <div className="space-y-4">
                
                {/* Metric Box 1 */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="flex items-center space-x-1.5 text-slate-400">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Avg. Days to Settlement</span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-lg font-mono font-extrabold text-slate-800">42.4 Days</span>
                    <span className="text-[10.5px] font-bold text-emerald-600 font-mono">-2 days improvement</span>
                  </div>
                </div>

                {/* Metric Box 2 */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="flex items-center space-x-1.5 text-slate-400">
                    <AlertCircle className="w-4 h-4 text-slate-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Dispute Ratio</span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-lg font-mono font-extrabold text-slate-800">0.08%</span>
                    <span className="text-[10.5px] font-bold text-emerald-600">Industry Avg: 0.25%</span>
                  </div>
                </div>

                {/* Metric Box 3 */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="flex items-center space-x-1.5 text-slate-400">
                    <TrendingUp className="w-4 h-4 text-slate-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Retention Release Rate</span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-lg font-mono font-extrabold text-slate-800">98.5%</span>
                    <span className="text-[10.5px] text-emerald-600 font-semibold">Speed: High Efficiency</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
