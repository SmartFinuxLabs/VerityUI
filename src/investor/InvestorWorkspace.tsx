/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import './index.css';
import { 
  ShieldCheck, 
  Bell, 
  Search, 
  Settings, 
  LayoutDashboard, 
  Coins, 
  LineChart, 
  FileCheck2, 
  Scale, 
  HelpCircle, 
  HeartHandshake, 
  ChevronRight, 
  Globe, 
  Sparkles,
  Server,
  ArrowUpRight
} from 'lucide-react';

import { ActiveScreen, Invoice, Settlement, LedgerRow, WalletState } from './types';
import { getInvestorWorkspaceInitialState, isDemoWorkspaceDataMode, loadInvestorWorkspaceState } from '../lib/workspaceData';
import { getParticipantAccessSnapshot } from '../lib/participantAuth';
import { verityApi } from '../lib/apiClient';

import DirectFundingView from './components/DirectFundingView';
import LiquidityMarketplaceView from './components/LiquidityMarketplaceView';
import InvoiceDeepDiveView from './components/InvoiceDeepDiveView';
import PortfolioAnalyticsView from './components/PortfolioAnalyticsView';

import WalletModal from './components/WalletModal';
import SuccessModal from './components/SuccessModal';

interface InvestorWorkspaceProps {
  accessLabel?: string;
  accessRole?: string;
  onResetAccess?: () => void;
}

