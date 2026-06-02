import React, { useState } from 'react';
import { Search, Bell, Settings, User, Wallet, Sparkles, CheckCircle2 } from 'lucide-react';
import { MainRoute } from '../types';

interface HeaderProps {
  currentRoute: MainRoute;
  setCurrentRoute: (route: MainRoute) => void;
  workspacePerspective: 'Supplier' | 'Investor';
  walletConnected: boolean;
  onToggleWallet: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  accessLabel?: string;
  accessRole?: string;
  onResetAccess?: () => void;
}

export default function Header({
  currentRoute,
  setCurrentRoute,
  workspacePerspective,
  walletConnected,
  onToggleWallet,
  searchQuery,
  setSearchQuery,
  accessLabel,
  accessRole,
  onResetAccess
}: HeaderProps) {
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Dispute raised on INV-2026-089 by Global Manufacturing Corp', status: 'new' },
    { id: 2, message: 'Invoice INV-002: approved for 90% advance routing', status: 'old' },
    { id: 3, message: 'Smart contract escrow ready for final settlement of $50,000 USDC', status: 'old' }
  ]);

  const hasNew = notifications.some(n => n.status === 'new');

  const getRouteTitle = () => {
    const isInvestor = workspacePerspective === 'Investor';

    switch (currentRoute) {
      case 'dashboard':
        return isInvestor ? 'Investor Overview' : 'Supplier Overview';
      case 'invoice-queue':
        return isInvestor ? 'Invoice Portfolio' : 'Invoice Queue';
      case 'factoring':
        return isInvestor ? 'Deploy Capital' : 'Request Factoring';
      case 'disputes':
        return isInvestor ? 'Risk & Dispute Watch' : 'Buyer Dispute Resolution';
      case 'settlement':
        return isInvestor ? 'Settlement Performance' : 'Programmatic Invoice Settlement';
      default:
        return isInvestor ? 'Investor Treasury Node' : 'Smart Treasury Node';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-[0px_1px_3px_rgba(15,23,42,0.02)]">
      
      {/* Route Location Indicator */}
      <div className="flex items-center gap-6">
        <div className="hidden sm:flex items-center gap-3">
          <span className="text-[15px] font-bold text-slate-900 tracking-tight">{getRouteTitle()}</span>
          <span className="text-slate-300">/</span>
          <nav className="flex items-center gap-4 text-[13px] font-semibold text-slate-500">
            <button 
              onClick={() => setCurrentRoute('dashboard')}
              className={`transition-colors hover:text-[#0052CC] ${currentRoute === 'dashboard' ? 'text-[#0052CC]' : ''}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setCurrentRoute('factoring')}
              className={`transition-colors hover:text-[#0052CC] ${currentRoute === 'factoring' ? 'text-[#0052CC]' : ''}`}
            >
              Liquidity Market
            </button>
          </nav>
        </div>
      </div>

      {/* Global Interactive Tools (Search & Actions) */}
      <div className="flex items-center gap-4 flex-1 justify-end max-w-xl">
        
        {/* Real-time search filter for invoices */}
        <div className="relative w-full max-w-[280px] hidden md:block">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search verified invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-[6px] pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0052CC]/15 focus:border-[#0052CC] transition-all"
          />
        </div>

        {/* Dynamic Connect Wallet button (essential for on-chain identity) */}
        <button
          onClick={onToggleWallet}
          type="button"
          className={`flex items-center gap-2.5 px-4 py-2 rounded-[6px] text-[13px] font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
            walletConnected 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 shadow-3xs'
              : 'bg-[#0052CC] hover:bg-[#003D9B] text-white shadow-xs hover:shadow-subtle hover:-translate-y-0.5 active:translate-y-0'
          }`}
        >
          <Wallet className={`w-4 h-4 ${walletConnected ? 'text-emerald-600' : 'text-white'}`} />
          <span className="font-semibold">
            {walletConnected ? 'Node Wallet: 0xVerity...4F9E' : 'Connect Node Wallet'}
          </span>
          {walletConnected && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
          )}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              // Mark all as read when opening
              setNotifications(notifications.map(n => ({ ...n, status: 'old' })));
            }}
            className="w-9 h-9 rounded-[6px] hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 border border-slate-200 transition-colors relative cursor-pointer"
          >
            <Bell className="w-4.5 h-4.5" />
            {hasNew && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-[340px] bg-white border border-slate-200 rounded-[12px] shadow-medium z-50 overflow-hidden transform origin-top-right transition-all">
              <div className="p-4 bg-[#F8F9FA] border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-800 text-sm">Notifications & Events</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                  Real-time Updates
                </span>
              </div>
              <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100">
                {notifications.map(n => (
                  <div key={n.id} className="p-4 hover:bg-slate-50 flex gap-2.5 items-start">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <p className="text-[12.5px] text-slate-600 leading-normal">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Support Settings Icon */}
        <button 
          onClick={() => alert("Smart Finux Settings:\n- Environment: Local Container Ingress\n- Protocol Host: 0.0.0.0\n- Smart Contract Suite: Verity-V3 Core")}
          className="w-9 h-9 rounded-[6px] hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800 border border-slate-200 transition-colors cursor-pointer"
        >
          <Settings className="w-4.5 h-4.5" />
        </button>

        {/* User Identity Avatar */}
        {accessRole && (
          <span className="hidden lg:inline-flex items-center px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold border border-slate-300 text-slate-700 bg-white rounded-sm">
            {accessRole}
          </span>
        )}

        {accessLabel && (
          <span className="hidden xl:inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-sm">
            {accessLabel}
          </span>
        )}

        {onResetAccess && (
          <button
            onClick={onResetAccess}
            className="px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors rounded-[6px]"
          >
            Reset Access
          </button>
        )}

        <div className="w-8.5 h-8.5 rounded-full bg-[#0052CC]/10 border border-[#0052CC]/25 flex items-center justify-center text-[#0052CC] font-bold text-xs select-none">
          JS
        </div>

      </div>

    </header>
  );
}
