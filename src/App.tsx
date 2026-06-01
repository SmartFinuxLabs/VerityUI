import React, { useEffect, useState } from 'react';
import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import AuthPage from './auth/AuthPage';
import BuyerWorkspace from './buyer/BuyerWorkspace';
import SupplierWorkspace from './supplier/SupplierWorkspace';
import InvestorWorkspace from './investor/InvestorWorkspace';
import { Hero } from './public/components/Hero';
import { Footer } from './public/components/Footer';
import { BentoGrid } from './public/components/architecture/BentoGrid';
import { ProtocolDashboard } from './public/components/sandbox/ProtocolDashboard';
import { SandboxPortal } from './public/components/sandbox/SandboxPortal';
import { INITIAL_INVOICES, INITIAL_TRANSACTIONS } from './public/data';
import { Invoice, PlatformStats, TransactionRecord } from './public/types';
import { Landmark } from 'lucide-react';
import { ParticipantRole, clearParticipantAccess, getParticipantAccessSnapshot, hasParticipantAccess } from './lib/participantAuth';

function getFirstRouteForRole(role?: ParticipantRole) {
  if (role === 'Supplier') {
    return '/supplier-workspace';
  }

  if (role === 'Buyer') {
    return '/buyer-workspace';
  }

  if (role === 'Investor') {
    return '/investor-workspace';
  }

  return '/supplier-workspace';
}

