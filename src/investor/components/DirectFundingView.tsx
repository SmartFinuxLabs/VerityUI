/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  Filter, 
  FileSpreadsheet, 
  Bookmark, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Server,
  Download,
  Lock,
  Search,
  Truck,
  Cpu,
  Sun,
  ShoppingBag,
  Car,
  Layers,
  Clock,
  CheckCircle,
  HelpCircle,
  QrCode
} from 'lucide-react';
import { Invoice, Settlement, ActiveScreen } from '../types';

interface DirectFundingViewProps {
  onNavigate: (screen: ActiveScreen) => void;
  onSelectInvoice: (invoiceId: string) => void;
  totalCommitted: number;
  activeInvestments: number;
  projectedYield: number;
  availableCapital: number;
  invoices: Invoice[];
  settlements: Settlement[];
  onExportCSV: () => void;
}

export default function DirectFundingView({
  onNavigate,
  onSelectInvoice,
  totalCommitted,
  activeInvestments,
  projectedYield,
  availableCapital,
  invoices,
  settlements,
  onExportCSV
}: DirectFundingViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Get first 4 available opportunities for the dashboard
  const topOpportunities = invoices
    .filter(inv => inv.status === 'Available' && inv.id !== 'INV-2026-089')
    .slice(0, 4);

  // If we have search query of course filter
  const filteredOpportunities = invoices
    .filter(inv => 
      inv.status === 'Available' && 
      (inv.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
       inv.obligor.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  const displayList = searchQuery ? filteredOpportunities : topOpportunities;

  // Render SVG checkmark or specific obligor icons
  const renderObligorIcon = (type: string) => {
    switch (type) {
      case 'logistics':
        return <Truck className="w-4 h-4 text-slate-500" />;
      case 'assembly':
        return <Cpu className="w-4 h-4 text-slate-500" />;
      case 'renewables':
        return <Sun className="w-4 h-4 text-slate-500" />;
      case 'retail':
        return <ShoppingBag className="w-4 h-4 text-slate-500" />;
      case 'motors':
        return <Car className="w-4 h-4 text-slate-500" />;
      default:
        return <Layers className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6" id="direct-funding-view">
      {/* Top Search bar inside Header handled by App.tsx, but page also contains inline items */}
      
      {/* Dynamic Status / Metrics Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5" id="stats-grid">
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-[0px_4px_12px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:border-slate-300 transition-all duration-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Committed</p>
          <p className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
            ${totalCommitted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center space-x-1.5 mt-3 text-emerald-600 font-semibold text-xs">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+4.2% vs last month</span>
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-brand-primary/5 rounded-bl-full translate-x-8 translate-y-8 -z-10 group-hover:bg-brand-primary/10 transition-colors"></div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-[0px_4px_12px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:border-slate-300 transition-all duration-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Active Investments</p>
          <p className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
            ${activeInvestments.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-3 font-medium flex items-center space-x-1">
            <span>Across 142 active invoices</span>
          </p>
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-brand-secondary/5 rounded-bl-full translate-x-8 translate-y-8 -z-10 transition-colors"></div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-[0px_4px_12px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:border-slate-300 transition-all duration-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Projected Yield (APY)</p>
          <p className="text-2xl font-extrabold text-brand-secondary font-mono tracking-tight">
            {projectedYield.toFixed(2)}%
          </p>
          <div className="flex items-center space-x-1.5 mt-3 text-slate-500 font-medium text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Above benchmark (7.2%)</span>
          </div>
        </div>

        {/* Metric 4 - Focus Available Capital */}
        <div className="bg-white p-6 rounded-xl border-2 border-brand-primary shadow-[0px_6px_18px_rgba(0,82,204,0.08)] relative overflow-hidden group transition-all duration-200">
          <p className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-2">Available Capital</p>
          <p className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
            ${availableCapital.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <button 
            onClick={() => onNavigate('liquidity-marketplace')}
            className="w-full mt-3 bg-brand-primary hover:bg-brand-primary-container text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 shadow-sm group-hover:-translate-y-0.5 cursor-pointer transition-all"
          >
            <span>VIEW OPPORTUNITIES</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary Dashboard Layout Grid: Columns 8 and 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-body">
        
        {/* Column Left (Col 8) */}
        <div className="lg:col-span-8 space-y-6 flex flex-col justify-between" id="dashboard-left">
          
          {/* Table Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">Investment Opportunities</h3>
                <p className="text-xs text-slate-400 mt-0.5">Verified institutional invoices ready for funding</p>
              </div>

              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => {
                    const el = document.getElementById('dash-search') as HTMLInputElement;
                    if (el) el.focus();
                  }}
                  className="px-3 py-2 text-xs font-semibold border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span>Filter</span>
                </button>
                <button 
                  onClick={onExportCSV}
                  className="px-3 py-2 text-xs font-semibold border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                  <span>Export CSV</span>
                </button>
                <button 
                  onClick={() => onNavigate('liquidity-marketplace')}
                  className="px-3 py-2 text-xs font-bold bg-brand-primary hover:bg-brand-primary-container text-white rounded-lg flex items-center space-x-1 transition-all cursor-pointer shadow-sm"
                >
                  <span>Go to Marketplace</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Inline search filter */}
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center space-x-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                id="dash-search"
                type="text" 
                placeholder="Search verified obligor name or invoice ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs p-1 outline-none text-slate-800 placeholder-slate-400"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Opportunities Table */}
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-5">Invoice ID</th>
                    <th className="py-3.5 px-5">Obligor</th>
                    <th className="py-3.5 px-5 text-right">Face Value</th>
                    <th className="py-3.5 px-5 text-center">Discount %</th>
                    <th className="py-3.5 px-5 text-right">Maturity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayList.map((inv, idx) => (
                    <tr 
                      key={inv.id} 
                      onClick={() => onSelectInvoice(inv.id)}
                      className={`hover:bg-slate-50 cursor-pointer h-14 group transition-colors duration-150 ${idx % 2 === 1 ? 'bg-slate-50/30' : ''}`}
                    >
                      <td className="py-3 px-5">
                        <span className="text-xs font-semibold text-brand-primary group-hover:underline font-mono">
                          #{inv.id}
                        </span>
                      </td>
                      <td className="py-3 px-5">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200/50 flex items-center justify-center shrink-0">
                            {renderObligorIcon(inv.logoType)}
                          </div>
                          <div>
                            <span className="text-xs font-extrabold text-slate-800 block leading-tight">
                              {inv.obligor}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Verified Asset • S&P {inv.buyerRating}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-5 text-right">
                        <span className="text-xs font-extrabold font-mono text-slate-900">
                          ${inv.faceValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-center">
                        <span className="text-xs font-semibold font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {inv.discount.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right text-xs font-semibold text-slate-500 font-mono">
                        {inv.maturity} Days
                      </td>
                    </tr>
                  ))}

                  {displayList.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400 text-xs">
                        No active investment opportunities match your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Opportunities Footer Footer */}
            {!searchQuery && (
              <div className="p-4 border-t border-slate-100 text-center bg-slate-50/50">
                <button
                  onClick={() => onNavigate('liquidity-marketplace')}
                  className="text-xs font-bold text-brand-primary hover:text-brand-primary-container inline-flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <span>View All Opportunities (124+)</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Column Right (Col 4) */}
        <div className="lg:col-span-4 space-y-6" id="dashboard-right-col">
          
          {/* Recent Settlements */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-slate-900">Recent Settlements</h3>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>

              {/* Settlement Timeline list */}
              <div className="space-y-4">
                {settlements.slice(0, 3).map((set) => (
                  <div key={set.id} className="relative pl-5 border-l-2 border-slate-100 last:border-0 pb-1" id={`timeline-${set.id}`}>
                    <div className="absolute left-0 top-0.5 -translate-x-[5px] w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-100"></div>
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                          <span>{set.invoiceId} Settled</span>
                          {set.id === 'INV-77418' && (
                            <span className="text-[9px] px-1 bg-amber-50 rounded text-amber-700 font-mono font-medium">Pending</span>
                          )}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">Payer: {set.payer}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono font-medium shrink-0">{set.timeAgo}</span>
                    </div>

                    <div className="mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Principal + Interest</span>
                      <span className="font-mono font-bold text-emerald-600">
                        +${set.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => onNavigate('portfolio-analytics')}
              className="w-full mt-5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <span>FULL HISTORY</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom widgets grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-bottom-row">
        
        {/* Risk Distribution Card (Col 4) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h4 className="font-bold text-sm text-slate-900 mb-4">Risk Distribution</h4>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-500 font-medium">Investment Grade (A-AAA)</span>
                <span className="font-mono font-bold text-slate-800">64%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-brand-primary rounded-full" style={{ width: '64%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-500 font-medium">Upper Mid-Market (B-BBB)</span>
                <span className="font-mono font-bold text-slate-800">28%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full" style={{ width: '28%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-500 font-medium">High Yield (C)</span>
                <span className="font-mono font-bold text-slate-800">8%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '8%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Analysis Card (Col 4) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-900 mb-2">Performance Analysis</h4>
            <p className="text-xs text-slate-400 mt-1">
              Generate deep-dive portfolio reports incorporating real-time yield trend indices, stress evaluations, and multi-network settlement parameters.
            </p>
          </div>
          
          <button 
            onClick={() => {
              alert("Your comprehensive performance analysis has loaded. Staggered risk report compiled into raw PDF representation. (Simulated Download Initiated)");
            }}
            className="w-full mt-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Download PDF Report</span>
          </button>
        </div>

        {/* Network Status / Multi-Party Computation blue Card (Col 4) */}
        <div className="lg:col-span-4 bg-brand-primary text-white p-5 rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-on-primary-container">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute border border-brand-primary inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block animate-ping"></span>
                <span className="pl-1">Network Status: Online</span>
              </span>
              <Server className="w-4 h-4 text-brand-on-primary-container" />
            </div>

            <div>
              <h4 className="font-extrabold text-base text-white tracking-wide">Institutional Integrity</h4>
              <p className="text-xs text-brand-on-primary-container mt-1.5 leading-relaxed font-light">
                Your investments are secured via multi-party computation and real-time blockchain settlement nodes.
              </p>
            </div>
          </div>

          <div className="mt-4 bg-brand-primary-container p-3 rounded-lg border border-white/10 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-[9px] text-brand-on-primary-container block uppercase font-sans font-bold">Settlement Node</span>
              <span className="font-semibold text-white">US-EAST-01-VERITY</span>
            </div>
            <QrCode className="w-5 h-5 text-brand-on-primary-container shrink-0" />
          </div>

          <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8"></div>
        </div>
      </div>
    </div>
  );
}
