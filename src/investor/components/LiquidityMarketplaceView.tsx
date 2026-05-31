/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowDown, 
  ChevronDown, 
  Search, 
  Star, 
  Zap, 
  HelpCircle, 
  RefreshCw,
  Wallet,
  ShieldCheck,
  Check,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { Invoice, Settlement, ActiveScreen, WalletState } from '../types';

interface LiquidityMarketplaceViewProps {
  onNavigate: (screen: ActiveScreen) => void;
  onSelectInvoice: (invoiceId: string) => void;
  committedCapital: number;
  activeInvestments: number;
  expectedYield: number;
  ytdEarned: number;
  availableCapital: number;
  onSetAvailableCapital: (val: number) => void;
  walletState: WalletState;
  onUpdateWalletBalance: (val: number) => void;
  invoices: Invoice[];
  recentSettlements: Settlement[];
  onTriggerSuccess: (title: string, amount: string | number, hash: string, details: Record<string, string>) => void;
}

export default function LiquidityMarketplaceView({
  onNavigate,
  onSelectInvoice,
  committedCapital,
  activeInvestments,
  expectedYield,
  ytdEarned,
  availableCapital,
  onSetAvailableCapital,
  walletState,
  onUpdateWalletBalance,
  invoices,
  recentSettlements,
  onTriggerSuccess
}: LiquidityMarketplaceViewProps) {
  const [sourceChain, setSourceChain] = useState('Ethereum (ETH)');
  const [bridgeValue, setBridgeValue] = useState('');
  const [isBridging, setIsBridging] = useState(false);
  const [bridgeStep, setBridgeStep] = useState(0); // 0 = idle, 1 = approving, 2 = transfer, 3 = complete
  
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('All Ratings');
  const [maturityFilter, setMaturityFilter] = useState('All Maturities');

  const handleMaxBridge = () => {
    setBridgeValue(walletState.balance.toString());
  };

  const handleBridgeAction = () => {
    const val = parseFloat(bridgeValue);
    if (isNaN(val) || val <= 0) {
      alert("Please enter a valid amount of USDC to bridge.");
      return;
    }
    if (val > walletState.balance) {
      alert(`Insufficient funds. Your wallet balance is ${walletState.balance.toLocaleString()} USDC.`);
      return;
    }

    setIsBridging(true);
    setBridgeStep(1);

    // Simulate stepping: step 1 (approving) takes 1.5s
    setTimeout(() => {
      setBridgeStep(2);
      // Simulate stepping: step 2 (transferring CCTP) takes 2s
      setTimeout(() => {
        setBridgeStep(3);
        // Finalize transaction
        const fee = 25;
        const netAmt = val - fee;
        onUpdateWalletBalance(walletState.balance - val);
        onSetAvailableCapital(availableCapital + val); // Bridge adds to active pool
        
        const txHash = '0xcctp' + Array.from({ length: 40 }, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join('').substring(0, 10) + '...' + Array.from({ length: 4 }, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join('');

        setIsBridging(false);
        setBridgeStep(0);
        setBridgeValue('');

        onTriggerSuccess(
          "Liquidity Bridged Successfully",
          val,
          txHash,
          {
            "Source Chain": sourceChain,
            "Destination Chain": "Arc Network (CCTP)",
            "Estimated Time": "Immediate (CCTP Node)",
            "System Fee": "$25.00"
          }
        );
      }, 1800);
    }, 1500);
  };

  // Filter invoices for the marketplace section. 
  // Market opportunities are typically those in state 'Available' or similar
  const filteredInvoices = invoices.filter(inv => {
    // Basic search on obligor
    const matchesSearch = inv.obligor.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inv.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inv.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Rating filter mapping
    let matchesRating = true;
    if (ratingFilter === 'AAA Only') {
      matchesRating = inv.buyerRating === 'AAA' || inv.buyerRating === 'AA';
    } else if (ratingFilter === 'A Grade +') {
      matchesRating = inv.buyerRating.startsWith('A');
    }

    // Maturity mapping
    let matchesMaturity = true;
    if (maturityFilter === 'Short-Term (<30d)') {
      matchesMaturity = inv.maturity < 30;
    } else if (maturityFilter === 'Mid-Term (30-60d)') {
      matchesMaturity = inv.maturity >= 30 && inv.maturity <= 60;
    } else if (maturityFilter === 'Long-Term (>60d)') {
      matchesMaturity = inv.maturity > 60;
    }

    return matchesSearch && matchesRating && matchesMaturity;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="liquidity-marketplace-view">
      
      {/* Top Breadcrumb control */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => onNavigate('direct-funding')}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-brand-primary cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        
        {isBridging && (
          <div className="flex items-center space-x-2 bg-brand-primary/5 text-brand-primary px-3 py-1.5 rounded-lg text-xs font-medium border border-brand-primary/10 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Bridge node synchronized... processing</span>
          </div>
        )}
      </div>

      {/* Main Row: Portfolio Summary and Bridge Liquidity Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="liquidity-summary">
        
        {/* Portfolio Summary Card (Col 7/8) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 mb-5">Portfolio Summary</h3>
            
            {/* Top Stat Row inside card */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-5 border-b border-slate-100" id="sub-stats">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Committed Capital</span>
                <span className="text-base font-extrabold text-brand-primary font-mono block mt-1">
                  ${committedCapital.toLocaleString('en-US')}
                </span>
                <span className="text-[10px] text-slate-400">USDC Pool</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Investments</span>
                <span className="text-base font-extrabold text-slate-800 font-mono block mt-1">
                  ${activeInvestments.toLocaleString('en-US')}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Expected Yield</span>
                <span className="text-base font-extrabold text-brand-secondary font-mono block mt-1">
                  {expectedYield.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">YTD Earned</span>
                <span className="text-base font-extrabold text-emerald-600 font-mono block mt-1">
                  +${ytdEarned.toLocaleString('en-US')}
                </span>
              </div>
            </div>

            {/* Recent Settlements Inner Table */}
            <div className="mt-5">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Recent Settlements</h4>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-slate-400 font-medium border-b border-slate-100 pb-2">
                      <th className="pb-2 font-semibold">Invoice ID</th>
                      <th className="pb-2 font-semibold">Date</th>
                      <th className="pb-2 font-semibold text-right">Amount</th>
                      <th className="pb-2 font-semibold text-right text-emerald-600">Yield</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-mono text-slate-700">
                    {recentSettlements.slice(3, 6).map((set) => (
                      <tr key={set.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 font-semibold text-brand-primary">
                          <button 
                            onClick={() => onSelectInvoice(set.invoiceId)}
                            className="hover:underline hover:text-brand-primary-container text-left cursor-pointer"
                          >
                            {set.invoiceId}
                          </button>
                        </td>
                        <td className="py-2.5 text-slate-500">05/18/2026</td>
                        <td className="py-2.5 text-right font-medium">${set.amount.toLocaleString()}</td>
                        <td className="py-2.5 text-right font-bold text-emerald-600">+${set.yieldEarned?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Deposit Liquidity Interactive Card (Col 5) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-1.5">
                <span>Deposit Liquidity</span>
              </h3>
              <RefreshCw className={`w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600 ${isBridging ? 'animate-spin' : ''}`} />
            </div>

            {isBridging ? (
              <div className="py-10 flex flex-col items-center justify-center space-y-4" id="bridge-progress-state">
                <div className="relative flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-brand-primary/10 border-t-brand-primary rounded-full animate-spin"></div>
                  <Wallet className="w-6 h-6 text-brand-primary absolute" />
                </div>
                
                <div className="text-center space-y-1">
                  {bridgeStep === 1 ? (
                    <>
                      <p className="text-sm font-bold text-slate-800">Approving USDC in Wallet...</p>
                      <p className="text-xs text-slate-400">Verifying security signature hash node...</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-indigo-700">Executing CCTP Cross-Chain Bridge...</p>
                      <p className="text-xs text-slate-400">Ethereum Network ➔ Arc Network</p>
                    </>
                  )}
                </div>

                {/* Progress Indicators */}
                <div className="w-full max-w-xs grid grid-cols-2 gap-2 pt-2 text-[10px] text-center font-bold font-mono">
                  <div className={`p-1.5 rounded border ${bridgeStep >= 1 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400'}`}>
                    1. APP IN-WALLET
                  </div>
                  <div className={`p-1.5 rounded border ${bridgeStep >= 2 ? 'bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                    2. GATE BRIDGE
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4" id="bridge-inputs-form">
                
                {/* Source dropdown */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Source Chain</label>
                  <div className="relative">
                    <select 
                      value={sourceChain}
                      onChange={(e) => setSourceChain(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg p-3 text-xs outline-none font-semibold text-slate-700 appearance-none cursor-pointer"
                    >
                      <option>Ethereum (ETH)</option>
                      <option>Arbitrum (ARB)</option>
                      <option>Optimism (OP)</option>
                      <option>Polygon (POL)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <div className="flex justify-center -my-1">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
                    <ArrowDown className="w-4 h-4" />
                  </div>
                </div>

                {/* Destination */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Destination</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">Arc Network</span>
                    <span className="text-[10px] font-mono tracking-wider font-semibold uppercase bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded">CCTP</span>
                  </div>
                </div>

                {/* Bridge Input */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Amount to Bridge (USDC)</label>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Available: <span className="font-mono font-bold text-slate-700">{walletState.balance.toLocaleString()} USDC</span>
                    </span>
                  </div>
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      value={bridgeValue}
                      onChange={(e) => setBridgeValue(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg p-3 pr-16 text-sm font-extrabold font-mono text-slate-800 outline-none"
                    />
                    <button 
                      onClick={handleMaxBridge}
                      className="absolute right-3 top-2 px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded text-[10px] font-bold text-slate-700 transition"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                {/* Summary Table */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Est. Fee</span>
                    <span className="font-mono font-semibold text-slate-700">$25 (0.005%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Est. Time</span>
                    <span className="font-mono font-semibold text-slate-700">~15 seconds</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleBridgeAction}
            disabled={isBridging}
            className={`w-full mt-4 flex items-center justify-center space-x-1 border border-transparent font-bold py-3 px-4 rounded-lg cursor-pointer text-sm shadow transition-all ${
              isBridging 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-brand-primary text-white hover:bg-brand-primary-container hover:-translate-y-0.5'
            }`}
          >
            <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400 pr-0.5" />
            <span>Approve & Bridge</span>
          </button>
        </div>
      </div>

      {/* Invoice Marketplace Section (Bottom Grid) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6" id="marketplace-grid-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Invoice Marketplace</h3>
            <p className="text-xs text-slate-400 mt-0.5">Filter, assess, and instantly fund short-term institutional asset streams</p>
          </div>

          {/* Search and Filters Block */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search inputs */}
            <div className="relative min-w-[200px] flex-1">
              <input 
                type="text" 
                placeholder="Search Buyer..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none text-slate-700 placeholder-slate-400 focus:bg-white"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>

            {/* Rating Filter dropdown */}
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 outline-none cursor-pointer"
            >
              <option>All Ratings</option>
              <option>AAA Only</option>
              <option>A Grade +</option>
            </select>

            {/* Maturity Filter dropdown */}
            <select
              value={maturityFilter}
              onChange={(e) => setMaturityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 outline-none cursor-pointer"
            >
              <option>All Maturities</option>
              <option>Short-Term (&lt;30d)</option>
              <option>Mid-Term (30-60d)</option>
              <option>Long-Term (&gt;60d)</option>
            </select>
          </div>
        </div>

        {/* Invoice Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="marketplace-cards-list">
          {filteredInvoices.map((inv) => (
            <div 
              key={inv.id} 
              className="bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-brand-primary hover:shadow-[0px_6px_18px_rgba(0,0,0,0.04)] transition-all duration-200 flex flex-col justify-between"
              id={`invoice-card-${inv.id}`}
            >
              {/* Card top banner */}
              <div className="p-5 border-b border-slate-100 flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-extrabold text-brand-primary block">
                    #{inv.id}
                  </span>
                  <p className="text-xs font-bold text-slate-800 mt-2 flex items-center space-x-1.5">
                    <span>{inv.supplier}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-brand-primary">{inv.obligor}</span>
                  </p>
                </div>

                <div className="flex items-center space-x-1 shrink-0 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                  <span className="text-[10px] font-bold text-slate-700 font-mono">5.0</span>
                </div>
              </div>

              {/* Card body table */}
              <div className="p-5 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Amount</span>
                  <span className="font-mono font-extrabold text-slate-900 block mt-1">
                    ${inv.faceValue.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Yield</span>
                  <span className="font-mono font-extrabold text-brand-secondary block mt-1">
                    {inv.discount.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Maturity</span>
                  <span className="font-mono font-semibold text-slate-700 block mt-0.5">
                    {inv.maturity} Days
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Status</span>
                  <div className="mt-1 flex">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-2 py-0.5 rounded-lg">
                      ACCEPTED
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button inside card */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  onClick={() => onSelectInvoice(inv.id)}
                  className="w-full bg-white hover:bg-brand-primary hover:text-white border border-slate-200 hover:border-brand-primary/40 text-brand-primary text-xs font-bold py-2 px-3 rounded-lg transition-all duration-150 cursor-pointer shadow-sm flex items-center justify-center space-x-1"
                >
                  <span>Fund This Invoice</span>
                </button>
              </div>
            </div>
          ))}

          {filteredInvoices.length === 0 && (
            <div className="col-span-full py-10 text-center text-slate-400 text-xs">
              No active invoice opportunities match your search parameters. Try clearing filters.
            </div>
          )}
        </div>

        {/* Load more */}
        {filteredInvoices.length > 0 && (
          <div className="mt-6 text-center">
            <button 
              onClick={() => {
                alert("More institutional invoices verified dynamically. (Cross chain ledger synchronized successfully).");
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-850 hover:underline transition-colors"
            >
              Load More Opportunities
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
