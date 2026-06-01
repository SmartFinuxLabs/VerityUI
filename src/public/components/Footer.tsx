import React from 'react';
import { Link } from 'react-router-dom';
import { Landmark, Github, Twitter, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-zinc-900 border-t border-zinc-200 py-20 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Info Column */}
        <div className="md:col-span-2 space-y-5">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 bg-zinc-900 text-white flex items-center justify-center rounded-none shadow-sm">
              <Landmark className="w-4 h-4" />
            </div>
            <span className="font-display text-xl font-light italic tracking-tight text-zinc-950">
              Verity Protocol
            </span>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
            On-chain credit administration and logistics accounting coordinating decentralized receivables factoring, corporate payables verification, and multijurisdictional automated maturity settlement.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <a href="#" className="p-2 bg-zinc-50 border border-zinc-200 text-zinc-650 hover:text-zinc-950 hover:bg-zinc-100 transition-all rounded-none shadow-sm">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 bg-zinc-50 border border-zinc-200 text-zinc-650 hover:text-zinc-955 hover:bg-zinc-100 transition-all rounded-none shadow-sm">
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Column 2: Protocol Nav */}
        <div>
          <h4 className="text-xs font-mono font-bold uppercase text-zinc-400 mb-4 tracking-widest">Protocol Navigation</h4>
          <ul className="space-y-3 text-xs font-sans text-zinc-500">
            <li><Link to="/" className="hover:text-zinc-950 hover:underline transition-all">Home Page</Link></li>
            <li><Link to="/architecture" className="hover:text-zinc-950 hover:underline transition-all">Architecture Page</Link></li>
            <li><Link to="/sandbox" className="hover:text-zinc-950 hover:underline transition-all">Interact Sandbox Page</Link></li>
          </ul>
        </div>

        {/* Column 3: Trust & Info */}
        <div>
          <h4 className="text-xs font-mono font-bold uppercase text-zinc-400 mb-4 tracking-widest">Trust & Compliance</h4>
          <ul className="space-y-3 text-xs font-sans text-zinc-500">
            <li className="flex items-center gap-1.5 text-zinc-600 font-extrabold font-mono text-[10px] uppercase">
              <ShieldCheck className="w-4 h-4 text-zinc-900" />
              SOC2 AUDITED CLIENT
            </li>
            <li className="font-medium">SEC Accredited Underwriting</li>
            <li className="font-medium">Direct Treasury Clearing</li>
            <li className="font-medium">MiCA Compliant framework</li>
          </ul>
        </div>

      </div>

      {/* Baseline */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mt-16 pt-8 border-t border-zinc-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono text-zinc-400 font-bold uppercase">
        <div>
          © 2026 Verity Finance Protocol. All Rights Reserved.
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-zinc-950 transition-colors">Developer Core</a>
          <span>•</span>
          <a href="#" className="hover:text-zinc-950 transition-colors">Audit Ledger Documentation</a>
        </div>
      </div>
    </footer>
  );
};
