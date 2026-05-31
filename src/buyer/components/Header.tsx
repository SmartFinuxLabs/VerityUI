/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Search, 
  Bell, 
  Settings, 
  Wallet, 
  CheckCircle2, 
  X,
  CreditCard,
  User,
  Power
} from 'lucide-react';
import { LiquidityProfile } from '../types';

interface HeaderProps {
  title: string;
  subtitle?: string;
  liquidity: LiquidityProfile;
  toggleWalletConnection: () => void;
  accessLabel?: string;
  accessRole?: string;
  onResetAccess?: () => void;
  onSearchChange?: (val: string) => void;
}

export default function Header({
  title,
  subtitle,
  liquidity,
  toggleWalletConnection,
  accessLabel,
  accessRole,
  onResetAccess,
  onSearchChange,
}: HeaderProps) {
  const [showWalletMenu, setShowWalletMenu] = React.useState(false);
  const [searchFocused, setSearchFocused] = React.useState(false);

  return (
    <header 
      id="app-header-container" 
      className="bg-white border-b border-[#E5E7EB] h-16 px-6 flex items-center justify-between shrink-0 sticky top-0 z-20"
    >
      {/* Left Area: Breadcrumbs / Title */}
      <div id="header-left-breadcrumbs" className="flex items-center gap-2">
        <div>
          <h2 className="font-sans font-bold text-lg text-slate-900 tracking-tight leading-none">
            {title}
          </h2>
          {subtitle && (
            <p className="font-sans text-xs text-slate-500 mt-1 leading-none font-medium">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Middle Area: Global Search */}
      <div id="header-search-box" className="hidden md:flex items-center w-80 relative">
        <Search className={`w-4 h-4 absolute left-3 transition-colors ${searchFocused ? 'text-[#0052cc]' : 'text-slate-400'}`} />
        <input
          id="global-search-input"
          type="text"
          placeholder="Search invoices, suppliers, or hashes..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-[#E5E7EB] hover:border-slate-300 focus:border-[#0052cc] focus:ring-2 focus:ring-[#0052cc]/15 rounded-lg text-xs font-sans placeholder-slate-400 bg-slate-50/50 focus:bg-white outline-none transition-all"
        />
      </div>

      {/* Right Area: Actions, Wallet Connect, and Profile */}
      <div id="header-right-actions" className="flex items-center gap-4">
        {/* Quick Utilities */}
        <div id="quick-utility-icons" className="flex items-center gap-1.5 border-r border-[#E5E7EB] pr-4">
          <button
            id="btn-nav-search-mobile"
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-50 relative"
          >
            <Search className="w-4.5 h-4.5" />
          </button>
          
          <button
            id="btn-nav-status-ledger"
            title="Registry state"
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <CreditCard className="w-4.5 h-4.5" />
          </button>

          <button
            id="btn-nav-notifications"
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-[#0052cc] transition-colors relative"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute top-2 right-2 animate-pulse" />
          </button>

          <button
            id="btn-nav-settings-shortcut"
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <Settings className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Interactive Wallet Connect */}
        <div className="relative" id="interactive-wallet-dropdown">
          {liquidity.isConnected ? (
            <button
              id="btn-wallet-connected-badge"
              onClick={() => setShowWalletMenu(!showWalletMenu)}
              className="flex items-center gap-2 bg-[#0052cc]/10 hover:bg-[#0052cc]/15 text-[#0052cc] py-1.5 px-3 rounded-lg border border-[#0052cc]/20 transition-all font-mono text-xs font-bold"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <span>{liquidity.walletName} ({liquidity.walletAddress.substring(0, 6)}...{liquidity.walletAddress.substring(liquidity.walletAddress.length - 4)})</span>
              <Wallet className="w-3.5 h-3.5 ml-1" />
            </button>
          ) : (
            <button
              id="btn-connect-wallet-action"
              onClick={toggleWalletConnection}
              className="bg-[#0052cc] hover:bg-[#0040a2] active:bg-[#003d9b] text-white py-1.5 px-4 rounded-lg font-sans font-semibold text-xs tracking-wide shadow-xs transition-all flex items-center gap-1.5"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Connect Wallet</span>
            </button>
          )}

          {/* Connected Wallet Control Popover */}
          {showWalletMenu && liquidity.isConnected && (
            <div 
              id="wallet-popover-menu"
              className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#E5E7EB] p-4 font-sans text-xs text-slate-700 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <span className="font-semibold text-slate-900 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Connected Wallet
                </span>
                <button 
                  id="btn-close-wallet-popover"
                  onClick={() => setShowWalletMenu(false)}
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-2 mb-4">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Vault ID</span>
                  <span className="font-semibold text-slate-800 font-mono text-xs">{liquidity.walletName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Address</span>
                  <span className="font-mono text-xs break-all bg-slate-50 p-1.5 rounded border border-slate-100 block mt-0.5">
                    0x7f2E3f3C02ab05Cd18f92983281E1928C3023B92
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Available Balance</span>
                  <span className="font-sans font-bold text-slate-900 text-sm">
                    {liquidity.availableLiquidity.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC
                  </span>
                </div>
              </div>

              <button
                id="btn-disconnect-wallet-popover"
                onClick={() => {
                  toggleWalletConnection();
                  setShowWalletMenu(false);
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg font-medium transition-colors"
              >
                <Power className="w-3.5 h-3.5" />
                <span>Disconnect Wallet</span>
              </button>
            </div>
          )}
        </div>

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
            className="px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            Logout
          </button>
        )}

        {/* User Account Avatar */}
        <div id="user-profile-avatar-container" className="flex items-center gap-2 select-none pointer-events-none">
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center shrink-0">
            {/* The avatar matching the mockup styling */}
            <img 
              id="img-user-avatar"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop" 
              alt="Buyer avatar" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to simple icon
                e.currentTarget.style.display = 'none';
              }}
            />
            <User className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>
    </header>
  );
}
