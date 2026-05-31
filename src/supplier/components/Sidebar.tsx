import React from 'react';
import { 
  ShieldCheck, 
  Plus, 
  LayoutDashboard, 
  Receipt, 
  AlertTriangle, 
  Banknote, 
  TrendingUp, 
  Settings, 
  HelpCircle, 
  ShieldAlert,
  Compass
} from 'lucide-react';
import { MainRoute } from '../types';

interface SidebarProps {
  currentRoute: MainRoute;
  setCurrentRoute: (route: MainRoute) => void;
  onOpenUploadModal: () => void;
  walletConnected: boolean;
}

export default function Sidebar({ 
  currentRoute, 
  setCurrentRoute, 
  onOpenUploadModal,
  walletConnected
}: SidebarProps) {
  
  // Sidebar items definition
  const menuItems = [
    { 
      id: 'dashboard' as MainRoute, 
      label: 'Dashboard', 
      detail: 'Suppliers UI',
      icon: LayoutDashboard 
    },
    { 
      id: 'settlement' as MainRoute, 
      label: 'Invoices', 
      detail: 'Settlement UI',
      icon: Receipt 
    },
    { 
      id: 'disputes' as MainRoute, 
      label: 'Disputes', 
      detail: 'Resolution UI',
      icon: AlertTriangle 
    },
    { 
      id: 'factoring' as MainRoute, 
      label: 'Factoring', 
      detail: 'Advance Market',
      icon: Banknote 
    }
  ];

  return (
    <aside id="sidebar-navigation" className="w-[260px] bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      
      {/* Top Identity Block */}
      <div>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-[32px] h-[32px] bg-[#0052CC] rounded-[6px] flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[17px] font-extrabold tracking-tight text-[#003D9B] block leading-none">Verity</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-1">Enterprise Node</span>
            </div>
          </div>
          
          {/* Quick Node Status Light */}
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-100 uppercase tracking-tight">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active</span>
          </div>
        </div>

        {/* CTA Button: "+ New Funding Request", which opens the high-fidelity Multi-step Invoice Creator (Screen 3) */}
        <div className="p-4">
          <button 
            type="button"
            id="btn-sidebar-new-request"
            onClick={onOpenUploadModal}
            className="w-full bg-[#0052CC] hover:bg-[#003D9B] active:bg-brand-primary text-white text-[13.5px] font-semibold py-3 px-4 rounded-[6px] shadow-sm flex items-center justify-center gap-2 tracking-wide transition-all hover:scale-[1.01] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Funding Request</span>
          </button>
        </div>

        {/* Navigation Categories */}
        <nav className="px-3 py-2 space-y-1">
          <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase px-3 mb-2 mt-4">Workspace</p>
          
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentRoute === item.id;
            
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentRoute(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[6px] text-left transition-all group cursor-pointer ${
                  isActive 
                    ? 'bg-[#EBF2FF] text-[#0052CC] font-semibold shadow-2xs' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className={`w-4.5 h-4.5 transition-colors ${
                    isActive ? 'text-[#0052CC]' : 'text-slate-400 group-hover:text-slate-600'
                  }`} />
                  <span className="text-[13.5px]">{item.label}</span>
                </div>
                {/* Visual Pill Indicator for Active State description */}
                {isActive && (
                  <span className="text-[9px] bg-white text-[#0052CC] px-1.5 py-0.5 rounded border border-blue-100 font-medium tracking-tight">
                    {item.detail}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile/Node Metadata Panel */}
      <div className="p-4 border-t border-slate-100 bg-[#F8F9FA]/50">
        
        {/* Help Center Shortcut */}
        <div className="space-y-1 mb-4">
          <button 
            type="button"
            onClick={() => alert("Welcome to Verity Help Center! Quick Guides:\n1. Click + New Funding Request to create an invoice.\n2. Click 'Request Financing' in the table to compute advance rates.\n3. Resolve disputes or sign smart settlements dynamically!")}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-800 rounded-md text-[13px] hover:bg-slate-100/50 transition-colors cursor-pointer text-left"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Help Center</span>
          </button>
          
          <div className="flex items-center justify-between px-3 py-2 text-slate-500 text-[13px]">
            <div className="flex items-center gap-3">
              <Compass className="w-4 h-4 text-slate-400" />
              <span>Compliance</span>
            </div>
            <span className="text-[10px] bg-blue-50 text-[#0052CC] border border-blue-100 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
              Verify
            </span>
          </div>
        </div>

        {/* Registered Node Identifier */}
        <div className="flex items-center gap-3 p-2 bg-white rounded-[6px] border border-slate-200/60 shadow-3xs">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-[10px] font-mono text-slate-600 font-bold shrink-0">
            F1
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[12px] font-bold text-slate-800 block truncate">Finux-Vault-01</span>
            <span className="text-[10px] text-slate-400 block truncate font-mono">
              {walletConnected ? '0xVerity...4f9e' : 'Disconnected'}
            </span>
          </div>
        </div>

      </div>

    </aside>
  );
}
