/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Building2, 
  LayoutDashboard, 
  FileCheck, 
  Users, 
  UserSquare2, 
  History, 
  Settings, 
  HelpCircle, 
  ShieldAlert, 
  Plus, 
  Zap,
  Globe
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  brandingMode: 'finux' | 'verity';
  setBrandingMode: (mode: 'finux' | 'verity') => void;
  pendingInvoicesCount: number;
  onNewFundingRequest: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  brandingMode,
  setBrandingMode,
  pendingInvoicesCount,
  onNewFundingRequest,
}: SidebarProps) {
  
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'invoices',
      label: 'Invoices Queue',
      icon: FileCheck,
      badge: pendingInvoicesCount > 0 ? pendingInvoicesCount : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'suppliers',
      label: 'Suppliers',
      icon: Users,
      badge: '48',
      badgeColor: 'bg-slate-100 text-slate-600',
    },
    {
      id: 'investors',
      label: 'Investors',
      icon: UserSquare2,
      badge: null,
    },
    {
      id: 'history',
      label: 'History',
      icon: History,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Settings / Sandbox',
      icon: Settings,
      badge: 'Dev',
      badgeColor: 'bg-[#0052cc]/10 text-[#0052cc]',
    },
  ];

  return (
    <aside 
      id="sidebar-container" 
      className="w-[260px] border-r border-slate-200 bg-white flex flex-col h-screen sticky top-0 shrink-0 z-30"
    >
      {/* Brand Header */}
      <div id="sidebar-header" className="p-6 border-b border-slate-100 flex flex-col gap-3 bg-slate-50/30">
        {brandingMode === 'finux' ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[8px] bg-[#003d9b] flex items-center justify-center text-white font-bold text-lg select-none shadow-sm">
              SF
            </div>
            <div>
              <h1 className="font-sans font-bold text-base leading-tight text-slate-900 tracking-tight">
                Smart Finux Labs
              </h1>
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest block font-medium">
                Enterprise Node
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[8px] bg-[#0052cc] flex items-center justify-center text-white shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-sans font-extrabold text-lg leading-none tracking-tight text-[#0052cc]">
                Verity
              </h1>
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest block font-medium mt-0.5">
                Enterprise Node
              </span>
            </div>
          </div>
        )}

        {/* Branding Mode Quick Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-[6px] text-[11px] font-medium mt-1">
          <button
            id="brand-toggle-finux"
            onClick={() => setBrandingMode('finux')}
            className={`flex-1 py-1 rounded text-center transition-all ${
              brandingMode === 'finux' 
                ? 'bg-white text-[#003d9b] shadow-xs font-semibold' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Smart Finux
          </button>
          <button
            id="brand-toggle-verity"
            onClick={() => setBrandingMode('verity')}
            className={`flex-1 py-1 rounded text-center transition-all ${
              brandingMode === 'verity' 
                ? 'bg-white text-[#0052cc] shadow-xs font-semibold' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Verity CLI
          </button>
        </div>
      </div>

      {/* Primary Call to Action */}
      <div className="p-4" id="sidebar-cta-area">
        <button
          id="btn-new-funding-request"
          onClick={onNewFundingRequest}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#003d9b] hover:bg-[#002e75] active:bg-[#002154] text-white font-sans font-semibold text-[13.5px] rounded-[6px] transition-all shadow-xs hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Funding Request</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto" id="sidebar-main-nav">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              id={`nav-link-${item.id}`}
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[6px] text-[13.5px] font-sans font-medium transition-all group relative ${
                isActive 
                  ? 'bg-[#EBF2FF] text-[#0052cc] font-semibold shadow-2xs' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-lg bg-[#0052cc]" />
              )}
              <div className="flex items-center gap-3">
                <IconComponent className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-[#0052cc]' : 'text-slate-400 group-hover:text-slate-600'
                }`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-wide ${
                  item.badgeColor || 'bg-slate-100 text-slate-800'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Meta Details */}
      <div className="p-4 border-t border-slate-100 bg-[#F8F9FA]/50 space-y-2 text-xs" id="sidebar-footer">
        <button
          id="sidebar-help-center"
          onClick={() => setActiveTab('help')}
          className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-900 font-sans font-medium hover:bg-slate-100/50 rounded-[6px] transition-all text-left"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Help Center</span>
        </button>
        <button
          id="sidebar-compliance"
          onClick={() => setActiveTab('compliance')}
          className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-900 font-sans font-medium hover:bg-slate-100/50 rounded-[6px] transition-all text-left"
        >
          <ShieldAlert className="w-4 h-4 text-slate-400" />
          <span>Compliance</span>
        </button>

        <div className="px-3 pt-2 border-t border-[#E5E7EB]/50 flex items-center justify-between text-[10px] text-slate-400 font-mono select-none">
          <span className="flex items-center gap-1">
            <Globe className="w-3 h-3 text-emerald-500 animate-pulse" />
            <span>USDC v2.0</span>
          </span>
          <span>v1.0.4-live</span>
        </div>
      </div>
    </aside>
  );
}
