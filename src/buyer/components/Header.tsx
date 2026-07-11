/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Search, 
  Bell, 
  Settings, 
  CreditCard,
  User,
} from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  liquidity?: unknown;
  toggleWalletConnection?: () => void;
  accessLabel?: string;
  accessRole?: string;
  onResetAccess?: () => void;
  onSearchChange?: (val: string) => void;
}

export default function Header({
  title,
  subtitle,
  accessLabel,
  accessRole,
  onResetAccess,
  onSearchChange,
}: HeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [searchFocused, setSearchFocused] = React.useState(false);

  return (
    <header 
      id="app-header-container" 
      className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-[0px_1px_3px_rgba(15,23,42,0.02)]"
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
          className="w-full pl-9 pr-4 py-2 border border-slate-200 hover:border-slate-300 focus:border-[#0052cc] focus:ring-2 focus:ring-[#0052cc]/15 rounded-[6px] text-xs font-sans placeholder-slate-400 bg-slate-50/50 focus:bg-white outline-none transition-all"
        />
      </div>

      {/* Right Area: Actions and Profile */}
      <div id="header-right-actions" className="flex items-center gap-4">
        {/* Quick Utilities */}
        <div id="quick-utility-icons" className="flex items-center gap-1.5 border-r border-slate-200 pr-4">
          <button
            id="btn-nav-search-mobile"
            className="md:hidden p-2 rounded-[6px] text-slate-500 hover:bg-slate-50 relative"
          >
            <Search className="w-4.5 h-4.5" />
          </button>
          
          <button
            id="btn-nav-status-ledger"
            title="Registry state"
            className="p-2 rounded-[6px] text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <CreditCard className="w-4.5 h-4.5" />
          </button>

          <button
            id="btn-nav-notifications"
            className="p-2 rounded-[6px] text-slate-500 hover:bg-slate-50 hover:text-[#0052cc] transition-colors relative"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute top-2 right-2 animate-pulse" />
          </button>

          <button
            id="btn-nav-settings-shortcut"
            className="p-2 rounded-[6px] text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <Settings className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* User Account Menu */}
        <div id="user-profile-avatar-container" className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu((value) => !value)}
            aria-label="Open user access menu"
            aria-expanded={showProfileMenu}
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center shrink-0 hover:border-[#0052cc]/40 transition-colors"
          >
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
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-[8px] shadow-xl border border-slate-200 overflow-hidden font-sans text-xs text-slate-700 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Signed in as</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{accessRole ?? 'Buyer'}</p>
                {accessLabel && (
                  <p className="mt-1 font-mono font-semibold text-slate-500 break-all">{accessLabel}</p>
                )}
              </div>
              {onResetAccess && (
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onResetAccess();
                  }}
                  className="w-full px-4 py-3 text-left text-[10px] uppercase tracking-widest font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Logout
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