export default function App() {
  const navigate = useNavigate();
  const [accessSnapshot, setAccessSnapshot] = useState(() => getParticipantAccessSnapshot());
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('verity_ui_public_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });
  const [transactions, setTransactions] = useState<TransactionRecord[]>(() => {
    const saved = localStorage.getItem('verity_ui_public_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });
  const [activeRole, setActiveRole] = useState<'Supplier' | 'Buyer' | 'Investor' | 'Operator'>('Supplier');

  useEffect(() => {
    localStorage.setItem('verity_ui_public_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('verity_ui_public_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const handleOpenWorkspace = () => {
    const snapshot = getParticipantAccessSnapshot();
    setAccessSnapshot(snapshot);

    if (snapshot && hasParticipantAccess()) {
      navigate(getFirstRouteForRole(snapshot.participantRole));
      return;
    }

    navigate('/login');
  };

  const handleAuthenticated = () => {
    const snapshot = getParticipantAccessSnapshot();
    setAccessSnapshot(snapshot);
    navigate(getFirstRouteForRole(snapshot?.participantRole), { replace: true });
  };

  const handleResetAccess = () => {
    clearParticipantAccess();
    setAccessSnapshot(null);
    navigate('/login', { replace: true });
  };

  const handleUpdateInvoices = (newInvoices: Invoice[]) => {
    setInvoices(newInvoices);
  };

  const handleAddTransaction = (newTransaction: TransactionRecord) => {
    setTransactions((previous) => [newTransaction, ...previous]);
  };

  const handleEnterSandbox = () => {
    navigate('/login');
  };

  const computeStats = (): PlatformStats => {
    const baseTVL = 11350000;
    const baseCumulative = 122450000;
    const activeFinanced = invoices.filter((invoice) => invoice.status === 'Financed');
    const settledInvoices = invoices.filter((invoice) => invoice.status === 'Settled');
    const currentFinancedSum = activeFinanced.reduce((total, invoice) => total + invoice.amount, 0);
    const activePayoffsSum =
      activeFinanced.reduce((total, invoice) => total + invoice.earlyPaymentAmount, 0) +
      settledInvoices.reduce((total, invoice) => total + invoice.earlyPaymentAmount, 0);

    let totalYieldFactor = 0;
    let totalAmountForYield = 0;

    invoices.forEach((invoice) => {
      if (invoice.status === 'Financed' || invoice.status === 'Approved_Unfunded') {
        totalYieldFactor += invoice.discountRate * invoice.amount;
        totalAmountForYield += invoice.amount;
      }
    });

    return {
      totalValueLocked: baseTVL + currentFinancedSum,
      cumulativeFinanced: baseCumulative + activePayoffsSum,
      averageYield: totalAmountForYield > 0 ? totalYieldFactor / totalAmountForYield : 0.0581,
      activeSuppliersCount: new Set(invoices.map((invoice) => invoice.supplierName)).size + 4,
      activeInvoicesCount: invoices.length,
    };
  };

  const currentStats = computeStats();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `transition-colors ${isActive ? 'text-zinc-900' : 'text-[#09090B]/60 hover:text-zinc-900'}`;

  const PublicHeader = () => (
    <header className="fixed top-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200 h-16 flex items-center shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-between items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-zinc-900 rounded-sm flex items-center justify-center text-white relative">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-1 right-1" />
            <Landmark className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <span className="font-sans font-extrabold tracking-tight text-sm text-zinc-900">VERITY</span>
            <span className="text-[9px] text-zinc-400 font-mono block leading-none">SCF PLATFORM</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-[10px] uppercase font-bold tracking-widest text-[#09090B]/60">
          <NavLink to="/" end className={navClass}>Home</NavLink>
          <NavLink to="/architecture" className={navClass}>Architecture</NavLink>
          <NavLink to="/sandbox" className={navClass}>Interact Sandbox</NavLink>
        </nav>

        <div className="flex items-center gap-3">
          {accessSnapshot && (
            <>
              <span className="hidden lg:inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-zinc-600 bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-sm">
                {accessSnapshot.provider === 'supabase' ? 'Supabase Auth' : 'Demo Access'}
                <span className="text-zinc-400">{accessSnapshot.email}</span>
              </span>
              {accessSnapshot.participantRole && (
                <span className="hidden md:inline-flex items-center px-2.5 py-1 text-[10px] uppercase tracking-widest font-bold border border-zinc-300 text-zinc-700 bg-white rounded-sm">
                  {accessSnapshot.participantRole}
                </span>
              )}
              <button
                onClick={handleResetAccess}
                className="hidden sm:inline-flex px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold border border-zinc-300 text-zinc-700 bg-white hover:bg-zinc-50 transition-colors"
              >
                Reset Access
              </button>
            </>
          )}
          {accessSnapshot?.participantRole && (
            <button
              onClick={handleOpenWorkspace}
              className="px-3 py-2 border border-zinc-300 bg-white hover:bg-zinc-50 text-[10px] font-bold uppercase tracking-widest text-zinc-700 transition-colors"
            >
              Open Workspace
            </button>
          )}
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 text-xs text-white tracking-widest uppercase font-bold rounded-none transition duration-200 cursor-pointer flex items-center gap-1 shadow-sm"
          >
            Portal Terminal
            <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </header>
  );

  const PublicLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-[#FAFAFA] font-sans antialiased text-zinc-900 pt-16">
      <PublicHeader />
      <main>{children}</main>
      <Footer />
    </div>
  );

  const AuthGate = ({ children }: { children: React.ReactNode }) => {
    if (!accessSnapshot || !hasParticipantAccess()) {
      return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
  };

  return (
    <Routes>
      <Route
        path="/"
        element={(
          <PublicLayout>
            <>
              <Hero onEnterSandbox={handleEnterSandbox} activeRole={activeRole} />
              <section className="py-24 bg-white border-b border-zinc-200 relative overflow-hidden text-center text-zinc-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-zinc-100 border border-zinc-200 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6">
                    REGULATORY COMPLIANCE
                  </div>
                  <h2 className="font-display text-4xl sm:text-5xl font-light italic tracking-tight text-zinc-900 mb-4 max-w-3xl mx-auto leading-tight">
                    The Trust Standard in Decentralized Trade Finance
                  </h2>
                  <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-500 leading-relaxed">
                    Verity binds legal invoice factoring terms to self-executing smart contracts, giving participants a transparent and auditable trust layer.
                  </p>
                </div>
              </section>
            </>
          </PublicLayout>
        )}
      />
      <Route
        path="/architecture"
        element={(
          <PublicLayout>
            <BentoGrid />
          </PublicLayout>
        )}
      />
      <Route
        path="/sandbox"
        element={(
          <PublicLayout>
            <>
              <SandboxPortal
                invoices={invoices}
                onUpdateInvoices={handleUpdateInvoices}
                transactions={transactions}
                onAddTransaction={handleAddTransaction}
                activeRole={activeRole}
                setActiveRole={setActiveRole}
              />
              <ProtocolDashboard stats={currentStats} />
            </>
          </PublicLayout>
        )}
      />
      <Route path="/login" element={<AuthPage onAuthenticated={handleAuthenticated} />} />
      <Route
        path="/supplier-workspace"
        element={(
          <AuthGate>
            <SupplierWorkspace
              accessLabel={accessSnapshot ? `${accessSnapshot.provider === 'supabase' ? 'Supabase Auth' : 'Demo Access'} · ${accessSnapshot.email}` : undefined}
              accessRole={accessSnapshot?.participantRole}
              onResetAccess={accessSnapshot ? handleResetAccess : undefined}
            />
          </AuthGate>
        )}
      />
      <Route
        path="/buyer-workspace"
        element={(
          <AuthGate>
            <BuyerWorkspace
              accessLabel={accessSnapshot ? `${accessSnapshot.provider === 'supabase' ? 'Supabase Auth' : 'Demo Access'} · ${accessSnapshot.email}` : undefined}
              accessRole={accessSnapshot?.participantRole}
              onResetAccess={accessSnapshot ? handleResetAccess : undefined}
            />
          </AuthGate>
        )}
      />
      <Route
        path="/investor-workspace"
        element={(
          <AuthGate>
            <InvestorWorkspace
              accessLabel={accessSnapshot ? `${accessSnapshot.provider === 'supabase' ? 'Supabase Auth' : 'Demo Access'} · ${accessSnapshot.email}` : undefined}
              accessRole={accessSnapshot?.participantRole}
              onResetAccess={accessSnapshot ? handleResetAccess : undefined}
            />
          </AuthGate>
        )}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