export default function InvestorWorkspace({
  accessLabel,
  accessRole,
  onResetAccess,
}: InvestorWorkspaceProps) {
  const initialWorkspaceState = getInvestorWorkspaceInitialState();
  // Navigation State
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('direct-funding');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('INV-2026-089');

  // Unified global metrics (that change with user fund/bridge actions!)
  const [totalCommitted, setTotalCommitted] = useState(initialWorkspaceState.totalCommitted);
  const [activeInvestments, setActiveInvestments] = useState(initialWorkspaceState.activeInvestments);
  const [availableCapital, setAvailableCapital] = useState(initialWorkspaceState.availableCapital);
  const [projectedYield, setProjectedYield] = useState(initialWorkspaceState.projectedYield);
  const [ytdEarned, setYtdEarned] = useState(initialWorkspaceState.ytdEarned);
  const [investorOrganizationId, setInvestorOrganizationId] = useState<string | null>(
    initialWorkspaceState.investorOrganizationId
  );

  // Invoices & Settlements lists with dynamic modifications
  const [invoices, setInvoices] = useState<Invoice[]>(initialWorkspaceState.invoices);
  const [settlements, setSettlements] = useState<Settlement[]>(initialWorkspaceState.settlements);
  const [ledgerRows, setLedgerRows] = useState<LedgerRow[]>(initialWorkspaceState.ledgerRows);
  const [workspaceDataStatus, setWorkspaceDataStatus] = useState<'loading' | 'ready' | 'error'>(
    isDemoWorkspaceDataMode() ? 'ready' : 'loading'
  );
  const [workspaceDataError, setWorkspaceDataError] = useState('');

  // Notifications State
  const [notifications, setNotifications] = useState<string[]>([
    "Verification complete check: PO-9902 authenticated",
    "Smart Contract disburse logged on Arc Network node: US-EAST"
  ]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Wallet Connection Simulation State
  const [walletState, setWalletState] = useState<WalletState>({
    connected: false,
    address: null,
    balance: 500000.00, // starting Ethereum wallet balance
    network: 'ethereum'
  });

  // Modal Management
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  
  // Custom Success state parameters
  const [successInfo, setSuccessInfo] = useState({
    title: '',
    amount: '' as string | number,
    hash: '',
    details: {} as Record<string, string>
  });

  useEffect(() => {
    let isMounted = true;

    loadInvestorWorkspaceState()
      .then((state) => {
        if (!isMounted) return;
        setInvestorOrganizationId(state.investorOrganizationId);
        setInvoices(state.invoices);
        setSettlements(state.settlements);
        setLedgerRows(state.ledgerRows);
        setTotalCommitted(state.totalCommitted);
        setActiveInvestments(state.activeInvestments);
        setAvailableCapital(state.availableCapital);
        setProjectedYield(state.projectedYield);
        setYtdEarned(state.ytdEarned);
        setWorkspaceDataStatus('ready');
        setWorkspaceDataError('');
      })
      .catch((error) => {
        if (!isMounted) return;
        setWorkspaceDataStatus('error');
        setWorkspaceDataError(error instanceof Error ? error.message : 'Unable to load investor workspace data from VerityAPI.');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshInvestorWorkspace = async () => {
    const state = await loadInvestorWorkspaceState();
    setInvestorOrganizationId(state.investorOrganizationId);
    setInvoices(state.invoices);
    setSettlements(state.settlements);
    setLedgerRows(state.ledgerRows);
    setTotalCommitted(state.totalCommitted);
    setActiveInvestments(state.activeInvestments);
    setAvailableCapital(state.availableCapital);
    setProjectedYield(state.projectedYield);
    setYtdEarned(state.ytdEarned);
    setWorkspaceDataStatus('ready');
    setWorkspaceDataError('');
  };

  // Action: Export CSV simulation
  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Invoice ID,Obligor,Face Value,Discount%,Maturity,Status",
         ...invoices.map(inv => `${inv.id},${inv.obligor},${inv.faceValue},${inv.discount}%,${inv.maturity},${inv.status}`)
        ].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Verity_Asset_Opportunities_Audit_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Action: Bridge Liquidity callback from Marketplace view
  const handleSetAvailableCapital = (newCapital: number) => {
    setAvailableCapital(newCapital);
  };

  const handleUpdateWalletBalance = (newBalance: number) => {
    setWalletState(prev => ({ ...prev, balance: newBalance }));
  };

  const handleConnectWallet = (address: string, network: 'ethereum' | 'arc') => {
    setWalletState({
      connected: true,
      address,
      balance: 500000.00,
      network
    });
    
    // Auto add notification
    setNotifications(prev => [
      `Wallet connected successfully on node endpoint: ${address}`,
      ...prev
    ]);
  };

  // Action: Fund invoice callback from Deep Dive view
  const handleFundInvoice = async (invoiceId: string, advanceAmt: number) => {
    // Locate invoice in list
    const invItem = invoices.find(inv => inv.id === invoiceId);

    if (!isDemoWorkspaceDataMode()) {
      const snapshot = getParticipantAccessSnapshot();
      if (snapshot?.provider !== 'api' || !snapshot.accessToken) {
        throw new Error('API investor funding requires a signed-in VerityAPI session.');
      }
      if (!investorOrganizationId) {
        throw new Error('Investor organization is required before funding marketplace invoices.');
      }
      if (!invItem?.fundingOfferId) {
        throw new Error('Funding offer ID is required before funding marketplace invoices.');
      }

      await verityApi.createFundingCommitment(snapshot.accessToken, invItem.fundingOfferId, {
        investorId: investorOrganizationId,
        committedAmount: advanceAmt,
        offeredRate: invItem.discount / 100,
        commitmentTxRef: `VERITYUI-${invItem.fundingOfferId}-${Date.now()}`,
      });
      await refreshInvestorWorkspace();
      return;
    }

    const updatedInvoices = invoices.map(inv => {
      if (inv.id === invoiceId) {
        return { ...inv, status: 'Funded' as const };
      }
      return inv;
    });

    setInvoices(updatedInvoices);

    // Subtract from available capital pool
    setAvailableCapital(prev => prev - advanceAmt);

    // Add to active and total committed
    setActiveInvestments(prev => prev + advanceAmt);
    setTotalCommitted(prev => prev + advanceAmt);

    // Calculate dynamic yield part
    let yieldEarned = 0;
    let obligorName = "Unknown Obligor";
    if (invItem) {
      yieldEarned = invItem.faceValue * (invItem.discount / 100);
      obligorName = invItem.obligor;
      // Increment dynamic YTD earned parameter
      setYtdEarned(prev => prev + yieldEarned);
    }

    // Prepend dynamic item to ledger list
    const newLedgerRow: LedgerRow = {
      invoiceId,
      obligor: obligorName,
      faceValue: invItem ? invItem.faceValue : advanceAmt,
      yieldEarned: yieldEarned || (advanceAmt * 0.02),
      settlementDate: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'FACTORED'
    };
    setLedgerRows(prev => [newLedgerRow, ...prev]);

    // Prepend dynamic item to timeline settlements list
    const newSettlement: Settlement = {
      id: 'SET-' + Math.floor(10000 + Math.random() * 90000),
      invoiceId,
      payer: obligorName,
      amount: invItem ? invItem.faceValue : advanceAmt,
      yieldEarned: yieldEarned || (advanceAmt * 0.02),
      timeAgo: 'Just now',
      status: 'Settled',
      date: new Date().toISOString()
    };
    setSettlements(prev => [newSettlement, ...prev]);

    // Track notifications log
    setNotifications(prev => [
      `Approved Factoring of invoice ${invoiceId} for ${obligorName}`,
      ...prev
    ]);
  };

  const handleTriggerSuccessModal = (
    title: string, 
    amount: string | number, 
    hash: string, 
    details: Record<string, string>
  ) => {
    setSuccessInfo({ title, amount, hash, details });
    setIsSuccessModalOpen(true);
  };

  const handleSelectInvoiceAndNavigate = (id: string) => {
    setSelectedInvoiceId(id);
    setActiveScreen('invoice-deep-dive');
  };

  const currentSelectedInvoiceObject = invoices.find(inv => inv.id === selectedInvoiceId) || invoices[0];

  if (workspaceDataStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center text-slate-700">
        <div className="bg-white border border-slate-200 rounded-[8px] px-6 py-5 shadow-sm">
          <p className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-2">VerityAPI</p>
          <p className="text-sm font-bold">Loading investor workspace data...</p>
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
    <div className="min-h-screen flex text-slate-800 bg-[#F8F9FA] selection:bg-brand-primary selection:text-white" id="main-layout-root">
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="w-[260px] bg-white border-r border-slate-200 shrink-0 hidden md:flex flex-col justify-between h-screen sticky top-0 z-30" id="side-navigation-panel">
        
        {/* Top brand header */}
        <div>
          <div className="p-6 border-b border-slate-100 flex items-center space-x-3 bg-slate-50/30">
            <div className="w-9 h-9 rounded-[8px] bg-brand-primary text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-900 tracking-tight block">Verity Institutional</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Enterprise Node</span>
            </div>
          </div>

          <div className="p-4" id="sidebar-context-pill">
            <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-[6px] p-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5 font-bold text-brand-primary">
                <Globe className="w-3.5 h-3.5 text-brand-primary animate-pulse" />
                <span>Prime Network Node</span>
              </div>
              <span className="text-[9px] font-mono bg-brand-primary/10 text-brand-primary px-1.5 rounded font-bold uppercase">US-East</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="px-3 space-y-1" id="sidebar-navigation-items">
            {[
              { id: 'direct-funding' as ActiveScreen, label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: 'invoice-deep-dive' as ActiveScreen, label: 'Invoices Audit', icon: <FileCheck2 className="w-4 h-4" /> },
              { id: 'liquidity-marketplace' as ActiveScreen, label: 'Marketplace & Bridge', icon: <Coins className="w-4 h-4" /> },
              { id: 'portfolio-analytics' as ActiveScreen, label: 'Portfolio Analytics', icon: <LineChart className="w-4 h-4" /> },
            ].map((item) => {
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveScreen(item.id);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[6px] text-[13.5px] font-medium cursor-pointer transition-all duration-150 ${
                    isActive 
                      ? 'bg-[#EBF2FF] text-brand-primary shadow-2xs font-semibold' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3 h-3 text-brand-primary shrink-0" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Indicators */}
        <div className="p-4 border-t border-slate-100 bg-[#F8F9FA]/50 space-y-3.5 text-xs text-slate-400 font-medium">
          <div className="bg-white p-3 rounded-[6px] border border-slate-200/60 shadow-[0px_4px_10px_rgba(0,0,0,0.01)] flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-slate-500">
              <Scale className="w-3.5 h-3.5 text-emerald-600" />
              <span>Compliance Scan</span>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 px-1.5 rounded uppercase">Passed</span>
          </div>

          <div className="flex justify-between items-center px-1">
            <span className="flex items-center space-x-1 hover:text-slate-600 cursor-pointer">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Support Desk</span>
            </span>
            <span className="font-mono text-[10px] text-slate-350">v2.4.9</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER (Header + Custom Screen Views) */}
      <main className="flex-1 flex flex-col min-w-0" id="main-content-scroller">
        
        {/* TOP HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-40 shadow-[0px_1px_3px_rgba(15,23,42,0.02)]" id="page-header-container">
          
          {/* Logo / Context Title for Screen sizes */}
          <div className="flex items-center space-x-4">
            <div className="md:hidden flex items-center space-x-2 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-brand-primary text-white flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-sm text-slate-950">Verity</span>
            </div>

            {/* Quick action bar */}
            <div className="hidden lg:flex items-center space-x-1">
              {[
                { id: 'direct-funding' as ActiveScreen, label: 'Direct Funding' },
                { id: 'liquidity-marketplace' as ActiveScreen, label: 'Network Status' }
              ].map((lnk) => (
                <button
                  key={lnk.id}
                  onClick={() => setActiveScreen(lnk.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    activeScreen === lnk.id 
                    ? 'bg-[#EBF2FF] text-brand-primary' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {lnk.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Action Widgets row */}
          <div className="flex items-center space-x-4">
            
            {/* Notifications panel toggle */}
            <div className="relative">
              <button 
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-[6px] bg-slate-50 hover:bg-slate-100 transition relative cursor-pointer"
                aria-label="Toggle notifications panel"
              >
                <Bell className="w-4 h-4 text-slate-600" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-brand-primary rounded-full animate-bounce"></span>
                )}
              </button>

              {showNotificationsDropdown && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 rounded-[8px] shadow-xl overflow-hidden z-50 animate-fade-in">
                  <div className="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">System Log Notifications</span>
                    <button 
                      onClick={() => setNotifications([])}
                      className="text-[10px] font-bold text-brand-primary hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length > 0 ? (
                      notifications.map((notif, index) => (
                        <div key={index} className="p-3 hover:bg-slate-50 transition-colors">
                          <p className="text-xs text-slate-600 font-medium leading-relaxed">{notif}</p>
                          <span className="text-[9px] text-slate-350 block mt-1 font-mono">Verified Node US-East</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        No active system log entries.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative border-l border-slate-200 pl-4 h-8 flex items-center">
              <button
                type="button"
                onClick={() => setShowProfileMenu((value) => !value)}
                aria-label="Open user access menu"
                aria-expanded={showProfileMenu}
                className="w-8 h-8 rounded-full bg-slate-850 bg-gradient-to-tr from-brand-primary to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow overflow-hidden shrink-0 border border-slate-200 hover:ring-2 hover:ring-brand-primary/20 transition-all"
              >
                {(accessRole ?? 'Investor').slice(0, 2).toUpperCase()}
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-[8px] shadow-xl overflow-hidden z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Signed in as</p>
                    <p className="mt-1 text-sm font-bold text-slate-900">{accessRole ?? 'Investor Node'}</p>
                    <p className="mt-1 text-xs font-mono font-semibold text-slate-500 break-all">
                      {accessLabel ?? 'Investor Workspace'}
                    </p>
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
                      Reset Access
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>
        </header>

        {/* MAIN BODY CONTENTS SCROLL WRAPPER */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto" id="dynamic-dashboard-scoller-body">
          
          {/* MOBILE NAVIGATION PILLS BAR */}
          <div className="md:hidden flex items-center overflow-x-auto space-x-1 pb-4 mb-4 border-b border-slate-200/50" id="mobile-pills">
            {[
              { id: 'direct-funding' as ActiveScreen, label: 'Dashboard' },
              { id: 'invoice-deep-dive' as ActiveScreen, label: 'Invoices' },
              { id: 'liquidity-marketplace' as ActiveScreen, label: 'Marketplace' },
              { id: 'portfolio-analytics' as ActiveScreen, label: 'Analytics' }
            ].map(mItem => (
              <button
                key={mItem.id}
                onClick={() => setActiveScreen(mItem.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                  activeScreen === mItem.id
                    ? 'bg-brand-primary text-white font-extrabold'
                    : 'bg-white border border-slate-200 text-slate-500'
                }`}
              >
                {mItem.label}
              </button>
            ))}
          </div>

          {/* SENSITIVE VIEW SWITCHER RENDER ENGINE */}
          {activeScreen === 'direct-funding' && (
            <DirectFundingView 
              onNavigate={setActiveScreen}
              onSelectInvoice={handleSelectInvoiceAndNavigate}
              totalCommitted={totalCommitted}
              activeInvestments={activeInvestments}
              projectedYield={projectedYield}
              availableCapital={availableCapital}
              invoices={invoices}
              settlements={settlements}
              onExportCSV={handleExportCSV}
            />
          )}

          {activeScreen === 'liquidity-marketplace' && (
            <LiquidityMarketplaceView 
              onNavigate={setActiveScreen}
              onSelectInvoice={handleSelectInvoiceAndNavigate}
              committedCapital={totalCommitted}
              activeInvestments={activeInvestments}
              expectedYield={projectedYield}
              ytdEarned={ytdEarned}
              availableCapital={availableCapital}
              onSetAvailableCapital={handleSetAvailableCapital}
              walletState={walletState}
              onUpdateWalletBalance={handleUpdateWalletBalance}
              invoices={invoices}
              recentSettlements={settlements}
              onTriggerSuccess={handleTriggerSuccessModal}
            />
          )}

          {activeScreen === 'invoice-deep-dive' && (
            <InvoiceDeepDiveView 
              onNavigate={setActiveScreen}
              selectedInvoice={currentSelectedInvoiceObject}
              availableCapital={availableCapital}
              onFundInvoice={handleFundInvoice}
              onTriggerSuccess={handleTriggerSuccessModal}
              onBack={() => setActiveScreen('direct-funding')}
            />
          )}

          {activeScreen === 'portfolio-analytics' && (
            <PortfolioAnalyticsView 
              onNavigate={setActiveScreen}
              onSelectInvoice={handleSelectInvoiceAndNavigate}
              ledgerRows={ledgerRows}
              totalRealizedYield={ytdEarned}
            />
          )}

        </div>

      </main>

      {/* GLOBAL BACKGROUND INTERACTIVE MODALS */}
      <WalletModal 
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={handleConnectWallet}
      />

      <SuccessModal 
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title={successInfo.title}
        amount={successInfo.amount}
        txHash={successInfo.hash}
        details={successInfo.details}
      />

    </div>
  );
}
