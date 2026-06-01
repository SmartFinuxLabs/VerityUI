import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, Network, ArrowRight, Layers, FileLineChart, Coins } from 'lucide-react';

interface HeroProps {
  onEnterSandbox: () => void;
  activeRole: string;
}

export const Hero: React.FC<HeroProps> = ({ onEnterSandbox, activeRole }) => {
  return (
    <div id="hero-section" className="relative overflow-hidden bg-[#FAFAFA] text-zinc-900 pt-20 pb-16 md:pt-28 md:pb-20 border-b border-zinc-200">
      {/* Background Grid Pattern - subtle zinc screen */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_100%,transparent_100%)] opacity-35" />

      {/* Top Banner Alert / Newsletter format ticker */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 md:mb-10 flex justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-zinc-100 border border-zinc-200 text-xs text-zinc-800 shadow-sm">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-zinc-900 font-bold uppercase tracking-widest text-[9px] sm:text-[10px]">VERITY v2.1</span>
          <span className="text-zinc-300">|</span>
          <span className="truncate text-[11px] font-sans text-zinc-650 font-medium font-bold block">Liquidity rails automated. Smart Contracts live on-chain</span>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-500 inline ml-1" />
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-[11px] uppercase tracking-[0.25em] font-extrabold text-zinc-400 block mb-3">DECENTRALIZED SUPPLY CHAIN FACTORING</span>
        
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-light tracking-tighter text-zinc-950 leading-[1.05] mb-6 font-display italic">
          Enterprise Receivables. <br />
          <span className="not-italic font-sans font-black tracking-tight text-zinc-900 block mt-1">
            Programmed for Instant Liquidity
          </span>
        </h1>
        
        <p className="max-w-3xl mx-auto text-sm sm:text-base md:text-lg text-zinc-500 leading-relaxed mb-10 font-sans">
          Verity bridges the trust gap between global enterprise suppliers and institutional capital. 
          Convert buyer-accepted receivables into instant digital working capital via hybrid on-chain payment rails, backed by legally binding smart contract wrappers.
        </p>

        {/* Buttons - Editorial style hard corners */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-20">
          <button
            onClick={onEnterSandbox}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 text-white font-bold tracking-widest uppercase rounded-none transition duration-200 shadow-md cursor-pointer text-xs"
          >
            Launch Interactive Portal
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
          
          <Link
            to="/sandbox"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 bg-white hover:bg-zinc-50 text-zinc-900 font-bold tracking-widest uppercase rounded-none transition duration-200 border border-zinc-300 shadow-sm text-xs"
          >
            How it Works
          </Link>
        </div>

        {/* Platform Core Elements / Live Flow visualizer */}
        <div className="border border-zinc-200 bg-white rounded-none p-6 md:p-8 shadow-sm relative overflow-hidden text-left">
          <div className="absolute top-0 inset-x-0 h-[3px] bg-zinc-900" />
          
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zinc-900 inline-block animate-ping" />
              <p className="text-[10px] sm:text-xs font-mono tracking-widest font-extrabold text-zinc-900 uppercase">Verity Core Settler Engine</p>
            </div>
            <div className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
              BLOCK #49,203,114 • SYSTEM ONLINE
            </div>
          </div>

          {/* Three-part flow visualizer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="relative p-5 rounded-sm bg-zinc-50 border border-zinc-200 hover:border-zinc-350 transition-all">
              <div className="w-10 h-10 rounded-sm bg-zinc-900 text-white flex items-center justify-center mb-4 border border-zinc-400/10 shadow-sm">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 mb-2 flex items-center justify-between">
                <span className="font-display italic text-base">1. Invoice Registered</span>
                <span className="text-[9px] bg-zinc-200 border border-zinc-300 text-zinc-800 tracking-wider uppercase font-mono px-1.5 py-0.5 rounded-sm font-bold">Supplier Hub</span>
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-sans">
                SME registers buyer obligations. Invoice details are cryptographically hashed and verified with multi-signature approval.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-5 rounded-sm bg-zinc-50 border border-zinc-200 hover:border-zinc-350 transition-all">
              <div className="absolute inset-y-0 -left-4 justify-center items-center hidden md:flex">
                <ArrowRight className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="w-10 h-10 rounded-sm bg-zinc-900 text-white flex items-center justify-center mb-4 border border-zinc-400/10 shadow-sm">
                <Coins className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 mb-2 flex items-center justify-between">
                <span className="font-display italic text-base">2. Instant Liquidity Drawn</span>
                <span className="text-[9px] bg-emerald-105 border border-emerald-300 text-emerald-800 tracking-wider uppercase font-mono px-1.5 py-0.5 rounded-sm font-bold">Capital Desk</span>
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-sans">
                Corporate investors purchase verified receivable at discount yield. Instant cash settlement is wired to the SME.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-5 rounded-sm bg-zinc-50 border border-zinc-200 hover:border-zinc-350 transition-all">
              <div className="absolute inset-y-0 -left-4 justify-center items-center hidden md:flex">
                <ArrowRight className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="w-10 h-10 rounded-sm bg-zinc-900 text-white flex items-center justify-center mb-4 border border-zinc-400/10 shadow-sm">
                <FileLineChart className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 mb-2 flex items-center justify-between">
                <span className="font-display italic text-base">3. Clean Auto-Settlement</span>
                <span className="text-[9px] bg-zinc-200 border border-zinc-300 text-zinc-800 tracking-wider uppercase font-mono px-1.5 py-0.5 rounded-sm font-bold">Payer Escrow</span>
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-sans">
                At invoice invoice maturity, corporate buyer pays the platform directly, returning the core principal and profit into capital pools.
              </p>
            </div>

          </div>

          {/* Quick status feed */}
          <div className="mt-8 pt-4 border-t border-zinc-200 flex flex-wrap justify-between items-center gap-4 text-xs text-zinc-500">
            <span className="font-mono flex items-center gap-1.5 font-bold uppercase text-[10px]">
              <Network className="w-3.5 h-3.5 text-zinc-900" /> STATUS: <span className="text-zinc-900 font-sans tracking-wide">Mainnet Syndicate Nodes Connected (4)</span>
            </span>
            <span className="font-mono text-[10px] font-bold">
              Last Synced: Just now (Arbitrum block #294025a)
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
