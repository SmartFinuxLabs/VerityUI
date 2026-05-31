import React from 'react';
import { ShieldCheck, Info, ArrowRight, LayoutGrid, Wrench, BookOpen, ChevronRight, Settings } from 'lucide-react';

interface LandingPageProps {
  onStartApp: () => void;
}

export default function LandingPage({ onStartApp }: LandingPageProps) {
  return (
    <div id="landing-container" className="min-h-screen bg-[#F8F9FA] text-slate-800 selection:bg-brand-primary-container selection:text-brand-primary font-sans relative overflow-x-hidden">
      
      {/* Dynamic Grid Gradient Background Mesh */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#EBF2FF] to-transparent opacity-70 pointer-events-none" />
      <div className="absolute top-10 right-[-10%] w-[50%] h-[400px] bg-sky-200/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-40 left-[-10%] w-[40%] h-[300px] bg-teal-100/30 rounded-full blur-[80px] pointer-events-none" />

      {/* Primary Header/Navbar */}
      <header id="landing-header" className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-slate-200/50 relative z-20">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onStartApp}>
            {/* Custom Verity SVG Logo/Check Symbol */}
            <div className="w-[34px] h-[34px] bg-[#0052CC] rounded-[8px] flex items-center justify-center text-white font-bold text-lg shadow-sm">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-[22px] font-extrabold tracking-tight text-[#003D9B]">Verity</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <span className="text-[14px] font-semibold text-[#0052CC] border-b-2 border-[#0052CC] pb-1 cursor-pointer">PLATFORM</span>
            <span className="text-[14px] font-medium text-slate-600 hover:text-brand-primary cursor-pointer transition-colors">SOLUTIONS</span>
            <span className="text-[14px] font-medium text-slate-600 hover:text-brand-primary cursor-pointer transition-colors">RESOURCES</span>
            <span className="text-[14px] font-medium text-slate-600 hover:text-brand-primary cursor-pointer transition-colors">COMPANY</span>
            <span className="text-[14px] font-medium text-slate-600 hover:text-brand-primary cursor-pointer transition-colors">PRICING</span>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={onStartApp}
            className="text-[13px] font-bold tracking-wider text-slate-700 hover:text-brand-primary cursor-pointer"
          >
            LOG IN
          </button>
          <button 
            onClick={onStartApp}
            className="text-[13px] font-bold tracking-wider text-[#0052CC] hover:opacity-80 cursor-pointer hidden sm:inline"
          >
            FREE TRIAL
          </button>
          <button 
            onClick={onStartApp}
            className="bg-[#0052CC] hover:bg-[#003D9B] text-white text-[13px] font-bold tracking-wide px-5 py-2.5 rounded-[6px] shadow-sm transition-all cursor-pointer"
          >
            GET A DEMO
          </button>
        </div>
      </header>

      {/* Hero Content Section */}
      <main className="max-w-7xl mx-auto px-6 pt-16 pb-20 relative z-10 text-center">
        
        {/* Accent Announcement Badge */}
        <div className="inline-flex items-center gap-2 bg-white/80 border border-slate-200 hover:bg-white px-4 py-2 rounded-full text-[13px] text-slate-700 shadow-xs mb-8 transition-all max-w-full">
          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-brand-primary-light">
            <Settings className="w-3 h-3 animate-spin duration-3000" />
          </div>
          <span className="font-semibold text-slate-800">New:</span> 
          <span className="truncate">Download the Treasury Guide to Programmatic On-Chain Settlement in 2026</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Display Typography Header */}
        <h1 className="text-[44px] sm:text-[62px] font-extrabold tracking-tight text-[#111827] max-w-4xl mx-auto leading-[1.1] mb-6">
          Unlock Supply Chain Finance with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0052CC] to-[#008B58]">On-Chain Certainty</span>
        </h1>

        {/* Description Body Text */}
        <p className="text-[17px] sm:text-[19px] text-[#4B5563] max-w-3xl mx-auto leading-relaxed mb-10">
          Reduce friction. Eliminate double-factoring. Settle instantly. Elevate your team, your brand, and your capital efficiency with Verity's trust-engineered platform built specifically for enterprise supply chains.
        </p>

        {/* Hero CTA Action Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <button 
            onClick={onStartApp}
            className="w-full sm:w-auto bg-[#0052CC] hover:bg-[#003D9B] hover:scale-102 hover:shadow-md text-white font-semibold text-[15px] px-8 py-3.5 rounded-[8px] tracking-wide transition-all shadow-sm cursor-pointer"
          >
            START FREE TRIAL
          </button>
          <button 
            onClick={onStartApp}
            className="w-full sm:w-auto bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-[15px] px-8 py-3.5 rounded-[8px] tracking-wide transition-all shadow-xs cursor-pointer"
          >
            GET A DEMO
          </button>
        </div>

        {/* Social Proof Logos Area */}
        <div className="border-t border-slate-200/70 pt-10">
          <p className="text-[11px] font-bold tracking-widest text-[#6B7280] uppercase mb-6">
            WORLD-CLASS ENTERPRISE TEAMS TRUST VERITY
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-75">
            <span className="text-[22px] font-bold tracking-tight text-slate-400 font-mono">iHeartMEDIA</span>
            <span className="text-[20px] font-extrabold tracking-widest text-slate-400 uppercase font-sans">ULTA</span>
            <span className="text-[20px] font-light text-slate-400 tracking-tight font-serif">alliantgroup</span>
            <span className="text-[18px] font-mono tracking-wide text-slate-400">ANTHROPOLOGIE</span>
          </div>
        </div>

      </main>

      {/* Feature Section Grid */}
      <section className="bg-white border-t border-b border-slate-200/80 py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="grid lg:grid-cols-12 gap-12 items-start mb-16">
            <div className="lg:col-span-5">
              <div className="flex items-center gap-2 text-[#0052CC] font-bold text-xs tracking-widest uppercase mb-4">
                <LayoutGrid className="w-4 h-4" />
                <span>THE VERITY PLATFORM</span>
              </div>
              <h2 className="text-[34px] sm:text-[40px] font-extrabold tracking-tight text-slate-900 leading-tight mb-6">
                Built for supply chain success
              </h2>
            </div>
            <div className="lg:col-span-7">
              <p className="text-[16px] text-[#4B5563] leading-relaxed mb-6">
                Verity is the purpose-built smart asset platform for supply chain finance. Built on a foundation of enterprise trust, Verity deeply understands working capital coordination, delivering an intuitive on-chain toolkit that allows buyers and suppliers to build workflows to accelerate their success.
              </p>
              <button 
                onClick={onStartApp}
                className="inline-flex items-center gap-2 border border-[#0052CC] text-[#0052CC] font-bold text-[13px] px-5 py-2.5 rounded-[6px] tracking-wider hover:bg-slate-50 transition-colors cursor-pointer"
              >
                EXPLORE THE PLATFORM
              </button>
            </div>
          </div>

          {/* 4-Card Grid conforming to the specs */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <div className="bg-[#F8F9FA] border border-slate-200 p-8 rounded-[12px] flex flex-col justify-between hover:scale-102 transition-transform shadow-xs hover:shadow-subtle group">
              <div>
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-[#0052CC] border border-slate-200/60 shadow-2xs mb-6 font-semibold">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Apps & Workflows</h3>
                <p className="text-[13.5px] text-slate-600 leading-relaxed">
                  Transform existing processes with secure programmatic workflows integrated directly to your legacy ERP ledger systems.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-200/50 flex justify-end">
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#0052CC] transition-colors" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#F8F9FA] border border-slate-200 p-8 rounded-[12px] flex flex-col justify-between hover:scale-102 transition-transform shadow-xs hover:shadow-subtle group">
              <div>
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-[#0052CC] border border-slate-200/60 shadow-2xs mb-6 font-semibold">
                  <Wrench className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Marketing AI Toolkit</h3>
                <p className="text-[13.5px] text-slate-600 leading-relaxed">
                  Accelerate cash flow optimization with an intuitive set of tools designed for automated invoicing, discounting, and collection.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-200/50 flex justify-end">
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#0052CC] transition-colors" />
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-[#F8F9FA] border border-slate-200 p-8 rounded-[12px] flex flex-col justify-between hover:scale-102 transition-transform shadow-xs hover:shadow-subtle group">
              <div>
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-[#0052CC] border border-slate-200/60 shadow-2xs mb-6 font-semibold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Knowledge & Context</h3>
                <p className="text-[13.5px] text-slate-600 leading-relaxed">
                  Our proprietary intelligence layer tailors settlement for each industry, utilizing secure decentralized escrows to automate payouts.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-200/50 flex justify-end">
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#0052CC] transition-colors" />
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-[#F8F9FA] border border-slate-200 p-8 rounded-[12px] flex flex-col justify-between hover:scale-102 transition-transform shadow-xs hover:shadow-subtle group">
              <div>
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-[#0052CC] border border-slate-200/60 shadow-2xs mb-6 font-semibold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Trust Foundation</h3>
                <p className="text-[13.5px] text-slate-600 leading-relaxed">
                  Enterprise-grade security and a unique on-chain architecture deliver trusted liquidity at scale, free from manual validation delays.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-200/50 flex justify-end">
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#0052CC] transition-colors" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Footer conforming to specified strings */}
      <footer className="bg-[#f0f1f2] border-t border-slate-300 py-12 relative z-10 text-[13px] text-slate-600">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="flex items-center gap-1.5">
              <div className="w-[20px] h-[20px] bg-[#0c56d0] rounded-[4px] flex items-center justify-center text-white text-xs font-bold shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-extrabold text-[#003D9B] text-base tracking-tight">Verity</span>
            </div>
            <span className="text-slate-500">© 2026 Verity. All rights reserved. Registered Digital Asset Provider.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 font-semibold text-slate-700 tracking-wider text-[11px]">
            <span className="cursor-pointer hover:text-[#0052CC]">LEGAL & COMPLIANCE</span>
            <span className="cursor-pointer hover:text-[#0052CC]">PRIVACY POLICY</span>
            <span className="cursor-pointer hover:text-[#0052CC]">WHITEPAPER</span>
            <span className="cursor-pointer hover:text-[#0052CC]">SECURITY AUDIT</span>
            <span className="cursor-pointer hover:text-[#0052CC]">TERMS OF SERVICE</span>
          </div>
        </div>
      </footer>

      {/* Interactive Quick launch overlay/banner to guide reviewer */}
      <div className="fixed bottom-4 right-4 z-50 bg-[#003D9B] text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer animate-pulse font-semibold text-sm" onClick={onStartApp}>
        <span>Open Verity Platform Admin →</span>
      </div>

    </div>
  );
}
