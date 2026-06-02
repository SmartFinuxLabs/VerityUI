/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import OverviewDashboard from './components/OverviewDashboard';
import InvoiceListTab from './components/InvoiceListTab';
import InvoiceVerification from './components/InvoiceVerification';
import ReviewRebuttal from './components/ReviewRebuttal';
import { Invoice, FundingRequest, LiquidityProfile } from './types';
import {
  getBuyerDemoWorkspaceState,
  getBuyerWorkspaceInitialState,
  isDemoWorkspaceDataMode,
  loadBuyerWorkspaceState,
  persistBuyerDemoWorkspaceState,
} from '../lib/workspaceData';
import {
  Plus, 
  HelpCircle, 
  Search, 
  RefreshCw, 
  CheckSquare, 
  Building2, 
  ShieldCheck, 
  FileText, 
  Globe, 
  Check, 
  ExternalLink 
} from 'lucide-react';

interface BuyerWorkspaceProps {
  accessLabel?: string;
  accessRole?: string;
  onResetAccess?: () => void;
}

export default function BuyerWorkspace({
  accessLabel,
  accessRole,
  onResetAccess,
}: BuyerWorkspaceProps) {
  const initialWorkspaceState = getBuyerWorkspaceInitialState();
  // Navigation / Tabs state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [brandingMode, setBrandingMode] = useState<'finux' | 'verity'>('finux');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [workspaceDataStatus, setWorkspaceDataStatus] = useState<'loading' | 'ready' | 'error'>(
    isDemoWorkspaceDataMode() ? 'ready' : 'loading'
  );
  const [workspaceDataError, setWorkspaceDataError] = useState('');
  
  // App Core Data states
  const [invoices, setInvoices] = useState<Invoice[]>(initialWorkspaceState.invoices);

  const [fundingRequests, setFundingRequests] = useState<FundingRequest[]>(initialWorkspaceState.fundingRequests);

  const [liquidity, setLiquidity] = useState<LiquidityProfile>(initialWorkspaceState.liquidity);

  // Selected Invoice reference for Screen 1/2/4 evaluation views
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    loadBuyerWorkspaceState()
      .then((state) => {
        if (!isMounted) return;
        setInvoices(state.invoices);
        setFundingRequests(state.fundingRequests);
        setLiquidity(state.liquidity);
        setWorkspaceDataStatus('ready');
        setWorkspaceDataError('');
      })
      .catch((error) => {
        if (!isMounted) return;
        setWorkspaceDataStatus('error');
        setWorkspaceDataError(error instanceof Error ? error.message : 'Unable to load buyer workspace data from VerityAPI.');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    persistBuyerDemoWorkspaceState({ invoices, fundingRequests, liquidity });
  }, [invoices, fundingRequests, liquidity]);

  // Handle Wallet toggles
  const handleToggleWallet = () => {
    setLiquidity(prev => ({
      ...prev,
      isConnected: !prev.isConnected,
    }));
  };

  const handleAdjustLiquidity = (amount: number) => {
    setLiquidity(prev => ({
      ...prev,
      availableLiquidity: Math.max(0, prev.availableLiquidity + amount),
    }));
  };

  // Add mock Funding requests
  const handleAddFundingRequest = (req: Omit<FundingRequest, 'id'>) => {
    const nextId = `REQ-${(8880 + fundingRequests.length).toString()}-X`;
    const newRequest: FundingRequest = {
      id: nextId,
      ...req,
    };
    setFundingRequests(prev => [newRequest, ...prev]);
  };

  // Invoice Actions: Accept & Sign
  const handleAcceptAndSignInvoice = (id: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === id) {
        return {
          ...inv,
          status: 'VERIFIED',
          signedAt: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }) + ' ' + new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })
        };
      }
      return inv;
    }));
  };

  // Invoice Actions: Submit Dispute
  const handleSubmitDisputeInvoice = (
    id: string, 
    reason: string, 
    description: string, 
    filename: string, 
    filesize: string
  ) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === id) {
        return {
          ...inv,
          status: 'CONTESTED',
          dispute: {
            reason,
            description,
            evidenceFileName: filename,
            evidenceFileSize: filesize,
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          },
          // Auto-inject a neat simulated matching supplier rebuttal so the user can experience the Screen 4 review workflow immediately!
          rebuttal: {
            stance: 'Review Filed',
            explanation: 'Supplier system acknowledged receipt of customer dispute file (' + filename + '). The supplier will investigate inventory serial counters.',
            evidenceFileName: 'dock_log_receipts_full.pdf',
            evidenceFileSize: '1.5 MB',
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
          }
        };
      }
      return inv;
    }));
  };

  // Rebuttal Actions: Resolving conflict
  const handleAcceptRebuttal = (id: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === id) {
        return {
          ...inv,
          status: 'VERIFIED',
          internalNotes: (inv.internalNotes || '') + '\n[Resolved today]: Accept supplier proof of shipment. Ledger updated.'
        };
      }
      return inv;
    }));
    // Return back to list
    setSelectedInvoiceId(null);
    setActiveTab('invoices');
  };

  const handleUpholdDispute = (id: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === id) {
        return {
          ...inv,
          status: 'PENDING_VERIFICATION', // reset or keep contested
          internalNotes: (inv.internalNotes || '') + '\n[Dispute upheld]: Requested replacement batch from supplier.'
        };
      }
      return inv;
    }));
    setSelectedInvoiceId(null);
    setActiveTab('invoices');
  };

  // Navigation handlers
  const handleSelectInvoiceAndRoute = (id: string) => {
    setSelectedInvoiceId(id);
    const inv = invoices.find(x => x.id === id);
    if (inv?.status === 'CONTESTED') {
      setActiveTab('review-rebuttal');
    } else {
      setActiveTab('verification-details');
    }
  };

  // Sandbox Sandbox functions
  const handleResetSandbox = () => {
    const demoState = getBuyerDemoWorkspaceState();
    setInvoices(demoState.invoices);
    setFundingRequests(demoState.fundingRequests);
    setLiquidity(demoState.liquidity);
    setSelectedInvoiceId(null);
    setActiveTab('dashboard');
  };

  // Search filter
  const filteredInvoices = invoices.filter(inv => {
    const term = searchQuery.toLowerCase();
    return (
      inv.supplierName.toLowerCase().includes(term) ||
      inv.id.toLowerCase().includes(term) ||
      inv.supplierId.toLowerCase().includes(term)
    );
  });

  const pendingInvoicesCount = invoices.filter(inv => inv.status === 'PENDING_VERIFICATION').length;

  // Header helpers based on tab
  const getHeaderTitleAndSubtitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Buyer Dashboard',
          sub: accessRole
            ? `Welcome back, ${accessRole}. Complete pending ledger clearances.`
            : 'Welcome back, Enterprise Officer. Complete pending ledger clearances.'
        };
      case 'invoices':
        return { title: 'Invoices Queue', sub: 'Verify and authorize incoming peer-to-peer invoice assets.' };
      case 'verification-details':
        return { title: 'Invoice Details', sub: 'Perform strict document matching before vault signatures.' };
      case 'review-rebuttal':
        return { title: 'Review Rebuttal Ledger', sub: 'Review supplier stances and settle conflicts.' };
      case 'suppliers':
        return { title: 'Active Suppliers', sub: 'Direct connections list with onboarding status.' };
      case 'investors':
        return { title: 'Participating Investors', sub: 'Horizon capital and yield index allocations.' };
      case 'history':
        return { title: 'Immutable Cleared History', sub: 'Archived ledger transactions.' };
      case 'settings':
        return { title: 'Settings & Sandbox Controls', sub: 'Configure corporate parameters and simulate platform pathways.' };
      case 'help':
        return { title: 'Help Center', sub: 'Reference manuals for supply chain finance.' };
      case 'compliance':
        return { title: 'Compliance & KYB Registry', sub: 'Regulatory flags and audits.' };
      default:
        return {
          title: 'Smart Finux Labs',
          sub: accessLabel ? `${accessLabel} · Enterprise financing portal` : 'Enterprise financing portal'
        };
    }
  };

  const currentInvoice = invoices.find(inv => inv.id === selectedInvoiceId) || invoices[0];
  const headerMeta = getHeaderTitleAndSubtitle();

  if (workspaceDataStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center text-slate-700">
        <div className="bg-white border border-slate-200 rounded-[8px] px-6 py-5 shadow-sm">
          <p className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-2">VerityAPI</p>
          <p className="text-sm font-bold">Loading buyer workspace data...</p>
        </div>
      </div>
    );
  }

  if (workspaceDataStatus === 'error') {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center text-slate-700">
        <div className="bg-white border border-rose-200 rounded-[8px] px-6 py-5 shadow-sm max-w-md">
          <p className="text-xs uppercase tracking-widest font-bold text-rose-500 mb-2">VerityAPI data unavailable</p>
          <p className="text-sm leading-relaxed">{workspaceDataError}</p>
          {onResetAccess && (
            <button
              type="button"
              onClick={onResetAccess}
              className="mt-4 px-3 py-2 text-[10px] uppercase tracking-widest font-bold bg-slate-900 text-white"
            >
              Reset Access
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8f9fa] font-sans text-slate-800" id="application-layout-frame">
      
      {/* Sidebar Navigation Module */}
      <Sidebar
        activeTab={activeTab === 'verification-details' || activeTab === 'review-rebuttal' ? 'invoices' : activeTab}
        setActiveTab={(tab) => {
          setSelectedInvoiceId(null);
          setActiveTab(tab);
        }}
        brandingMode={brandingMode}
        setBrandingMode={setBrandingMode}
        pendingInvoicesCount={pendingInvoicesCount}
        onNewFundingRequest={() => {
          setActiveTab('dashboard');
          // triggers the modal instantly on dashboard view
          setTimeout(() => {
            const btn = document.getElementById('btn-fund-payables-dashboard');
            if (btn) btn.click();
          }, 100);
        }}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative" id="main-content-viewport">
        {/* Top Header */}
        <Header
          title={headerMeta.title}
          subtitle={headerMeta.sub}
          liquidity={liquidity}
          toggleWalletConnection={handleToggleWallet}
          accessLabel={accessLabel}
          accessRole={accessRole}
          onResetAccess={onResetAccess}
          onSearchChange={(val) => {
            setSearchQuery(val);
            if (activeTab !== 'dashboard' && activeTab !== 'invoices') {
              setActiveTab('invoices');
            }
          }}
        />

        {/* Scrollable Work Viewport with interactive canvas style */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 vault-grid-bg" id="scrollable-viewport">
          
          {/* Dynamic Router View */}
          {activeTab === 'dashboard' && (
            <OverviewDashboard
              invoices={filteredInvoices}
              fundingRequests={fundingRequests}
              onAddFundingRequest={handleAddFundingRequest}
              liquidity={liquidity}
              adjustLiquidity={handleAdjustLiquidity}
              onSelectInvoice={handleSelectInvoiceAndRoute}
              onExportData={() => alert('Exporting corporate payables CSV ledger to download queue...')}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoiceListTab
              invoices={filteredInvoices}
              liquidity={liquidity}
              onSelectInvoiceDetails={handleSelectInvoiceAndRoute}
              onApproveInvoice={handleAcceptAndSignInvoice}
              onRejectOrDispute={(id) => {
                setSelectedInvoiceId(id);
                setActiveTab('verification-details');
                // Auto-trigger dispute form inside verification screen
                setTimeout(() => {
                  const btn = document.getElementById('btn-dispute-trigger-main');
                  if (btn) btn.click();
                }, 100);
              }}
            />
          )}

          {activeTab === 'verification-details' && (
            <InvoiceVerification
              invoice={currentInvoice}
              liquidity={liquidity}
              onBack={() => setActiveTab('invoices')}
              onAcceptAndSign={handleAcceptAndSignInvoice}
              onSubmitDispute={handleSubmitDisputeInvoice}
            />
          )}

          {activeTab === 'review-rebuttal' && (
            <ReviewRebuttal
              invoice={currentInvoice}
              onBack={() => setActiveTab('invoices')}
              onAcceptRebuttal={handleAcceptRebuttal}
              onUpholdDispute={handleUpholdDispute}
            />
          )}

          {/* Suppliers Tab Overview */}
          {activeTab === 'suppliers' && (
            <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] space-y-6" id="suppliers-tab-view">
              <div className="border-b border-dashed border-slate-100 pb-3">
                <h3 className="font-sans font-bold text-slate-800 text-sm">Active Suppliers Partner Profile</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Verified KYB channels on Smart Finux platform.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'TechGear Solutions', id: 'tg_0492', items: 'Sensors / Hardware', vol: '$1.4M', rating: '9.8', bankKey: '0x8a...4f2b', risk: 'Low Risk' },
                  { name: 'Global Logistics Ltd', id: 'gl_1104', items: 'Freight & Cold-Chain', vol: '$780K', rating: '9.2', bankKey: '0x3c...9a11', risk: 'Medium Dispute' },
                  { name: 'Apex Manufacturing', id: 'am_0021', items: 'Semiconductors', vol: '$4.2M', rating: '9.9', bankKey: '0x9e...77bb', risk: 'Low Risk' },
                  { name: 'Nexal Plastics', id: 'nx_9120', items: 'Polymer Injection', vol: '$120K', rating: '8.8', bankKey: '0xf2...dc90', risk: 'Under Audit' },
                  { name: 'Inteliclad Systems', id: 'is_6753', items: 'Aluminum structures', vol: '$540K', rating: '9.4', bankKey: '0xd7...ac85', risk: 'Low Risk' }
                ].map((s) => (
                  <div key={s.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all text-xs space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-sans font-bold text-slate-900 block">{s.name}</span>
                        <span className="font-mono text-[10px] text-slate-400 font-semibold block mt-0.5">ID: {s.id}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-sans ${
                        s.risk === 'Low Risk' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>{s.risk}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-150 font-mono text-[10px] text-slate-500">
                      <div>
                        <span>Channel</span>
                        <span className="font-bold text-slate-800 block mt-0.5 font-sans">{s.items}</span>
                      </div>
                      <div>
                        <span>Volume</span>
                        <span className="font-bold text-slate-800 block mt-0.5">{s.vol}</span>
                      </div>
                      <div>
                        <span>KYB Tier</span>
                        <span className="font-bold text-emerald-600 block mt-0.5">{s.rating}/10</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Investors Tab Overview */}
          {activeTab === 'investors' && (
            <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] space-y-6" id="investors-tab-view">
              <div className="border-b border-dashed border-slate-100 pb-3">
                <h3 className="font-sans font-bold text-slate-800 text-sm">Horizon Capital Pool Allocations</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Enterprise institutional pools supporting immediate invoices discounting.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Arc Investment Pool (Lead)', pool: '$25,000,000 USDC', deployed: '$18.4M Deployed', rate: '5.2% APY', hash: '0xabc...8821', pips: 'bg-emerald-500' },
                  { name: 'Horizon Liquidity Trust', pool: '$15,000,000 USDC', deployed: '$9.2M Deployed', rate: '5.5% APY', hash: '0xf4a...1104', pips: 'bg-indigo-505' },
                  { name: 'Apex FinCo Credit', pool: '$10,000,000 USDC', deployed: 'Inactive', rate: '4.8% APY', hash: '0xe8c...5539', pips: 'bg-slate-300' },
                  { name: 'Genesis Chain Fund', pool: '$8,5000,000 USDC', deployed: '$4.1M Deployed', rate: '6.1% APY', hash: '0xdac...4452', pips: 'bg-emerald-505' }
                ].map((inv, i) => (
                  <div key={i} className="p-4.5 rounded-xl border border-slate-200 bg-white hover:shadow-2xs transition-all text-xs space-y-3.5">
                    <div className="flex justify-between items-center">
                      <span className="font-sans font-bold text-slate-900 block">{inv.name}</span>
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-600 rounded px-2 py-0.5 font-bold">{inv.rate}</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex justify-between items-center text-[11px]">
                      <div>
                        <span className="text-slate-400 text-[9px] uppercase tracking-wider block">Total Pool Capacity</span>
                        <span className="font-bold text-slate-900 block mt-0.5">{inv.pool}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 text-[9px] uppercase tracking-wider block">Active Utilization</span>
                        <span className="font-bold text-slate-700 block mt-0.5">{inv.deployed}</span>
                      </div>
                    </div>

                    <div className="text-[9px] text-slate-400 font-mono flex items-center justify-between">
                      <span>Ledger Lock Hash: {inv.hash}</span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Online Vault
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* History Page representation */}
          {activeTab === 'history' && (
            <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xs overflow-hidden" id="history-tab-view">
              <div className="px-5 py-4 border-b border-[#E5E7EB] bg-slate-50/50">
                <h3 className="font-sans font-bold text-slate-800 text-sm">Archived Verified Blocks</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-sans">Immutable history of finalized invoices and settled bills.</p>
              </div>

              <div className="overflow-x-auto text-xs font-sans">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] bg-slate-100/40 text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest">
                      <th className="py-3 px-5">Ledger Hash</th>
                      <th className="py-3 px-5">Receipt Details</th>
                      <th className="py-3 px-5">Cleared Sum</th>
                      <th className="py-3 px-5">Clearing Date</th>
                      <th className="py-3 px-5 text-center">Receipt Log</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] font-serif text-slate-700 text-[11px]">
                    {[
                      { hash: '0x0d3c...a911', details: 'Invoice Match INV-2026-075 for TechGear', amt: 'USDC 45,000.00', date: 'May 12, 2026', cert: 'SHA-256 Verified' },
                      { hash: '0xf8e1...4490', details: 'Invoice Match INV-2026-064 for Silica Logistics', amt: 'USDC 12,000.00', date: 'May 04, 2026', cert: 'SHA-256 Verified' },
                      { hash: '0xc112...00ab', details: 'Auto Match INV-GM-402 for Global Mfg', amt: 'USDC 89,500.50', date: 'Apr 28, 2026', cert: 'SHA-256 Verified' },
                      { hash: '0x99a2...ee74', details: 'Batch Clearance REQ-8822-B', amt: 'USDC 310,000.00', date: 'Apr 25, 2026', cert: 'Ledger Finalized' }
                    ].map((h, i) => (
                      <tr key={i} className="hover:bg-slate-50/40 font-sans transition-colors">
                        <td className="py-3.5 px-5 font-mono text-slate-400 block max-w-xs truncate">{h.hash}</td>
                        <td className="py-3.5 px-5 font-semibold text-slate-800">{h.details}</td>
                        <td className="py-3.5 px-5 font-mono font-bold text-slate-900">{h.amt}</td>
                        <td className="py-3.5 px-5 text-slate-510 font-bold">{h.date}</td>
                        <td className="py-3.5 px-5 text-center">
                          <button className="flex items-center gap-1.5 px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded text-[10px] font-bold mx-auto transition-colors">
                            <Plus className="w-3 h-3 text-slate-400" /> Print Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sandbox & Dev Tools Panel */}
          {activeTab === 'settings' && (
            <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] space-y-6" id="settings-tab-view">
              <div className="border-b border-dashed border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-sans font-bold text-slate-800 text-sm">Corporate Settings & Dev Sandbox</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-sans">Simulate and reset verification conditions for this workspace.</p>
                </div>
                
                <button
                  id="btn-sandbox-hard-reset"
                  onClick={handleResetSandbox}
                  className="flex items-center gap-2 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 font-sans font-bold text-xs text-white rounded-lg transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                  <span>Reset Demo State</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sans">
                {/* Section Left: Branding Config */}
                <div className="space-y-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                  <span className="text-slate-400 text-[9px] uppercase font-bold tracking-wider font-mono">Branding Style Preference</span>
                  
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button
                      onClick={() => setBrandingMode('finux')}
                      className={`p-4 rounded-xl border text-center space-y-2 transition-all ${
                        brandingMode === 'finux'
                          ? 'border-[#003d9b] bg-[#003d9b]/5 ring-2 ring-[#003d9b]/15'
                          : 'border-slate-200 bg-white hover:border-slate-350'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#003d9b] text-white flex items-center justify-center font-bold font-mono text-sm mx-auto">
                        SF
                      </div>
                      <div className="font-bold text-slate-800 text-xs">Smart Finux Labs</div>
                      <p className="text-[9px] text-slate-405 leading-normal">Deep Navy, banking legacy, structural dashboard.</p>
                    </button>

                    <button
                      onClick={() => setBrandingMode('verity')}
                      className={`p-4 rounded-xl border text-center space-y-2 transition-all ${
                        brandingMode === 'verity'
                          ? 'border-[#0052cc] bg-[#0052cc]/5 ring-2 ring-[#0052cc]/15'
                          : 'border-slate-200 bg-white hover:border-slate-350'
                      }`}
                    >
                      <Building2 className="w-8 h-8 text-[#0052cc] mx-auto stroke-2" />
                      <div className="font-bold text-slate-850 text-xs">Verity clearing board</div>
                      <p className="text-[9px] text-slate-405 leading-normal">Precision blue, split-pane quick actions list.</p>
                    </button>
                  </div>
                </div>

                {/* Section Right: Simulator Options */}
                <div className="space-y-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <span className="text-slate-400 text-[9px] uppercase font-bold tracking-wider font-mono">Simulator Sandbox Actions</span>
                    <p className="text-slate-500 text-[10px] mt-1">Quick-test different scenarios like instant factoring or dispute rebuttals.</p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => {
                        // Bulk approve all pending
                        setInvoices(prev => prev.map(inv => ({ ...inv, status: 'VERIFIED' })));
                        alert('All pending invoices transitioned to VERIFIED!');
                        setActiveTab('dashboard');
                      }}
                      className="w-full text-left py-2 px-3 bg-white hover:bg-slate-100 font-sans font-bold text-slate-700 rounded-lg border border-slate-200 flex items-center justify-between transition-colors"
                    >
                      <span>⚡ Bulk Approve Clearances</span>
                      <Check className="w-4 h-4 text-emerald-500" />
                    </button>

                    <button
                      onClick={() => {
                        // Set specific preloaded invoice to pending
                        setInvoices(prev => prev.map(inv => {
                          if (inv.id === 'INV-2026-089') {
                            return { ...inv, status: 'PENDING_VERIFICATION' };
                          }
                          return inv;
                        }));
                        alert('INV-2026-089 set back to PENDING_VERIFICATION for testing.');
                      }}
                      className="w-full text-left py-2 px-3 bg-white hover:bg-slate-100 font-sans font-bold text-slate-700 rounded-lg border border-slate-200 flex items-center justify-between transition-colors"
                    >
                      <span>🔄 Reset INV-2026-089 status</span>
                      <RefreshCw className="w-4 h-4 text-[#0052cc]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Help Center Screen representation */}
          {activeTab === 'help' && (
            <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] space-y-4 font-sans text-xs" id="help-tab-view">
              <h3 className="font-bold text-slate-800 text-sm">Help Center & Manuals</h3>
              <p className="text-slate-505 font-medium leading-relaxed max-w-2xl">
                Welcome to Smart Finux Labs clearing board documentation. Explore our instructions on matching goods invoices with automated purchase order (PO) contracts and executing blockchain digital signatures via Fireblocks bank vaults.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-900 block text-xs">Invoice Factoring eligibility</span>
                  <p className="text-slate-500 text-[10px] mt-1.5 leading-relaxed font-medium">Invoices verified by buyer enterprise signatures become legally binding digital assets that can be discounted by Arc Liquidity Trust within 24 hours.</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-900 block text-xs">Filing Buyer Disputes</span>
                  <p className="text-slate-500 text-[10px] mt-1.5 leading-relaxed font-medium">To pause factoring, file a dispute selecting reasons like 'Quantity Mismatch' or 'Price Discrepancy'. Suppliers are notified instantly to submit counter-evidence.</p>
                </div>
              </div>
            </div>
          )}

          {/* Compliance Screen representation */}
          {activeTab === 'compliance' && (
            <div className="bg-white p-6 rounded-xl border border-[#E5E7EB] space-y-4 font-sans text-xs" id="compliance-tab-view">
              <h3 className="font-bold text-slate-800 text-sm">Regulatory & Compliance registry</h3>
              <p className="text-slate-505 font-medium leading-relaxed max-w-2xl">
                All participant nodes in the Smart Finux network maintain compliance auditing in alignment with standard international trade laws.
              </p>
              <div className="p-4.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 shrink-0 text-emerald-600" />
                <div>
                  <span className="font-bold block text-emerald-900 text-xs">Compliance Audit Rank: EXCELLENT (99.8)</span>
                  <p className="text-[10px] text-emerald-800 leading-normal font-medium mt-0.5">Perfect records on PO checks, counterparty KYC validations, and instant automatic audit trail records on decentralized state registries.</p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
