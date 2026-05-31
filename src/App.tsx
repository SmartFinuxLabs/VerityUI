import React, { useState } from 'react';
import { INITIAL_INVOICES } from './data';
import { Invoice, MainRoute, InvoiceStatus } from './types';
import LandingPage from './components/LandingPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import CreateInvoiceModal from './components/CreateInvoiceModal';
import FactoringView from './components/FactoringView';
import DisputeView from './components/DisputeView';
import SettlementView from './components/SettlementView';
import AuthPage from './components/AuthPage';
import { ShieldCheck, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';
import { ParticipantRole, clearParticipantAccess, getParticipantAccessSnapshot, hasParticipantAccess } from './lib/participantAuth';

function getFirstRouteForRole(role?: ParticipantRole) {
  // Phase 1 role-routing baseline.
  if (role === 'Supplier') {
    return 'dashboard' as MainRoute;
  }

  if (role === 'Buyer') {
    return 'disputes' as MainRoute;
  }

  if (role === 'Investor') {
    return 'factoring' as MainRoute;
  }

  return 'dashboard' as MainRoute;
}

export default function App() {
  
  // Routing and Global App State variables
  const [currentRoute, setCurrentRoute] = useState<MainRoute>('landing');
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [availableLiquidity, setAvailableLiquidity] = useState<number>(215500);
  const [escrowValue, setEscrowValue] = useState<number>(145000);
  const [onChainCredit, setOnChainCredit] = useState<number>(820);
  
  // Blockchain connection simulator state
  const [walletConnected, setWalletConnected] = useState<boolean>(true);
  const [walletAddress, setWalletAddress] = useState<string | null>('0x71C8384f9E58A49dfF0bd083B20B2F5b48B64F9E');

  // Interactive controls
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [preselectedInvoiceId, setPreselectedInvoiceId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [authVersion, setAuthVersion] = useState(0);

  // Toggle wallet helper
  const handleToggleWallet = () => {
    if (walletConnected) {
      setWalletConnected(false);
      setWalletAddress(null);
    } else {
      setWalletConnected(true);
      setWalletAddress('0x71C8384f9E58A49dfF0bd083B20B2F5b48B64F9E');
    }
  };

  // Add newly registered invoice via Modal
  const handleAddInvoice = (newInvoice: Omit<Invoice, 'status'>) => {
    const fullInvoice: Invoice = {
      ...newInvoice,
      status: 'ACCEPTED', // Newly submitted and verified invoice starts as accepted, waiting for factoring!
      lifecycleTimeline: {
        registered: new Date().toLocaleDateString() + ' • ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        approved: new Date().toLocaleDateString() + ' • ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    };
    setInvoices([fullInvoice, ...invoices]);
  };

  // Submit invoices for early factoring funding
  const handleSubmitFactoringBatch = (invoiceIds: string[], totalAdvance: number) => {
    const focusInvoiceId = invoiceIds[0] ?? null;

    setInvoices(prevInvoices => 
      prevInvoices.map(inv => {
        if (invoiceIds.includes(inv.id)) {
          return {
            ...inv,
            status: 'FACTORED' as InvoiceStatus
          };
        }
        return inv;
      })
    );

    // Update pool cash balances realistic accounting
    setEscrowValue(prev => prev + totalAdvance);
    setAvailableLiquidity(prev => prev + totalAdvance);
    const addedCredit = Math.min(850, onChainCredit + 15);
    setOnChainCredit(addedCredit);
    setPreselectedInvoiceId(focusInvoiceId);
  };

  // Submit dispute responses (e.g. adjust prices or launch rebuttal)
  const handleResolveDispute = (invoiceId: string, params: {
    status: 'ACCEPTED' | 'PENDING';
    amount?: number;
    qty?: number;
    rebuttalCounterReason?: string;
    rebuttalDetail?: string;
  }) => {
    setInvoices(prevInvoices => 
      prevInvoices.map(inv => {
        if (inv.id === invoiceId) {
          return {
            ...inv,
            status: params.status,
            amount: params.amount !== undefined ? params.amount : inv.amount,
            revisedQty: params.qty,
            rebuttalCounterReason: params.rebuttalCounterReason,
            rebuttalDetail: params.rebuttalDetail
          };
        }
        return inv;
      })
    );

    // If correction occurred, score improves for prompt correction!
    if (params.status === 'ACCEPTED') {
      setOnChainCredit(prev => Math.min(850, prev + 10));
    }
  };

  // Execute terminal settlement releases
  const handleExecuteSettlement = (invoiceId: string, releasedRetention: number) => {
    setInvoices(prevInvoices => 
      prevInvoices.map(inv => {
        if (inv.id === invoiceId) {
          return {
            ...inv,
            status: 'SETTLED' as InvoiceStatus,
            lifecycleTimeline: {
              ...inv.lifecycleTimeline,
              matured: new Date().toLocaleDateString(),
              settled: new Date().toLocaleDateString() + ' • ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          };
        }
        return inv;
      })
    );

    // Cash and pool balances rebalanced
    setAvailableLiquidity(prev => prev + releasedRetention);
    setEscrowValue(prev => Math.max(0, prev - 50000));
    // Score rating increases on healthy settlement
    setOnChainCredit(prev => Math.min(850, prev + 25));
  };

  // Focused routing helpers
  const handleFocusInvoiceForFactoring = (invoiceId: string) => {
    setPreselectedInvoiceId(invoiceId);
    setCurrentRoute('factoring');
  };

  const handleFocusInvoiceForDispute = (invoiceId: string) => {
    setPreselectedInvoiceId(invoiceId);
    setCurrentRoute('disputes');
  };

  const handleFocusInvoiceForSettlement = (invoiceId: string) => {
    setPreselectedInvoiceId(invoiceId);
    setCurrentRoute('settlement');
  };

  const accessSnapshot = getParticipantAccessSnapshot();

  const handleStartApp = () => {
    if (hasParticipantAccess()) {
      setCurrentRoute(getFirstRouteForRole(accessSnapshot?.participantRole));
      return;
    }

    setCurrentRoute('auth');
  };

  const handleAuthenticated = () => {
    setAuthVersion((version) => version + 1);
    const snapshot = getParticipantAccessSnapshot();
    setCurrentRoute(getFirstRouteForRole(snapshot?.participantRole));
  };

  const handleResetAccess = () => {
    clearParticipantAccess();
    setAuthVersion((version) => version + 1);
    setCurrentRoute('auth');
  };

  // Find targeted invoice for focused pages, fallback to preloaded INV-2026-089 if not found
  const getDisputeInvoice = () => {
    const matched = invoices.find(inv => inv.id === preselectedInvoiceId || inv.status === 'DISPUTED');
    return matched || invoices.find(inv => inv.id === 'INV-2026-089') || invoices[4];
  };

  const getSettlementInvoice = () => {
    const matched = invoices.find(inv => inv.id === preselectedInvoiceId || inv.status === 'FACTORED');
    return matched || invoices.find(inv => inv.id === 'INV-2026-089') || invoices[4];
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans select-none antialiased">
      
      {currentRoute === 'landing' ? (
        
        // Render Screen 1: Marketing Landing Page
        <LandingPage onStartApp={handleStartApp} />

      ) : currentRoute === 'auth' ? (

        <AuthPage onAuthenticated={handleAuthenticated} />
        
      ) : (
        
        // Render Internal Enterprise Application layout Dashboard
        <div className="flex h-screen overflow-hidden">
          
          {/* Global Sidebar layout panels */}
          <Sidebar 
            currentRoute={currentRoute} 
            setCurrentRoute={(route) => {
              // Reset preselection on side clicks
              setPreselectedInvoiceId(null);
              setCurrentRoute(route);
            }} 
            onOpenUploadModal={() => setShowUploadModal(true)}
            walletConnected={walletConnected}
          />

          {/* Internal main contents layout */}
          <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-[#F8F9FA]">
            
            {/* Global Header controller */}
            <Header 
              currentRoute={currentRoute} 
              setCurrentRoute={setCurrentRoute} 
              walletConnected={walletConnected}
              onToggleWallet={handleToggleWallet}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              accessLabel={accessSnapshot ? `${accessSnapshot.provider === 'supabase' ? 'Supabase Auth' : 'Demo Access'} · ${accessSnapshot.email}` : undefined}
              accessRole={accessSnapshot?.participantRole}
              onResetAccess={accessSnapshot ? handleResetAccess : undefined}
            />

            {/* Core page routers */}
            {currentRoute === 'dashboard' && (
              <DashboardView
                invoices={invoices}
                availableLiquidity={availableLiquidity}
                onModifyLiquidity={(amount) => setAvailableLiquidity(prev => Math.max(0, prev + amount))}
                escrowValue={escrowValue}
                onChainCredit={onChainCredit}
                onSelectRoute={setCurrentRoute}
                onOpenUploadModal={() => setShowUploadModal(true)}
                searchQuery={searchQuery}
                onFocusInvoiceForFactoring={handleFocusInvoiceForFactoring}
                onFocusInvoiceForDispute={handleFocusInvoiceForDispute}
                onFocusInvoiceForSettlement={handleFocusInvoiceForSettlement}
              />
            )}

            {currentRoute === 'factoring' && (
              <FactoringView
                invoices={invoices}
                onSelectRoute={setCurrentRoute}
                onSubmitFactoringBatch={handleSubmitFactoringBatch}
                preselectedInvoiceId={preselectedInvoiceId}
              />
            )}

            {currentRoute === 'disputes' && (
              <DisputeView
                invoice={getDisputeInvoice()}
                onSelectRoute={setCurrentRoute}
                onResolveDispute={handleResolveDispute}
              />
            )}

            {currentRoute === 'settlement' && (
              <SettlementView
                invoice={getSettlementInvoice()}
                onSelectRoute={setCurrentRoute}
                onExecuteSettlement={handleExecuteSettlement}
              />
            )}

            {/* Quick Walkthrough Navigation Assistant Bar at bottom margin for reviewer convenience */}
            <div className="mt-auto px-6 py-4 bg-slate-900 text-slate-450 border-t border-slate-800 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono select-none">
              <div className="flex items-center gap-2">
                <div className="w-[18px] h-[18px] bg-blue-600 rounded flex items-center justify-center text-white font-extrabold text-[10px]">✔</div>
                <span className="text-slate-300 font-bold">Verity Review Assistant:</span>
                <span className="text-slate-400">Interactive full-stack supply chain finance walkthrough active.</span>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mr-1">SWITCH VIEWS:</span>
                <button onClick={() => setCurrentRoute('landing')} className={`px-2 py-1 rounded cursor-pointer ${currentRoute === 'landing' ? 'bg-[#0052CC] text-white font-semibold' : 'bg-slate-800 text-slate-300 hover:bg-slate-705'}`}>
                  Landing
                </button>
                <button onClick={handleStartApp} className={`px-2 py-1 rounded cursor-pointer ${currentRoute === 'auth' ? 'bg-[#0052CC] text-white font-semibold' : 'bg-slate-800 text-slate-300 hover:bg-slate-705'}`}>
                  Auth
                </button>
                <button onClick={() => setCurrentRoute('dashboard')} className={`px-2 py-1 rounded cursor-pointer ${currentRoute === 'dashboard' ? 'bg-[#0052CC] text-white font-semibold' : 'bg-slate-800 text-slate-300 hover:bg-slate-705'}`}>
                  Dashboard
                </button>
                <button onClick={() => handleFocusInvoiceForFactoring('INV-002')} className={`px-2 py-1 rounded cursor-pointer ${currentRoute === 'factoring' ? 'bg-[#0052CC] text-white font-semibold' : 'bg-slate-800 text-slate-300 hover:bg-slate-705'}`}>
                  Factoring
                </button>
                <button onClick={() => handleFocusInvoiceForDispute('INV-2026-089')} className={`px-2 py-1 rounded cursor-pointer ${currentRoute === 'disputes' ? 'bg-[#0052CC] text-white font-semibold' : 'bg-slate-800 text-slate-300 hover:bg-slate-705'}`}>
                  Disputes
                </button>
                <button onClick={() => handleFocusInvoiceForSettlement('INV-2026-089')} className={`px-2 py-1 rounded cursor-pointer ${currentRoute === 'settlement' ? 'bg-[#0052CC] text-white font-semibold' : 'bg-slate-800 text-slate-300 hover:bg-slate-705'}`}>
                  Settlements
                </button>
              </div>
            </div>

          </div>

          {/* Form Modal rendering */}
          {showUploadModal && (
            <CreateInvoiceModal 
              onClose={() => setShowUploadModal(false)}
              onSubmitInvoice={handleAddInvoice}
            />
          )}

        </div>
      )}

    </div>
  );
}
